import request from '@/utils/request'

// ======== Interfaces ========

export interface NoteSaveParams {
  id?: number
  title: string
  summary?: string
  content: string
  moduleType: number // 0:学习, 1:随笔, 2:兴趣
  status: number // 0:草稿, 1:发布
  coverUrl?: string
  tags?: string[]
}

export interface NoteListItem {
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

export interface NoteDetail {
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

export const noteApi = {
  /**
   * 保存或更新笔记
   */
  save(data: NoteSaveParams) {
    return request.post<any, number>('/note/save', data)
  },

  /**
   * 获取笔记分页列表
   */
  getList(params: { pageNum?: number; pageSize?: number; moduleType?: number; status?: number }) {
    return request.get<any, PageData<NoteListItem>>('/note/list', { params })
  },

  /**
   * 获取笔记详情（含 Markdown 正文）
   */
  getDetail(id: number) {
    return request.get<any, NoteDetail>(`/note/${id}`)
  }
}
