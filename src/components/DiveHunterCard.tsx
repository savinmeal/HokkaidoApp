import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from 'react'


import taiwanMap from '../assets/taiwan_map.png'


import OceanSightingsCard from './OceanSightingsCard'


import {
  DIVE_SITE_GUIDE_SOURCE_NAME,
  getDiveSiteGuideSourceByRegion,
  getDiveSiteGuidesByRegion,
} from '../data/diveSiteGuideCatalog'


// ============================================================
// Dive Hunter V1
//
// Data:
// - Open-Meteo Marine API
// - Open-Meteo Weather API
//
// Important:
// - This is a CONDITION SCORE, not a SAFETY SCORE.
// - Marine current / sea-level models are coarse near shore.
// - Dive entry conditions must still be checked on site.
// ============================================================


// ============================================================
// Types
// ============================================================

type OceanMode =
  | 'freedive'
  | 'scuba'
  | 'surf'



type DiveHunterTextSize =
  | 'small'
  | 'medium'
  | 'large'



type DiveHunterTab =
  | 'conditions'
  | 'spots'
  | 'sightings'


type OceanRegion = {
  id: string
  name: string
  enName: string
}


type OceanSpot = {
  id: string
  regionId: string

  name: string
  enName: string

  latitude: number
  longitude: number

  activities:
    OceanMode[]

  entryType:
    | 'shore'
    | 'boat'
    | 'mixed'

  note?: string
}


type MarineApiResponse = {
  latitude?: number
  longitude?: number

  current?: {
    time?: string

    wave_height?: number
    wave_direction?: number
    wave_period?: number

    swell_wave_height?: number
    swell_wave_direction?: number
    swell_wave_period?: number

    sea_surface_temperature?: number

    ocean_current_velocity?: number
    ocean_current_direction?: number

    sea_level_height_msl?: number
  }

  hourly?: {
    time?: string[]

    wave_height?: Array<
      number |
      null
    >

    swell_wave_height?: Array<
      number |
      null
    >

    swell_wave_period?: Array<
      number |
      null
    >

    sea_surface_temperature?: Array<
      number |
      null
    >

    ocean_current_velocity?: Array<
      number |
      null
    >

    sea_level_height_msl?: Array<
      number |
      null
    >
  }
}


type WeatherApiResponse = {
  current?: {
    time?: string

    temperature_2m?: number

    wind_speed_10m?: number
    wind_gusts_10m?: number

    precipitation?: number
    weather_code?: number
  }

  hourly?: {
    time?: string[]

    wind_speed_10m?: Array<
      number |
      null
    >

    wind_gusts_10m?: Array<
      number |
      null
    >

    precipitation?: Array<
      number |
      null
    >

    precipitation_probability?: Array<
      number |
      null
    >
  }
}


type OceanSnapshot = {
  spot:
    OceanSpot

  fetchedAt:
    string

  marineTime:
    string |
    null

  weatherTime:
    string |
    null

  waveHeight:
    number |
    null

  waveDirection:
    number |
    null

  wavePeriod:
    number |
    null

  swellHeight:
    number |
    null

  swellDirection:
    number |
    null

  swellPeriod:
    number |
    null

  seaTemp:
    number |
    null

  currentVelocity:
    number |
    null

  currentDirection:
    number |
    null

  seaLevel:
    number |
    null

  windSpeed:
    number |
    null

  windGust:
    number |
    null

  precipitation:
    number |
    null

  weatherCode:
    number |
    null

  next6h: {
    waveMax:
      number |
      null

    swellMax:
      number |
      null

    currentMax:
      number |
      null

    windMax:
      number |
      null

    gustMax:
      number |
      null

    rainProbabilityMax:
      number |
      null

    rainSum:
      number |
      null
  }

  next12h: {
    waveMax:
      number |
      null

    swellMax:
      number |
      null

    currentMax:
      number |
      null

    windMax:
      number |
      null

    gustMax:
      number |
      null

    rainProbabilityMax:
      number |
      null

    rainSum:
      number |
      null
  }

  series12h: {
    time:
      string[]

    waveHeight:
      Array<
        number |
        null
      >

    currentVelocity:
      Array<
        number |
        null
      >

    seaLevel:
      Array<
        number |
        null
      >

    windSpeed:
      Array<
        number |
        null
      >
  }
}


type ScoreBreakdown = {
  key: string
  label: string
  score: number
  max: number
}


type OceanScore = {
  score: number

  grade:
    'A' |
    'B' |
    'C' |
    'D' |
    'E'

  label:
    'EXCELLENT' |
    'GOOD' |
    'FAIR' |
    'POOR' |
    'AVOID'

  summary:
    string

  accentClass:
    string

  barClass:
    string

  breakdown:
    ScoreBreakdown[]

  warnings:
    string[]

  dataQuality:
    'FULL' |
    'PARTIAL'
}


// ============================================================
// Catalog
//
// Coordinates are for marine forecast sampling around the spot.
// They are not intended to be used as exact water-entry waypoints.
// ============================================================

const OCEAN_REGIONS:
  OceanRegion[] =
[
  {
    id:
      'northeast',

    name:
      '東北角',

    enName:
      'NORTHEAST COAST',
  },

  {
    id:
      'kenting',

    name:
      '墾丁',

    enName:
      'KENTING',
  },

  {
    id:
      'liuqiu',

    name:
      '小琉球',

    enName:
      'LIUQIU',
  },

  {
    id:
      'green-island',

    name:
      '綠島',

    enName:
      'GREEN ISLAND',
  },

  {
    id:
      'lanyu',

    name:
      '蘭嶼',

    enName:
      'ORCHID ISLAND',
  },

  {
    id:
      'taitung',

    name:
      '台東',

    enName:
      'TAITUNG',
  },

  {
    id:
      'penghu',

    name:
      '澎湖',

    enName:
      'PENGHU',
  },
]


const OCEAN_SPOTS:
  OceanSpot[] =
[
  // ==========================================================
  // Northeast coast
  // ==========================================================

  {
    id:
      'longdong-bay',

    regionId:
      'northeast',

    name:
      '龍洞灣',

    enName:
      'LONGDONG BAY',

    latitude:
      25.116,

    longitude:
      121.919,

    activities: [
      'freedive',
      'scuba',
    ],

    entryType:
      'shore',

    note:
      '岩岸進出，現場浪況非常重要。',
  },

  {
    id:
      'longdong-four-seasons',

    regionId:
      'northeast',

    name:
      '龍洞四季灣',

    enName:
      'LONGDONG FOUR SEASONS',

    latitude:
      25.123,

    longitude:
      121.915,

    activities: [
      'freedive',
      'scuba',
    ],

    entryType:
      'shore',
  },

  {
    id:
      'chaojing',

    regionId:
      'northeast',

    name:
      '潮境公園',

    enName:
      'CHAOJING',

    latitude:
      25.144,

    longitude:
      121.803,

    activities: [
      'freedive',
      'scuba',
    ],

    entryType:
      'shore',
  },

  {
    id:
      'wushi-harbor',

    regionId:
      'northeast',

    name:
      '烏石港',

    enName:
      'WUSHI HARBOR',

    latitude:
      24.872,

    longitude:
      121.839,

    activities: [
      'surf',
    ],

    entryType:
      'shore',
  },


  // ==========================================================
  // Kenting
  // ==========================================================

  {
    id:
      'houbihu',

    regionId:
      'kenting',

    name:
      '後壁湖',

    enName:
      'HOUBIHU',

    latitude:
      21.944,

    longitude:
      120.744,

    activities: [
      'freedive',
      'scuba',
    ],

    entryType:
      'mixed',
  },

  {
    id:
      'wanlitong',

    regionId:
      'kenting',

    name:
      '萬里桐',

    enName:
      'WANLITONG',

    latitude:
      21.997,

    longitude:
      120.705,

    activities: [
      'freedive',
      'scuba',
    ],

    entryType:
      'shore',
  },

  {
    id:
      'jialeshui',

    regionId:
      'kenting',

    name:
      '佳樂水',

    enName:
      'JIALESHUI',

    latitude:
      21.991,

    longitude:
      120.862,

    activities: [
      'surf',
    ],

    entryType:
      'shore',
  },


  // ==========================================================
  // Liuqiu
  // ==========================================================

  {
    id:
      'liuqiu-shanfu',

    regionId:
      'liuqiu',

    name:
      '杉福',

    enName:
      'SHANFU',

    latitude:
      22.337,

    longitude:
      120.359,

    activities: [
      'freedive',
      'scuba',
    ],

    entryType:
      'shore',
  },

  {
    id:
      'liuqiu-houshi',

    regionId:
      'liuqiu',

    name:
      '厚石群礁',

    enName:
      'HOUSHI REEF',

    latitude:
      22.327,

    longitude:
      120.367,

    activities: [
      'freedive',
      'scuba',
    ],

    entryType:
      'shore',
  },


  // ==========================================================
  // Green Island
  // ==========================================================

  {
    id:
      'green-island-shilang',

    regionId:
      'green-island',

    name:
      '石朗',

    enName:
      'SHILANG',

    latitude:
      22.642,

    longitude:
      121.471,

    activities: [
      'freedive',
      'scuba',
    ],

    entryType:
      'shore',
  },

  {
    id:
      'green-island-chaikou',

    regionId:
      'green-island',

    name:
      '柴口',

    enName:
      'CHAIKOU',

    latitude:
      22.677,

    longitude:
      121.493,

    activities: [
      'freedive',
      'scuba',
    ],

    entryType:
      'shore',
  },


  // ==========================================================
  // Orchid Island
  // ==========================================================

  {
    id:
      'lanyu-yeyou',

    regionId:
      'lanyu',

    name:
      '椰油',

    enName:
      'YEYOU',

    latitude:
      22.054,

    longitude:
      121.509,

    activities: [
      'freedive',
      'scuba',
    ],

    entryType:
      'mixed',
  },

  {
    id:
      'lanyu-yeyin',

    regionId:
      'lanyu',

    name:
      '野銀',

    enName:
      'YEYIN',

    latitude:
      22.029,

    longitude:
      121.566,

    activities: [
      'freedive',
      'scuba',
    ],

    entryType:
      'shore',
  },


  // ==========================================================
  // Taitung surf
  // ==========================================================

  {
    id:
      'jinzun',

    regionId:
      'taitung',

    name:
      '金樽',

    enName:
      'JINZUN',

    latitude:
      22.954,

    longitude:
      121.295,

    activities: [
      'surf',
    ],

    entryType:
      'shore',
  },


  // ==========================================================
  // Penghu
  // ==========================================================

  {
    id:
      'penghu-shili',

    regionId:
      'penghu',

    name:
      '嵵裡',

    enName:
      'SHILI',

    latitude:
      23.528,

    longitude:
      119.565,

    activities: [
      'freedive',
      'scuba',
    ],

    entryType:
      'mixed',
  },
]


// ============================================================
// Storage
// ============================================================

const OCEAN_MODE_STORAGE_KEY =
  'travel_v100_ocean_mode_v1'


const OCEAN_SPOT_STORAGE_KEY =
  'travel_v100_ocean_spot_v1'



const DIVE_HUNTER_TEXT_SIZE_STORAGE_KEY =
  'travel_v100_dive_hunter_text_size_v1'


function loadDiveHunterTextSize():
  DiveHunterTextSize {

  try {

    const value =
      localStorage.getItem(
        DIVE_HUNTER_TEXT_SIZE_STORAGE_KEY
      )


    if (
      value ===
        'small' ||
      value ===
        'medium' ||
      value ===
        'large'
    ) {

      return value

    }

  } catch {
    // ignore
  }


  return 'medium'

}


function loadOceanMode():
  OceanMode {

  try {

    const value =
      localStorage.getItem(
        OCEAN_MODE_STORAGE_KEY
      )


    if (
      value ===
        'freedive' ||
      value ===
        'scuba' ||
      value ===
        'surf'
    ) {

      return value

    }

  } catch {
    // ignore
  }


  return 'freedive'

}


function loadOceanSpotId() {

  try {

    return (
      localStorage.getItem(
        OCEAN_SPOT_STORAGE_KEY
      ) ||
      'longdong-bay'
    )

  } catch {

    return 'longdong-bay'

  }

}


// ============================================================
// Utility
// ============================================================

function normalizeResponseArray<T>(
  value:
    T |
    T[]
):
  T[] {

  return Array.isArray(
    value
  )
    ? value
    : [
        value,
      ]

}


function safeNumber(
  value:
    unknown
):
  number |
  null {

  return typeof value ===
      'number' &&
    Number.isFinite(
      value
    )
    ? value
    : null

}


function round(
  value:
    number |
    null,
  digits =
    1
):
  number |
  null {

  if (
    value ===
    null
  ) {
    return null
  }


  const factor =
    10 **
    digits


  return (
    Math.round(
      value *
      factor
    ) /
    factor
  )

}


function maxValid(
  values:
    Array<
      number |
      null
    > |
    undefined,
  count:
    number
):
  number |
  null {

  if (
    !values
  ) {
    return null
  }


  const valid =
    values
      .slice(
        0,
        count
      )
      .filter(
        (
          value
        ):
          value is number =>
          typeof value ===
            'number' &&
          Number.isFinite(
            value
          )
      )


  if (
    valid.length ===
    0
  ) {
    return null
  }


  return Math.max(
    ...valid
  )

}


function sumValid(
  values:
    Array<
      number |
      null
    > |
    undefined,
  count:
    number
):
  number |
  null {

  if (
    !values
  ) {
    return null
  }


  const valid =
    values
      .slice(
        0,
        count
      )
      .filter(
        (
          value
        ):
          value is number =>
          typeof value ===
            'number' &&
          Number.isFinite(
            value
          )
      )


  if (
    valid.length ===
    0
  ) {
    return null
  }


  return valid.reduce(
    (
      total,
      value
    ) =>
      total +
      value,
    0
  )

}


function takeSeries(
  values:
    Array<
      number |
      null
    > |
    undefined,
  count:
    number
):
  Array<
    number |
    null
  > {

  if (
    !values
  ) {
    return []
  }


  return values
    .slice(
      0,
      count
    )
    .map(
      value =>
        typeof value ===
          'number' &&
        Number.isFinite(
          value
        )
          ? value
          : null
    )

}


function compassDirection(
  degree:
    number |
    null
) {

  if (
    degree ===
    null
  ) {
    return '—'
  }


  const names = [
    'N',
    'NE',
    'E',
    'SE',
    'S',
    'SW',
    'W',
    'NW',
  ]


  const index =
    Math.round(
      degree /
      45
    ) %
    8


  return names[
    index
  ]

}


function formatValue(
  value:
    number |
    null,
  suffix:
    string,
  digits =
    1
) {

  if (
    value ===
    null
  ) {
    return '—'
  }


  return `${value.toFixed(
    digits
  )}${suffix}`

}


function regionForSpot(
  spot:
    OceanSpot
) {

  return (
    OCEAN_REGIONS.find(
      region =>
        region.id ===
        spot.regionId
    ) ??
    null
  )

}


function weatherCodeLabel(
  code:
    number |
    null
) {

  if (
    code ===
    null
  ) {
    return 'UNKNOWN'
  }


  if (
    code ===
    0
  ) {
    return 'CLEAR'
  }


  if (
    code <=
    3
  ) {
    return 'CLOUDY'
  }


  if (
    code <=
    48
  ) {
    return 'FOG'
  }


  if (
    code <=
    67
  ) {
    return 'RAIN'
  }


  if (
    code <=
    82
  ) {
    return 'SHOWERS'
  }


  if (
    code >=
    95
  ) {
    return 'STORM'
  }


  return 'MIXED'
}


// ============================================================
// Score helpers
// ============================================================

function waveCalmScore(
  value:
    number |
    null,
  maxScore:
    number
) {

  if (
    value ===
    null
  ) {
    return Math.round(
      maxScore *
      0.42
    )
  }


  if (
    value <=
    0.4
  ) {
    return maxScore
  }


  if (
    value <=
    0.7
  ) {
    return Math.round(
      maxScore *
      0.92
    )
  }


  if (
    value <=
    1.0
  ) {
    return Math.round(
      maxScore *
      0.72
    )
  }


  if (
    value <=
    1.3
  ) {
    return Math.round(
      maxScore *
      0.46
    )
  }


  if (
    value <=
    1.5
  ) {
    return Math.round(
      maxScore *
      0.22
    )
  }


  return 0

}


function currentCalmScore(
  value:
    number |
    null,
  maxScore:
    number
) {

  if (
    value ===
    null
  ) {
    return Math.round(
      maxScore *
      0.35
    )
  }


  if (
    value <=
    0.3
  ) {
    return maxScore
  }


  if (
    value <=
    0.6
  ) {
    return Math.round(
      maxScore *
      0.88
    )
  }


  if (
    value <=
    1.0
  ) {
    return Math.round(
      maxScore *
      0.68
    )
  }


  if (
    value <=
    1.5
  ) {
    return Math.round(
      maxScore *
      0.4
    )
  }


  if (
    value <=
    2.0
  ) {
    return Math.round(
      maxScore *
      0.16
    )
  }


  return 0

}


function lowWindScore(
  value:
    number |
    null,
  maxScore:
    number
) {

  if (
    value ===
    null
  ) {
    return Math.round(
      maxScore *
      0.45
    )
  }


  if (
    value <=
    10
  ) {
    return maxScore
  }


  if (
    value <=
    18
  ) {
    return Math.round(
      maxScore *
      0.88
    )
  }


  if (
    value <=
    28
  ) {
    return Math.round(
      maxScore *
      0.66
    )
  }


  if (
    value <=
    38
  ) {
    return Math.round(
      maxScore *
      0.36
    )
  }


  return Math.round(
    maxScore *
    0.08
  )

}


function rainScore(
  probability:
    number |
    null,
  rainSum:
    number |
    null,
  maxScore:
    number
) {

  if (
    probability ===
      null &&
    rainSum ===
      null
  ) {

    return Math.round(
      maxScore *
      0.45
    )

  }


  const probabilityScore =
    probability ===
      null
      ? 0.5
      : probability <=
        20
      ? 1
      : probability <=
        40
      ? 0.72
      : probability <=
        60
      ? 0.4
      : 0.12


  const rainPenalty =
    rainSum ===
      null
      ? 0.85
      : rainSum <=
        0.5
      ? 1
      : rainSum <=
        2
      ? 0.72
      : rainSum <=
        5
      ? 0.42
      : 0.18


  return Math.round(
    maxScore *
    Math.min(
      probabilityScore,
      rainPenalty
    )
  )

}


function seaTempScore(
  value:
    number |
    null,
  maxScore:
    number
) {

  if (
    value ===
    null
  ) {
    return Math.round(
      maxScore *
      0.4
    )
  }


  if (
    value >=
      25 &&
    value <=
      30
  ) {
    return maxScore
  }


  if (
    value >=
      22 &&
    value <=
      32
  ) {
    return Math.round(
      maxScore *
      0.8
    )
  }


  if (
    value >=
      19 &&
    value <=
      34
  ) {
    return Math.round(
      maxScore *
      0.52
    )
  }


  return Math.round(
    maxScore *
    0.25
  )

}


function swellPeriodScoreForDive(
  value:
    number |
    null,
  maxScore:
    number
) {

  if (
    value ===
    null
  ) {
    return Math.round(
      maxScore *
      0.4
    )
  }


  // For shore diving, long powerful swell can create surge.
  if (
    value <=
    6
  ) {
    return maxScore
  }


  if (
    value <=
    8
  ) {
    return Math.round(
      maxScore *
      0.8
    )
  }


  if (
    value <=
    10
  ) {
    return Math.round(
      maxScore *
      0.55
    )
  }


  if (
    value <=
    12
  ) {
    return Math.round(
      maxScore *
      0.32
    )
  }


  return Math.round(
    maxScore *
    0.16
  )

}


function surfSwellHeightScore(
  value:
    number |
    null,
  maxScore:
    number
) {

  if (
    value ===
    null
  ) {
    return Math.round(
      maxScore *
      0.18
    )
  }


  if (
    value <
    0.3
  ) {
    return Math.round(
      maxScore *
      0.08
    )
  }


  if (
    value <
    0.5
  ) {
    return Math.round(
      maxScore *
      0.35
    )
  }


  if (
    value <
    0.8
  ) {
    return Math.round(
      maxScore *
      0.68
    )
  }


  if (
    value <=
    1.8
  ) {
    return maxScore
  }


  if (
    value <=
    2.4
  ) {
    return Math.round(
      maxScore *
      0.72
    )
  }


  if (
    value <=
    3.0
  ) {
    return Math.round(
      maxScore *
      0.42
    )
  }


  return Math.round(
    maxScore *
    0.12
  )

}


function surfPeriodScore(
  value:
    number |
    null,
  maxScore:
    number
) {

  if (
    value ===
    null
  ) {
    return Math.round(
      maxScore *
      0.2
    )
  }


  if (
    value >=
    12
  ) {
    return maxScore
  }


  if (
    value >=
    10
  ) {
    return Math.round(
      maxScore *
      0.86
    )
  }


  if (
    value >=
    8
  ) {
    return Math.round(
      maxScore *
      0.64
    )
  }


  if (
    value >=
    6
  ) {
    return Math.round(
      maxScore *
      0.38
    )
  }


  return Math.round(
    maxScore *
    0.15
  )

}


function surfWaveScore(
  value:
    number |
    null,
  maxScore:
    number
) {

  if (
    value ===
    null
  ) {
    return Math.round(
      maxScore *
      0.2
    )
  }


  if (
    value <
    0.4
  ) {
    return 0
  }


  if (
    value <
    0.7
  ) {
    return Math.round(
      maxScore *
      0.55
    )
  }


  if (
    value <=
    2.0
  ) {
    return maxScore
  }


  if (
    value <=
    2.8
  ) {
    return Math.round(
      maxScore *
      0.5
    )
  }


  return Math.round(
    maxScore *
    0.12
  )

}


// ============================================================
// Score
// ============================================================

function calculateOceanScore(
  snapshot:
    OceanSnapshot,
  mode:
    OceanMode
):
  OceanScore {

  const warnings:
    string[] =
    []


  const missingCoreData =
    snapshot.waveHeight ===
      null ||
    snapshot.windSpeed ===
      null ||
    (
      mode !==
        'surf' &&
      snapshot.currentVelocity ===
        null
    ) ||
    (
      mode ===
        'surf' &&
      snapshot.swellHeight ===
        null
    )


  let breakdown:
    ScoreBreakdown[] =
    []


  if (
    mode ===
    'freedive'
  ) {

    // V3:
    // Near-shore current forecasts have lower confidence than
    // wave forecasts, so current weight is intentionally reduced.
    // Surface wave state is the primary condition signal.
    breakdown = [
      {
        key:
          'wave',

        label:
          'WAVE',

        score:
          waveCalmScore(
            snapshot.waveHeight,
            40
          ),

        max:
          40,
      },

      {
        key:
          'current',

        label:
          'CURRENT',

        score:
          currentCalmScore(
            snapshot.currentVelocity,
            15
          ),

        max:
          15,
      },

      {
        key:
          'wind',

        label:
          'WIND',

        score:
          lowWindScore(
            snapshot.windSpeed,
            15
          ),

        max:
          15,
      },

      {
        key:
          'swell',

        label:
          'SWELL',

        score:
          waveCalmScore(
            snapshot.swellHeight,
            15
          ),

        max:
          15,
      },

      {
        key:
          'rain',

        label:
          'RAIN',

        score:
          rainScore(
            snapshot.next6h
              .rainProbabilityMax,
            snapshot.next6h
              .rainSum,
            5
          ),

        max:
          5,
      },

      {
        key:
          'temp',

        label:
          'SEA TEMP',

        score:
          seaTempScore(
            snapshot.seaTemp,
            10
          ),

        max:
          10,
      },
    ]

  } else if (
    mode ===
    'scuba'
  ) {

    const isShore =
      snapshot.spot
        .entryType ===
        'shore'


    const waveWeight =
      isShore
        ? 40
        : 30


    const currentWeight =
      isShore
        ? 15
        : 25


    const swellWeight =
      isShore
        ? 15
        : 10


    breakdown = [
      {
        key:
          'wave',

        label:
          'ENTRY WAVE',

        score:
          waveCalmScore(
            snapshot.waveHeight,
            waveWeight
          ),

        max:
          waveWeight,
      },

      {
        key:
          'current',

        label:
          'CURRENT',

        score:
          currentCalmScore(
            snapshot.currentVelocity,
            currentWeight
          ),

        max:
          currentWeight,
      },

      {
        key:
          'wind',

        label:
          'WIND',

        score:
          lowWindScore(
            snapshot.windSpeed,
            15
          ),

        max:
          15,
      },

      {
        key:
          'swell',

        label:
          'SWELL',

        score:
          waveCalmScore(
            snapshot.swellHeight,
            swellWeight
          ),

        max:
          swellWeight,
      },

      {
        key:
          'rain',

        label:
          'RAIN',

        score:
          rainScore(
            snapshot.next6h
              .rainProbabilityMax,
            snapshot.next6h
              .rainSum,
            5
          ),

        max:
          5,
      },

      {
        key:
          'temp',

        label:
          'SEA TEMP',

        score:
          seaTempScore(
            snapshot.seaTemp,
            10
          ),

        max:
          10,
      },
    ]

  } else {

    breakdown = [
      {
        key:
          'swell',

        label:
          'SWELL',

        score:
          surfSwellHeightScore(
            snapshot.swellHeight,
            35
          ),

        max:
          35,
      },

      {
        key:
          'period',

        label:
          'PERIOD',

        score:
          surfPeriodScore(
            snapshot.swellPeriod,
            25
          ),

        max:
          25,
      },

      {
        key:
          'wind',

        label:
          'WIND',

        score:
          lowWindScore(
            snapshot.windSpeed,
            20
          ),

        max:
          20,
      },

      {
        key:
          'wave',

        label:
          'WAVE',

        score:
          surfWaveScore(
            snapshot.waveHeight,
            10
          ),

        max:
          10,
      },

      {
        key:
          'rain',

        label:
          'RAIN',

        score:
          rainScore(
            snapshot.next6h
              .rainProbabilityMax,
            snapshot.next6h
              .rainSum,
            10
          ),

        max:
          10,
      },
    ]

  }


  let score =
    breakdown.reduce(
      (
        total,
        item
      ) =>
        total +
        item.score,
      0
    )


  // ==========================================================
  // Hard condition caps
  // ==========================================================

  if (
    mode !==
    'surf'
  ) {

    if (
      snapshot.waveHeight !==
        null &&
      snapshot.waveHeight >=
        2.0
    ) {

      score =
        Math.min(
          score,
          25
        )

      warnings.push(
        '浪高明顯偏高'
      )

    } else if (
      snapshot.waveHeight !==
        null &&
      snapshot.waveHeight >=
        1.5
    ) {

      score =
        Math.min(
          score,
          45
        )

      warnings.push(
        '進出水浪況需特別確認'
      )

    }


    if (
      snapshot.currentVelocity !==
        null &&
      snapshot.currentVelocity >=
        3.0
    ) {

      score =
        Math.min(
          score,
          35
        )

      warnings.push(
        '模型顯示海流偏強'
      )

    }

  } else {

    if (
      snapshot.swellHeight !==
        null &&
      snapshot.swellHeight <
        0.3
    ) {

      score =
        Math.min(
          score,
          35
        )

      warnings.push(
        '湧浪太小'
      )

    }


    if (
      snapshot.swellHeight !==
        null &&
      snapshot.swellHeight >
        3
    ) {

      score =
        Math.min(
          score,
          30
        )

      warnings.push(
        '湧浪過大'
      )

    }

  }


  if (
    snapshot.windGust !==
      null &&
    snapshot.windGust >=
      45
  ) {

    score =
      Math.min(
        score,
        35
      )

    warnings.push(
      '強陣風'
    )

  }


  if (
    snapshot.next6h
      .rainProbabilityMax !==
      null &&
    snapshot.next6h
      .rainProbabilityMax >=
      80
  ) {

    warnings.push(
      '高降雨機率'
    )

  }


  score =
    Math.max(
      0,
      Math.min(
        100,
        Math.round(
          score
        )
      )
    )


  if (
    score >=
    88
  ) {

    return {
      score,

      grade:
        'A',

      label:
        'EXCELLENT',

      summary:
        mode ===
          'surf'
          ? '浪況條件很有潛力，仍需確認現場浪型與風向。'
          : '整體海況穩定度佳，適合列為今天優先候選潛點。',

      accentClass:
        'text-cyan-200',

      barClass:
        'bg-cyan-300',

      breakdown,

      warnings,

      dataQuality:
        missingCoreData
          ? 'PARTIAL'
          : 'FULL',
    }

  }


  if (
    score >=
    75
  ) {

    return {
      score,

      grade:
        'B',

      label:
        'GOOD',

      summary:
        mode ===
          'surf'
          ? '條件不錯，可再確認風向、潮位與實際浪型。'
          : '海況大致良好，下水前仍應確認進出點與現場流況。',

      accentClass:
        'text-sky-200',

      barClass:
        'bg-sky-300',

      breakdown,

      warnings,

      dataQuality:
        missingCoreData
          ? 'PARTIAL'
          : 'FULL',
    }

  }


  if (
    score >=
    60
  ) {

    return {
      score,

      grade:
        'C',

      label:
        'FAIR',

      summary:
        mode ===
          'surf'
          ? '條件普通，可能受風或湧浪品質限制。'
          : '條件普通，建議有經驗者依現場狀況判斷是否下水。',

      accentClass:
        'text-amber-200',

      barClass:
        'bg-amber-300',

      breakdown,

      warnings,

      dataQuality:
        missingCoreData
          ? 'PARTIAL'
          : 'FULL',
    }

  }


  if (
    score >=
    40
  ) {

    return {
      score,

      grade:
        'D',

      label:
        'POOR',

      summary:
        mode ===
          'surf'
          ? '條件偏差，今天可能不是理想浪況。'
          : '浪、流或風況已有明顯限制，不建議只依預報決定下水。',

      accentClass:
        'text-orange-200',

      barClass:
        'bg-orange-300',

      breakdown,

      warnings,

      dataQuality:
        missingCoreData
          ? 'PARTIAL'
          : 'FULL',
    }

  }


  return {
    score,

    grade:
      'E',

    label:
      'AVOID',

    summary:
      mode ===
        'surf'
        ? '目前條件不理想，建議改看其他浪點。'
        : '目前模型條件不適合作為優先下水選擇，請考慮其他潛點。',

    accentClass:
      'text-rose-200',

    barClass:
      'bg-rose-300',

    breakdown,

    warnings,

    dataQuality:
      missingCoreData
        ? 'PARTIAL'
        : 'FULL',
  }

}


// ============================================================
// Fetch
// ============================================================

async function fetchOceanSnapshots(
  spots:
    OceanSpot[]
):
  Promise<
    OceanSnapshot[]
  > {

  if (
    spots.length ===
    0
  ) {
    return []
  }


  const latitudes =
    spots
      .map(
        spot =>
          spot.latitude
      )
      .join(
        ','
      )


  const longitudes =
    spots
      .map(
        spot =>
          spot.longitude
      )
      .join(
        ','
      )


  const marineParams =
    new URLSearchParams({
      latitude:
        latitudes,

      longitude:
        longitudes,

      timezone:
        'Asia/Taipei',

      current:
        [
          'wave_height',
          'wave_direction',
          'wave_period',
          'swell_wave_height',
          'swell_wave_direction',
          'swell_wave_period',
          'sea_surface_temperature',
          'ocean_current_velocity',
          'ocean_current_direction',
          'sea_level_height_msl',
        ].join(
          ','
        ),

      hourly:
        [
          'wave_height',
          'swell_wave_height',
          'swell_wave_period',
          'sea_surface_temperature',
          'ocean_current_velocity',
          'sea_level_height_msl',
        ].join(
          ','
        ),

      forecast_hours:
        '12',
    })


  const weatherParams =
    new URLSearchParams({
      latitude:
        latitudes,

      longitude:
        longitudes,

      timezone:
        'Asia/Taipei',

      current:
        [
          'temperature_2m',
          'wind_speed_10m',
          'wind_gusts_10m',
          'precipitation',
          'weather_code',
        ].join(
          ','
        ),

      hourly:
        [
          'wind_speed_10m',
          'wind_gusts_10m',
          'precipitation',
          'precipitation_probability',
        ].join(
          ','
        ),

      forecast_hours:
        '12',
    })


  const [
    marineResponse,
    weatherResponse,
  ] =
    await Promise.all([
      fetch(
        `https://marine-api.open-meteo.com/v1/marine?${marineParams.toString()}`
      ),

      fetch(
        `https://api.open-meteo.com/v1/forecast?${weatherParams.toString()}`
      ),
    ])


  if (
    !marineResponse.ok
  ) {

    throw new Error(
      `Marine API ${marineResponse.status}`
    )

  }


  if (
    !weatherResponse.ok
  ) {

    throw new Error(
      `Weather API ${weatherResponse.status}`
    )

  }


  const marineJson =
    await marineResponse.json() as
      MarineApiResponse |
      MarineApiResponse[]


  const weatherJson =
    await weatherResponse.json() as
      WeatherApiResponse |
      WeatherApiResponse[]


  const marineList =
    normalizeResponseArray(
      marineJson
    )


  const weatherList =
    normalizeResponseArray(
      weatherJson
    )


  const fetchedAt =
    new Date()
      .toISOString()


  return spots.map(
    (
      spot,
      index
    ) => {

      const marine =
        marineList[
          index
        ] ??
        {}


      const weather =
        weatherList[
          index
        ] ??
        {}


      return {
        spot,

        fetchedAt,

        marineTime:
          marine.current
            ?.time ??
          null,

        weatherTime:
          weather.current
            ?.time ??
          null,

        waveHeight:
          round(
            safeNumber(
              marine.current
                ?.wave_height
            ),
            2
          ),

        waveDirection:
          round(
            safeNumber(
              marine.current
                ?.wave_direction
            ),
            0
          ),

        wavePeriod:
          round(
            safeNumber(
              marine.current
                ?.wave_period
            ),
            1
          ),

        swellHeight:
          round(
            safeNumber(
              marine.current
                ?.swell_wave_height
            ),
            2
          ),

        swellDirection:
          round(
            safeNumber(
              marine.current
                ?.swell_wave_direction
            ),
            0
          ),

        swellPeriod:
          round(
            safeNumber(
              marine.current
                ?.swell_wave_period
            ),
            1
          ),

        seaTemp:
          round(
            safeNumber(
              marine.current
                ?.sea_surface_temperature
            ),
            1
          ),

        currentVelocity:
          round(
            safeNumber(
              marine.current
                ?.ocean_current_velocity
            ),
            2
          ),

        currentDirection:
          round(
            safeNumber(
              marine.current
                ?.ocean_current_direction
            ),
            0
          ),

        seaLevel:
          round(
            safeNumber(
              marine.current
                ?.sea_level_height_msl
            ),
            2
          ),

        windSpeed:
          round(
            safeNumber(
              weather.current
                ?.wind_speed_10m
            ),
            1
          ),

        windGust:
          round(
            safeNumber(
              weather.current
                ?.wind_gusts_10m
            ),
            1
          ),

        precipitation:
          round(
            safeNumber(
              weather.current
                ?.precipitation
            ),
            1
          ),

        weatherCode:
          safeNumber(
            weather.current
              ?.weather_code
          ),

        next6h: {
          waveMax:
            round(
              maxValid(
                marine.hourly
                  ?.wave_height,
                6
              ),
              2
            ),

          swellMax:
            round(
              maxValid(
                marine.hourly
                  ?.swell_wave_height,
                6
              ),
              2
            ),

          currentMax:
            round(
              maxValid(
                marine.hourly
                  ?.ocean_current_velocity,
                6
              ),
              2
            ),

          windMax:
            round(
              maxValid(
                weather.hourly
                  ?.wind_speed_10m,
                6
              ),
              1
            ),

          gustMax:
            round(
              maxValid(
                weather.hourly
                  ?.wind_gusts_10m,
                6
              ),
              1
            ),

          rainProbabilityMax:
            round(
              maxValid(
                weather.hourly
                  ?.precipitation_probability,
                6
              ),
              0
            ),

          rainSum:
            round(
              sumValid(
                weather.hourly
                  ?.precipitation,
                6
              ),
              1
            ),
        },

        next12h: {
          waveMax:
            round(
              maxValid(
                marine.hourly
                  ?.wave_height,
                12
              ),
              2
            ),

          swellMax:
            round(
              maxValid(
                marine.hourly
                  ?.swell_wave_height,
                12
              ),
              2
            ),

          currentMax:
            round(
              maxValid(
                marine.hourly
                  ?.ocean_current_velocity,
                12
              ),
              2
            ),

          windMax:
            round(
              maxValid(
                weather.hourly
                  ?.wind_speed_10m,
                12
              ),
              1
            ),

          gustMax:
            round(
              maxValid(
                weather.hourly
                  ?.wind_gusts_10m,
                12
              ),
              1
            ),

          rainProbabilityMax:
            round(
              maxValid(
                weather.hourly
                  ?.precipitation_probability,
                12
              ),
              0
            ),

          rainSum:
            round(
              sumValid(
                weather.hourly
                  ?.precipitation,
                12
              ),
              1
            ),
        },

        series12h: {
          time:
            (
              marine.hourly
                ?.time ??
              weather.hourly
                ?.time ??
              []
            )
              .slice(
                0,
                12
              ),

          waveHeight:
            takeSeries(
              marine.hourly
                ?.wave_height,
              12
            ),

          currentVelocity:
            takeSeries(
              marine.hourly
                ?.ocean_current_velocity,
              12
            ),

          seaLevel:
            takeSeries(
              marine.hourly
                ?.sea_level_height_msl,
              12
            ),

          windSpeed:
            takeSeries(
              weather.hourly
                ?.wind_speed_10m,
              12
            ),
        },
      }

    }
  )

}


// ============================================================
// Dive Computer Instruments
// ============================================================

function WaveInstrument({
  value,
  period,
  direction,
}: {
  value:
    number |
    null

  period:
    number |
    null

  direction:
    number |
    null
}) {

  const normalized =
    Math.max(
      0,
      Math.min(
        1,
        (
          value ??
          0
        ) /
        2
      )
    )


  const amplitude =
    5 +
    normalized *
    9


  return (

    <div
      className="
        relative
        overflow-hidden
        rounded-[20px]
        border
        border-cyan-200/[0.12]
        bg-[#052a38]/78
        p-3
        shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]
      "
    >

      <div
        className="
          flex
          items-start
          justify-between
          gap-2
        "
      >

        <div>

          <p
            className="
              text-[length:var(--dh-f8)]
              font-black
              tracking-[0.16em]
              text-cyan-100/42
            "
          >
            WAVE
          </p>


          <p
            className="
              mt-1
              text-[length:var(--dh-f21)]
              font-semibold
              tracking-[-0.035em]
              text-white/95
            "
          >
            {
              formatValue(
                value,
                ' m',
                1
              )
            }
          </p>

        </div>


        <p
          className="
            text-right
            text-[length:var(--dh-f8)]
            font-bold
            leading-4
            text-cyan-100/42
          "
        >
          {
            compassDirection(
              direction
            )
          }
          <br />
          {
            formatValue(
              period,
              's',
              1
            )
          }
        </p>

      </div>


      <svg
        viewBox="0 0 140 42"
        className="
          mt-2
          h-[42px]
          w-full
          overflow-visible
        "
        aria-hidden="true"
      >
        <path
          d={`
            M 0 24
            C 12 ${24 - amplitude},
              23 ${24 - amplitude},
              35 24
            S 58 ${24 + amplitude},
              70 24
            S 93 ${24 - amplitude},
              105 24
            S 128 ${24 + amplitude},
              140 24
          `}
          fill="none"
          stroke="rgba(165,243,252,0.72)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />

        <path
          d="M 0 34 H 140"
          stroke="rgba(165,243,252,0.09)"
          strokeWidth="1"
          strokeDasharray="3 4"
        />
      </svg>


      <p
        className="
          mt-[-2px]
          text-[length:var(--dh-f7)]
          font-semibold
          tracking-[0.08em]
          text-white/24
        "
      >
        MODEL SEA STATE
      </p>

    </div>

  )

}


function CurrentInstrument({
  value,
  direction,
}: {
  value:
    number |
    null

  direction:
    number |
    null
}) {

  const rotation =
    direction ??
    0


  return (

    <div
      className="
        relative
        overflow-hidden
        rounded-[20px]
        border
        border-cyan-200/[0.12]
        bg-[#052a38]/78
        p-3
        shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]
      "
    >

      <div
        className="
          flex
          items-center
          gap-3
        "
      >

        <div
          className="
            relative
            flex
            h-[72px]
            w-[72px]
            shrink-0
            items-center
            justify-center
            rounded-full
            border
            border-cyan-100/15
            bg-[#02161f]/45
          "
        >

          <span
            className="
              absolute
              top-[5px]
              text-[length:var(--dh-f6)]
              font-black
              text-cyan-100/30
            "
          >
            N
          </span>

          <span
            className="
              absolute
              right-[6px]
              text-[length:var(--dh-f6)]
              font-black
              text-cyan-100/20
            "
          >
            E
          </span>

          <span
            className="
              absolute
              bottom-[5px]
              text-[length:var(--dh-f6)]
              font-black
              text-cyan-100/20
            "
          >
            S
          </span>

          <span
            className="
              absolute
              left-[6px]
              text-[length:var(--dh-f6)]
              font-black
              text-cyan-100/20
            "
          >
            W
          </span>


          <div
            className="
              flex
              h-[43px]
              w-[43px]
              items-center
              justify-center
              rounded-full
              border
              border-cyan-100/10
            "
          >

            <div
              style={{
                transform:
                  `rotate(${rotation}deg)`,
              }}

              className="
                relative
                h-[34px]
                w-[2px]
                origin-center
                bg-gradient-to-t
                from-transparent
                via-cyan-200/40
                to-cyan-100
              "
            >
              <span
                className="
                  absolute
                  -left-[3px]
                  -top-[1px]
                  h-0
                  w-0
                  border-b-[6px]
                  border-l-[4px]
                  border-r-[4px]
                  border-b-cyan-100
                  border-l-transparent
                  border-r-transparent
                "
              />
            </div>

          </div>

        </div>


        <div
          className="
            min-w-0
            flex-1
          "
        >

          <p
            className="
              text-[length:var(--dh-f8)]
              font-black
              tracking-[0.15em]
              text-cyan-100/42
            "
          >
            CURRENT
          </p>


          <p
            className="
              mt-1
              text-[length:var(--dh-f20)]
              font-semibold
              tracking-[-0.035em]
              text-white/95
            "
          >
            {
              formatValue(
                value,
                ' km/h',
                1
              )
            }
          </p>


          <p
            className="
              mt-1
              text-[length:var(--dh-f7)]
              font-semibold
              tracking-[0.08em]
              text-white/25
            "
          >
            {
              compassDirection(
                direction
              )
            }
            {' · '}
            MODEL FLOW
          </p>

        </div>

      </div>

    </div>

  )

}


function WindInstrument({
  value,
  gust,
}: {
  value:
    number |
    null

  gust:
    number |
    null
}) {

  const ratio =
    Math.max(
      0,
      Math.min(
        1,
        (
          value ??
          0
        ) /
        45
      )
    )


  return (

    <div
      className="
        col-span-2
        rounded-[20px]
        border
        border-cyan-200/[0.10]
        bg-[#052531]/72
        px-3
        py-3
      "
    >

      <div
        className="
          flex
          items-end
          justify-between
          gap-3
        "
      >

        <div>

          <p
            className="
              text-[length:var(--dh-f8)]
              font-black
              tracking-[0.15em]
              text-cyan-100/42
            "
          >
            SURFACE WIND
          </p>


          <p
            className="
              mt-1
              text-[length:var(--dh-f20)]
              font-semibold
              tracking-[-0.03em]
              text-white/95
            "
          >
            {
              formatValue(
                value,
                ' km/h',
                0
              )
            }
          </p>

        </div>


        <p
          className="
            text-right
            text-[length:var(--dh-f8)]
            font-bold
            leading-4
            text-white/35
          "
        >
          GUST
          <br />
          <span
            className="
              text-cyan-100/65
            "
          >
            {
              formatValue(
                gust,
                ' km/h',
                0
              )
            }
          </span>
        </p>

      </div>


      <div
        className="
          mt-3
          flex
          items-center
          gap-1
        "
      >

        {Array.from({
          length:
            12,
        }).map(
          (
            _,
            index
          ) => {

            const active =
              index <
              Math.round(
                ratio *
                12
              )


            return (

              <span
                key={index}
                className={`
                  h-[5px]
                  flex-1
                  rounded-full

                  ${
                    active
                      ? 'bg-cyan-200/70'
                      : 'bg-white/[0.07]'
                  }
                `}
              />

            )

          }
        )}

      </div>

    </div>

  )

}


function SeaLevelChart({
  times,
  values,
}: {
  times:
    string[]

  values:
    Array<
      number |
      null
    >
}) {

  const valid =
    values
      .map(
        (
          value,
          index
        ) => ({
          value,
          index,
        })
      )
      .filter(
        (
          item
        ):
          item is {
            value:
              number
            index:
              number
          } =>
          typeof item.value ===
            'number' &&
          Number.isFinite(
            item.value
          )
      )


  if (
    valid.length <
    2
  ) {
    return null
  }


  const min =
    Math.min(
      ...valid.map(
        item =>
          item.value
      )
    )


  const max =
    Math.max(
      ...valid.map(
        item =>
          item.value
      )
    )


  const range =
    Math.max(
      0.01,
      max -
      min
    )


  const width =
    300

  const height =
    74


  const points =
    valid
      .map(
        item => {

          const x =
            (
              item.index /
              Math.max(
                1,
                values.length -
                1
              )
            ) *
            width


          const y =
            8 +
            (
              1 -
              (
                item.value -
                min
              ) /
              range
            ) *
            (
              height -
              18
            )


          return `${x},${y}`

        }
      )
      .join(
        ' '
      )


  return (

    <div
      className="
        mx-4
        mt-3
        rounded-[21px]
        border
        border-cyan-100/[0.09]
        bg-[#041c27]/62
        p-3
      "
    >

      <div
        className="
          flex
          items-start
          justify-between
          gap-3
        "
      >

        <div>

          <p
            className="
              text-[length:var(--dh-f8)]
              font-black
              tracking-[0.15em]
              text-cyan-100/45
            "
          >
            SEA LEVEL TREND
          </p>


          <p
            className="
              mt-1
              text-[length:var(--dh-f8)]
              text-white/28
            "
          >
            NEXT 12H · MODEL TREND
          </p>

        </div>


        <p
          className="
            text-right
            text-[length:var(--dh-f7)]
            font-semibold
            leading-4
            text-white/25
          "
        >
          MAX {max.toFixed(2)}m
          <br />
          MIN {min.toFixed(2)}m
        </p>

      </div>


      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="
          mt-2
          h-[74px]
          w-full
          overflow-visible
        "
        aria-hidden="true"
      >

        <defs>
          <linearGradient
            id="diveHunterSeaLevelGradient"
            x1="0"
            x2="0"
            y1="0"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor="rgba(103,232,249,0.28)"
            />

            <stop
              offset="100%"
              stopColor="rgba(103,232,249,0)"
            />
          </linearGradient>
        </defs>


        <polyline
          points={
            `0,${height} ${points} ${width},${height}`
          }
          fill="url(#diveHunterSeaLevelGradient)"
          stroke="none"
        />


        <polyline
          points={points}
          fill="none"
          stroke="rgba(165,243,252,0.78)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

      </svg>


      <div
        className="
          mt-1
          flex
          justify-between
          text-[length:var(--dh-f7)]
          font-semibold
          text-white/22
        "
      >
        <span>
          {
            times[
              0
            ]?.slice(
              11,
              16
            ) ??
            'NOW'
          }
        </span>

        <span>
          +6H
        </span>

        <span>
          {
            times[
              times.length -
              1
            ]?.slice(
              11,
              16
            ) ??
            '+12H'
          }
        </span>
      </div>

    </div>

  )

}


// ============================================================
// Metric Card
// ============================================================

function MetricCard({
  label,
  value,
  sub,
}: {
  label:
    string

  value:
    string

  sub:
    string
}) {

  return (

    <div
      className="
        relative
        overflow-hidden
        rounded-[18px]
        border
        border-cyan-200/[0.10]
        bg-[#072a38]/70
        px-3
        py-3
        shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]
        backdrop-blur-xl
      "
    >

      <p
        className="
          text-[length:var(--dh-f7)]
          font-black
          tracking-[0.16em]
          text-white/30
        "
      >
        {label}
      </p>


      <p
        className="
          mt-1.5
          text-[length:var(--dh-f17)]
          font-semibold
          tracking-[-0.025em]
          text-white/95
        "
      >
        {value}
      </p>


      <p
        className="
          mt-1
          truncate
          text-[length:var(--dh-f7)]
          font-semibold
          tracking-[0.06em]
          text-cyan-100/45
        "
      >
        {sub}
      </p>

    </div>

  )

}


// ============================================================
// Ocean Theme Decoration
// ============================================================

function OceanBackdrop() {

  return (

    <div
      className="
        pointer-events-none
        absolute
        inset-0
        z-0
        overflow-hidden
      "
      aria-hidden="true"
    >

      {/* Surface glow */}

      <div
        className="
          absolute
          -left-[20%]
          -top-[80px]
          h-[230px]
          w-[140%]
          rounded-[50%]
          bg-cyan-200/[0.08]
          blur-2xl
        "
      />


      {/* Underwater light rays */}

      <div
        className="
          absolute
          -top-14
          left-[8%]
          h-[360px]
          w-[90px]
          rotate-[16deg]
          bg-gradient-to-b
          from-cyan-100/[0.10]
          via-cyan-100/[0.025]
          to-transparent
          blur-xl
        "
      />

      <div
        className="
          absolute
          -top-20
          left-[46%]
          h-[420px]
          w-[60px]
          rotate-[9deg]
          bg-gradient-to-b
          from-white/[0.07]
          via-cyan-100/[0.02]
          to-transparent
          blur-xl
        "
      />


      {/* Sonar / pressure rings */}

      <div
        className="
          absolute
          right-[-105px]
          top-[88px]
          h-[240px]
          w-[240px]
          rounded-full
          border
          border-cyan-100/[0.055]
        "
      />

      <div
        className="
          absolute
          right-[-76px]
          top-[117px]
          h-[182px]
          w-[182px]
          rounded-full
          border
          border-cyan-100/[0.045]
        "
      />

      <div
        className="
          absolute
          right-[-47px]
          top-[146px]
          h-[124px]
          w-[124px]
          rounded-full
          border
          border-cyan-100/[0.04]
        "
      />


      {/* Bubbles */}

      {[
        ['left-[8%]', 'top-[150px]', 'h-[5px]', 'w-[5px]'],
        ['left-[13%]', 'top-[198px]', 'h-[9px]', 'w-[9px]'],
        ['left-[6%]', 'top-[285px]', 'h-[4px]', 'w-[4px]'],
        ['right-[14%]', 'top-[340px]', 'h-[6px]', 'w-[6px]'],
        ['right-[9%]', 'top-[418px]', 'h-[10px]', 'w-[10px]'],
        ['left-[18%]', 'top-[530px]', 'h-[6px]', 'w-[6px]'],
      ].map(
        (
          bubble,
          index
        ) => (

          <span
            key={index}
            className={`
              absolute
              ${bubble[0]}
              ${bubble[1]}
              ${bubble[2]}
              ${bubble[3]}
              rounded-full
              border
              border-cyan-100/25
              bg-cyan-50/[0.035]
            `}
          />

        )
      )}


      {/* Deep sea fade */}

      <div
        className="
          absolute
          inset-x-0
          bottom-0
          h-[360px]
          bg-gradient-to-b
          from-transparent
          via-[#03131c]/20
          to-[#020d13]/72
        "
      />


      {/* Depth ruler */}

      <div
        className="
          absolute
          right-[7px]
          top-[520px]
          flex
          flex-col
          items-end
          gap-[22px]
          opacity-25
        "
      >

        {[0, 5, 10, 15, 20].map(
          depth => (

            <div
              key={depth}
              className="
                flex
                items-center
                gap-1.5
              "
            >

              <span
                className="
                  text-[length:var(--dh-f6)]
                  font-bold
                  tracking-[0.08em]
                  text-cyan-100
                "
              >
                {depth}m
              </span>

              <span
                className="
                  h-px
                  w-3
                  bg-cyan-100
                "
              />

            </div>

          )
        )}

      </div>

    </div>

  )

}


// ============================================================
// Activity Icons
// ============================================================

function ActivityIcon({
  mode,
}: {
  mode:
    OceanMode
}) {

  if (
    mode ===
    'freedive'
  ) {

    return (

      <svg
        viewBox="0 0 28 28"
        className="
          h-[23px]
          w-[23px]
          shrink-0
        "
        fill="none"
        aria-hidden="true"
      >

        {/* Single long freedive fin - top view */}

        <path
          d="
            M14 2.5
            C16.3 3.2 17.7 4.6 17.9 6.6
            L17.1 10.2
            L20.1 23.5
            C20.4 24.9 19.4 26 18.2 25.3
            L14 22.7
            L9.8 25.3
            C8.6 26 7.6 24.9 7.9 23.5
            L10.9 10.2
            L10.1 6.6
            C10.3 4.6 11.7 3.2 14 2.5Z
          "
          fill="currentColor"
          fillOpacity="0.10"
          stroke="currentColor"
          strokeWidth="1.65"
          strokeLinejoin="round"
        />

        {/* Foot pocket */}

        <path
          d="
            M11.2 7.2
            C12.3 6.6 15.7 6.6 16.8 7.2
            L16.4 10.7
            C15.1 11.5 12.9 11.5 11.6 10.7Z
          "
          fill="currentColor"
          fillOpacity="0.22"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        {/* Blade centre rib */}

        <path
          d="M14 11V22"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.9"
        />

      </svg>

    )

  }


  if (
    mode ===
    'scuba'
  ) {

    return (

      <svg
        viewBox="0 0 28 28"
        className="
          h-[23px]
          w-[23px]
          shrink-0
        "
        fill="none"
        aria-hidden="true"
      >

        {/* Single scuba cylinder */}

        <path
          d="
            M10 5.5
            C10 3.9 11.4 2.6 13 2.6
            H15
            C16.6 2.6 18 3.9 18 5.5
            V21.2
            C18 23.6 16.2 25.4 14 25.4
            C11.8 25.4 10 23.6 10 21.2Z
          "
          fill="currentColor"
          fillOpacity="0.10"
          stroke="currentColor"
          strokeWidth="1.7"
        />

        {/* Valve */}

        <path
          d="M12.2 2.6V1.2H15.8V2.6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        <path
          d="M16 1.4H19"
          stroke="currentColor"
          strokeWidth="1.45"
          strokeLinecap="round"
        />

        <path
          d="M18.6 1.4V4"
          stroke="currentColor"
          strokeWidth="1.35"
          strokeLinecap="round"
        />

        {/* Tank bands */}

        <path
          d="M10.7 9H17.3"
          stroke="currentColor"
          strokeWidth="1.15"
          strokeLinecap="round"
          opacity="0.78"
        />

        <path
          d="M10.7 18.7H17.3"
          stroke="currentColor"
          strokeWidth="1.15"
          strokeLinecap="round"
          opacity="0.78"
        />

        {/* Highlight */}

        <path
          d="M12.1 6.3V17"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.38"
        />

      </svg>

    )

  }


  return (

    <svg
      viewBox="0 0 28 28"
      className="
        h-[23px]
        w-[23px]
        shrink-0
      "
      fill="none"
      aria-hidden="true"
    >

      {/* Surfboard */}

      <path
        d="
          M14 1.8
          C18.4 5.1 20.6 9.4 20.4 14
          C20.2 18.6 18.1 22.5 14 26.2
          C9.9 22.5 7.8 18.6 7.6 14
          C7.4 9.4 9.6 5.1 14 1.8Z
        "
        fill="currentColor"
        fillOpacity="0.10"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />

      {/* Deck stripe */}

      <path
        d="M14 3.1V24.6"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
      />

      {/* Traction pad */}

      <path
        d="
          M10.7 18.3
          C12.1 17.4 15.9 17.4 17.3 18.3
          L16.7 21.2
          C15.2 21.9 12.8 21.9 11.3 21.2Z
        "
        fill="currentColor"
        fillOpacity="0.20"
        stroke="currentColor"
        strokeWidth="1.05"
        strokeLinejoin="round"
      />

      {/* Tail fins */}

      <path
        d="M11.4 23.2L12.4 26"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />

      <path
        d="M16.6 23.2L15.6 26"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />

      {/* Nose mark */}

      <path
        d="M12.5 7.2H15.5"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinecap="round"
        opacity="0.85"
      />

    </svg>

  )

}


// ============================================================
// Taiwan Dive Region Map
//
// Stylized selector map, not a navigation / entry-point map.
// ============================================================

const TAIWAN_MAP_REGION_POSITIONS:
  Record<
    string,
    {
      x:
        number

      y:
        number
    }
  > =
{
  // Coordinates are percentages over taiwan_map.png
  // x: left -> right
  // y: top -> bottom

  northeast: {
    x:
      82,

    y:
      10,
  },

  taitung: {
    x:
      70,

    y:
      58,
  },

  kenting: {
    x:
      49,

    y:
      86,
  },

  liuqiu: {
    x:
      31,

    y:
      78,
  },

  'green-island': {
    x:
      78,

    y:
      72,
  },

  lanyu: {
    x:
      85,

    y:
      89,
  },

  penghu: {
    x:
      17,

    y:
      43,
  },
}


function TaiwanDiveRegionMap({
  mode,
  selectedRegionId,
  onSelect,
}: {
  mode:
    OceanMode

  selectedRegionId:
    string

  onSelect:
    (
      regionId:
        string
    ) => void
}) {

  const availableRegions =
    OCEAN_REGIONS.filter(
      region =>
        OCEAN_SPOTS.some(
          spot =>
            spot.regionId ===
              region.id &&
            spot.activities.includes(
              mode
            )
        )
    )


  return (

    <div
      className="
        relative
        mx-auto
        w-full
        max-w-[260px]
        overflow-visible
      "
    >

      {/* ====================================================
          Taiwan map image asset

          Asset:
          src/assets/taiwan_map.png

          The image owns the geographic appearance.
          Interactive region markers are layered above it.
      ==================================================== */}

      <div
        className="
          relative
          aspect-[2/3]
          w-full
        "
      >

        <img
          src={
            taiwanMap
          }

          alt="台灣潛點區域地圖"

          draggable={
            false
          }

          className="
            pointer-events-none
            absolute
            inset-0
            h-full
            w-full
            select-none
            object-contain
            drop-shadow-[0_0_20px_rgba(34,211,238,0.12)]
          "
        />


        {/* Ocean ambient halo */}

        <div
          className="
            pointer-events-none
            absolute
            left-1/2
            top-1/2
            h-[80%]
            w-[72%]
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            bg-cyan-300/[0.035]
            blur-3xl
          "
          aria-hidden="true"
        />


        {/* Region selectors */}

        {availableRegions.map(
          region => {

            const point =
              TAIWAN_MAP_REGION_POSITIONS[
                region.id
              ]


            if (
              !point
            ) {
              return null
            }


            const active =
              selectedRegionId ===
              region.id


            return (

              <button
                key={
                  region.id
                }

                type="button"

                onClick={() =>
                  onSelect(
                    region.id
                  )
                }

                style={{
                  left:
                    `${point.x}%`,

                  top:
                    `${point.y}%`,
                }}

                className="
                  group
                  absolute
                  z-10
                  -translate-x-1/2
                  -translate-y-1/2
                "
              >

                <span
                  className={`
                    relative
                    flex
                    h-[27px]
                    w-[27px]
                    items-center
                    justify-center
                    rounded-full
                    border
                    transition
                    duration-200
                    active:scale-90

                    ${
                      active
                        ? `
                            border-cyan-50/90
                            bg-cyan-200
                            shadow-[0_0_0_5px_rgba(103,232,249,0.12),0_0_20px_rgba(34,211,238,0.40)]
                          `
                        : `
                            border-cyan-100/45
                            bg-[#052c3b]/92
                            shadow-[0_0_0_4px_rgba(34,211,238,0.06),0_0_12px_rgba(34,211,238,0.12)]
                          `
                    }
                  `}
                >

                  <span
                    className={`
                      h-[7px]
                      w-[7px]
                      rounded-full

                      ${
                        active
                          ? 'bg-[#04202a]'
                          : 'bg-cyan-100/85'
                      }
                    `}
                  />

                </span>


                <span
                  className={`
                    absolute
                    left-1/2
                    top-[31px]
                    -translate-x-1/2
                    whitespace-nowrap
                    rounded-full
                    border
                    px-2
                    py-[3px]
                    text-[length:var(--dh-f7)]
                    font-bold
                    backdrop-blur-md
                    transition

                    ${
                      active
                        ? `
                            border-cyan-100/30
                            bg-cyan-200
                            text-[#052531]
                          `
                        : `
                            border-cyan-100/12
                            bg-[#031923]/92
                            text-cyan-50/68
                          `
                    }
                  `}
                >
                  {region.name}
                </span>

              </button>

            )

          }
        )}

      </div>

    </div>

  )

}


// ============================================================
// Ranking Dive Mask
// ============================================================

function RankingDiveMask({
  rank,
}: {
  rank:
    number
}) {

  const tone =
    rank ===
      1
      ? {
          main:
            '#E2BC55',

          soft:
            'rgba(226,188,85,0.16)',

          glow:
            'rgba(226,188,85,0.28)',
        }
      : rank ===
          2
        ? {
            main:
              '#C9D2DB',

            soft:
              'rgba(201,210,219,0.14)',

            glow:
              'rgba(201,210,219,0.22)',
          }
        : {
            main:
              '#B97A50',

            soft:
              'rgba(185,122,80,0.15)',

            glow:
              'rgba(185,122,80,0.24)',
          }


  return (

    <div
      className="
        relative
        flex
        h-8
        w-9
        shrink-0
        items-center
        justify-center
      "

      style={{
        filter:
          `drop-shadow(0 0 7px ${tone.glow})`,
      }}
    >

      <svg
        viewBox="0 0 36 28"
        className="
          h-[27px]
          w-[34px]
        "
        fill="none"
        aria-hidden="true"
      >

        {/* Strap */}

        <path
          d="
            M5 8
            C2.8 8.6 2 10.4 2.2 13.6
            C2.4 16.8 4.2 18.2 6.4 18.5
          "
          stroke={tone.main}
          strokeWidth="1.7"
          strokeLinecap="round"
          opacity="0.72"
        />

        <path
          d="
            M31 8
            C33.2 8.6 34 10.4 33.8 13.6
            C33.6 16.8 31.8 18.2 29.6 18.5
          "
          stroke={tone.main}
          strokeWidth="1.7"
          strokeLinecap="round"
          opacity="0.72"
        />


        {/* Mask frame */}

        <path
          d="
            M7.2 7.4
            C9.6 5.7 13.1 5 18 5
            C22.9 5 26.4 5.7 28.8 7.4
            L29.5 12.8
            C29.9 16.2 27.2 19.2 23.9 19.6
            C21.2 19.9 19.4 18.6 18 16.9
            C16.6 18.6 14.8 19.9 12.1 19.6
            C8.8 19.2 6.1 16.2 6.5 12.8
            Z
          "
          fill={tone.soft}
          stroke={tone.main}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />


        {/* Dual lenses */}

        <path
          d="
            M8.7 9.1
            C10.8 8.2 13.5 8 16.5 8.5
            L16.2 14.3
            C15.3 16.2 13.7 17 11.8 16.6
            C9.8 16.2 8.5 14.6 8.5 12.5
            Z
          "
          fill="rgba(255,255,255,0.05)"
          stroke={tone.main}
          strokeWidth="1.05"
          opacity="0.9"
        />

        <path
          d="
            M27.3 9.1
            C25.2 8.2 22.5 8 19.5 8.5
            L19.8 14.3
            C20.7 16.2 22.3 17 24.2 16.6
            C26.2 16.2 27.5 14.6 27.5 12.5
            Z
          "
          fill="rgba(255,255,255,0.05)"
          stroke={tone.main}
          strokeWidth="1.05"
          opacity="0.9"
        />


        {/* Nose pocket */}

        <path
          d="
            M16.4 15
            C16.6 17.6 16.9 20.1 18 22.6
            C19.1 20.1 19.4 17.6 19.6 15
          "
          stroke={tone.main}
          strokeWidth="1.45"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

      </svg>


      <span
        className="
          absolute
          -right-[1px]
          -top-[3px]
          flex
          h-[14px]
          min-w-[14px]
          items-center
          justify-center
          rounded-full
          border
          border-black/15
          px-[3px]
          text-[7px]
          font-black
          leading-none
          text-[#06151c]
        "

        style={{
          backgroundColor:
            tone.main,
        }}
      >
        {rank}
      </span>

    </div>

  )

}


// ============================================================
// Component
// ============================================================

function DiveHunterCard() {

  const [
    textSize,
    setTextSize,
  ] = useState<DiveHunterTextSize>(
    loadDiveHunterTextSize
  )


  const [
    textSizeOpen,
    setTextSizeOpen,
  ] = useState(false)



  const [
    activeTab,
    setActiveTab,
  ] = useState<DiveHunterTab>(
    'conditions'
  )


  const [
    mode,
    setMode,
  ] = useState<OceanMode>(
    loadOceanMode
  )


  const [
    selectedSpotId,
    setSelectedSpotId,
  ] = useState(
    loadOceanSpotId
  )



  const [
    siteSelectorOpen,
    setSiteSelectorOpen,
  ] = useState(false)



  const [
    diveGuideOpen,
    setDiveGuideOpen,
  ] = useState(false)



  const [
    diveGuideQuery,
    setDiveGuideQuery,
  ] = useState('')


  const [
    selectedRegionId,
    setSelectedRegionId,
  ] = useState(
    () =>
      OCEAN_SPOTS.find(
        spot =>
          spot.id ===
          loadOceanSpotId()
      )
        ?.regionId ??
      'northeast'
  )


  const [
    snapshots,
    setSnapshots,
  ] = useState<
    OceanSnapshot[]
  >(
    []
  )


  const [
    loading,
    setLoading,
  ] = useState(true)


  const [
    error,
    setError,
  ] = useState<
    string |
    null
  >(
    null
  )


  useEffect(() => {

    try {

      localStorage.setItem(
        DIVE_HUNTER_TEXT_SIZE_STORAGE_KEY,
        textSize
      )

    } catch {
      // ignore
    }

  }, [
    textSize,
  ])


  const fontScale =
    textSize ===
      'small'
      ? 1
      : textSize ===
        'large'
      ? 1.28
      : 1.14


  useEffect(() => {

    if (
      mode ===
        'surf' &&
      activeTab ===
        'sightings'
    ) {

      setActiveTab(
        'conditions'
      )

    }

  }, [
    activeTab,
    mode,
  ])


  const compatibleSpots =
    useMemo(
      () =>
        OCEAN_SPOTS.filter(
          spot =>
            spot.activities.includes(
              mode
            )
        ),
      [
        mode,
      ]
    )


  const filteredSpots =
    useMemo(
      () =>
        compatibleSpots.filter(
          spot =>
            spot.regionId ===
            selectedRegionId
        ),
      [
        compatibleSpots,
        selectedRegionId,
      ]
    )


  const diveSiteGuides =
    useMemo(
      () =>
        getDiveSiteGuidesByRegion(
          selectedRegionId
        ),
      [
        selectedRegionId,
      ]
    )


  const diveGuideSource =
    useMemo(
      () =>
        getDiveSiteGuideSourceByRegion(
          selectedRegionId
        ),
      [
        selectedRegionId,
      ]
    )


  const filteredDiveSiteGuides =
    useMemo(
      () => {

        const query =
          diveGuideQuery
            .trim()
            .toLowerCase()


        if (
          !query
        ) {
          return diveSiteGuides
        }


        return diveSiteGuides.filter(
          guide =>
            guide.name
              .toLowerCase()
              .includes(
                query
              ) ||
            guide.code
              .toLowerCase()
              .includes(
                query
              )
        )

      },
      [
        diveGuideQuery,
        diveSiteGuides,
      ]
    )


  const selectedSnapshot =
    useMemo(
      () =>
        snapshots.find(
          snapshot =>
            snapshot.spot.id ===
            selectedSpotId
        ) ??
        snapshots[
          0
        ] ??
        null,
      [
        snapshots,
        selectedSpotId,
      ]
    )


  const selectedScore =
    useMemo(
      () =>
        selectedSnapshot
          ? calculateOceanScore(
              selectedSnapshot,
              mode
            )
          : null,
      [
        selectedSnapshot,
        mode,
      ]
    )


  const ranking =
    useMemo(
      () =>
        snapshots
          .map(
            snapshot => ({
              snapshot,

              score:
                calculateOceanScore(
                  snapshot,
                  mode
                ),
            })
          )
          .sort(
            (
              a,
              b
            ) =>
              b.score.score -
              a.score.score
          ),
      [
        snapshots,
        mode,
      ]
    )


  // ==========================================================
  // Keep selected spot compatible with selected mode
  // ==========================================================

  useEffect(() => {

    const current =
      compatibleSpots.find(
        spot =>
          spot.id ===
          selectedSpotId
      )


    if (
      current
    ) {
      return
    }


    const first =
      compatibleSpots[
        0
      ]


    if (
      first
    ) {

      setSelectedSpotId(
        first.id
      )

    }

  }, [
    compatibleSpots,
    selectedSpotId,
  ])


  useEffect(() => {

    setDiveGuideOpen(
      false
    )


    setDiveGuideQuery(
      ''
    )

  }, [
    selectedRegionId,
  ])


  useEffect(() => {

    const currentSpot =
      compatibleSpots.find(
        spot =>
          spot.id ===
          selectedSpotId
      )


    if (
      currentSpot
    ) {

      setSelectedRegionId(
        currentSpot.regionId
      )

      return

    }


    const firstSpot =
      compatibleSpots[
        0
      ]


    if (
      firstSpot
    ) {

      setSelectedRegionId(
        firstSpot.regionId
      )

    }

  }, [
    compatibleSpots,
    selectedSpotId,
  ])


  // ==========================================================
  // Persist UI selection
  // ==========================================================

  useEffect(() => {

    try {

      localStorage.setItem(
        OCEAN_MODE_STORAGE_KEY,
        mode
      )

    } catch {
      // ignore
    }

  }, [
    mode,
  ])


  useEffect(() => {

    try {

      localStorage.setItem(
        OCEAN_SPOT_STORAGE_KEY,
        selectedSpotId
      )

    } catch {
      // ignore
    }

  }, [
    selectedSpotId,
  ])


  // ==========================================================
  // Load all compatible spots in one batch
  // ==========================================================

  const refresh =
    async () => {

      setLoading(
        true
      )

      setError(
        null
      )


      try {

        const next =
          await fetchOceanSnapshots(
            compatibleSpots
          )


        setSnapshots(
          next
        )

      } catch (fetchError) {

        console.error(
          'Dive Hunter API failed:',
          fetchError
        )


        setError(
          fetchError instanceof
            Error
            ? fetchError.message
            : 'Ocean API failed'
        )

      } finally {

        setLoading(
          false
        )

      }

    }


  useEffect(() => {

    void refresh()


    const timer =
      window.setInterval(
        () => {

          void refresh()

        },
        10 *
        60 *
        1000
      )


    return () => {

      window.clearInterval(
        timer
      )

    }

  }, [
    mode,
  ])


  const selectedRegion =
    selectedSnapshot
      ? regionForSpot(
          selectedSnapshot
            .spot
        )
      : null


  const lastUpdated =
    selectedSnapshot
      ? new Date(
          selectedSnapshot.fetchedAt
        )
          .toLocaleTimeString(
            'zh-TW',
            {
              hour:
                '2-digit',

              minute:
                '2-digit',
            }
          )
      : '—'


  return (

    <section
      className="
        relative
        mt-5
        overflow-hidden
        rounded-[30px]
        border
        border-cyan-200/[0.16]
        bg-[#04141d]
        text-white
        shadow-[0_22px_60px_rgba(2,18,28,0.34)]
        ring-1
        ring-white/[0.025]
      "

      style={{
        '--dh-f6': `${6 * fontScale}px`,
        '--dh-f7': `${7 * fontScale}px`,
        '--dh-f8': `${8 * fontScale}px`,
        '--dh-f9': `${9 * fontScale}px`,
        '--dh-f10': `${10 * fontScale}px`,
        '--dh-f11': `${11 * fontScale}px`,
        '--dh-f14': `${14 * fontScale}px`,
        '--dh-f15': `${15 * fontScale}px`,
        '--dh-f17': `${17 * fontScale}px`,
        '--dh-f20': `${20 * fontScale}px`,
        '--dh-f21': `${21 * fontScale}px`,
        '--dh-f23': `${23 * fontScale}px`,
        '--dh-f31': `${31 * fontScale}px`,
        backgroundImage:
          `
            radial-gradient(
              circle at 18% -8%,
              rgba(165,243,252,0.18),
              transparent 28%
            ),
            radial-gradient(
              circle at 92% 18%,
              rgba(34,211,238,0.10),
              transparent 30%
            ),
            radial-gradient(
              circle at 14% 78%,
              rgba(8,145,178,0.11),
              transparent 36%
            ),
            linear-gradient(
              180deg,
              #073347 0%,
              #062331 30%,
              #041823 67%,
              #020d13 100%
            )
          `,
      } as CSSProperties}
    >

      <OceanBackdrop />

      <div
        className="
          relative
          z-10
        "
      >

      {/* ====================================================
          Header
      ==================================================== */}

      <div
        className="
          px-5
          pb-4
          pt-5
        "
      >

        <div
          className="
            flex
            items-start
            justify-between
            gap-3
          "
        >

          <div>

            <div
              className="
                flex
                items-center
                gap-2
              "
            >

              <span
                className="
                  h-[7px]
                  w-[7px]
                  rounded-full
                  bg-cyan-300
                  shadow-[0_0_10px_rgba(103,232,249,0.75)]
                "
              />


              <p
                className="
                  text-[length:var(--dh-f8)]
                  font-black
                  tracking-[0.18em]
                  text-cyan-100/55
                "
              >
                DIVE COMPUTER · TAIWAN
              </p>

            </div>


            <h2
              className="
                mt-1.5
                text-[length:var(--dh-f23)]
                font-semibold
                tracking-[-0.04em]
                text-white
              "
            >
              Dive Hunter
            </h2>


            <p
              className="
                mt-1
                text-[length:var(--dh-f8)]
                font-semibold
                tracking-[0.08em]
                text-white/30
              "
            >
              SEA STATE FINDER · LIVE MARINE MODEL
            </p>

          </div>


          <div
            className="
              relative
              flex
              items-center
              gap-2
            "
          >

            <button
              type="button"

              onClick={() =>
                setTextSizeOpen(
                  current =>
                    !current
                )
              }

              aria-label="Dive Hunter 字體大小"

              className="
                flex
                h-9
                min-w-9
                items-center
                justify-center
                rounded-full
                border
                border-cyan-100/15
                bg-[#0a3545]/80
                px-2
                text-[length:var(--dh-f10)]
                font-semibold
                text-cyan-100/70
                shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]
                transition
                active:scale-95
              "
            >
              Aa
            </button>


          <button
            type="button"

            onClick={() => {
              void refresh()
            }}

            disabled={
              loading
            }

            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-full
              border
              border-cyan-100/15
              bg-[#0a3545]/80
              text-[length:var(--dh-f15)]
              text-cyan-100/65
              shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]
              transition
              active:scale-95
              disabled:opacity-30
            "
          >
            ↻
          </button>


            {textSizeOpen && (

              <div
                className="
                  absolute
                  right-0
                  top-[44px]
                  z-30
                  flex
                  overflow-hidden
                  rounded-[13px]
                  border
                  border-cyan-100/15
                  bg-[#031923]/95
                  p-1
                  shadow-xl
                  backdrop-blur-xl
                "
              >

                {(
                  [
                    {
                      id:
                        'small',

                      label:
                        '小',
                    },

                    {
                      id:
                        'medium',

                      label:
                        '中',
                    },

                    {
                      id:
                        'large',

                      label:
                        '大',
                    },
                  ] as const
                ).map(
                  option => {

                    const active =
                      textSize ===
                      option.id


                    return (

                      <button
                        key={
                          option.id
                        }

                        type="button"

                        onClick={() => {

                          setTextSize(
                            option.id
                          )

                          setTextSizeOpen(
                            false
                          )

                        }}

                        className={`
                          rounded-[9px]
                          px-3
                          py-2
                          text-[length:var(--dh-f9)]
                          font-semibold
                          transition

                          ${
                            active
                              ? `
                                  bg-cyan-200
                                  text-[#05202a]
                                `
                              : `
                                  text-cyan-50/45
                                `
                          }
                        `}
                      >
                        {option.label}
                      </button>

                    )

                  }
                )}

              </div>

            )}

          </div>

        </div>


        {/* Activity mode */}

        <div
          className="
            mt-4
            grid
            grid-cols-3
            gap-1
            rounded-[17px]
            border
            border-cyan-100/[0.09]
            bg-[#021017]/45
            p-1
            shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]
          "
        >

          {(
            [
              {
                id:
                  'freedive',

                label:
                  'FREEDIVE',

                sub:
                  '自由潛水',
              },

              {
                id:
                  'scuba',

                label:
                  'SCUBA',

                sub:
                  '水肺',
              },

              {
                id:
                  'surf',

                label:
                  'SURF',

                sub:
                  '衝浪',
              },
            ] as const
          ).map(
            item => {

              const active =
                mode ===
                item.id


              return (

                <button
                  key={
                    item.id
                  }

                  type="button"

                  onClick={() => {

                    setMode(
                      item.id
                    )

                    setSiteSelectorOpen(
                      false
                    )

                  }}

                  className={`
                    rounded-[11px]
                    px-2
                    py-2
                    text-center
                    transition
                    active:scale-[0.98]

                    ${
                      active
                        ? `
                            border
                            border-cyan-100/25
                            bg-cyan-200/[0.13]
                            text-cyan-50
                            shadow-[0_0_20px_rgba(34,211,238,0.08)]
                          `
                        : `
                            text-white/40
                          `
                    }
                  `}
                >

                  <div
                    className="
                      flex
                      items-center
                      justify-center
                      gap-1.5
                    "
                  >

                    <span
                      className={`
                        ${
                          active
                            ? 'text-cyan-100'
                            : 'text-white/28'
                        }
                      `}
                    >
                      <ActivityIcon
                        mode={
                          item.id
                        }
                      />
                    </span>


                    <div
                      className="
                        min-w-0
                        text-left
                      "
                    >

                      <p
                        className="
                          whitespace-nowrap
                          text-[length:var(--dh-f8)]
                          font-black
                          tracking-[0.06em]
                        "
                      >
                        {item.label}
                      </p>


                      <p
                        className={`
                          mt-[1px]
                          whitespace-nowrap
                          text-[length:var(--dh-f7)]
                          font-semibold

                          ${
                            active
                              ? 'text-cyan-100/55'
                              : 'text-white/20'
                          }
                        `}
                      >
                        {item.sub}
                      </p>

                    </div>

                  </div>

                </button>

              )

            }
          )}

        </div>


        {/* ==================================================
            Main Tabs
        ================================================== */}

        <div
          className={`
            mt-3
            grid
            gap-1
            rounded-[15px]
            border
            border-cyan-100/[0.08]
            bg-[#020d13]/46
            p-1

            ${
              mode ===
                'surf'
                ? 'grid-cols-2'
                : 'grid-cols-3'
            }
          `}
        >

          {(
            [
              {
                id:
                  'conditions' as const,

                label:
                  '海況',

                sub:
                  'CONDITION',
              },

              {
                id:
                  'spots' as const,

                label:
                  mode ===
                    'surf'
                    ? '浪點'
                    : '潛點',

                sub:
                  'SPOTS',
              },

              ...(
                mode !==
                  'surf'
                  ? [
                      {
                        id:
                          'sightings' as const,

                        label:
                          '大物',

                        sub:
                          'SIGHTINGS',
                      },
                    ]
                  : []
              ),
            ]
          ).map(
            tab => {

              const active =
                activeTab ===
                tab.id


              return (

                <button
                  key={
                    tab.id
                  }

                  type="button"

                  onClick={() =>
                    setActiveTab(
                      tab.id
                    )
                  }

                  className={`
                    rounded-[10px]
                    px-2
                    py-2
                    text-center
                    transition
                    active:scale-[0.98]

                    ${
                      active
                        ? `
                            border
                            border-cyan-100/20
                            bg-cyan-200/[0.11]
                            text-cyan-50
                          `
                        : `
                            text-white/30
                          `
                    }
                  `}
                >

                  <p
                    className="
                      text-[length:var(--dh-f10)]
                      font-semibold
                    "
                  >
                    {tab.label}
                  </p>

                  <p
                    className={`
                      mt-[2px]
                      text-[length:var(--dh-f6)]
                      font-black
                      tracking-[0.08em]

                      ${
                        active
                          ? 'text-cyan-100/42'
                          : 'text-white/16'
                      }
                    `}
                  >
                    {tab.sub}
                  </p>

                </button>

              )

            }
          )}

        </div>


        {activeTab ===
          'spots' && (

          <>

        {/* ==================================================
            Dive Site Selector
        ================================================== */}

        <div
          className="
            mt-3
            overflow-hidden
            rounded-[18px]
            border
            border-cyan-100/[0.09]
            bg-[#031923]/42
          "
        >

          <button
            type="button"

            onClick={() => {

              if (
                !siteSelectorOpen &&
                selectedSnapshot
              ) {

                setSelectedRegionId(
                  selectedSnapshot
                    .spot
                    .regionId
                )

              }


              setSiteSelectorOpen(
                current =>
                  !current
              )

            }}

            className="
              flex
              w-full
              items-center
              gap-3
              px-3.5
              py-3
              text-left
              transition
              active:bg-white/[0.03]
            "
          >

            <div
              className="
                flex
                h-[34px]
                w-[34px]
                shrink-0
                items-center
                justify-center
                rounded-full
                border
                border-cyan-100/15
                bg-cyan-100/[0.055]
              "
            >

              <svg
                viewBox="0 0 24 24"
                className="
                  h-[17px]
                  w-[17px]
                  text-cyan-100/70
                "
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="
                    M12 21
                    C15.8 16.8 18 13.7 18 10
                    C18 6.7 15.3 4 12 4
                    C8.7 4 6 6.7 6 10
                    C6 13.7 8.2 16.8 12 21Z
                  "
                  stroke="currentColor"
                  strokeWidth="1.5"
                />

                <circle
                  cx="12"
                  cy="10"
                  r="2.3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>

            </div>


            <div
              className="
                min-w-0
                flex-1
              "
            >

              <p
                className="
                  text-[length:var(--dh-f7)]
                  font-black
                  tracking-[0.14em]
                  text-cyan-100/35
                "
              >
                DIVE SITE
              </p>


              <div
                className="
                  mt-[2px]
                  flex
                  min-w-0
                  items-baseline
                  gap-2
                "
              >

                <p
                  className="
                    truncate
                    text-[length:var(--dh-f11)]
                    font-semibold
                    text-white/85
                  "
                >
                  {
                    selectedSnapshot
                      ?.spot
                      .name ??
                    '選擇潛點'
                  }
                </p>


                <p
                  className="
                    shrink-0
                    text-[length:var(--dh-f7)]
                    font-semibold
                    text-white/25
                  "
                >
                  {
                    selectedSnapshot
                      ? regionForSpot(
                          selectedSnapshot
                            .spot
                        )
                          ?.name ??
                        ''
                      : ''
                  }
                </p>

              </div>

            </div>


            <span
              className={`
                shrink-0
                text-[length:var(--dh-f14)]
                font-light
                text-cyan-100/40
                transition-transform
                duration-300

                ${
                  siteSelectorOpen
                    ? 'rotate-180'
                    : 'rotate-0'
                }
              `}
            >
              ▾
            </span>

          </button>


          <div
            className={`
              grid
              transition-[grid-template-rows,opacity]
              duration-300
              ease-out

              ${
                siteSelectorOpen
                  ? `
                      grid-rows-[1fr]
                      opacity-100
                    `
                  : `
                      grid-rows-[0fr]
                      opacity-0
                    `
              }
            `}
          >

            <div
              className="
                min-h-0
                overflow-hidden
              "
            >

              <div
                className="
                  border-t
                  border-cyan-100/[0.07]
                  px-3
                  pb-3
                  pt-3
                "
              >

                <div
                  className="
                    flex
                    items-start
                    justify-between
                    gap-3
                  "
                >

                  <div>

                    <p
                      className="
                        text-[length:var(--dh-f8)]
                        font-black
                        tracking-[0.14em]
                        text-cyan-100/45
                      "
                    >
                      SELECT AREA
                    </p>


                    <p
                      className="
                        mt-1
                        text-[length:var(--dh-f7)]
                        leading-5
                        text-white/26
                      "
                    >
                      點台灣地圖選區域，再選擇實際潛點。
                    </p>

                  </div>


                  <button
                    type="button"

                    onClick={() =>
                      setSiteSelectorOpen(
                        false
                      )
                    }

                    className="
                      flex
                      h-7
                      w-7
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-white/[0.07]
                      bg-white/[0.03]
                      text-[length:var(--dh-f11)]
                      text-white/35
                    "
                  >
                    ×
                  </button>

                </div>


                <div
                  className="
                    mt-2
                    rounded-[20px]
                    border
                    border-cyan-100/[0.07]
                    bg-[#02131b]/34
                    px-2
                    py-3
                    shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]
                  "
                >

                  <TaiwanDiveRegionMap
                    mode={
                      mode
                    }

                    selectedRegionId={
                      selectedRegionId
                    }

                    onSelect={
                      regionId => {

                        setSelectedRegionId(
                          regionId
                        )

                      }
                    }
                  />

                </div>


                {/* Selected region */}

                <div
                  className="
                    mt-3
                    flex
                    items-center
                    justify-between
                    gap-2
                  "
                >

                  <div>

                    <p
                      className="
                        text-[length:var(--dh-f7)]
                        font-black
                        tracking-[0.12em]
                        text-cyan-100/35
                      "
                    >
                      SELECT SPOT
                    </p>


                    <p
                      className="
                        mt-1
                        text-[length:var(--dh-f10)]
                        font-semibold
                        text-white/70
                      "
                    >
                      {
                        OCEAN_REGIONS.find(
                          region =>
                            region.id ===
                            selectedRegionId
                        )
                          ?.name ??
                        '區域'
                      }
                    </p>

                  </div>


                  <p
                    className="
                      text-[length:var(--dh-f7)]
                      font-semibold
                      tracking-[0.08em]
                      text-white/22
                    "
                  >
                    {
                      filteredSpots.length
                    } SPOTS
                  </p>

                </div>


                <div
                  className="
                    mt-2
                    grid
                    grid-cols-2
                    gap-2
                  "
                >

                  {filteredSpots.map(
                    spot => {

                      const active =
                        selectedSpotId ===
                          spot.id


                      return (

                        <button
                          key={
                            spot.id
                          }

                          type="button"

                          onClick={() => {

                            setSelectedSpotId(
                              spot.id
                            )

                            setSelectedRegionId(
                              spot.regionId
                            )

                            setSiteSelectorOpen(
                              false
                            )

                          }}

                          className={`
                            rounded-[13px]
                            border
                            px-3
                            py-2.5
                            text-left
                            transition
                            active:scale-[0.98]

                            ${
                              active
                                ? `
                                    border-cyan-100/25
                                    bg-cyan-200/[0.12]
                                  `
                                : `
                                    border-white/[0.055]
                                    bg-white/[0.025]
                                  `
                            }
                          `}
                        >

                          <div
                            className="
                              flex
                              items-center
                              gap-2
                            "
                          >

                            <span
                              className={`
                                h-[6px]
                                w-[6px]
                                shrink-0
                                rounded-full

                                ${
                                  active
                                    ? 'bg-cyan-200'
                                    : 'bg-cyan-100/25'
                                }
                              `}
                            />


                            <p
                              className="
                                min-w-0
                                truncate
                                text-[length:var(--dh-f10)]
                                font-semibold
                                text-white/78
                              "
                            >
                              {spot.name}
                            </p>

                          </div>


                          <p
                            className="
                              mt-1
                              truncate
                              pl-[14px]
                              text-[length:var(--dh-f7)]
                              font-semibold
                              tracking-[0.05em]
                              text-white/23
                            "
                          >
                            {spot.enName}
                          </p>

                        </button>

                      )

                    }
                  )}

                </div>

              </div>

            </div>

          </div>

        </div>


        {/* ==================================================
            External Dive Map Guide

            External links only.
            The linked charts remain on the source website.
        ================================================== */}

        {mode !==
          'surf' &&
         diveSiteGuides.length >
          0 && (

          <div
            className="
              mt-3
              overflow-hidden
              rounded-[18px]
              border
              border-cyan-100/[0.09]
              bg-[#031923]/42
            "
          >

            <button
              type="button"

              onClick={() =>
                setDiveGuideOpen(
                  current =>
                    !current
                )
              }

              className="
                flex
                w-full
                items-center
                gap-3
                px-3.5
                py-3
                text-left
                transition
                active:bg-white/[0.03]
              "
            >

              <div
                className="
                  flex
                  h-[34px]
                  w-[34px]
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-cyan-100/15
                  bg-cyan-100/[0.055]
                  text-cyan-100/70
                "
              >

                <svg
                  viewBox="0 0 24 24"
                  className="
                    h-[18px]
                    w-[18px]
                  "
                  fill="none"
                  aria-hidden="true"
                >

                  <path
                    d="
                      M4 6.5
                      L9 4.5
                      L15 6.5
                      L20 4.5
                      V17.5
                      L15 19.5
                      L9 17.5
                      L4 19.5
                      Z
                    "
                    stroke="currentColor"
                    strokeWidth="1.45"
                    strokeLinejoin="round"
                  />

                  <path
                    d="M9 4.8V17.2M15 6.8V19.2"
                    stroke="currentColor"
                    strokeWidth="1.15"
                    opacity="0.65"
                  />

                  <path
                    d="M12 9.2C13.4 9.2 14.5 10.3 14.5 11.7C14.5 13.6 12 16 12 16C12 16 9.5 13.6 9.5 11.7C9.5 10.3 10.6 9.2 12 9.2Z"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />

                </svg>

              </div>


              <div
                className="
                  min-w-0
                  flex-1
                "
              >

                <p
                  className="
                    text-[length:var(--dh-f7)]
                    font-black
                    tracking-[0.14em]
                    text-cyan-100/35
                  "
                >
                  DIVE SITE GUIDE
                </p>


                <div
                  className="
                    mt-[2px]
                    flex
                    items-baseline
                    gap-2
                  "
                >

                  <p
                    className="
                      text-[length:var(--dh-f11)]
                      font-semibold
                      text-white/85
                    "
                  >
                    {
                      diveGuideSource
                        ?.guideTitle ??
                      '潛點海圖'
                    }
                  </p>


                  <span
                    className="
                      text-[length:var(--dh-f7)]
                      font-semibold
                      tracking-[0.08em]
                      text-cyan-100/32
                    "
                  >
                    {diveSiteGuides.length} MAPS
                  </span>

                </div>

              </div>


              <span
                className={`
                  shrink-0
                  text-[length:var(--dh-f14)]
                  font-light
                  text-cyan-100/40
                  transition-transform
                  duration-300

                  ${
                    diveGuideOpen
                      ? 'rotate-180'
                      : 'rotate-0'
                  }
                `}
              >
                ▾
              </span>

            </button>


            <div
              className={`
                grid
                transition-[grid-template-rows,opacity]
                duration-300
                ease-out

                ${
                  diveGuideOpen
                    ? `
                        grid-rows-[1fr]
                        opacity-100
                      `
                    : `
                        grid-rows-[0fr]
                        opacity-0
                      `
                }
              `}
            >

              <div
                className="
                  min-h-0
                  overflow-hidden
                "
              >

                <div
                  className="
                    border-t
                    border-cyan-100/[0.07]
                    px-3
                    pb-3
                    pt-3
                  "
                >

                  <p
                    className="
                      text-[length:var(--dh-f7)]
                      leading-[1.65]
                      text-white/27
                    "
                  >
                    點選潛點後會開啟外部網站的原始介紹頁與海圖。
                  </p>


                  {/* ==========================================
                      Region Overview Map
                  ========================================== */}

                  {diveGuideSource && (

                    <a
                      href={
                        diveGuideSource.sourceUrl
                      }

                      target="_blank"
                      rel="noopener noreferrer"

                      onPointerDown={
                        event =>
                          event.stopPropagation()
                      }

                      className="
                        group
                        mt-3
                        flex
                        w-full
                        items-center
                        gap-3
                        overflow-hidden
                        rounded-[16px]
                        border
                        border-cyan-100/[0.12]
                        bg-gradient-to-r
                        from-cyan-200/[0.09]
                        via-cyan-100/[0.045]
                        to-transparent
                        px-3.5
                        py-3.5
                        text-left
                        transition
                        active:scale-[0.99]
                      "
                    >

                      <div
                        className="
                          relative
                          flex
                          h-[44px]
                          w-[44px]
                          shrink-0
                          items-center
                          justify-center
                          overflow-hidden
                          rounded-[13px]
                          border
                          border-cyan-100/15
                          bg-[#062b39]/80
                        "
                      >

                        <svg
                          viewBox="0 0 44 44"
                          className="
                            h-[34px]
                            w-[34px]
                            text-cyan-100/70
                          "
                          fill="none"
                          aria-hidden="true"
                        >

                          <path
                            d="
                              M7 31
                              C12 27 15 22 18 17
                              C21 12 25 8 31 6
                            "
                            stroke="currentColor"
                            strokeWidth="1.4"
                            strokeLinecap="round"
                            opacity="0.42"
                          />

                          <path
                            d="
                              M8 34
                              C15 32 21 29 26 25
                              C31 21 34 16 36 10
                            "
                            stroke="currentColor"
                            strokeWidth="1"
                            strokeDasharray="2.5 3"
                            strokeLinecap="round"
                            opacity="0.28"
                          />

                          {[
                            [10, 30],
                            [15, 25],
                            [20, 20],
                            [25, 16],
                            [31, 11],
                          ].map(
                            (
                              point,
                              index
                            ) => (

                              <g
                                key={index}
                              >

                                <circle
                                  cx={point[0]}
                                  cy={point[1]}
                                  r="3.2"
                                  fill="rgba(103,232,249,0.10)"
                                  stroke="currentColor"
                                  strokeWidth="1"
                                />

                                <circle
                                  cx={point[0]}
                                  cy={point[1]}
                                  r="1.15"
                                  fill="currentColor"
                                />

                              </g>

                            )
                          )}

                        </svg>

                      </div>


                      <div
                        className="
                          min-w-0
                          flex-1
                        "
                      >

                        <p
                          className="
                            text-[length:var(--dh-f7)]
                            font-black
                            tracking-[0.14em]
                            text-cyan-100/42
                          "
                        >
                          REGION OVERVIEW
                        </p>


                        <p
                          className="
                            mt-[2px]
                            truncate
                            text-[length:var(--dh-f11)]
                            font-semibold
                            text-white/86
                          "
                        >
                          {diveGuideSource.regionName}
                          潛點位置總覽
                        </p>


                        <p
                          className="
                            mt-1
                            text-[length:var(--dh-f7)]
                            font-medium
                            leading-4
                            text-white/28
                          "
                        >
                          查看整個區域潛點分布與相對位置
                        </p>

                      </div>


                      <div
                        className="
                          flex
                          h-8
                          w-8
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                          border
                          border-cyan-100/10
                          bg-white/[0.025]
                          text-[length:var(--dh-f11)]
                          text-cyan-100/42
                          transition
                          group-hover:text-cyan-100/75
                        "
                      >
                        ↗
                      </div>

                    </a>

                  )}


                  <div
                    className="
                      mt-4
                      flex
                      items-center
                      justify-between
                      gap-3
                    "
                  >

                    <div>

                      <p
                        className="
                          text-[length:var(--dh-f7)]
                          font-black
                          tracking-[0.14em]
                          text-cyan-100/35
                        "
                      >
                        SITE DETAIL MAPS
                      </p>


                      <p
                        className="
                          mt-1
                          text-[length:var(--dh-f9)]
                          font-semibold
                          text-white/55
                        "
                      >
                        個別潛點海圖
                      </p>

                    </div>


                    <span
                      className="
                        rounded-full
                        border
                        border-cyan-100/10
                        bg-cyan-100/[0.035]
                        px-2
                        py-1
                        text-[length:var(--dh-f7)]
                        font-bold
                        tracking-[0.08em]
                        text-cyan-100/35
                      "
                    >
                      {diveSiteGuides.length} MAPS
                    </span>

                  </div>


                  {diveSiteGuides.length >
                    8 && (

                    <div
                      className="
                        relative
                        mt-3
                      "
                    >

                      <svg
                        viewBox="0 0 24 24"
                        className="
                          pointer-events-none
                          absolute
                          left-3
                          top-1/2
                          h-[15px]
                          w-[15px]
                          -translate-y-1/2
                          text-cyan-100/28
                        "
                        fill="none"
                        aria-hidden="true"
                      >
                        <circle
                          cx="10.8"
                          cy="10.8"
                          r="5.4"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />

                        <path
                          d="M15 15L20 20"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>


                      <input
                        type="search"

                        value={
                          diveGuideQuery
                        }

                        onChange={
                          event =>
                            setDiveGuideQuery(
                              event.target.value
                            )
                        }

                        placeholder="搜尋潛點名稱 / 編號"

                        className="
                          w-full
                          rounded-[13px]
                          border
                          border-cyan-100/[0.08]
                          bg-[#02131b]/55
                          py-2.5
                          pl-9
                          pr-3
                          text-[length:var(--dh-f9)]
                          font-medium
                          text-white/75
                          outline-none
                          placeholder:text-white/20
                          focus:border-cyan-100/20
                        "
                      />

                    </div>

                  )}


                  <div
                    className="
                      mt-3
                      max-h-[330px]
                      overflow-y-auto
                      pr-1
                      [scrollbar-width:none]
                      [&::-webkit-scrollbar]:hidden
                    "
                  >

                    <div
                      className="
                        grid
                        grid-cols-2
                        gap-2
                      "
                    >

                    {filteredDiveSiteGuides.map(
                      guide => (

                        <a
                          key={
                            guide.id
                          }

                          href={
                            guide.guideUrl
                          }

                          target="_blank"
                          rel="noopener noreferrer"

                          onPointerDown={
                            event =>
                              event.stopPropagation()
                          }

                          className="
                            group
                            rounded-[13px]
                            border
                            border-white/[0.055]
                            bg-white/[0.025]
                            px-3
                            py-2.5
                            text-left
                            transition
                            active:scale-[0.98]
                          "
                        >

                          <div
                            className="
                              flex
                              items-center
                              justify-between
                              gap-2
                            "
                          >

                            <span
                              className="
                                rounded-full
                                border
                                border-cyan-100/12
                                bg-cyan-100/[0.05]
                                px-1.5
                                py-[2px]
                                text-[length:var(--dh-f6)]
                                font-black
                                tracking-[0.08em]
                                text-cyan-100/45
                              "
                            >
                              {guide.code}
                            </span>


                            <span
                              className="
                                text-[length:var(--dh-f9)]
                                text-cyan-100/35
                                transition
                                group-hover:text-cyan-100/70
                              "
                            >
                              ↗
                            </span>

                          </div>


                          <p
                            className="
                              mt-2
                              truncate
                              text-[length:var(--dh-f10)]
                              font-semibold
                              text-white/78
                            "
                          >
                            {guide.name}
                          </p>

                        </a>

                      )
                    )}


                    {filteredDiveSiteGuides.length ===
                      0 && (

                      <div
                        className="
                          col-span-2
                          rounded-[13px]
                          border
                          border-white/[0.05]
                          bg-white/[0.02]
                          px-3
                          py-5
                          text-center
                        "
                      >
                        <p
                          className="
                            text-[length:var(--dh-f9)]
                            font-semibold
                            text-white/32
                          "
                        >
                          找不到符合的潛點
                        </p>
                      </div>

                    )}

                    </div>

                  </div>


                  <div
                    className="
                      mt-3
                      flex
                      items-center
                      justify-between
                      gap-3
                      border-t
                      border-white/[0.05]
                      pt-3
                    "
                  >

                    <p
                      className="
                        min-w-0
                        text-[length:var(--dh-f6)]
                        font-semibold
                        leading-4
                        text-white/22
                      "
                    >
                      海圖與介紹內容著作權屬原網站，
                      本 App 僅提供外部連結。
                    </p>


                    <a
                      href={
                        diveGuideSource
                          ?.sourceUrl ??
                        'https://sites.google.com/site/ken20060806/about'
                      }

                      target="_blank"
                      rel="noopener noreferrer"

                      onPointerDown={
                        event =>
                          event.stopPropagation()
                      }

                      className="
                        shrink-0
                        rounded-full
                        border
                        border-cyan-100/10
                        bg-white/[0.025]
                        px-2.5
                        py-1.5
                        text-[length:var(--dh-f7)]
                        font-semibold
                        text-cyan-100/45
                      "
                    >
                      {
                        diveGuideSource
                          ?.regionName ??
                        ''
                      }
                      {' · '}
                      {DIVE_SITE_GUIDE_SOURCE_NAME} ↗
                    </a>

                  </div>

                </div>

              </div>

            </div>

          </div>

        )}


        <div
          className="
            mt-4
            flex
            items-center
            gap-2
            opacity-35
          "
          aria-hidden="true"
        >
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-100/60 to-cyan-100/20" />
          <span className="text-[length:var(--dh-f8)] tracking-[0.22em] text-cyan-100">≈ ≈ ≈</span>
          <span className="h-px flex-1 bg-gradient-to-l from-transparent via-cyan-100/60 to-cyan-100/20" />
        </div>


          </>

        )}

      </div>


      {activeTab ===
        'conditions' && (

        <>

      {/* ====================================================
          Loading / Error
      ==================================================== */}

      {loading &&
        snapshots.length ===
          0 && (

        <div
          className="
            mx-4
            mb-4
            rounded-[20px]
            border
            border-white/[0.07]
            bg-white/[0.04]
            px-4
            py-8
            text-center
          "
        >

          <p
            className="
              text-[length:var(--dh-f9)]
              font-black
              tracking-[0.16em]
              text-cyan-100/50
            "
          >
            LOADING OCEAN DATA
          </p>


          <p
            className="
              mt-2
              text-[length:var(--dh-f11)]
              text-white/35
            "
          >
            正在整理台灣潛點海況…
          </p>

        </div>

      )}


      {error && (

        <div
          className="
            mx-4
            mb-4
            rounded-[18px]
            border
            border-rose-300/15
            bg-rose-400/[0.07]
            px-4
            py-3
          "
        >

          <p
            className="
              text-[length:var(--dh-f8)]
              font-black
              tracking-[0.12em]
              text-rose-200/70
            "
          >
            DATA ERROR
          </p>


          <p
            className="
              mt-1
              text-[length:var(--dh-f10)]
              text-white/45
            "
          >
            {error}
          </p>

        </div>

      )}


      {/* ====================================================
          Selected Spot
      ==================================================== */}

      {selectedSnapshot &&
       selectedScore && (

        <>

          <div
            className="
              mx-4
              relative
              overflow-hidden
              rounded-[24px]
              border
              border-cyan-200/[0.11]
              bg-[#03141d]/66
              p-4
              shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]
              backdrop-blur-xl
            "
          >

            <div
              className="
                flex
                items-start
                justify-between
                gap-4
              "
            >

              <div
                className="
                  min-w-0
                  flex-1
                "
              >

                <p
                  className="
                    text-[length:var(--dh-f8)]
                    font-black
                    tracking-[0.15em]
                    text-cyan-100/40
                  "
                >
                  {
                    selectedRegion
                      ?.name ??
                    ''
                  }
                  {' · '}
                  {
                    selectedRegion
                      ?.enName ??
                    ''
                  }
                </p>


                <p
                  className="
                    mt-1
                    truncate
                    text-[length:var(--dh-f21)]
                    font-semibold
                    tracking-[-0.035em]
                    text-white
                  "
                >
                  {
                    selectedSnapshot
                      .spot
                      .name
                  }
                </p>


                <p
                  className="
                    mt-[2px]
                    text-[length:var(--dh-f8)]
                    font-semibold
                    tracking-[0.12em]
                    text-white/28
                  "
                >
                  {
                    selectedSnapshot
                      .spot
                      .enName
                  }
                  {' · '}
                  {
                    selectedSnapshot
                      .spot
                      .entryType
                      .toUpperCase()
                  }
                </p>


                <div
                  className="
                    mt-3
                    flex
                    flex-wrap
                    items-center
                    gap-2
                  "
                >

                  <span
                    className={`
                      rounded-full
                      border
                      px-2.5
                      py-1
                      text-[length:var(--dh-f7)]
                      font-black
                      tracking-[0.08em]

                      ${selectedScore.accentClass}

                      border-current/20
                      bg-white/[0.04]
                    `}
                  >
                    {
                      selectedScore
                        .label
                    }
                  </span>


                  <span
                    className="
                      rounded-full
                      border
                      border-white/10
                      bg-white/[0.03]
                      px-2.5
                      py-1
                      text-[length:var(--dh-f7)]
                      font-bold
                      tracking-[0.08em]
                      text-white/35
                    "
                  >
                    DATA {
                      selectedScore
                        .dataQuality
                    }
                  </span>

                </div>

              </div>


              <div
                className="
                  flex
                  h-[86px]
                  w-[86px]
                  shrink-0
                  flex-col
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-cyan-100/25
                  bg-[#062835]/72
                  shadow-[0_0_0_6px_rgba(34,211,238,0.025),inset_0_0_34px_rgba(34,211,238,0.08)]
                "
              >

                <p
                  className={`
                    text-[length:var(--dh-f31)]
                    font-semibold
                    leading-none
                    tracking-[-0.05em]

                    ${selectedScore.accentClass}
                  `}
                >
                  {
                    selectedScore
                      .score
                  }
                </p>


                <p
                  className="
                    mt-1
                    text-[length:var(--dh-f7)]
                    font-black
                    tracking-[0.12em]
                    text-white/30
                  "
                >
                  / 100
                </p>

              </div>

            </div>


            <div
              className="
                mt-4
                h-[4px]
                overflow-hidden
                rounded-full
                bg-white/[0.07]
              "
            >

              <div
                className={`
                  h-full
                  rounded-full
                  transition-all
                  duration-700

                  ${selectedScore.barClass}
                `}

                style={{
                  width:
                    `${selectedScore.score}%`,
                }}
              />

            </div>


            <div
              className="
                mt-3
                flex
                items-start
                gap-3
              "
            >

              <div
                className="
                  shrink-0
                  rounded-[10px]
                  border
                  border-white/10
                  bg-white/[0.04]
                  px-2
                  py-1.5
                  text-center
                "
              >

                <p
                  className="
                    text-[length:var(--dh-f6)]
                    font-black
                    tracking-[0.12em]
                    text-white/25
                  "
                >
                  GRADE
                </p>


                <p
                  className={`
                    mt-[1px]
                    text-[length:var(--dh-f15)]
                    font-black

                    ${selectedScore.accentClass}
                  `}
                >
                  {
                    selectedScore
                      .grade
                  }
                </p>

              </div>


              <p
                className="
                  pt-[2px]
                  text-[length:var(--dh-f10)]
                  leading-[1.6]
                  text-white/48
                "
              >
                {
                  selectedScore
                    .summary
                }
              </p>

            </div>


            {selectedScore
              .warnings
              .length >
              0 && (

              <div
                className="
                  mt-3
                  flex
                  flex-wrap
                  gap-1.5
                "
              >

                {selectedScore
                  .warnings
                  .map(
                    warning => (

                      <span
                        key={
                          warning
                        }

                        className="
                          rounded-full
                          bg-rose-400/[0.09]
                          px-2
                          py-1
                          text-[length:var(--dh-f7)]
                          font-semibold
                          text-rose-200/75
                        "
                      >
                        ⚠ {warning}
                      </span>

                    )
                  )}

              </div>

            )}

          </div>


          {/* ==================================================
              Dive Computer Instruments
          ================================================== */}

          <div
            className="
              mx-4
              mt-3
              grid
              grid-cols-2
              gap-2
            "
          >

            <WaveInstrument
              value={
                selectedSnapshot
                  .waveHeight
              }

              period={
                selectedSnapshot
                  .wavePeriod
              }

              direction={
                selectedSnapshot
                  .waveDirection
              }
            />


            <CurrentInstrument
              value={
                selectedSnapshot
                  .currentVelocity
              }

              direction={
                selectedSnapshot
                  .currentDirection
              }
            />


            <WindInstrument
              value={
                selectedSnapshot
                  .windSpeed
              }

              gust={
                selectedSnapshot
                  .windGust
              }
            />

          </div>


          {/* Secondary marine values */}

          <div
            className="
              mx-4
              mt-2
              grid
              grid-cols-2
              gap-2
            "
          >

            <MetricCard
              label="SEA TEMP"

              value={
                formatValue(
                  selectedSnapshot
                    .seaTemp,
                  '°C',
                  1
                )
              }

              sub="SURFACE TEMP"
            />


            <MetricCard
              label="SWELL"

              value={
                formatValue(
                  selectedSnapshot
                    .swellHeight,
                  ' m',
                  1
                )
              }

              sub={
                `${compassDirection(
                  selectedSnapshot
                    .swellDirection
                )} · ${formatValue(
                  selectedSnapshot
                    .swellPeriod,
                  ' sec',
                  1
                )}`
              }
            />

          </div>


          <SeaLevelChart
            times={
              selectedSnapshot
                .series12h
                .time
            }

            values={
              selectedSnapshot
                .series12h
                .seaLevel
            }
          />


          {/* ==================================================
              Next 6H / 12H
          ================================================== */}

          <div
            className="
              mx-4
              mt-3
              rounded-[21px]
              border
              border-cyan-100/[0.08]
              bg-[#05212c]/62
              p-3
              backdrop-blur-xl
            "
          >

            <div
              className="
                flex
                items-center
                justify-between
              "
            >

              <p
                className="
                  text-[length:var(--dh-f8)]
                  font-black
                  tracking-[0.15em]
                  text-cyan-100/45
                "
              >
                DIVE WINDOW · OCEAN OUTLOOK
              </p>


              <p
                className="
                  text-[length:var(--dh-f7)]
                  font-semibold
                  tracking-[0.08em]
                  text-white/25
                "
              >
                UPDATE {lastUpdated}
              </p>

            </div>


            <div
              className="
                mt-3
                grid
                grid-cols-2
                gap-2
              "
            >

              {(
                [
                  {
                    title:
                      'NEXT 6H',

                    data:
                      selectedSnapshot
                        .next6h,
                  },

                  {
                    title:
                      'NEXT 12H',

                    data:
                      selectedSnapshot
                        .next12h,
                  },
                ]
              ).map(
                item => (

                  <div
                    key={
                      item.title
                    }

                    className="
                      rounded-[15px]
                      bg-black/15
                      px-3
                      py-3
                    "
                  >

                    <p
                      className="
                        text-[length:var(--dh-f7)]
                        font-black
                        tracking-[0.14em]
                        text-white/30
                      "
                    >
                      {item.title}
                    </p>


                    <div
                      className="
                        mt-2
                        space-y-1.5
                        text-[length:var(--dh-f8)]
                        font-semibold
                        text-white/48
                      "
                    >

                      <div
                        className="
                          flex
                          items-center
                          justify-between
                          gap-2
                        "
                      >
                        <span>Wave Max</span>

                        <span className="text-white/75">
                          {
                            formatValue(
                              item.data
                                .waveMax,
                              'm',
                              1
                            )
                          }
                        </span>
                      </div>


                      <div
                        className="
                          flex
                          items-center
                          justify-between
                          gap-2
                        "
                      >
                        <span>Current Max</span>

                        <span className="text-white/75">
                          {
                            formatValue(
                              item.data
                                .currentMax,
                              'km/h',
                              1
                            )
                          }
                        </span>
                      </div>


                      <div
                        className="
                          flex
                          items-center
                          justify-between
                          gap-2
                        "
                      >
                        <span>Wind Max</span>

                        <span className="text-white/75">
                          {
                            formatValue(
                              item.data
                                .windMax,
                              'km/h',
                              0
                            )
                          }
                        </span>
                      </div>


                      <div
                        className="
                          flex
                          items-center
                          justify-between
                          gap-2
                        "
                      >
                        <span>Rain</span>

                        <span className="text-white/75">
                          {
                            item.data
                              .rainProbabilityMax !==
                            null
                              ? `${item.data.rainProbabilityMax}%`
                              : '—'
                          }
                        </span>
                      </div>

                    </div>

                  </div>

                )
              )}

            </div>

          </div>


          {/* ==================================================
              Score breakdown
          ================================================== */}

          <div
            className="
              mx-4
              mt-3
              rounded-[21px]
              border
              border-cyan-100/[0.08]
              bg-[#041c27]/62
              p-3
              backdrop-blur-xl
            "
          >

            <p
              className="
                text-[length:var(--dh-f8)]
                font-black
                tracking-[0.15em]
                text-cyan-100/45
              "
            >
              DIVE CONDITION MATRIX
            </p>


            <div
              className="
                mt-3
                space-y-2.5
              "
            >

              {selectedScore
                .breakdown
                .map(
                  item => {

                    const ratio =
                      item.max >
                      0
                        ? item.score /
                          item.max
                        : 0


                    return (

                      <div
                        key={
                          item.key
                        }
                      >

                        <div
                          className="
                            flex
                            items-center
                            justify-between
                            gap-2
                          "
                        >

                          <p
                            className="
                              text-[length:var(--dh-f7)]
                              font-black
                              tracking-[0.1em]
                              text-white/35
                            "
                          >
                            {item.label}
                          </p>


                          <p
                            className="
                              text-[length:var(--dh-f7)]
                              font-semibold
                              text-white/45
                            "
                          >
                            {item.score}/{item.max}
                          </p>

                        </div>


                        <div
                          className="
                            mt-1
                            h-[3px]
                            overflow-hidden
                            rounded-full
                            bg-white/[0.06]
                          "
                        >

                          <div
                            className="
                              h-full
                              rounded-full
                              bg-cyan-300/65
                            "

                            style={{
                              width:
                                `${Math.max(
                                  0,
                                  Math.min(
                                    100,
                                    ratio *
                                    100
                                  )
                                )}%`,
                            }}
                          />

                        </div>

                      </div>

                    )

                  }
                )}

            </div>

          </div>

        </>

      )}


        </>

      )}


      {/* ====================================================
          Dive Hunter ranking
      ==================================================== */}


      {activeTab ===
         'spots' &&
       ranking.length >
         0 && (

        <div
          className="
            mx-4
            mt-3
            rounded-[22px]
            border
            border-cyan-100/[0.09]
            bg-[#03151e]/70
            p-3
            backdrop-blur-xl
          "
        >

          <div
            className="
              flex
              items-end
              justify-between
              gap-3
            "
          >

            <div>

              <p
                className="
                  text-[length:var(--dh-f8)]
                  font-black
                  tracking-[0.15em]
                  text-cyan-100/45
                "
              >
                DIVE HUNTER
              </p>


              <p
                className="
                  mt-1
                  text-[length:var(--dh-f14)]
                  font-semibold
                  text-white/85
                "
              >
                今日推薦地點
              </p>

            </div>


            <p
              className="
                text-[length:var(--dh-f7)]
                font-semibold
                text-white/25
              "
            >
              TOP {
                Math.min(
                  ranking.length,
                  5
                )
              }
            </p>

          </div>


          <div
            className="
              mt-3
              space-y-2
            "
          >

            {ranking
              .slice(
                0,
                5
              )
              .map(
                (
                  item,
                  index
                ) => {

                  const region =
                    regionForSpot(
                      item.snapshot
                        .spot
                    )


                  const active =
                    item.snapshot
                      .spot
                      .id ===
                    selectedSnapshot
                      ?.spot
                      .id


                  return (

                    <button
                      key={
                        item.snapshot
                          .spot
                          .id
                      }

                      type="button"

                      onClick={() =>
                        setSelectedSpotId(
                          item.snapshot
                            .spot
                            .id
                        )
                      }

                      className={`
                        flex
                        w-full
                        items-center
                        gap-3
                        rounded-[15px]
                        border
                        px-3
                        py-2.5
                        text-left
                        transition
                        active:scale-[0.99]

                        ${
                          active
                            ? `
                                border-cyan-200/20
                                bg-cyan-200/[0.08]
                              `
                            : `
                                border-white/[0.05]
                                bg-white/[0.025]
                              `
                        }
                      `}
                    >

                      {index <
                        3
                        ? (

                          <RankingDiveMask
                            rank={
                              index +
                              1
                            }
                          />

                        )
                        : (

                          <div
                            className="
                              flex
                              h-7
                              w-7
                              shrink-0
                              items-center
                              justify-center
                              rounded-full
                              bg-white/[0.055]
                              text-[length:var(--dh-f9)]
                              font-black
                              text-white/45
                            "
                          >
                            {
                              String(
                                index +
                                1
                              )
                                .padStart(
                                  2,
                                  '0'
                                )
                            }
                          </div>

                        )
                      }


                      <div
                        className="
                          min-w-0
                          flex-1
                        "
                      >

                        <p
                          className="
                            truncate
                            text-[length:var(--dh-f11)]
                            font-semibold
                            text-white/80
                          "
                        >
                          {
                            item.snapshot
                              .spot
                              .name
                          }
                        </p>


                        <p
                          className="
                            mt-[2px]
                            truncate
                            text-[length:var(--dh-f7)]
                            font-semibold
                            tracking-[0.08em]
                            text-white/25
                          "
                        >
                          {
                            region
                              ?.name ??
                            ''
                          }
                          {' · '}
                          WAVE {
                            formatValue(
                              item.snapshot
                                .waveHeight,
                              'm',
                              1
                            )
                          }
                          {' · '}
                          WIND {
                            formatValue(
                              item.snapshot
                                .windSpeed,
                              '',
                              0
                            )
                          }
                        </p>

                      </div>


                      <div
                        className="
                          text-right
                        "
                      >

                        <p
                          className={`
                            text-[length:var(--dh-f17)]
                            font-semibold
                            leading-none

                            ${item.score.accentClass}
                          `}
                        >
                          {
                            item.score
                              .score
                          }
                        </p>


                        <p
                          className="
                            mt-1
                            text-[length:var(--dh-f6)]
                            font-black
                            tracking-[0.08em]
                            text-white/25
                          "
                        >
                          {
                            item.score
                              .label
                          }
                        </p>

                      </div>

                    </button>

                  )

                }
              )}

          </div>

        </div>

      )}


      {/* ====================================================
          Ocean Sightings / Big Wildlife Radar
      ==================================================== */}

      {activeTab ===
         'sightings' &&
       mode !==
         'surf' && (

        <OceanSightingsCard
          regionId={
            selectedRegionId
          }
        />

      )}


      {/* ====================================================
          Model Note
      ==================================================== */}

      {activeTab ===
        'conditions' && (

      <div
        className="
          mx-4
          mb-4
          mt-3
          rounded-[18px]
          border
          border-cyan-100/[0.07]
          bg-[#02131b]/48
          px-3
          py-3
        "
      >

        <p
          className="
            text-[length:var(--dh-f7)]
            font-semibold
            leading-[1.75]
            text-white/25
          "
        >
          CONDITION SCORE V3 以浪況為主要權重，
          風與近岸海流作為輔助條件。海流與潮位屬較粗解析度模型，
          因此不會單獨大幅拉低分數。此分數僅供行前規劃，
          實際下水仍請依直播、現場浪況、海巡公告、潛伴與在地教練判斷。
        </p>


        <p
          className="
            mt-2
            text-[length:var(--dh-f6)]
            font-bold
            tracking-[0.09em]
            text-cyan-100/22
          "
        >
          MARINE MODEL · OPEN-METEO · CONDITION ONLY
        </p>

      </div>

      )}

      </div>

    </section>

  )

}


export default DiveHunterCard
