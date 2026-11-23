import { getFollowedAreas, request } from './api.js'

// Followed areas are kept on the back-end, so following an area shows up on every screen.

export async function isFollowingArea(areaId) {
  const followedAreas = await getFollowedAreas()
  return followedAreas.some(area => area.id === areaId)
}

// follow (true) or unfollow (false) an area, the back-end replies with { areaId, following }
export function setFollowingArea(areaId, following) {
  return request('/followed-areas', {
    method: 'POST',
    body: { areaId, following },
  })
}

// the Followed areas screen gets its list from the back-end
export function getMyFollowedAreas() {
  return getFollowedAreas()
}
