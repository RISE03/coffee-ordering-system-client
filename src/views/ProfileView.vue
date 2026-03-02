<template>
  <div class="container mx-auto px-4 py-6">
    <div class="max-w-lg mx-auto flex flex-col gap-4">

      <!-- 1. 头像 Hero 卡片 -->
      <div class="hero-card glass-card" :class="{ 'hero-card--dusk': themeStore.isDusk }">
        <div class="flex flex-col items-center pt-8 pb-5 px-5 relative z-[1]">
          <!-- 头像 -->
          <n-avatar
            round
            :size="80"
            :src="authStore.user?.avatar"
            class="profile-avatar"
          />
          <h1 class="text-xl font-bold text-[var(--color-text)] mt-3 truncate max-w-[80%] text-center">
            {{ authStore.user?.nickname || authStore.user?.username }}
          </h1>
          <span
            class="level-badge mt-2"
            :class="`level-${authStore.user?.level ?? 1}`"
          >
            Lv.{{ authStore.user?.level }} {{ authStore.user?.levelName || '会员' }}
          </span>
          <span class="text-xs text-[var(--color-text-secondary)] mt-1.5">
            ID: {{ authStore.user?.id }}
          </span>
        </div>
      </div>

      <!-- 2. 数据统计条 -->
      <div class="glass-card points-card">
        <div class="points-main">
          <n-icon :size="18" class="points-main-icon"><TimeOutline /></n-icon>
          <span class="points-main-label">光阴值</span>
          <span class="points-main-value">{{ pointsInfo?.balance ?? '--' }}</span>
          <span class="points-main-sub">可用余额</span>
        </div>
        <div class="points-footer">
          <span class="points-footer-text">累计获得</span>
          <span class="points-footer-value">{{ pointsInfo?.totalEarned ?? '--' }}</span>
        </div>
      </div>

      <!-- 3. 功能菜单列表 -->
      <div class="glass-card overflow-hidden">
        <!-- 我的足迹 -->
        <div class="menu-group-title">我的足迹</div>
        <div class="menu-item" @click="$router.push('/member/orders')">
          <n-icon :size="20" class="menu-icon"><ReceiptOutline /></n-icon>
          <span class="menu-text">时光账单</span>
          <n-icon :size="18" class="menu-arrow"><ChevronForwardOutline /></n-icon>
        </div>

        <div class="menu-divider" />

        <!-- 专属好礼 -->
        <div class="menu-group-title">专属好礼</div>
        <div class="menu-item" @click="$router.push('/points')">
          <n-icon :size="20" class="menu-icon"><TimeOutline /></n-icon>
          <span class="menu-text">光阴小铺</span>
          <n-icon :size="18" class="menu-arrow"><ChevronForwardOutline /></n-icon>
        </div>
        <div class="menu-item" @click="$router.push('/coupons')">
          <n-icon :size="20" class="menu-icon"><TicketOutline /></n-icon>
          <span class="menu-text">光阴福袋</span>
          <n-icon :size="18" class="menu-arrow"><ChevronForwardOutline /></n-icon>
        </div>

        <div class="menu-divider" />

        <!-- 账号设置 -->
        <div class="menu-group-title">账号设置</div>
        <div class="menu-item" @click="openEditProfile">
          <n-icon :size="20" class="menu-icon"><PersonOutline /></n-icon>
          <span class="menu-text">编辑资料</span>
          <n-icon :size="18" class="menu-arrow"><ChevronForwardOutline /></n-icon>
        </div>
        <div class="menu-item" @click="openChangePassword">
          <n-icon :size="20" class="menu-icon"><LockClosedOutline /></n-icon>
          <span class="menu-text">修改密码</span>
          <n-icon :size="18" class="menu-arrow"><ChevronForwardOutline /></n-icon>
        </div>
      </div>

      <!-- 4. 退出登录按钮 -->
      <button class="logout-button" @click="handleLogout">
        <n-icon :size="18" class="mr-1.5"><LogOutOutline /></n-icon>
        退出登录
      </button>

    </div>
  </div>

  <!-- 编辑资料弹窗 -->
  <n-modal
    v-model:show="showEditProfile"
    preset="card"
    title="编辑资料"
    class="profile-modal"
    :bordered="false"
    :mask-closable="true"
    style="max-width: 420px; width: 90vw;"
  >
    <n-form
      ref="editFormRef"
      :model="editForm"
      :rules="editRules"
      label-placement="top"
    >
      <n-form-item label="头像" path="avatar">
        <div class="avatar-upload-area">
          <!-- 预览 -->
          <n-avatar round :size="64" :src="editForm.avatarPreview || editForm.avatar" class="avatar-upload-preview" />
          <!-- 上传按钮 -->
          <div class="avatar-upload-right">
            <input
              ref="fileInputRef"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              style="display:none"
              @change="handleFileChange"
            />
            <n-button
              :loading="avatarUploading"
              :disabled="avatarUploading"
              size="small"
              @click="fileInputRef?.click()"
            >
              {{ avatarUploading ? '上传中…' : '选择图片' }}
            </n-button>
            <span class="avatar-upload-hint">支持 jpg、png、webp，最大 5MB</span>
          </div>
        </div>
      </n-form-item>
      <n-form-item label="昵称" path="nickname">
        <n-input
          v-model:value="editForm.nickname"
          placeholder="请输入昵称（2-20个字符）"
          :maxlength="20"
          show-count
          clearable
        />
      </n-form-item>
      <n-form-item label="手机号" path="mobile">
        <n-input
          v-model:value="editForm.mobile"
          placeholder="请输入手机号（可留空）"
          clearable
        />
      </n-form-item>
    </n-form>
    <template #footer>
      <div class="flex justify-end gap-3">
        <n-button @click="showEditProfile = false">取消</n-button>
        <n-button type="primary" :loading="editLoading" @click="handleSaveProfile">
          保存
        </n-button>
      </div>
    </template>
  </n-modal>

  <!-- 修改密码弹窗 -->
  <n-modal
    v-model:show="showChangePassword"
    preset="card"
    title="修改密码"
    class="profile-modal"
    :bordered="false"
    :mask-closable="true"
    style="max-width: 420px; width: 90vw;"
  >
    <n-form
      ref="pwdFormRef"
      :model="pwdForm"
      :rules="pwdRules"
      label-placement="top"
    >
      <n-form-item label="当前密码" path="oldPassword">
        <n-input
          v-model:value="pwdForm.oldPassword"
          type="password"
          placeholder="请输入当前密码"
          show-password-on="click"
        />
      </n-form-item>
      <n-form-item label="新密码" path="newPassword">
        <n-input
          v-model:value="pwdForm.newPassword"
          type="password"
          placeholder="请输入新密码（6-32位）"
          show-password-on="click"
        />
      </n-form-item>
      <n-form-item label="确认新密码" path="confirmPassword">
        <n-input
          v-model:value="pwdForm.confirmPassword"
          type="password"
          placeholder="再次输入新密码"
          show-password-on="click"
        />
      </n-form-item>
    </n-form>
    <template #footer>
      <div class="flex justify-end gap-3">
        <n-button @click="showChangePassword = false">取消</n-button>
        <n-button type="primary" :loading="pwdLoading" @click="handleChangePassword">
          确认修改
        </n-button>
      </div>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  NAvatar, NIcon, NModal, NForm, NFormItem, NInput, NButton,
  useMessage, useDialog, type FormInst, type FormRules
} from 'naive-ui'
import { uploadFile } from '@/api/file'
import {
  ReceiptOutline,
  TimeOutline,
  TicketOutline,
  ChevronForwardOutline,
  LogOutOutline,
  PersonOutline,
  LockClosedOutline,
} from '@vicons/ionicons5'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { useRouter } from 'vue-router'
import { getMyPoints, updateUserProfile, changePassword, getCurrentUser, type PointsInfo } from '@/api/user'

const authStore = useAuthStore()
const themeStore = useThemeStore()
const router = useRouter()
const message = useMessage()
const dialog = useDialog()

const pointsInfo = ref<PointsInfo | null>(null)

onMounted(async () => {
  try {
    pointsInfo.value = await getMyPoints()
  } catch (e) {
    console.error('获取积分信息失败', e)
  }
})

// ============================================================================
// 编辑资料
// ============================================================================

const showEditProfile = ref(false)
const editLoading = ref(false)
const editFormRef = ref<FormInst | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const avatarUploading = ref(false)

const editForm = ref({
  avatar: '',        // 存入后端的永久 URL
  avatarPreview: '', // 上传成功后的临时预览地址（signedUrl）
  nickname: '',
  mobile: '',
})

const editRules: FormRules = {
  nickname: [
    { min: 2, max: 20, message: '昵称需在 2-20 个字符之间', trigger: 'blur' },
  ],
  mobile: [
    { pattern: /^(1[3-9]\d{9})?$/, message: '请输入有效的手机号', trigger: 'blur' },
  ],
}

function openEditProfile() {
  editForm.value = {
    avatar: authStore.user?.avatar ?? '',
    avatarPreview: '',
    nickname: authStore.user?.nickname ?? '',
    mobile: authStore.user?.mobile ?? '',
  }
  showEditProfile.value = true
}

async function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  avatarUploading.value = true
  try {
    const result = await uploadFile(file, 'avatar')
    editForm.value.avatar = result.url           // 永久 URL，保存到后端
    editForm.value.avatarPreview = result.signedUrl // 临时签名 URL，用于预览
    message.success('头像上传成功')
  } catch (e: any) {
    const msg = e?.response?.data?.message || '上传失败，请重试'
    message.error(msg)
  } finally {
    avatarUploading.value = false
    // 重置 input，允许再次选同一文件
    input.value = ''
  }
}

async function handleSaveProfile() {
  try {
    await editFormRef.value?.validate()
  } catch {
    return
  }

  editLoading.value = true
  try {
    await updateUserProfile({
      avatar: editForm.value.avatar || undefined,
      nickname: editForm.value.nickname || undefined,
      mobile: editForm.value.mobile || undefined,
    })
    // 重新拉取最新用户信息
    const latestUser = await getCurrentUser()
    authStore.setUser(latestUser)
    message.success('资料已更新')
    showEditProfile.value = false
  } catch (e: any) {
    const msg = e?.response?.data?.message || '更新失败，请稍后重试'
    message.error(msg)
  } finally {
    editLoading.value = false
  }
}

// ============================================================================
// 修改密码
// ============================================================================

const showChangePassword = ref(false)
const pwdLoading = ref(false)
const pwdFormRef = ref<FormInst | null>(null)

const pwdForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const pwdRules: FormRules = {
  oldPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' },
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 32, message: '密码长度为 6-32 位', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (_rule, value) => {
        if (value !== pwdForm.value.newPassword) {
          return new Error('两次输入的密码不一致')
        }
        return true
      },
      trigger: 'blur',
    },
  ],
}

function openChangePassword() {
  pwdForm.value = { oldPassword: '', newPassword: '', confirmPassword: '' }
  showChangePassword.value = true
}

async function handleChangePassword() {
  try {
    await pwdFormRef.value?.validate()
  } catch {
    return
  }

  pwdLoading.value = true
  try {
    await changePassword({
      oldPassword: pwdForm.value.oldPassword,
      newPassword: pwdForm.value.newPassword,
    })
    message.success('密码已修改，请重新登录')
    showChangePassword.value = false
    // 修改密码后退出登录
    await authStore.logout(false)
    router.push('/login')
  } catch (e: any) {
    const msg = e?.response?.data?.message || '修改失败，请检查当前密码是否正确'
    message.error(msg)
  } finally {
    pwdLoading.value = false
  }
}

// ============================================================================
// 退出登录
// ============================================================================

function handleLogout() {
  dialog.warning({
    title: '确认退出',
    content: '确定要退出登录吗？',
    positiveText: '退出',
    negativeText: '取消',
    onPositiveClick: async () => {
      await authStore.logout()
      message.success('已退出登录')
      router.push('/login')
    },
  })
}
</script>

<style scoped>
/* Hero 卡片 —— 顶部柔光晕效果 */
.hero-card {
  position: relative;
  overflow: hidden;
}

.hero-card::before {
  content: '';
  position: absolute;
  top: -40%;
  left: 50%;
  translate: -50% 0;
  width: 120%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    color-mix(in srgb, #F5B041 28%, transparent) 0%,
    color-mix(in srgb, #E09D2B 12%, transparent) 40%,
    transparent 70%
  );
  pointer-events: none;
}

.hero-card--dusk::before {
  background: radial-gradient(
    circle,
    color-mix(in srgb, #FAD7A0 22%, transparent) 0%,
    color-mix(in srgb, #E8C78B 10%, transparent) 40%,
    transparent 70%
  );
}

/* 头像样式 */
.profile-avatar {
  border: 3px solid var(--color-bg) !important;
  box-shadow: 0 0 0 3px var(--color-primary),
              0 0 16px color-mix(in srgb, var(--color-primary) 35%, transparent);
}

/* 头像上传区域 */
.avatar-upload-area {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
}

.avatar-upload-preview {
  flex-shrink: 0;
  border: 2px solid var(--color-primary);
}

.avatar-upload-right {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.avatar-upload-hint {
  font-size: 12px;
  color: var(--color-text-secondary);
}

/* 等级徽章基础样式 */
.level-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 14px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  letter-spacing: 0.5px;
}

/* Lv.1 晨曦 - 柔橙渐变 */
.level-1 {
  background: linear-gradient(135deg, #FFB347, #FF8C42);
}

/* Lv.2 烈阳 - 明黄橙渐变 */
.level-2 {
  background: linear-gradient(135deg, #FFC107, #FF9800);
}

/* Lv.3 晚霞 - 粉紫渐变 */
.level-3 {
  background: linear-gradient(135deg, #E991C8, #9B59B6);
}

/* Lv.4 繁星 - 深蓝金渐变 */
.level-4 {
  background: linear-gradient(135deg, #2C3E50, #D4AC0D);
  color: #FAD7A0;
}

/* 统计卡片 —— 主次突出型 */
.points-card {
  padding: 0;
  overflow: hidden;
}

.points-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 20px 16px;
  gap: 2px;
}

.points-main-icon {
  color: var(--color-primary);
  margin-bottom: 2px;
}

.points-main-label {
  font-size: 13px;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.points-main-value {
  font-size: 32px;
  font-weight: 800;
  color: var(--color-primary);
  line-height: 1.2;
  letter-spacing: -0.5px;
}

.points-main-sub {
  font-size: 11px;
  color: var(--color-text-secondary);
  opacity: 0.7;
}

.points-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  border-top: 1px solid var(--glass-border-subtle);
  background: color-mix(in srgb, var(--color-primary) 4%, transparent);
}

.points-footer-text {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.points-footer-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
}

/* 菜单组标题 */
.menu-group-title {
  padding: 12px 20px 4px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
  letter-spacing: 0.5px;
}

/* 菜单项 */
.menu-item {
  display: flex;
  align-items: center;
  padding: 14px 20px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.menu-item:hover {
  background: var(--glass-bg-hover);
}

.menu-item:active {
  background: var(--glass-bg-strong);
}

.menu-icon {
  color: var(--color-primary);
  flex-shrink: 0;
}

.menu-text {
  flex: 1;
  margin-left: 12px;
  font-size: 15px;
  color: var(--color-text);
}

.menu-arrow {
  color: var(--color-text-secondary);
  opacity: 0.5;
  flex-shrink: 0;
}

/* 菜单分隔线 */
.menu-divider {
  height: 1px;
  margin: 4px 20px;
  background: var(--glass-border-subtle);
}

/* 退出登录按钮 */
.logout-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 14px;
  border-radius: 16px;
  font-size: 15px;
  font-weight: 500;
  color: #E74C3C;
  background: color-mix(in srgb, #E74C3C 8%, var(--glass-bg));
  border: 1px solid color-mix(in srgb, #E74C3C 20%, transparent);
  backdrop-filter: var(--glass-blur-sm);
  -webkit-backdrop-filter: var(--glass-blur-sm);
  transition: background 0.2s ease, transform 0.1s ease;
}

.logout-button:hover {
  background: color-mix(in srgb, #E74C3C 16%, var(--glass-bg));
}

.logout-button:active {
  transform: scale(0.98);
}
</style>
