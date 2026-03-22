import request from '@/utils/request'

export interface BangumiSubject {
  id: number
  name: string
  name_cn: string
  summary: string
  images: {
    large: string
    common: string
    medium: string
    small: string
    grid: string
  }
  eps: number
  date: string
}

export interface AnimeSubject {
  id: number
  bgmId: number
  title: string
  imageUrl: string
  eps: number
  airDate?: string
  airYear: number
  airSeason: number
}

export interface AnimeProgress {
  animeId: number
  status: number
  watchedEps: number[]
  trackDate: string
  lastWatchAt?: string
}

export interface AnimeListItem {
  subject: AnimeSubject
  progress: AnimeProgress
}

export interface AnimeImportResult {
  action: 'CREATED' | 'UPDATED'
  message: string
}

export interface AnimeListQuery {
  year?: number
  season?: number
  status?: number
  trackDateStart?: string
  trackDateEnd?: string
}

export const animeApi = {
  /**
   * 搜索 Bangumi 番剧
   * @param keyword 关键词
   */
  search(keyword: string) {
    return request.get<any, BangumiSubject[]>('/anime/search', { params: { keyword } })
  },
  /**
   * 导入番剧元数据
   */
  import(data: { bgmId: number; trackDate?: string }) {
    return request.post<any, AnimeImportResult>('/anime/import', data)
  },
  /**
   * 获取番剧列表
   */
  getList(params?: AnimeListQuery) {
    return request.get<any, AnimeListItem[]>('/anime/list', { params })
  },
  /**
   * 切换集数观看状态
   */
  toggle(animeId: number, episodeIndex: number) {
    return request.post('/anime/toggle', { animeId, episodeIndex })
  },
  /**
   * 快捷更新进度到第N集
   */
  seenTo(animeId: number, episode: number) {
    return request.put('/anime/progress/seen-to', { animeId, episode })
  },
  /**
   * 快捷一键看完
   */
  complete(animeId: number) {
    return request.put('/anime/progress/complete', { animeId })
  },
  /**
   * 快捷重置进度
   */
  reset(animeId: number) {
    return request.put('/anime/progress/reset', { animeId })
  },
  /**
   * 更新开始追番时间
   */
  updateTrackDate(animeId: number, trackDate: string) {
    return request.put('/anime/track-date', { animeId, trackDate })
  }
}
