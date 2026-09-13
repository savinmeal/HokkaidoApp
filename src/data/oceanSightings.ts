// ============================================================
// Ocean Sightings / Social Radar
// ============================================================

export type OceanSightingKind =
  | 'official'
  | 'news'
  | 'threads'
  | 'youtube'


export type OceanSightingCategory =
  | 'whale-shark'
  | 'manta'
  | 'cetacean'
  | 'shark'
  | 'sunfish'
  | 'turtle'
  | 'ray'
  | 'school'
  | 'wildlife'


export type OceanSightingItem = {
  id: string
  kind: OceanSightingKind
  category: OceanSightingCategory
  speciesLabel: string
  title: string
  regionId: string
  regionName: string
  locationLabel: string
  date: string
  count: number | null
  latitude: number | null
  longitude: number | null
  sourceName: string
  authorName?: string | null
  thumbnailUrl?: string | null
  url: string | null
}


export type OceanSightingsResponse = {
  success: boolean
  updatedAt: string
  requestedRegionId: string
  usedRegionId: string
  fallbackToTaiwan: boolean
  officialAvailable: boolean
  newsAvailable: boolean
  threadsConfigured: boolean
  threadsAvailable: boolean
  youtubeConfigured: boolean
  youtubeAvailable: boolean
  items: OceanSightingItem[]
}


export const OCEAN_SIGHTING_REGION_NAMES:
  Record<string, string> =
{
  taiwan: '全台',
  northeast: '東北角',
  kenting: '墾丁',
  liuqiu: '小琉球',
  'green-island': '綠島',
  lanyu: '蘭嶼',
  taitung: '台東',
  penghu: '澎湖',
}


export async function fetchOceanSightings({
  regionId,
  limit = 12,
  days = 120,
  signal,
}: {
  regionId: string
  limit?: number
  days?: number
  signal?: AbortSignal
}) {

  const params =
    new URLSearchParams({
      regionId,
      limit: String(limit),
      days: String(days),
    })


  const response =
    await fetch(
      `/api/ocean/sightings?${params.toString()}`,
      {
        signal,
      }
    )


  if (
    !response.ok
  ) {
    throw new Error(
      `Ocean Sightings API ${response.status}`
    )
  }


  const data =
    await response.json() as
      OceanSightingsResponse


  if (
    !data.success
  ) {
    throw new Error(
      'Ocean Sightings API failed'
    )
  }


  return data

}
