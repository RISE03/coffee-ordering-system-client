import { ref, computed, type Ref } from 'vue'

interface RequestStateOptions<T> {
  /**
   * Custom check for "empty" state.
   * Default logic: data is null/undefined or empty array.
   */
  checkEmpty?: (data: T) => boolean
}

export function useRequestState<T = any>(
  initialData: T | null = null,
  options: RequestStateOptions<T> = {}
) {
  const data = ref<T | null>(initialData) as Ref<T | null>
  const loading = ref(false)
  const error = ref<any>(null)
  
  // Store the last run function to support retry
  const lastRun = ref<(() => Promise<T>) | null>(null)

  const empty = computed(() => {
    // Basic empty checks
    if (data.value === null || data.value === undefined) return true
    if (Array.isArray(data.value) && data.value.length === 0) return true
    // Custom check
    if (options.checkEmpty) return options.checkEmpty(data.value)
    return false
  })

  /**
   * Execute the async request
   * @param requestFn A function that returns a Promise
   */
  const run = async (requestFn: () => Promise<T>): Promise<T | null> => {
    loading.value = true
    error.value = null
    lastRun.value = requestFn

    try {
      const result = await requestFn()
      data.value = result
      return result
    } catch (err: any) {
      // Log error for debugging, but state handles the UI
      console.error('[useRequestState] Error:', err)
      error.value = err
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Retry the last executed request
   */
  const retry = async () => {
    if (lastRun.value) {
      return run(lastRun.value)
    } else {
      console.warn('[useRequestState] No previous request to retry')
      return null
    }
  }

  /**
   * Reset state to initial values
   */
  const reset = () => {
    data.value = initialData
    loading.value = false
    error.value = null
    lastRun.value = null
  }

  return {
    data,
    loading,
    error,
    empty,
    run,
    retry,
    reset
  }
}
