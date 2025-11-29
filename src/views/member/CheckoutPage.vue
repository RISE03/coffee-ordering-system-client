<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  useMessage,
  NAlert,
  NButton,
  NForm,
  NFormItem,
  NInput,
  NRadioButton,
  NRadioGroup,
  NSpin,
  NTag,
  type FormInst,
  type FormRules
} from 'naive-ui'
import CouponSelector from '@/components/member/CouponSelector.vue'
import CheckoutSummary from '@/components/member/CheckoutSummary.vue'
import { useCartStore } from '@/stores/cart'
import { useCheckoutStore } from '@/stores/checkout'
import type { BuyNowState, CheckoutItem, CheckoutSource, PickupType } from '@/types/cart'
import { getDisplayErrorMessage } from '@/utils/error'

const route = useRoute()
const router = useRouter()
const message = useMessage()
const cartStore = useCartStore()
const checkoutStore = useCheckoutStore()

const formRef = ref<FormInst | null>(null)
const submitting = ref(false)
const initializing = ref(false)
const snapshotReady = ref(false)

const intendedSource = computed<CheckoutSource>(() => (route.query.source as CheckoutSource) || 'cart')

const form = reactive({
  pickupType: checkoutStore.formDraft.pickupType as PickupType,
  contactName: checkoutStore.formDraft.contactName,
  contactPhone: checkoutStore.formDraft.contactPhone,
  address: checkoutStore.formDraft.address,
  remark: checkoutStore.formDraft.remark
})

const formRules: FormRules = {
  contactName: [
    { required: true, message: '请输入联系人姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度需在 2-20 个字符', trigger: 'blur' }
  ],
  contactPhone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\\d{9}$/, message: '请输入有效的手机号', trigger: 'blur' }
  ],
  address: [
    {
      validator: (_rule, value: string) => {
        if (form.pickupType === 'DELIVERY' && !value) {
          return new Error('请填写配送地址')
        }
        return true
      },
      trigger: 'blur'
    }
  ],
  remark: [{ max: 120, message: '备注不超过 120 字', trigger: 'input' }]
}

const checkoutItems = computed<CheckoutItem[]>(() => checkoutStore.checkoutItems)

const previewItems = computed(() => {
  if (checkoutStore.preview?.items?.length) {
    return checkoutStore.preview.items
  }
  // 预览未加载时用快照兜底展示
  return checkoutStore.itemsSnapshot.map((item) => ({
    ...item,
    available: true,
    reason: undefined
  }))
})

const previewLoading = computed(() => checkoutStore.loadingPreview)
const previewReady = computed(() => !!checkoutStore.preview)
const hasPreviewError = computed(() => !!checkoutStore.previewError)
const hasUnavailableItems = computed(
  () => checkoutStore.preview?.items.some((item) => item.available === false) ?? false
)
const price = computed(() => checkoutStore.price)
const couponWarning = computed(() => checkoutStore.couponNotice)
const busyState = computed(() => previewLoading.value || checkoutStore.couponLoading)

const lastUpdatedLabel = computed(() => {
  if (!checkoutStore.lastPreviewAt) return '尚未预览'
  const d = new Date(checkoutStore.lastPreviewAt)
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`
})

const isFormValid = computed(() => {
  const nameOk = form.contactName.trim().length >= 2 && form.contactName.trim().length <= 20
  const phoneOk = /^1[3-9]\\d{9}$/.test(form.contactPhone)
  const addressOk = form.pickupType === 'SELF_PICKUP' || form.address.trim().length > 0
  const remarkOk = form.remark.length <= 120
  return nameOk && phoneOk && addressOk && remarkOk
})

const canSubmit = computed(() => {
  return (
    checkoutItems.value.length > 0 &&
    previewReady.value &&
    !hasUnavailableItems.value &&
    !hasPreviewError.value &&
    isFormValid.value &&
    !busyState.value &&
    !submitting.value
  )
})

const backTarget = computed(() => {
  if (checkoutStore.source === 'buyNow') {
    return (
      (route.query.from as string) ||
      checkoutStore.returnPath ||
      (checkoutStore.buyNowProductId ? `/product/${checkoutStore.buyNowProductId}` : '/menu')
    )
  }
  return (route.query.from as string) || checkoutStore.returnPath || '/cart'
})

const sourceLabel = computed(() =>
  checkoutStore.source === 'buyNow' ? '立即购买（不影响购物车）' : '购物车结算'
)

watch(
  () => checkoutStore.selectedCouponId,
  (n, o) => {
    if (!snapshotReady.value || n === o) return
    refreshPreview('优惠券变更')
  }
)

watch(
  () => form.pickupType,
  () => {
    if (!snapshotReady.value) return
    refreshPreview('取餐方式变更')
  }
)

watch(
  () => ({ ...form }),
  (draft) => {
    checkoutStore.setFormDraft({
      pickupType: draft.pickupType as PickupType,
      contactName: draft.contactName,
      contactPhone: draft.contactPhone,
      address: draft.address,
      remark: draft.remark
    })
  },
  { deep: true }
)

async function ensureSnapshot(): Promise<boolean> {
  if (intendedSource.value === 'cart') {
    checkoutStore.setSource('cart')
    checkoutStore.setReturnPath((route.query.from as string) || '/cart')

    if (!cartStore.initialized) {
      await cartStore.fetchCart()
    }

    const itemsFromCart = cartStore.items.length
      ? cartStore.items
      : checkoutStore.buyNowProductId
        ? []
        : checkoutStore.itemsSnapshot
    if (itemsFromCart.length > 0) {
      checkoutStore.setCartSnapshot(itemsFromCart, checkoutStore.returnPath || '/cart')
      snapshotReady.value = true
      return true
    }

    message.info('购物车还是空的，先去挑选一些好物吧')
    router.replace('/cart')
    return false
  }

  checkoutStore.setSource('buyNow')
  checkoutStore.setReturnPath((route.query.from as string) || checkoutStore.returnPath || null)

  if (checkoutStore.hasSnapshot && checkoutStore.source === 'buyNow') {
    snapshotReady.value = true
    return true
  }

  const rawState = route.query.state as string | undefined
  if (rawState) {
    try {
      const state = JSON.parse(rawState) as BuyNowState
      if (state.productId && state.quantity) {
        checkoutStore.setSnapshotFromState(state, checkoutStore.returnPath || undefined)
        snapshotReady.value = true
        return true
      }
    } catch (e) {
      console.warn('解析 buy now 状态失败', e)
    }
  }

  message.info('找不到要购买的商品，请重新选择')
  router.replace(checkoutStore.returnPath || '/menu')
  return false
}

async function refreshPreview(reason?: string) {
  if (!checkoutItems.value.length) {
    message.info('暂无可结算的商品')
    return
  }
  try {
    const data = await checkoutStore.fetchPreview(checkoutItems.value)
    if (data?.price?.itemsAmount) {
      checkoutStore.fetchCoupons(data.price.itemsAmount).catch(() => {
        // 已在 store 内记录提示，这里不再打断流程
      })
    }
    if (reason) {
      message.success(`价格已更新`, { duration: 1500 })
    }
  } catch (err) {
    message.error(getDisplayErrorMessage(err))
  }
}

function handleBack() {
  router.push(backTarget.value)
}

async function handleSubmit() {
  try {
    await formRef.value?.validate()
  } catch {
    message.warning('请完善联系信息后再提交')
    return
  }

  if (!canSubmit.value) {
    message.warning('请先确认最新价格或检查商品状态')
    return
  }

  submitting.value = true
  try {
    const submitRes = await checkoutStore.submit({
      items: checkoutItems.value,
      pickupType: form.pickupType,
      contact: {
        name: form.contactName,
        phone: form.contactPhone
      },
      addressInput: form.pickupType === 'DELIVERY' ? form.address : undefined,
      couponId: checkoutStore.selectedCouponId ?? undefined,
      remark: form.remark || undefined
    })

    const payRes = await checkoutStore.pay({ orderNo: submitRes.orderNo })
    message.success('支付成功，为您跳转订单详情')

    if (checkoutStore.source === 'cart') {
      await cartStore.clearCart()
    }
    checkoutStore.reset()
    Object.assign(form, checkoutStore.formDraft)
    router.replace(`/member/orders/${payRes.orderNo}`)
  } catch (err) {
    message.error(getDisplayErrorMessage(err))
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  initializing.value = true
  const ok = await ensureSnapshot()
  initializing.value = false
  if (ok) {
    await refreshPreview('初始化')
  }
})
</script>

<template>
  <div class="container mx-auto px-4 py-6 lg:py-8 max-w-5xl">
    <div class="flex items-center justify-between mb-6">
      <div>
        <div class="flex items-center gap-3">
          <h1 class="text-2xl font-serif font-bold text-gray-900 dark:text-gray-100">确认订单</h1>
          <NTag size="small" type="warning" round>{{ sourceLabel }}</NTag>
        </div>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          确认商品与联系方式，开启这一刻的美好。
        </p>
      </div>
      <NButton quaternary size="small" @click="handleBack">
        {{ checkoutStore.source === 'buyNow' ? '返回商品' : '返回购物车' }}
      </NButton>
    </div>

    <div v-if="initializing" class="text-center py-16">
      <NSpin size="large" />
      <p class="mt-3 text-[var(--color-text-secondary)]">正在为您准备订单...</p>
    </div>

    <div
      v-else
      class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start"
    >
      <div class="lg:col-span-2 space-y-5">
        <div class="card">
          <div class="flex items-center justify-between mb-3">
            <h3 class="section-title">商品清单</h3>
            <span class="text-xs text-[var(--color-text-secondary)]">
              预览更新时间：{{ lastUpdatedLabel }}
            </span>
          </div>

          <NAlert
            v-if="checkoutStore.source === 'buyNow'"
            type="info"
            size="small"
            class="mb-3"
            show-icon
          >
            立即购买为一次性结算，不会影响购物车内容；如需修改数量请返回商品页。
          </NAlert>

          <div v-if="previewLoading && !previewReady" class="text-center py-10">
            <NSpin size="large" />
            <p class="mt-2 text-[var(--color-text-secondary)]">正在确认最新价格...</p>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="item in previewItems"
              :key="item.productId"
              class="item-row"
              :class="{ 'opacity-60': item.available === false }"
            >
              <div class="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                <img :src="item.image || '/placeholder-product.png'" :alt="item.name" class="w-full h-full object-cover" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <p class="font-medium text-[var(--color-text)] truncate">{{ item.name }}</p>
                    <p class="text-xs text-[var(--color-text-secondary)] mt-1">
                      ￥{{ item.unitPrice.toFixed(2) }} × {{ item.quantity }}
                    </p>
                  </div>
                  <div class="text-right">
                    <p class="text-sm text-[var(--color-primary)] font-semibold">
                      ￥{{ item.subtotal.toFixed(2) }}
                    </p>
                  </div>
                </div>
                <p v-if="item.available === false" class="text-xs text-red-500 mt-1">
                  {{ item.reason || '该商品暂时无法结算，请返回调整' }}
                </p>
              </div>
            </div>

            <NAlert v-if="hasUnavailableItems" type="warning" show-icon>
              部分商品暂时无法结算，请返回调整后再试。
            </NAlert>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center justify-between mb-3">
            <h3 class="section-title">取餐方式</h3>
          </div>
          <NRadioGroup v-model:value="form.pickupType" class="w-full">
            <div class="grid grid-cols-2 gap-3">
              <NRadioButton value="SELF_PICKUP" class="text-center">到店自取</NRadioButton>
              <NRadioButton value="DELIVERY" class="text-center">外卖配送</NRadioButton>
            </div>
          </NRadioGroup>
        </div>

        <div class="card">
          <div class="flex items-center justify-between mb-3">
            <h3 class="section-title">
              {{ form.pickupType === 'SELF_PICKUP' ? '取餐人信息' : '配送信息' }}
            </h3>
          </div>

          <NForm ref="formRef" :model="form" :rules="formRules" label-placement="top">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NFormItem label="联系人" path="contactName">
                <NInput v-model:value="form.contactName" placeholder="请输入联系人姓名" />
              </NFormItem>
              <NFormItem label="手机号" path="contactPhone">
                <NInput v-model:value="form.contactPhone" placeholder="请输入手机号" />
              </NFormItem>
            </div>

            <NFormItem v-if="form.pickupType === 'DELIVERY'" label="配送地址" path="address">
              <NInput
                v-model:value="form.address"
                type="textarea"
                placeholder="请输入详细配送地址"
                :rows="2"
              />
            </NFormItem>

            <NFormItem label="备注（选填）" path="remark">
              <NInput
                v-model:value="form.remark"
                type="textarea"
                placeholder="口味偏好、到店时间等，120 字以内"
                :rows="2"
                maxlength="120"
                show-count
              />
            </NFormItem>
          </NForm>
        </div>

        <div class="card">
          <div class="flex items-center justify-between mb-3">
            <h3 class="section-title">优惠券</h3>
            <NButton text size="small" @click="refreshPreview('手动刷新')">刷新预览</NButton>
          </div>

          <div v-if="!previewReady" class="text-sm text-[var(--color-text-secondary)]">
            确认价格后将显示可用的优惠券。
          </div>
          <NAlert v-if="couponWarning" type="warning" show-icon class="mb-3">
            {{ couponWarning }}
          </NAlert>
          <CouponSelector
            v-else
            :usable="checkoutStore.usableCoupons"
            :unusable="checkoutStore.unusableCoupons"
            v-model:selected-coupon-id="checkoutStore.selectedCouponId"
            :loading="checkoutStore.couponLoading"
          />
        </div>
      </div>

      <div class="lg:col-span-1 space-y-3">
        <CheckoutSummary
          :items-amount="price.itemsAmount"
          :discount-amount="price.discountAmount"
          :pay-amount="price.payAmount"
          :points-estimate="checkoutStore.preview?.pointsEstimate || 0"
          :paying="submitting"
          :previewing="busyState"
          :disabled="!canSubmit"
          :last-updated="checkoutStore.lastPreviewAt || undefined"
          :preview-error="hasPreviewError ? checkoutStore.previewError : null"
          @pay="handleSubmit"
          @refresh="refreshPreview('手动刷新')"
        />

        <NAlert v-if="hasPreviewError" type="error" show-icon>
          {{ checkoutStore.previewError }}，请点击"刷新预览"确认最新价格后再支付。
        </NAlert>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.25rem;
}

.section-title {
  color: var(--color-text);
  font-weight: 500;
}

.item-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 0.75rem;
  border: 1px solid var(--color-border);
  background: var(--color-bg);
}

:deep(.n-radio-button) {
  flex: 1;
}

:deep(.n-radio-group) {
  width: 100%;
}
</style>
