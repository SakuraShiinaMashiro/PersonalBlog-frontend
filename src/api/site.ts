import request from '../utils/request'

export interface OwnerProfile {
  username: string
  avatarUrl: string
}

export const siteApi = {
  getOwnerProfile: () => {
    return request.get<OwnerProfile>('/site/owner-profile')
  }
}
