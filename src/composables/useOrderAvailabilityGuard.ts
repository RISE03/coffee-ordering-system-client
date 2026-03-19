import { getDisplayErrorMessage } from '@/utils/error'
import {
  formatStoreClosedMessage,
  getOrderAvailabilityStatus
} from '@/utils/order-availability'

type MessageApiLike = {
  warning: (content: string) => void
}

/**
 * 统一守卫结算入口：打烊时提示并阻止继续
 */
export async function guardOrderEntry(message: MessageApiLike): Promise<boolean> {
  try {
    const status = await getOrderAvailabilityStatus(true)
    if (status.isOpen) {
      return true
    }

    message.warning(formatStoreClosedMessage(status.businessHours))
    return false
  } catch (err) {
    message.warning(getDisplayErrorMessage(err))
    return false
  }
}
