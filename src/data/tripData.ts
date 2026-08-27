// ============================================================
// Shared Trip Storage
// ============================================================

export const TRIP_STORAGE_KEY =
  'travel_v100_hokkaido_trip_days_v1'

export const TRIP_META_STORAGE_KEY =
  'travel_v100_hokkaido_trip_meta_v1'

export const TRIP_LOCK_STORAGE_KEY =
  'travel_v100_hokkaido_trip_lock_v1'


// ============================================================
// Trip Regions
// ============================================================

export type TripRegionId =
  | 'sapporo'
  | 'asahikawa'
  | 'furano'
  | 'otaru'
  | 'niseko'


export type TripRegion = {
  id: TripRegionId
  name: string
  englishName: string
  latitude: number
  longitude: number
}


export const tripRegions: TripRegion[] = [
  {
    id: 'sapporo',
    name: '札幌',
    englishName: 'SAPPORO',
    latitude: 43.0618,
    longitude: 141.3545,
  },
  {
    id: 'asahikawa',
    name: '旭川',
    englishName: 'ASAHIKAWA',
    latitude: 43.7706,
    longitude: 142.365,
  },
  {
    id: 'furano',
    name: '富良野',
    englishName: 'FURANO',
    latitude: 43.3394,
    longitude: 142.3869,
  },
  {
    id: 'otaru',
    name: '小樽',
    englishName: 'OTARU',
    latitude: 43.1907,
    longitude: 140.9947,
  },
  {
    id: 'niseko',
    name: '二世古',
    englishName: 'NISEKO',
    latitude: 42.8048,
    longitude: 140.6874,
  },
]


// ============================================================
// Trip Meta
// ============================================================

export type TripMeta = {
  id: string

  // Trip 頁左上角顯示，例如「2026 HOKKAIDO」
  headerLabel: string

  name: string
  location: string
  startDate: string
  endDate: string
  type: string
}


export const tripInfo: TripMeta = {
  id: 'hokkaido-2026',
  headerLabel: '2026 HOKKAIDO',
  name: '北海道冬旅',
  location: 'Hokkaido, Japan',
  startDate: '2026-12-25',
  endDate: '2027-01-02',
  type: 'WINTER · ROAD TRIP',
}


// ============================================================
// Trip Activity
// ============================================================

export type TripActivityType =
  | 'transport'
  | 'attraction'
  | 'food'
  | 'hotel'
  | 'ski'
  | 'shopping'
  | 'other'




// ============================================================
// Trip Expense
// ============================================================

export type ExpenseCurrency =
  | 'TWD'
  | 'JPY'
  | 'USD'


export type ExpensePaymentMethod =
  | 'credit_card'
  | 'cash'


export type TripExpense = {
  id: string

  // 消費項目，例如：午餐、纜車票、停車費
  item: string

  // 詳細內容，例如：2 人套餐、4 小時停車
  detail?: string

  amount: number

  // 每一筆消費保留原始幣別，不會因顯示幣別切換而改變。
  currency: ExpenseCurrency

  // 舊資料可能沒有 paymentMethod，因此保持 optional 相容。
  paymentMethod?: ExpensePaymentMethod

  // 若使用 Home 設定的指定信用卡 / 付款 Profile，
  // 保存 Profile ID 供額度統計使用。
  paymentProfileId?: string

  // 照片本體存放於 IndexedDB，
  // 這裡只保存 Photo ID。
  photoIds?: string[]

  createdAt: number
}


export type TripActivity = {
  id: string
  time?: string
  title: string
  type: TripActivityType

  // 顯示在 Trip Timeline 的地點文字。
  // 舊資料只有 location 也可以繼續使用。
  location?: string

  // 使用者在 Google Maps 人工確認後貼回來的精準連結。
  // 單筆導航時會優先使用這個 URL。
  googleMapsUrl?: string

  // 是否已人工確認導航位置。
  // 即使沒有貼 googleMapsUrl，也可以標記為已確認。
  mapConfirmed?: boolean

  latitude?: number
  longitude?: number
  note?: string

  // 此行程的消費紀錄。
  expenses?: TripExpense[]

  completed?: boolean
}


export type TripDay = {
  id: string
  dayNumber: number
  date: string

  // 與 Weather / Snow Forecast 串接用
  regionId?: TripRegionId

  city?: string
  subtitle?: string

  activities: TripActivity[]
}


// ============================================================
// Date Helpers
// ============================================================

function parseDateOnly(
  dateString: string
) {
  return new Date(
    `${dateString}T12:00:00`
  )
}


function toDateString(
  date: Date
) {
  const year =
    date.getFullYear()

  const month =
    String(
      date.getMonth() + 1
    ).padStart(
      2,
      '0'
    )

  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      '0'
    )

  return `${year}-${month}-${day}`
}


// ============================================================
// Generate Trip Days
//
// 相同日期如果已經有資料，會保留：
// - regionId
// - city
// - subtitle
// - activities
//
// 日期範圍改變後，DAY Number 會重新從 1 排序。
// ============================================================

export function generateTripDays(
  startDate: string,
  endDate: string,
  existingDays: TripDay[] = []
): TripDay[] {

  const start =
    parseDateOnly(
      startDate
    )

  const end =
    parseDateOnly(
      endDate
    )


  if (
    Number.isNaN(
      start.getTime()
    ) ||
    Number.isNaN(
      end.getTime()
    ) ||
    start > end
  ) {
    return []
  }


  const existingMap =
    new Map(
      existingDays.map(
        day => [
          day.date,
          day,
        ]
      )
    )


  const result: TripDay[] = []

  const cursor =
    new Date(
      start
    )


  let dayNumber = 1


  while (
    cursor <= end
  ) {

    const date =
      toDateString(
        cursor
      )


    const existing =
      existingMap.get(
        date
      )


    result.push({
      id:
        date,

      dayNumber,

      date,

      regionId:
        existing?.regionId,

      city:
        existing?.city ?? '',

      subtitle:
        existing?.subtitle ?? '',

      activities:
        existing?.activities ?? [],
    })


    cursor.setDate(
      cursor.getDate() + 1
    )


    dayNumber += 1

  }


  return result
}


// ============================================================
// Default Trip Days
// ============================================================

export const tripDays =
  generateTripDays(
    tripInfo.startDate,
    tripInfo.endDate
  )