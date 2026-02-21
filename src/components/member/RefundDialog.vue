<template>
  <n-modal
    v-model:show="visible"
    preset="card"
    :title="dialogTitle"
    :style="{ maxWidth: '540px' }"
    :mask-closable="false"
    :closable="!submitting"
  >
    <n-form ref="formRef" :model="formData" :rules="formRules" label-placement="top">
      <!-- 退款原因选择 -->
      <n-form-item label="退款原因" path="reason">
        <n-space vertical class="w-full">
          <div
            v-for="option in reasonOptions"
            :key="option.value"
            class="reason-option"
            :class="{ 'reason-option--selected': formData.reason === option.label }"
            @click="selectReason(option)"
          >
            <div class="reason-radio">
              <div v-if="formData.reason === option.label" class="reason-radio-dot" />
            </div>
            <span class="reason-label">{{ option.label }}</span>
          </div>
        </n-space>
      </n-form-item>

      <!-- 详细说明 -->
      <n-form-item v-if="needsDescription" label="详细说明" path="description">
        <n-input
          v-model:value="formData.description"
          type="textarea"
          :placeholder="descriptionPlaceholder"
          :rows="3"
          maxlength="200"
          show-count
        />
      </n-form-item>

      <!-- 图片上传 -->
      <n-form-item v-if="needsImages" label="上传图片" path="images">
        <div class="upload-section">
          <p class="upload-hint">请上传商品问题照片（最多3张）</p>
          <n-upload
            v-model:file-list="fileList"
            :max="3"
            list-type="image-card"
            accept="image/*"
            :custom-request="handleUpload"
            @remove="handleRemove"
          >
            <n-button v-if="fileList.length < 3" quaternary>
              <template #icon>
                <n-icon><CameraOutline /></n-icon>
              </template>
              选择图片
            </n-button>
          </n-upload>
        </div>
      </n-form-item>

      <!-- 温馨提示 -->
      <n-alert v-if="isAfterSale" type="info">
        售后申请提交后，我们会在1-2个工作日内审核处理，请耐心等待。
      </n-alert>
    </n-form>

    <template #footer>
      <div class="flex justify-end gap-3">
        <n-button @click="handleCancel" :disabled="submitting">取消</n-button>
        <n-button type="primary" @click="handleSubmit" :loading="submitting" :disabled="!canSubmit">
          {{ submitting ? '提交中...' : '确认提交' }}
        </n-button>
      </div>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { NModal, NForm, NFormItem, NInput, NButton, NSpace, NIcon, NUpload, NAlert, useMessage, type FormInst, type FormRules, type UploadFileInfo, type UploadCustomRequestOptions } from 'naive-ui'
import { CameraOutline } from '@vicons/ionicons5'
import { useOrderStore } from '@/stores/order'
import { uploadRefundImage } from '@/api/order'
import { getRefundReasonsByStatus, type OrderStatus, type RefundReasonOption } from '@/types/order'
import { getDisplayErrorMessage } from '@/utils/error'

interface Props {
  modelValue: boolean
  orderNo: string
  status: OrderStatus
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}>()

const message = useMessage()
const orderStore = useOrderStore()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 表单相关
const formRef = ref<FormInst | null>(null)
const formData = ref({
  reason: '',
  reasonValue: '',
  description: '',
  images: [] as string[]
})

const fileList = ref<UploadFileInfo[]>([])
const submitting = ref(false)

// 退款原因选项
const reasonOptions = computed(() => getRefundReasonsByStatus(props.status))

// 当前选中的原因配置
const selectedReasonOption = computed(() =>
  reasonOptions.value.find(opt => opt.label === formData.value.reason)
)

// 是否需要详细说明
const needsDescription = computed(() => selectedReasonOption.value?.requiresDescription ?? false)

// 是否需要上传图片
const needsImages = computed(() => selectedReasonOption.value?.requiresImages ?? false)

// 是否为售后场景
const isAfterSale = computed(() => props.status === 'COMPLETED')

// 弹窗标题
const dialogTitle = computed(() => isAfterSale.value ? '申请售后' : '申请退款')

// 说明占位符
const descriptionPlaceholder = computed(() =>
  isAfterSale.value
    ? '请详细描述商品问题，以便我们更好地为您处理（至少10字）'
    : '可选填补充说明'
)

// 表单验证规则
const formRules = computed<FormRules>(() => {
  const rules: FormRules = {
    reason: {
      required: true,
      message: '请选择退款原因',
      trigger: 'change'
    }
  }

  if (needsDescription.value) {
    rules.description = {
      required: true,
      message: '请填写详细说明',
      trigger: 'blur',
      validator: (_rule, value: string) => {
        if (!value || value.trim().length < 10) {
          return new Error('详细说明至少需要10个字')
        }
        return true
      }
    }
  }

  if (needsImages.value) {
    rules.images = {
      required: true,
      message: '请上传商品问题图片',
      trigger: 'change',
      validator: () => {
        if (formData.value.images.length === 0) {
          return new Error('请至少上传1张图片')
        }
        return true
      }
    }
  }

  return rules
})

// 是否可以提交
const canSubmit = computed(() => {
  if (!formData.value.reason) return false
  if (needsDescription.value && (!formData.value.description || formData.value.description.trim().length < 10)) return false
  if (needsImages.value && formData.value.images.length === 0) return false
  return true
})

// 选择退款原因
function selectReason(option: RefundReasonOption) {
  formData.value.reason = option.label
  formData.value.reasonValue = option.value

  // 如果切换到不需要说明/图片的选项，清空相关数据
  if (!option.requiresDescription) {
    formData.value.description = ''
  }
  if (!option.requiresImages) {
    formData.value.images = []
    fileList.value = []
  }
}

// 图片上传
async function handleUpload({ file, onFinish, onError }: UploadCustomRequestOptions) {
  try {
    const url = await uploadRefundImage(file.file as File)
    formData.value.images.push(url)
    onFinish()
  } catch (err) {
    message.error(getDisplayErrorMessage(err))
    onError()
  }
}

// 移除图片
function handleRemove({ file }: { file: UploadFileInfo }) {
  const index = fileList.value.findIndex(f => f.id === file.id)
  if (index !== -1) {
    formData.value.images.splice(index, 1)
  }
}

// 取消
function handleCancel() {
  if (!submitting.value) {
    visible.value = false
  }
}

// 提交
async function handleSubmit() {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
  } catch {
    return
  }

  submitting.value = true

  try {
    await orderStore.doRefundOrder(props.orderNo, {
      reason: formData.value.reasonValue,
      description: formData.value.description || undefined,
      images: formData.value.images.length > 0 ? formData.value.images : undefined
    })

    message.success(
      isAfterSale.value
        ? '售后申请已提交，我们会尽快为您处理'
        : '退款申请已提交，请耐心等待审核'
    )

    visible.value = false
    emit('success')
  } catch (err) {
    message.error(getDisplayErrorMessage(err))
  } finally {
    submitting.value = false
  }
}

// 重置表单
function resetForm() {
  formData.value = {
    reason: '',
    reasonValue: '',
    description: '',
    images: []
  }
  fileList.value = []
}

// 监听弹窗关闭，重置表单
watch(visible, (val) => {
  if (!val) {
    setTimeout(resetForm, 300)
  }
})
</script>

<style scoped>
.reason-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid color-mix(in srgb, var(--color-text) 15%, transparent);
  background: color-mix(in srgb, var(--color-bg) 50%, transparent);
  cursor: pointer;
  transition: all 0.2s ease;
}

.reason-option:hover {
  border-color: color-mix(in srgb, var(--color-primary) 40%, transparent);
  background: color-mix(in srgb, var(--color-primary) 5%, transparent);
}

.reason-option--selected {
  border-color: var(--color-primary);
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
}

.reason-radio {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid color-mix(in srgb, var(--color-text) 30%, transparent);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: border-color 0.2s ease;
}

.reason-option--selected .reason-radio {
  border-color: var(--color-primary);
}

.reason-radio-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--color-primary);
}

.reason-label {
  flex: 1;
  font-size: 15px;
  color: var(--color-text);
}

.upload-section {
  width: 100%;
}

.upload-hint {
  margin: 0 0 12px 0;
  font-size: 13px;
  color: color-mix(in srgb, var(--color-text) 60%, transparent);
}
</style>
