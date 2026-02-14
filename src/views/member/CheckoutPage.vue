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
  NSpin,
  NTag,
  NIcon,
  type FormInst,
  type FormRules
} from 'naive-ui'
import {
  StorefrontOutline,
  BicycleOutline,
  PersonOutline,
  PhonePortraitOutline,
  LocationOutline,
  CreateOutline,
  ChevronBack
} from '@vicons/ionicons5'
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
    { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号', trigger: 'blur' }
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
  const phoneOk = /^1[3-9]\d{9}$/.test(form.contactPhone)
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
  checkoutStore.source === 'buyNow' ? '立即购买' : '购物车结算'
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
  const historyBack = window.history.state?.back as string | null | undefined
  if (historyBack && router.resolve(historyBack).fullPath === router.resolve(backTarget.value).fullPath) {
    router.back()
    return
  }

  router.replace(backTarget.value)
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
      pickupName: form.contactName,
      pickupPhone: form.contactPhone,
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

function selectPickup(type: PickupType) {
  form.pickupType = type
}

onMounted(async () => {
  initializing.value = true
  const ok = await ensureSnapshot()
  initializing.value = false
  if (ok) {
    await refreshPreview()
  }
})
</script>

<template>
  <div class="min-h-screen pb-20">
    <div class="container mx-auto px-4 py-8 lg:py-10 max-w-5xl">
      <!-- 顶部 Header -->
      <div class="glass-card px-6 py-5 mb-8">
        <!-- 三栏式导航：左按钮 / 中标题+副标题 / 右占位 -->
        <div class="flex items-center">
          <NButton circle secondary @click="handleBack">
            <template #icon>
              <NIcon><ChevronBack /></NIcon>
            </template>
          </NButton>
          <div class="flex-1 text-center">
            <div class="flex items-center justify-center gap-2">
              <h1 class="text-2xl font-serif font-bold text-[var(--color-text)]">确认订单</h1>
              <NTag size="small" type="primary" bordered round class="font-medium opacity-90">
                {{ sourceLabel }}
              </NTag>
            </div>
            <p class="text-sm text-[var(--color-text-secondary)] mt-1">
              确认商品与联系方式，开启这一刻的美好。
            </p>
          </div>
          <!-- 右侧占位，与左侧按钮等宽，保持标题视觉居中 -->
          <div class="w-[34px]"></div>
        </div>
      </div>

      <div v-if="initializing" class="flex flex-col items-center justify-center py-20">
        <NSpin size="large" />
        <p class="mt-4 text-[var(--color-text-secondary)] animate-pulse">正在为您准备订单...</p>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <!-- 左侧主要内容区 -->
        <div class="lg:col-span-8 space-y-6">
          
          <!-- 商品清单卡片 -->
          <div class="bg-[var(--color-bg-secondary)] rounded-2xl p-6 shadow-sm border border-[var(--color-border)]">
            <div class="flex items-center justify-between mb-5">
              <h3 class="card-title">商品清单</h3>
              <span class="text-xs text-[var(--color-text-secondary)] bg-[var(--color-bg)] border border-[var(--color-border)] px-2 py-1 rounded">
                {{ lastUpdatedLabel }}
              </span>
            </div>

            <NAlert
              v-if="checkoutStore.source === 'buyNow'"
              type="info"
              class="mb-5 rounded-lg border-none bg-blue-50 dark:bg-blue-900/20"
              :show-icon="true"
            >
              立即购买为一次性结算，不会影响购物车内容。
            </NAlert>

            <div v-if="previewLoading && !previewReady" class="text-center py-12">
              <NSpin size="medium" />
              <p class="mt-2 text-sm text-[var(--color-text-secondary)]">正在确认最新价格...</p>
            </div>

            <div v-else class="space-y-6">
              <div
                v-for="item in previewItems"
                :key="item.productId"
                class="group relative flex gap-4 transition-opacity duration-200"
                :class="{ 'opacity-50 grayscale': item.available === false }"
              >
                <!-- 商品图片 -->
                <div class="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-[var(--color-bg)] flex-shrink-0 shadow-sm border border-[var(--color-border)]">
                  <img 
                    :src="item.image || '/placeholder-product.png'" 
                    :alt="item.name" 
                    class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" 
                  />
                </div>
                
                <!-- 商品信息 -->
                <div class="flex-1 min-w-0 flex flex-col justify-between py-1">
                  <div>
                    <div class="flex justify-between items-start gap-2">
                      <p class="font-medium text-lg text-[var(--color-text)] truncate">{{ item.name }}</p>
                      <p class="font-bold text-[var(--color-text)] whitespace-nowrap">
                        ￥{{ item.subtotal.toFixed(2) }}
                      </p>
                    </div>
                    <!-- 规格/描述预留位置 -->
                    <p class="text-sm text-[var(--color-text-secondary)] mt-0.5 line-clamp-1">
                      {{ item.name.includes('拿铁') ? '标准糖 · 热' : '默认规格' }}
                    </p>
                  </div>
                  
                  <div class="flex justify-between items-end">
                    <p class="text-sm text-[var(--color-text-secondary)] bg-[var(--color-bg)] px-2 py-0.5 rounded inline-block border border-[var(--color-border)]">
                      ￥{{ item.unitPrice.toFixed(2) }} × {{ item.quantity }}
                    </p>
                    <p v-if="item.available === false" class="text-xs text-red-500 font-medium">
                      {{ item.reason || '无法结算' }}
                    </p>
                  </div>
                </div>
              </div>

              <NAlert v-if="hasUnavailableItems" type="warning" class="rounded-lg" show-icon>
                部分商品暂时无法结算，请返回调整后再试。
              </NAlert>
            </div>
          </div>

          <!-- 取餐方式卡片 -->
          <div class="bg-[var(--color-bg-secondary)] rounded-2xl p-6 shadow-sm border border-[var(--color-border)]">
            <h3 class="card-title mb-4">取餐方式</h3>
            <div class="grid grid-cols-2 gap-4">
              <div 
                class="cursor-pointer relative p-4 rounded-xl border transition-all duration-200 flex flex-col items-center gap-3 text-center hover:shadow-md"
                :class="form.pickupType === 'SELF_PICKUP' ? 'border-[var(--color-primary)] bg-[var(--color-bg)] shadow-sm' : 'border-[var(--color-border)] bg-[var(--color-bg)]'"
                @click="selectPickup('SELF_PICKUP')"
              >
                <div 
                  class="p-3 rounded-full shadow-sm text-[var(--color-primary)]"
                  :class="form.pickupType === 'SELF_PICKUP' ? 'bg-[var(--color-bg-secondary)]' : 'bg-[var(--color-bg-secondary)]'"
                >
                  <NIcon size="24"><StorefrontOutline /></NIcon>
                </div>
                <div>
                  <div class="font-medium text-[var(--color-text)]">到店自取</div>
                  <div class="text-xs text-[var(--color-text-secondary)] mt-1">无需排队，到店即拿</div>
                </div>
                <div v-if="form.pickupType === 'SELF_PICKUP'" class="absolute top-2 right-2 text-[var(--color-primary)]">
                  <div class="w-2 h-2 rounded-full bg-current"></div>
                </div>
              </div>

              <div 
                class="cursor-pointer relative p-4 rounded-xl border transition-all duration-200 flex flex-col items-center gap-3 text-center hover:shadow-md"
                :class="form.pickupType === 'DELIVERY' ? 'border-[var(--color-primary)] bg-[var(--color-bg)] shadow-sm' : 'border-[var(--color-border)] bg-[var(--color-bg)]'"
                @click="selectPickup('DELIVERY')"
              >
                <div 
                  class="p-3 rounded-full shadow-sm text-[var(--color-primary)]"
                  :class="form.pickupType === 'DELIVERY' ? 'bg-[var(--color-bg-secondary)]' : 'bg-[var(--color-bg-secondary)]'"
                >
                  <NIcon size="24"><BicycleOutline /></NIcon>
                </div>
                <div>
                  <div class="font-medium text-[var(--color-text)]">外卖配送</div>
                  <div class="text-xs text-[var(--color-text-secondary)] mt-1">专业配送，美味直达</div>
                </div>
                <div v-if="form.pickupType === 'DELIVERY'" class="absolute top-2 right-2 text-[var(--color-primary)]">
                  <div class="w-2 h-2 rounded-full bg-current"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- 信息填写卡片 -->
          <div class="bg-[var(--color-bg-secondary)] rounded-2xl p-6 shadow-sm border border-[var(--color-border)]">
            <h3 class="card-title mb-5">
              {{ form.pickupType === 'SELF_PICKUP' ? '取餐人信息' : '配送信息' }}
            </h3>

            <NForm ref="formRef" :model="form" :rules="formRules" label-placement="top" size="medium">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <NFormItem label="联系人" path="contactName">
                  <NInput v-model:value="form.contactName" placeholder="怎么称呼您" class="custom-input">
                    <template #prefix><NIcon :component="PersonOutline" /></template>
                  </NInput>
                </NFormItem>
                <NFormItem label="手机号" path="contactPhone">
                  <NInput v-model:value="form.contactPhone" placeholder="便于接收取餐通知" class="custom-input">
                    <template #prefix><NIcon :component="PhonePortraitOutline" /></template>
                  </NInput>
                </NFormItem>
              </div>

              <NFormItem v-if="form.pickupType === 'DELIVERY'" label="配送地址" path="address" class="mt-2">
                <NInput
                  v-model:value="form.address"
                  type="textarea"
                  placeholder="请输入详细的楼号、门牌号"
                  :rows="2"
                  class="custom-input"
                >
                  <template #prefix>
                    <div class="mt-1"><NIcon :component="LocationOutline" /></div>
                  </template>
                </NInput>
              </NFormItem>

              <NFormItem label="备注（选填）" path="remark" class="mt-2">
                <NInput
                  v-model:value="form.remark"
                  type="textarea"
                  placeholder="如有口味偏好或特殊需求，请告诉我们"
                  :rows="2"
                  maxlength="120"
                  show-count
                  class="custom-input"
                >
                  <template #prefix>
                    <div class="mt-1"><NIcon :component="CreateOutline" /></div>
                  </template>
                </NInput>
              </NFormItem>
            </NForm>
          </div>

          <!-- 优惠券卡片 -->
          <div class="bg-[var(--color-bg-secondary)] rounded-2xl p-6 shadow-sm border border-[var(--color-border)]">
            <div class="flex items-center justify-between mb-4">
              <h3 class="card-title">优惠券</h3>
            </div>

            <div v-if="!previewReady" class="text-sm text-[var(--color-text-secondary)] py-4 text-center bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg">
              确认价格后将显示可用的优惠券
            </div>
            
            <NAlert v-if="couponWarning" type="warning" show-icon class="mb-3 rounded-lg">
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

        <!-- 右侧结算栏 (Sticky) -->
        <div class="lg:col-span-4 space-y-4 lg:sticky lg:top-8">
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

          <NAlert v-if="hasPreviewError" type="error" show-icon class="rounded-xl shadow-sm border-red-100">
            {{ checkoutStore.previewError }}
          </NAlert>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card-title {
  color: var(--color-text);
  font-weight: 600;
  font-size: 1.125rem; /* text-lg */
  font-family: var(--font-serif);
}

:deep(.n-input.custom-input) {
  border-radius: 0.5rem;
  background-color: var(--color-bg);
  border-color: var(--color-border);
}

:deep(.n-input.custom-input:hover) {
  border-color: var(--color-primary);
}

:deep(.n-input.custom-input .n-input__prefix) {
  margin-right: 8px;
  color: var(--color-text-secondary);
}

/* 覆盖 Naive UI 默认样式以匹配设计 */
:deep(.n-form-item-label) {
  font-weight: 500;
  color: var(--color-text-secondary);
}
</style>
