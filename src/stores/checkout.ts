import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import {
  generateIdempotencyKey,
  getUsableCouponsForAmount,
  payOrder,
  previewCheckout,
  submitCheckout,
  type InternalSubmitParams
} from '@/api/checkout'
import type {
  BuyNowState,
  CartItem,
  CheckoutItem,
  CheckoutPreviewResponse,
  CheckoutSource,
  CouponInfo,
  PayOrderRequest,
  PickupType
} from '@/types/cart'
import { getDisplayErrorMessage } from '@/utils/error'

const CHECKOUT_STORAGE_KEY = 'dawn_dusk_checkout_ctx'
const CHECKOUT_FORM_KEY = 'dawn_dusk_checkout_form'

type CheckoutFormDraft = {
  pickupType: PickupType
  contactName: string
  contactPhone: string
  address: string
  remark: string
}

const DEFAULT_FORM_DRAFT: CheckoutFormDraft = {
  pickupType: 'SELF_PICKUP',
  contactName: '',
  contactPhone: '',
  address: '',
  remark: ''
}

type PersistedContext = {
  source?: CheckoutSource
  selectedCouponId?: number | null
  idempotencyKey?: string
  itemsSnapshot?: CartItem[]
  buyNowProductId?: number | null
  returnPath?: string | null
}

const DEFAULT_COUPONS = { usable: [] as CouponInfo[], unusable: [] as CouponInfo[] }

export const useCheckoutStore = defineStore('checkout', () => {
  const source = ref<CheckoutSource>('cart')
  const selectedCouponId = ref<number | null>(null)
  const preview = ref<CheckoutPreviewResponse | null>(null)
  const previewError = ref<string | null>(null)
  const loadingPreview = ref(false)
  const couponLoading = ref(false)
  const couponNotice = ref<string | null>(null)
  const coupons = ref<{ usable: CouponInfo[]; unusable: CouponInfo[] }>({ ...DEFAULT_COUPONS })
  const idempotencyKey = ref<string>(generateIdempotencyKey())
  const lastPreviewAt = ref<string | null>(null)
  const itemsSnapshot = ref<CartItem[]>([])
  const buyNowProductId = ref<number | null>(null)
  const returnPath = ref<string | null>(null)
  const formDraft = ref<CheckoutFormDraft>({ ...DEFAULT_FORM_DRAFT })

  // 恢复持久化上下文
  const stored = localStorage.getItem(CHECKOUT_STORAGE_KEY)
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as PersistedContext
      if (parsed.source) source.value = parsed.source
      if (typeof parsed.selectedCouponId === 'number') selectedCouponId.value = parsed.selectedCouponId
      if (parsed.idempotencyKey) idempotencyKey.value = parsed.idempotencyKey
      if (parsed.itemsSnapshot?.length) itemsSnapshot.value = parsed.itemsSnapshot
      if (typeof parsed.buyNowProductId === 'number') buyNowProductId.value = parsed.buyNowProductId
      if (parsed.returnPath) returnPath.value = parsed.returnPath
    } catch (e) {
      console.warn('恢复结算上下文失败，使用默认值', e)
    }
  }

  // 恢复表单草稿
  const storedForm = localStorage.getItem(CHECKOUT_FORM_KEY)
  if (storedForm) {
    try {
      const parsed = JSON.parse(storedForm) as CheckoutFormDraft
      formDraft.value = { ...DEFAULT_FORM_DRAFT, ...parsed }
    } catch (e) {
      console.warn('恢复结算表单失败，使用默认值', e)
    }
  }

  const checkoutItems = computed<CheckoutItem[]>(() =>
    itemsSnapshot.value.map((item) => ({
      productId: item.productId,
      quantity: item.quantity
    }))
  )
  const hasSnapshot = computed(() => itemsSnapshot.value.length > 0)
  const price = computed(() => preview.value?.price ?? { itemsAmount: 0, discountAmount: 0, payAmount: 0 })
  const usableCoupons = computed(() => coupons.value.usable)
  const unusableCoupons = computed(() => coupons.value.unusable)
  const selectedCoupon = computed(() =>
    selectedCouponId.value != null
      ? usableCoupons.value.find((c) => c.id === selectedCouponId.value) || null
      : null
  )

  function persist() {
    const snapshot: PersistedContext = {
      source: source.value,
      selectedCouponId: selectedCouponId.value,
      idempotencyKey: idempotencyKey.value,
      itemsSnapshot: itemsSnapshot.value,
      buyNowProductId: buyNowProductId.value,
      returnPath: returnPath.value
    }
    localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(snapshot))
  }

  watch([source, selectedCouponId, idempotencyKey, buyNowProductId, returnPath], persist)
  watch(itemsSnapshot, persist, { deep: true })
  watch(
    formDraft,
    (draft) => {
      localStorage.setItem(CHECKOUT_FORM_KEY, JSON.stringify(draft))
    },
    { deep: true }
  )

  function setSource(newSource: CheckoutSource) {
    source.value = newSource
    preview.value = null
    previewError.value = null
  }

  function setReturnPath(path: string | null) {
    returnPath.value = path
  }

  function setCartSnapshot(items: CartItem[], from?: string) {
    source.value = 'cart'
    itemsSnapshot.value = items.map((item) => ({ ...item }))
    buyNowProductId.value = null
    returnPath.value = from ?? '/cart'
    preview.value = null
    previewError.value = null
    couponNotice.value = null
    idempotencyKey.value = generateIdempotencyKey()
  }

  function setBuyNowSnapshot(item: CartItem, from?: string) {
    source.value = 'buyNow'
    itemsSnapshot.value = [{ ...item }]
    buyNowProductId.value = item.productId
    returnPath.value = from ?? `/product/${item.productId}`
    preview.value = null
    previewError.value = null
    coupons.value = { ...DEFAULT_COUPONS }
    couponNotice.value = null
    selectedCouponId.value = null
    idempotencyKey.value = generateIdempotencyKey()
  }

  function setSnapshotFromState(state: BuyNowState, from?: string) {
    const snapshot: CartItem = {
      productId: state.productId,
      name: state.name,
      image: state.image,
      unitPrice: state.unitPrice,
      quantity: state.quantity,
      subtotal: state.unitPrice * state.quantity
    }
    setBuyNowSnapshot(snapshot, from)
  }

  function clearSnapshot() {
    itemsSnapshot.value = []
    buyNowProductId.value = null
  }

  function setFormDraft(draft: CheckoutFormDraft) {
    formDraft.value = { ...draft }
  }

  function resetFormDraft() {
    formDraft.value = { ...DEFAULT_FORM_DRAFT }
    localStorage.removeItem(CHECKOUT_FORM_KEY)
  }

  function setSelectedCouponId(couponId: number | null) {
    selectedCouponId.value = couponId
  }

  function regenerateIdempotencyKey() {
    idempotencyKey.value = generateIdempotencyKey()
  }

  function ensureCouponValidity(amount?: number) {
    const currentId = selectedCouponId.value
    if (!currentId) {
      couponNotice.value = null
      return
    }

    const usableIds = usableCoupons.value.map((c) => c.id)
    const invalidCoupon = unusableCoupons.value.find((c) => c.id === currentId)
    const thresholdInvalid =
      amount && selectedCoupon.value ? selectedCoupon.value.threshold > amount : false

    if (!usableIds.includes(currentId) || thresholdInvalid) {
      selectedCouponId.value = null
      couponNotice.value =
        invalidCoupon?.reason ||
        (thresholdInvalid ? '订单金额低于该优惠券门槛，已为你移除' : '当前优惠券已不可用')
    } else {
      couponNotice.value = null
    }
  }

  async function fetchPreview(items?: CheckoutItem[]) {
    const payloadItems = items ?? checkoutItems.value
    if (!payloadItems.length) {
      previewError.value = '没有可结算的商品'
      return null
    }

    loadingPreview.value = true
    previewError.value = null
    try {
      const data = await previewCheckout({
        items: payloadItems,
        source: source.value,
        couponId: selectedCouponId.value ?? undefined
      })
      applyPreview(data)
      return data
    } catch (err) {
      previewError.value = getDisplayErrorMessage(err)
      throw err
    } finally {
      loadingPreview.value = false
    }
  }

  async function fetchCoupons(amount: number) {
    if (!amount || amount <= 0) {
      coupons.value = { ...DEFAULT_COUPONS }
      return coupons.value
    }

    couponLoading.value = true
    try {
      const data = await getUsableCouponsForAmount(amount)
      coupons.value = data
      ensureCouponValidity(amount)
      return data
    } catch (err) {
      couponNotice.value = getDisplayErrorMessage(err)
      throw err
    } finally {
      couponLoading.value = false
    }
  }

  function applyPreview(data: CheckoutPreviewResponse) {
    preview.value = data
    coupons.value = data.coupons ?? DEFAULT_COUPONS
    lastPreviewAt.value = data.generatedAt || new Date().toISOString()
    ensureCouponValidity(data.price.itemsAmount)
  }

  async function submit(data: Omit<InternalSubmitParams, 'source'>) {
    return submitCheckout({
      ...data,
      source: source.value
    })
  }

  async function pay(data: PayOrderRequest) {
    return payOrder(data, idempotencyKey.value)
  }

  function reset() {
    preview.value = null
    previewError.value = null
    selectedCouponId.value = null
    couponNotice.value = null
    coupons.value = { ...DEFAULT_COUPONS }
    idempotencyKey.value = generateIdempotencyKey()
    lastPreviewAt.value = null
    clearSnapshot()
    returnPath.value = null
    localStorage.removeItem(CHECKOUT_STORAGE_KEY)
  }

  return {
    // state
    source,
    selectedCouponId,
    preview,
    previewError,
    loadingPreview,
    couponLoading,
    couponNotice,
    idempotencyKey,
    lastPreviewAt,
    itemsSnapshot,
    buyNowProductId,
    returnPath,
    formDraft,
    // getters
    checkoutItems,
    usableCoupons,
    unusableCoupons,
    price,
    hasSnapshot,
    selectedCoupon,
    // actions
    setSource,
    setReturnPath,
    setCartSnapshot,
    setBuyNowSnapshot,
    setSnapshotFromState,
    clearSnapshot,
    setFormDraft,
    resetFormDraft,
    setSelectedCouponId,
    regenerateIdempotencyKey,
    fetchPreview,
    fetchCoupons,
    submit,
    pay,
    reset
  }
})
