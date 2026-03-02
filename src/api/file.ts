/**
 * 文件上传 API 模块
 */

import apiClient from './client'

export interface FileUploadResponse {
  /** 完整访问 URL（永久地址，存入数据库） */
  url: string
  /** 七牛存储 key */
  key: string
  /** 原始文件名 */
  filename: string
  /** 临时签名 URL（用于上传后预览） */
  signedUrl: string
  /** 签名有效期（秒） */
  expireSeconds: number
}

/**
 * 上传图片文件
 * POST /api/file/upload
 * @param file 图片文件
 * @param directory 存储目录，默认 'common'
 */
export async function uploadFile(file: File, directory = 'common'): Promise<FileUploadResponse> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('directory', directory)

  const response = await apiClient.post<FileUploadResponse>('/file/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}
