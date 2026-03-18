import request from '@/utils/request'

// ======== Interfaces ========

export interface ContentSaveParams {
  id?: number
  title: string
  summary?: string
  content: string
  moduleType: number // 0:学习, 1:随笔, 2:兴趣
  status: number // 0:草稿, 1:发布
  coverUrl?: string
  tags?: string[]
}

export interface ContentListItem {
  id: number
  title: string
  summary: string
  moduleType: number
  status: number
  coverUrl: string | null
  views: number
  createTime: string
  updateTime: string
  tags: string[]
}

export interface ContentDetail {
  id: number
  title: string
  content: string
  moduleType: number
  status: number
  coverUrl: string | null
  views: number
  createTime: string
  updateTime: string
  tags: string[]
}

export interface PageData<T> {
  list: T[]
  total: number
  pageNum: number
  pageSize: number
}

// ======== API ========

export const contentApi = {
  /**
   * 保存或更新文章
   */
  save(data: ContentSaveParams) {
    return request.post<any, number>('/content/save', data)
  },

  /**
   * 获取文章分页列表
   */
  getList(params: { pageNum?: number; pageSize?: number; moduleType?: number; status?: number }) {
    return request.get<any, PageData<ContentListItem>>('/content/list', { params })
  },

  /**
   * 获取文章详情（含 Markdown 正文）
   */
  getDetail(id: number) {
    return request.get<any, ContentDetail>(`/content/${id}`)
  }
}
