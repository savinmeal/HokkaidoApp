// ============================================================
// Trip Types
// ============================================================

export type TripActivityType =
  | 'transport'
  | 'attraction'
  | 'food'
  | 'hotel'
  | 'ski'
  | 'shopping'
  | 'other'


export type TripActivity = {
  id: string

  time?: string

  title: string

  type: TripActivityType

  location?: string

  latitude?: number

  longitude?: number

  note?: string

  completed?: boolean
}


export type TripDay = {
  id: string

  dayNumber: number

  date: string

  city?: string

  subtitle?: string

  activities: TripActivity[]
}


// ============================================================
// Trip Info
// ============================================================

export const tripInfo = {
  id: 'hokkaido-2026',
  name: '北海道冬旅',
  location: 'Hokkaido, Japan',
  year: 2026,
  startDate: '2026-12-25',
  endDate: '2027-01-02',
  type: 'WINTER · ROAD TRIP',
}


// ============================================================
// Trip Days
//
// 目前先建立完整 9 天骨架。
// 真實行程還沒確定，所以 activities 暫時保持空陣列。
// 後續只需要把行程項目放進 activities 即可。
// ============================================================

export const tripDays: TripDay[] = [

  {
    id: '2026-12-25',
    dayNumber: 1,
    date: '2026-12-25',
    city: '',
    subtitle: '',
    activities: [],
  },

  {
    id: '2026-12-26',
    dayNumber: 2,
    date: '2026-12-26',
    city: '',
    subtitle: '',
    activities: [],
  },

  {
    id: '2026-12-27',
    dayNumber: 3,
    date: '2026-12-27',
    city: '',
    subtitle: '',
    activities: [],
  },

  {
    id: '2026-12-28',
    dayNumber: 4,
    date: '2026-12-28',
    city: '',
    subtitle: '',
    activities: [],
  },

  {
    id: '2026-12-29',
    dayNumber: 5,
    date: '2026-12-29',
    city: '',
    subtitle: '',
    activities: [],
  },

  {
    id: '2026-12-30',
    dayNumber: 6,
    date: '2026-12-30',
    city: '',
    subtitle: '',
    activities: [],
  },

  {
    id: '2026-12-31',
    dayNumber: 7,
    date: '2026-12-31',
    city: '',
    subtitle: '',
    activities: [],
  },

  {
    id: '2027-01-01',
    dayNumber: 8,
    date: '2027-01-01',
    city: '',
    subtitle: '',
    activities: [],
  },

  {
    id: '2027-01-02',
    dayNumber: 9,
    date: '2027-01-02',
    city: '',
    subtitle: '',
    activities: [],
  },

]