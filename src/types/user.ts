/**
 * 用户与认证类型定义
 *
 * 定义用户实体、认证请求/响应及相关类型
 */

// ============================================================================
// 用户基础类型
// ============================================================================

/**
 * 用户角色
 * - member: 普通会员
 * - staff: 店员（仅 admin 端使用）
 * - admin: 管理员（仅 admin 端使用）
 */
export type UserRole = 'member' | 'staff' | 'admin'

/**
 * 会员等级（1-4）
 * 1: 晨曦 | 2: 烈阳 | 3: 晚霞 | 4: 繁星
 */
export type MemberLevel = 1 | 2 | 3 | 4

/**
 * 会员等级名称映射
 */
export const MEMBER_LEVEL_NAMES: Record<MemberLevel, string> = {
  1: '晨曦',
  2: '烈阳',
  3: '晚霞',
  4: '繁星',
} as const

/**
 * 获取会员等级名称
 */
export function getMemberLevelName(level: MemberLevel): string {
  return MEMBER_LEVEL_NAMES[level] || '未知等级'
}

// ============================================================================
// 用户实体
// ============================================================================

/**
 * 用户信息
 */
export interface User {
  /** 用户 ID */
  id: number
  /** 用户名（登录名） */
  username: string
  /** 昵称 */
  nickname: string
  /** 手机号（可选） */
  mobile?: string
  /** 头像 URL（可选） */
  avatar?: string
  /** 用户角色 */
  role: UserRole
  /** 会员等级 */
  level: MemberLevel
  /** 等级名称（后端返回） */
  levelName: string
}

/**
 * 用户基本信息（简化版，用于列表展示等场景）
 */
export interface UserBasicInfo {
  /** 用户 ID */
  id: number
  /** 昵称 */
  nickname: string
  /** 头像 URL */
  avatar?: string
  /** 会员等级 */
  level: MemberLevel
  /** 等级名称 */
  levelName: string
}

// ============================================================================
// 认证请求/响应类型
// ============================================================================

/**
 * 登录请求参数
 */
export interface LoginRequest {
  /** 用户名 */
  username: string
  /** 密码 */
  password: string
}

/**
 * 登录响应数据
 */
export interface LoginResponse {
  /** JWT Token */
  token: string
  /** 用户信息 */
  user: User
}

/**
 * 注册请求参数
 */
export interface RegisterRequest {
  /** 用户名 */
  username: string
  /** 密码 */
  password: string
  /** 确认密码 */
  confirmPassword: string
  /** 手机号（可选） */
  mobile?: string
}

/**
 * 注册响应数据
 */
export interface RegisterResponse {
  /** 新用户 ID */
  userId: number
  /** 用户名 */
  username: string
}

/**
 * 更新用户信息请求
 */
export interface UpdateUserRequest {
  /** 昵称 */
  nickname?: string
  /** 手机号 */
  mobile?: string
  /** 头像 URL */
  avatar?: string
}

// ============================================================================
// 认证状态类型
// ============================================================================

/**
 * 认证状态
 */
export interface AuthState {
  /** 是否已登录 */
  isLoggedIn: boolean
  /** JWT Token */
  token: string | null
  /** 当前用户信息 */
  user: User | null
  /** 认证加载状态 */
  loading: boolean
}

/**
 * 创建初始认证状态
 */
export function createInitialAuthState(): AuthState {
  return {
    isLoggedIn: false,
    token: null,
    user: null,
    loading: false,
  }
}

// ============================================================================
// 表单验证规则
// ============================================================================

/**
 * 用户名验证规则
 * - 必填
 * - 3-20 个字符
 * - 仅包含字母、数字、下划线
 */
export const USERNAME_RULES = {
  required: true,
  minLength: 3,
  maxLength: 20,
  pattern: /^[a-zA-Z0-9_]+$/,
  messages: {
    required: '请输入用户名',
    minLength: '用户名至少 3 个字符',
    maxLength: '用户名最多 20 个字符',
    pattern: '用户名只能包含字母、数字和下划线',
  },
} as const

/**
 * 密码验证规则
 * - 必填
 * - 6-32 个字符
 */
export const PASSWORD_RULES = {
  required: true,
  minLength: 6,
  maxLength: 32,
  messages: {
    required: '请输入密码',
    minLength: '密码至少 6 个字符',
    maxLength: '密码最多 32 个字符',
  },
} as const

/**
 * 手机号验证规则（中国大陆）
 */
export const MOBILE_RULES = {
  required: false,
  pattern: /^1[3-9]\d{9}$/,
  messages: {
    pattern: '请输入有效的手机号码',
  },
} as const

// ============================================================================
// 本地存储键名
// ============================================================================

/**
 * 认证相关的本地存储键
 */
export const AUTH_STORAGE_KEYS = {
  /** JWT Token */
  TOKEN: 'dawn_dusk_token',
  /** 用户信息 */
  USER: 'dawn_dusk_user',
} as const
