import request from '@/utils/request'

export interface AnimeSubject {
  id: number
  bgmId: number
  title: string
  imageUrl: string
  eps: number
  status: number
  airYear: number
  airSeason: number
}

export interface AnimeProgress {
  animeId: number
  watchedEps: number[]
}

export interface AnimeListItem {
  subject: AnimeSubject
  progress: AnimeProgress
}

export const animeApi = {
  search(keyword: string) {
    return request.get<any, any[]>('/anime/search', { params: { keyword } })
  },
  import(data: { bgmId: number; airYear: number; airSeason: number }) {
    return request.post('/anime/import', data)
  },
  getList(year?: number, season?: number) {
    return request.get<any, AnimeListItem[]>('/anime/list', { params: { year, season } })
  },
  toggle(animeId: number, episodeIndex: number) {
    return request.post('/anime/toggle', { animeId, episodeIndex })
  },
  updateStatus(animeId: number, status: number) {
    return request.put('/anime/status', { animeId, status })
  }
}
