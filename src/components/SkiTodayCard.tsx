import {
  useEffect,
  useMemo,
  useState,
} from 'react'


// ============================================================
// Ski Resort Catalog
// ============================================================

type SkiResort = {
  id: string
  prefectureId: string
  name: string
  shortName: string
  latitude: number
  longitude: number
  officialUrl?: string

}


type SkiPrefecture = {
  id: string
  name: string
  enName: string
}


const SKI_PREFECTURES: SkiPrefecture[] = [
  {
    id:
      'hokkaido',
    name:
      '北海道',
    enName:
      'HOKKAIDO',
  },
  {
    id:
      'aomori',
    name:
      '青森',
    enName:
      'AOMORI',
  },
  {
    id:
      'iwate',
    name:
      '岩手',
    enName:
      'IWATE',
  },
  {
    id:
      'yamagata',
    name:
      '山形',
    enName:
      'YAMAGATA',
  },
  {
    id:
      'fukushima',
    name:
      '福島',
    enName:
      'FUKUSHIMA',
  },
  {
    id:
      'gunma',
    name:
      '群馬',
    enName:
      'GUNMA',
  },
  {
    id:
      'niigata',
    name:
      '新潟',
    enName:
      'NIIGATA',
  },
  {
    id:
      'nagano',
    name:
      '長野',
    enName:
      'NAGANO',
  },
  {
    id:
      'gifu',
    name:
      '岐阜',
    enName:
      'GIFU',
  },
]


const SKI_RESORTS: SkiResort[] = [
  // ==========================================================
  // Hokkaido
  // ==========================================================
  {
    id:
      'furano',
    prefectureId:
      'hokkaido',
    name:
      'Furano Ski Resort',
    shortName:
      '富良野滑雪場',
    latitude:
      43.3243,
    longitude:
      142.3541,
    officialUrl:
      'https://www.princehotels.co.jp/ski/furano/winter/',
  },
  {
    id:
      'sapporo-teine',
    prefectureId:
      'hokkaido',
    name:
      'Sapporo Teine',
    shortName:
      '札幌手稻滑雪場',
    latitude:
      43.0866,
    longitude:
      141.2042,
    officialUrl:
      'https://sapporo-teine.com/snow/',
  },
  {
    id:
      'sapporo-kokusai',
    prefectureId:
      'hokkaido',
    name:
      'Sapporo Kokusai Ski Resort',
    shortName:
      '札幌國際滑雪場',
    latitude:
      43.073,
    longitude:
      141.0704,
    officialUrl:
      'https://www.sapporo-kokusai.jp/',
  },
  {
    id:
      'niseko-hirafu',
    prefectureId:
      'hokkaido',
    name:
      'Niseko Tokyu Grand Hirafu',
    shortName:
      '二世古格蘭比羅夫',
    latitude:
      42.862,
    longitude:
      140.6979,
    officialUrl:
      'https://www.grand-hirafu.jp/',
  },
  {
    id:
      'niseko-hanazono',
    prefectureId:
      'hokkaido',
    name:
      'Niseko Hanazono Resort',
    shortName:
      '二世古 HANAZONO',
    latitude:
      42.8931,
    longitude:
      140.6997,
    officialUrl:
      'https://hanazononiseko.com/',
  },
  {
    id:
      'rusutsu',
    prefectureId:
      'hokkaido',
    name:
      'Rusutsu Resort',
    shortName:
      '留壽都滑雪場',
    latitude:
      42.7508,
    longitude:
      140.9118,
    officialUrl:
      'https://rusutsu.com/',
  },
  {
    id:
      'tomamu',
    prefectureId:
      'hokkaido',
    name:
      'Hoshino Resorts Tomamu',
    shortName:
      '星野 TOMAMU',
    latitude:
      43.064,
    longitude:
      142.612,
    officialUrl:
      'https://www.snowtomamu.jp/winter/en/',
  },
  {
    id:
      'kiroro',
    prefectureId:
      'hokkaido',
    name:
      'Kiroro Snow World',
    shortName:
      '喜樂樂雪世界',
    latitude:
      43.0704,
    longitude:
      140.9932,
    officialUrl:
      'https://www.kiroro.co.jp/',
  },
  {
    id:
      'kamui',
    prefectureId:
      'hokkaido',
    name:
      'Kamui Ski Links',
    shortName:
      '神居滑雪場',
    latitude:
      43.7039,
    longitude:
      142.1867,
    officialUrl:
      'https://www.kamui-skilinks.com/',
  },

  // ==========================================================
  // Tohoku
  // ==========================================================
  {
    id:
      'hakkoda',
    prefectureId:
      'aomori',
    name:
      'Hakkoda Ski Area',
    shortName:
      '八甲田滑雪場',
    latitude:
      40.683,
    longitude:
      140.830,
    officialUrl:
      'https://hakkoda-ropeway.jp/',
  },
  {
    id:
      'appi',
    prefectureId:
      'iwate',
    name:
      'Appi Kogen Ski Resort',
    shortName:
      '安比高原滑雪場',
    latitude:
      40.003,
    longitude:
      140.968,
    officialUrl:
      'https://www.appi.co.jp/',
  },
  {
    id:
      'zao',
    prefectureId:
      'yamagata',
    name:
      'Zao Onsen Ski Resort',
    shortName:
      '藏王溫泉滑雪場',
    latitude:
      38.167,
    longitude:
      140.395,
    officialUrl:
      'https://zaomountainresort.com/',
  },
  {
    id:
      'nekoma',
    prefectureId:
      'fukushima',
    name:
      'NEKOMA Mountain',
    shortName:
      'NEKOMA 貓魔山',
    latitude:
      37.615,
    longitude:
      140.071,
    officialUrl:
      'https://www.nekoma.co.jp/',
  },

  // ==========================================================
  // Gunma
  // ==========================================================
  {
    id:
      'kawaba',
    prefectureId:
      'gunma',
    name:
      'Kawaba Ski Resort',
    shortName:
      '川場滑雪場',
    latitude:
      36.803,
    longitude:
      139.104,
    officialUrl:
      'https://www.kawaba.co.jp/',
  },
  {
    id:
      'marunuma',
    prefectureId:
      'gunma',
    name:
      'Marunuma Kogen Ski Resort',
    shortName:
      '丸沼高原滑雪場',
    latitude:
      36.813,
    longitude:
      139.333,
    officialUrl:
      'https://www.marunuma.jp/winter/',
  },

  // ==========================================================
  // Niigata
  // ==========================================================
  {
    id:
      'gala-yuzawa',
    prefectureId:
      'niigata',
    name:
      'GALA Yuzawa Snow Resort',
    shortName:
      'GALA 湯澤滑雪場',
    latitude:
      36.936,
    longitude:
      138.809,
    officialUrl:
      'https://gala.co.jp/en/winter/',
  },
  {
    id:
      'naeba',
    prefectureId:
      'niigata',
    name:
      'Naeba Ski Resort',
    shortName:
      '苗場滑雪場',
    latitude:
      36.791,
    longitude:
      138.783,
    officialUrl:
      'https://www.princehotels.co.jp/ski/naeba/winter/',
  },
  {
    id:
      'kagura',
    prefectureId:
      'niigata',
    name:
      'Kagura Ski Resort',
    shortName:
      '神樂滑雪場',
    latitude:
      36.876,
    longitude:
      138.731,
    officialUrl:
      'https://www.princehotels.co.jp/ski/kagura/winter/',
  },
  {
    id:
      'joetsu-kokusai',
    prefectureId:
      'niigata',
    name:
      'Joetsu Kokusai Ski Resort',
    shortName:
      '上越國際滑雪場',
    latitude:
      37.027,
    longitude:
      138.827,
    officialUrl:
      'https://jkokusai.co.jp/ski/',
  },

  // ==========================================================
  // Nagano
  // ==========================================================
  {
    id:
      'hakuba-happo',
    prefectureId:
      'nagano',
    name:
      'Hakuba Happo-One',
    shortName:
      '白馬八方尾根滑雪場',
    latitude:
      36.703,
    longitude:
      137.837,
    officialUrl:
      'https://www.happo-one.jp/en/',
  },
  {
    id:
      'hakuba-goryu',
    prefectureId:
      'nagano',
    name:
      'Hakuba Goryu',
    shortName:
      '白馬五龍滑雪場',
    latitude:
      36.662,
    longitude:
      137.837,
    officialUrl:
      'https://www.hakubaescal.com/winter-en/',
  },
  {
    id:
      'tsugaike',
    prefectureId:
      'nagano',
    name:
      'Tsugaike Mountain Resort',
    shortName:
      '栂池高原滑雪場',
    latitude:
      36.749,
    longitude:
      137.872,
    officialUrl:
      'https://www.tsugaike.gr.jp/',
  },
  {
    id:
      'nozawa',
    prefectureId:
      'nagano',
    name:
      'Nozawa Onsen Ski Resort',
    shortName:
      '野澤溫泉滑雪場',
    latitude:
      36.923,
    longitude:
      138.447,
    officialUrl:
      'https://en.nozawaski.com/',
  },
  {
    id:
      'shiga-kogen',
    prefectureId:
      'nagano',
    name:
      'Shiga Kogen',
    shortName:
      '志賀高原滑雪場',
    latitude:
      36.734,
    longitude:
      138.510,
    officialUrl:
      'https://shigakogen-ski.or.jp/english/',
  },

  // ==========================================================
  // Gifu
  // ==========================================================
  {
    id:
      'takasu',
    prefectureId:
      'gifu',
    name:
      'Takasu Snow Park',
    shortName:
      '高鷲 Snow Park',
    latitude:
      35.961,
    longitude:
      136.838,
    officialUrl:
      'https://www.takasu.gr.jp/',
  },
  {
    id:
      'dynaland',
    prefectureId:
      'gifu',
    name:
      'Dynaland',
    shortName:
      'Dynaland 滑雪場',
    latitude:
      35.988,
    longitude:
      136.821,
    officialUrl:
      'https://www.dynaland.co.jp/',
  },
]


const SKI_TODAY_RESORT_KEY =
  'travel_v100_ski_today_resort_v2'



const SKI_STATUS_API_BASE =
  (
    import.meta.env
      .VITE_SKI_STATUS_API_BASE ??
    ''
  ).replace(
    /\/$/,
    ''
  )


const LIFT_REFRESH_MS =
  3 *
  60 *
  1000


// ============================================================
// Props
// ============================================================

type SkiTodayCardProps = {
  areaId?: string
}


// ============================================================
// API Types
// ============================================================

type OpenMeteoResponse = {
  current: {
    temperature_2m: number
    apparent_temperature: number
    wind_speed_10m: number
    wind_gusts_10m: number
    weather_code: number
    snow_depth?: number
    visibility?: number
    time: string
  }

  hourly: {
    time: string[]
    temperature_2m: number[]
    snowfall: number[]
    snow_depth: number[]
    freezing_level_height: number[]
    visibility: number[]
    wind_speed_10m: number[]
    wind_gusts_10m: number[]
  }

  daily: {
    time: string[]
    weather_code: number[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    snowfall_sum: number[]
    precipitation_probability_max: number[]
    wind_gusts_10m_max: number[]
  }
}


type DailyForecast = {
  date: string
  weatherCode: number
  minTemperature: number
  maxTemperature: number
  snowfall: number
  precipitationProbability: number
  windGust: number
}


type SkiTodayData = {
  temperature: number
  apparentTemperature: number
  windSpeed: number
  windGust: number
  newSnow24h: number
  snowDepth: number | null
  visibilityKm: number | null
  freezingLevel: number | null
  weatherCode: number
  updatedAt: string
  todaySnow: number
  next6hSnow: number
  next12hSnow: number
  daily: DailyForecast[]
}


type LiftItem = {
  name: string

  code?:
    string

  status:
    | 'open'
    | 'hold'
    | 'closed'
}


type LiftStatus = {
  success: boolean
  supported: boolean
  live: boolean

  sourceMode:
    | 'official_live'
    | 'official_summary'
    | 'official_schedule'
    | 'official_only'
    | 'unsupported'

  open:
    number |
    null

  total:
    number |
    null

  onHold:
    number |
    null

  closed:
    number |
    null

  updatedAt?:
    string |
    null

  fetchedAt?:
    string

  sourceUrl?:
    string

  officialUrl?:
    string

  message?:
    string

  lifts:
    LiftItem[]
}


// ============================================================
// Helpers
// ============================================================

function weatherSymbol(
  code: number
) {

  if (
    code >= 71 &&
    code <= 77
  ) {
    return '❄'
  }


  if (
    code === 85 ||
    code === 86
  ) {
    return '❄'
  }


  if (
    code >= 61 &&
    code <= 67
  ) {
    return '☂'
  }


  if (
    code === 0 ||
    code === 1
  ) {
    return '☀'
  }


  if (
    code === 2 ||
    code === 3
  ) {
    return '☁'
  }


  return '◌'

}


function formatJapanTime(
  value:
    string |
    undefined
) {

  if (!value) {
    return '--:--'
  }


  return (
    value.includes('T')
      ? value.slice(
          11,
          16
        )
      : value
  ) ||
    '--:--'

}


function getWeekday(
  date:
    string,
  index:
    number
) {

  if (
    index ===
    0
  ) {
    return '今天'
  }


  return new Date(
    `${date}T12:00:00+09:00`
  )
    .toLocaleDateString(
      'zh-TW',
      {
        weekday:
          'short',
        timeZone:
          'Asia/Tokyo',
      }
    )

}


function getInitialResort(
  areaId?:
    string
):
  SkiResort {

  try {

    const saved =
      localStorage.getItem(
        SKI_TODAY_RESORT_KEY
      )


    const savedResort =
      SKI_RESORTS.find(
        resort =>
          resort.id ===
          saved
      )


    if (
      savedResort
    ) {
      return savedResort
    }

  } catch {
    // Ignore.
  }


  const areaMap:
    Record<string, string> =
  {
    sapporo:
      'sapporo-teine',

    asahikawa:
      'kamui',

    'new-chitose':
      'rusutsu',

    otaru:
      'kiroro',

    niseko:
      'niseko-hirafu',
  }


  const mapped =
    areaId
      ? areaMap[
          areaId
        ]
      : undefined


  return (
    SKI_RESORTS.find(
      resort =>
        resort.id ===
        mapped
    ) ??
    SKI_RESORTS[0]
  )

}


// ============================================================
// Component
// ============================================================

function SkiTodayCard({
  areaId,
}: SkiTodayCardProps) {

  const [
    selectedResortId,
    setSelectedResortId,
  ] = useState(
    () =>
      getInitialResort(
        areaId
      ).id
  )


  const selectedResort =
    SKI_RESORTS.find(
      resort =>
        resort.id ===
        selectedResortId
    ) ??
    SKI_RESORTS[0]


  const [
    selectedPrefectureId,
    setSelectedPrefectureId,
  ] = useState(
    selectedResort.prefectureId
  )


  const [
    selectorOpen,
    setSelectorOpen,
  ] = useState(false)


  const [
    forecastExpanded,
    setForecastExpanded,
  ] = useState(true)


  const [
    data,
    setData,
  ] = useState<SkiTodayData | null>(
    null
  )


  const [
    loading,
    setLoading,
  ] = useState(true)


  const [
    error,
    setError,
  ] = useState(false)


  const [
    refreshing,
    setRefreshing,
  ] = useState(false)


  const [
    liftStatus,
    setLiftStatus,
  ] = useState<LiftStatus | null>(
    null
  )



  const [
    liftStatusLoading,
    setLiftStatusLoading,
  ] = useState(false)


  const [
    liftStatusError,
    setLiftStatusError,
  ] = useState(false)


  const [
    liftDetailOpen,
    setLiftDetailOpen,
  ] = useState(false)


  const resortsInPrefecture =
    useMemo(
      () =>
        SKI_RESORTS.filter(
          resort =>
            resort.prefectureId ===
            selectedPrefectureId
        ),
      [
        selectedPrefectureId,
      ]
    )


  const selectedPrefecture =
    SKI_PREFECTURES.find(
      prefecture =>
        prefecture.id ===
        selectedResort.prefectureId
    ) ??
    SKI_PREFECTURES[0]


  useEffect(() => {

    try {

      localStorage.setItem(
        SKI_TODAY_RESORT_KEY,
        selectedResort.id
      )

    } catch {
      // Ignore.
    }

  }, [
    selectedResort.id,
  ])


  // ==========================================================
  // Fetch Weather + Forecast
  // ==========================================================

  const fetchData =
    async (
      signal?:
        AbortSignal
    ) => {

      try {

        setError(
          false
        )


        const currentVariables = [
          'temperature_2m',
          'apparent_temperature',
          'wind_speed_10m',
          'wind_gusts_10m',
          'weather_code',
          'snow_depth',
          'visibility',
        ].join(',')


        const hourlyVariables = [
          'temperature_2m',
          'snowfall',
          'snow_depth',
          'freezing_level_height',
          'visibility',
          'wind_speed_10m',
          'wind_gusts_10m',
        ].join(',')


        const dailyVariables = [
          'weather_code',
          'temperature_2m_max',
          'temperature_2m_min',
          'snowfall_sum',
          'precipitation_probability_max',
          'wind_gusts_10m_max',
        ].join(',')


        const url =
          `https://api.open-meteo.com/v1/forecast` +
          `?latitude=${selectedResort.latitude}` +
          `&longitude=${selectedResort.longitude}` +
          `&current=${currentVariables}` +
          `&hourly=${hourlyVariables}` +
          `&daily=${dailyVariables}` +
          `&past_days=1` +
          `&forecast_days=7` +
          `&timezone=Asia%2FTokyo`


        const response =
          await fetch(
            url,
            {
              signal,
            }
          )


        if (
          !response.ok
        ) {

          throw new Error(
            `Ski weather API failed: ${response.status}`
          )

        }


        const json =
          (await response.json()) as
            OpenMeteoResponse


        const currentTime =
          new Date(
            `${json.current.time}:00+09:00`
          )


        const currentTimestamp =
          currentTime.getTime()


        const start24h =
          currentTimestamp -
          24 *
          60 *
          60 *
          1000


        let newSnow24h =
          0


        let next6hSnow =
          0


        let next12hSnow =
          0


        let closestIndex =
          0


        let closestDistance =
          Number.POSITIVE_INFINITY


        json.hourly.time.forEach(
          (
            time,
            index
          ) => {

            const timestamp =
              new Date(
                `${time}:00+09:00`
              ).getTime()


            const snowfall =
              Number(
                json.hourly
                  .snowfall[
                    index
                  ] ??
                0
              )


            if (
              timestamp >
                start24h &&
              timestamp <=
                currentTimestamp
            ) {

              newSnow24h +=
                snowfall

            }


            if (
              timestamp >
                currentTimestamp &&
              timestamp <=
                currentTimestamp +
                  6 *
                  60 *
                  60 *
                  1000
            ) {

              next6hSnow +=
                snowfall

            }


            if (
              timestamp >
                currentTimestamp &&
              timestamp <=
                currentTimestamp +
                  12 *
                  60 *
                  60 *
                  1000
            ) {

              next12hSnow +=
                snowfall

            }


            const distance =
              Math.abs(
                timestamp -
                currentTimestamp
              )


            if (
              distance <
              closestDistance
            ) {

              closestDistance =
                distance

              closestIndex =
                index

            }

          }
        )


        const snowDepthMeters =
          Number.isFinite(
            json.current
              .snow_depth
          )
            ? json.current
                .snow_depth
            : json.hourly
                .snow_depth[
                  closestIndex
                ]


        const visibilityMeters =
          Number.isFinite(
            json.current
              .visibility
          )
            ? json.current
                .visibility
            : json.hourly
                .visibility[
                  closestIndex
                ]


        const freezingLevel =
          json.hourly
            .freezing_level_height[
              closestIndex
            ]


        const daily =
          json.daily.time.map(
            (
              date,
              index
            ) => ({
              date,

              weatherCode:
                json.daily
                  .weather_code[
                    index
                  ],

              maxTemperature:
                json.daily
                  .temperature_2m_max[
                    index
                  ],

              minTemperature:
                json.daily
                  .temperature_2m_min[
                    index
                  ],

              snowfall:
                json.daily
                  .snowfall_sum[
                    index
                  ],

              precipitationProbability:
                json.daily
                  .precipitation_probability_max[
                    index
                  ],

              windGust:
                json.daily
                  .wind_gusts_10m_max[
                    index
                  ],
            })
          )


        setData({
          temperature:
            json.current
              .temperature_2m,

          apparentTemperature:
            json.current
              .apparent_temperature,

          windSpeed:
            json.current
              .wind_speed_10m,

          windGust:
            json.current
              .wind_gusts_10m,

          newSnow24h:
            Math.max(
              0,
              newSnow24h
            ),

          snowDepth:
            Number.isFinite(
              snowDepthMeters
            )
              ? snowDepthMeters *
                100
              : null,

          visibilityKm:
            Number.isFinite(
              visibilityMeters
            )
              ? visibilityMeters /
                1000
              : null,

          freezingLevel:
            Number.isFinite(
              freezingLevel
            )
              ? freezingLevel
              : null,

          weatherCode:
            json.current
              .weather_code,

          updatedAt:
            json.current.time,

          todaySnow:
            daily[0]
              ?.snowfall ??
            0,

          next6hSnow,

          next12hSnow,

          daily,
        })


        setError(
          false
        )

      } catch (
        fetchError
      ) {

        if (
          fetchError instanceof
            DOMException &&
          fetchError.name ===
            'AbortError'
        ) {
          return
        }


        console.error(
          'Ski Today V2 fetch failed:',
          fetchError
        )


        setError(
          true
        )

      } finally {

        setLoading(
          false
        )

        setRefreshing(
          false
        )

      }

    }


  const fetchLiftStatus =
    async (
      signal?:
        AbortSignal
    ) => {

      try {

        setLiftStatusLoading(
          true
        )

        setLiftStatusError(
          false
        )


        const response =
          await fetch(
            `${SKI_STATUS_API_BASE}/api/ski/lift-status/${selectedResort.id}`,
            {
              signal,
            }
          )


        if (
          !response.ok
        ) {

          throw new Error(
            `Lift status API failed: ${response.status}`
          )

        }


        const json =
          (await response.json()) as
            LiftStatus


        setLiftStatus(
          json
        )


        setLiftStatusError(
          !json.success &&
          json.sourceMode !==
            'official_only'
        )

      } catch (
        liftError
      ) {

        if (
          liftError instanceof
            DOMException &&
          liftError.name ===
            'AbortError'
        ) {
          return
        }


        console.warn(
          'Lift status API failed:',
          liftError
        )


        setLiftStatusError(
          true
        )

        setLiftStatus(
          null
        )

      } finally {

        setLiftStatusLoading(
          false
        )

      }

    }


  useEffect(() => {

    const controller =
      new AbortController()


    setLiftStatus(
      null
    )

    setLiftDetailOpen(
      false
    )


    void fetchLiftStatus(
      controller.signal
    )


    const intervalId =
      window.setInterval(
        () => {

          void fetchLiftStatus()

        },
        LIFT_REFRESH_MS
      )


    return () => {

      controller.abort()

      window.clearInterval(
        intervalId
      )

    }

  }, [
    selectedResort.id,
  ])


  useEffect(() => {

    const controller =
      new AbortController()


    setLoading(
      true
    )


    setLiftStatus(
      null
    )


    void fetchData(
      controller.signal
    )


    return () => {

      controller.abort()

    }

  }, [
    selectedResort.id,
    selectedResort.latitude,
    selectedResort.longitude,
  ])


  // ==========================================================
  // Coach Assessment
  // ==========================================================

  const coachReport =
    useMemo(
      () => {

        if (
          !data
        ) {

          return {
            score:
              0,

            snowScore:
              0,

            weatherScore:
              0,

            grade:
              'WAIT',

            condition:
              'CHECKING',

            message:
              '正在建立今日雪況簡報',

            accent:
              'text-white/70',

            bar:
              'bg-white/30',
          }

        }


        // ======================================================
        // Strict Ski Score V2
        //
        // SNOW      45 pt
        //   Base snow depth     25
        //   Fresh snow / 24H    20
        //
        // WEATHER   55 pt
        //   Temperature         20
        //   Wind                20
        //   Visibility          15
        //
        // Hard caps:
        // - Base <= 5cm   : max 20
        // - Base < 30cm   : max 40
        // - Wind >= 40km/h: max 35
        // - Vis < 0.5km   : max 35
        //
        // This is an app heuristic, not an official resort score.
        // ======================================================


        // ------------------------------
        // Base snow depth / 25
        // ------------------------------

        let baseScore =
          5


        if (
          data.snowDepth !==
          null
        ) {

          if (
            data.snowDepth >=
            150
          ) {
            baseScore =
              25
          }

          else if (
            data.snowDepth >=
            100
          ) {
            baseScore =
              22
          }

          else if (
            data.snowDepth >=
            60
          ) {
            baseScore =
              18
          }

          else if (
            data.snowDepth >=
            30
          ) {
            baseScore =
              10
          }

          else if (
            data.snowDepth >
            5
          ) {
            baseScore =
              4
          }

          else {
            baseScore =
              0
          }

        }


        // ------------------------------
        // Fresh snow / 20
        // ------------------------------

        let freshSnowScore =
          0


        if (
          data.newSnow24h >=
          20
        ) {
          freshSnowScore =
            20
        }

        else if (
          data.newSnow24h >=
          10
        ) {
          freshSnowScore =
            16
        }

        else if (
          data.newSnow24h >=
          5
        ) {
          freshSnowScore =
            11
        }

        else if (
          data.newSnow24h >=
          2
        ) {
          freshSnowScore =
            6
        }

        else if (
          data.newSnow24h >
          0
        ) {
          freshSnowScore =
            2
        }


        // ------------------------------
        // Temperature / 20
        // ------------------------------

        let temperatureScore =
          4


        if (
          data.temperature >=
            -12 &&
          data.temperature <=
            -4
        ) {
          temperatureScore =
            20
        }

        else if (
          (
            data.temperature >=
              -15 &&
            data.temperature <
              -12
          ) ||
          (
            data.temperature >
              -4 &&
            data.temperature <=
              -1
          )
        ) {
          temperatureScore =
            15
        }

        else if (
          (
            data.temperature >=
              -18 &&
            data.temperature <
              -15
          ) ||
          (
            data.temperature >
              -1 &&
            data.temperature <=
              2
          )
        ) {
          temperatureScore =
            10
        }


        // ------------------------------
        // Wind / 20
        // ------------------------------

        let windScore =
          0


        if (
          data.windSpeed <=
          10
        ) {
          windScore =
            20
        }

        else if (
          data.windSpeed <=
          18
        ) {
          windScore =
            15
        }

        else if (
          data.windSpeed <=
          25
        ) {
          windScore =
            9
        }

        else if (
          data.windSpeed <
          40
        ) {
          windScore =
            4
        }


        // ------------------------------
        // Visibility / 15
        // ------------------------------

        let visibilityScore =
          7


        if (
          data.visibilityKm !==
          null
        ) {

          if (
            data.visibilityKm >=
            10
          ) {
            visibilityScore =
              15
          }

          else if (
            data.visibilityKm >=
            5
          ) {
            visibilityScore =
              12
          }

          else if (
            data.visibilityKm >=
            2
          ) {
            visibilityScore =
              7
          }

          else if (
            data.visibilityKm >=
            1
          ) {
            visibilityScore =
              3
          }

          else {
            visibilityScore =
              0
          }

        }


        const snowScore =
          baseScore +
          freshSnowScore


        const weatherScore =
          temperatureScore +
          windScore +
          visibilityScore


        let score =
          snowScore +
          weatherScore


        // ------------------------------
        // Hard safety / season caps
        // ------------------------------

        if (
          data.snowDepth !==
            null &&
          data.snowDepth <=
            5
        ) {

          score =
            Math.min(
              score,
              20
            )

        }

        else if (
          data.snowDepth !==
            null &&
          data.snowDepth <
            30
        ) {

          score =
            Math.min(
              score,
              40
            )

        }


        if (
          data.windSpeed >=
          40
        ) {

          score =
            Math.min(
              score,
              35
            )

        }


        if (
          data.visibilityKm !==
            null &&
          data.visibilityKm <
            0.5
        ) {

          score =
            Math.min(
              score,
              35
            )

        }


        score =
          Math.min(
            100,
            Math.max(
              0,
              Math.round(
                score
              )
            )
          )


        let condition =
          'FIRM'


        if (
          data.snowDepth !==
            null &&
          data.snowDepth <=
            5
        ) {

          condition =
            'NO SNOW'

        }

        else if (
          data.snowDepth !==
            null &&
          data.snowDepth <
            30
        ) {

          condition =
            'LIMITED'

        }

        else if (
          data.windSpeed >=
          30
        ) {

          condition =
            'WINDY'

        }

        else if (
          data.newSnow24h >=
            10 &&
          data.temperature <=
            -2
        ) {

          condition =
            'POWDER'

        }

        else if (
          data.temperature >
          2
        ) {

          condition =
            'SPRING'

        }

        else if (
          data.newSnow24h >=
          3
        ) {

          condition =
            'FRESH'

        }


        if (
          score >=
          88
        ) {

          return {
            score,
            snowScore,
            weatherScore,

            grade:
              'A',

            condition,

            message:
              '優秀雪況。新雪、底雪與天候條件都很適合滑雪。',

            accent:
              'text-lime-300',

            bar:
              'bg-lime-300',
          }

        }


        if (
          score >=
          75
        ) {

          return {
            score,
            snowScore,
            weatherScore,

            grade:
              'B',

            condition,

            message:
              '條件良好。仍建議確認山頂風勢與 Lift 運行。',

            accent:
              'text-sky-200',

            bar:
              'bg-sky-300',
          }

        }


        if (
          score >=
          60
        ) {

          return {
            score,
            snowScore,
            weatherScore,

            grade:
              'C',

            condition,

            message:
              '普通雪況。以壓雪道與穩定開放區域為主。',

            accent:
              'text-amber-200',

            bar:
              'bg-amber-300',
          }

        }


        if (
          score >=
          40
        ) {

          return {
            score,
            snowScore,
            weatherScore,

            grade:
              'D',

            condition,

            message:
              '條件偏差。雪量或天候已有明顯限制。',

            accent:
              'text-orange-200',

            bar:
              'bg-orange-300',
          }

        }


        return {
          score,
          snowScore,
          weatherScore,

          grade:
            'E',

          condition,

          message:
            '目前不建議依此條件安排滑雪，請先確認雪場是否營業。',

          accent:
            'text-rose-200',

          bar:
            'bg-rose-300',
        }

      },
      [
        data,
      ]
    )


  const refresh =
    () => {

      if (
        refreshing
      ) {
        return
      }


      setRefreshing(
        true
      )


      void fetchData()

      void fetchLiftStatus()

    }


  const openOfficial =
    () => {

      if (
        selectedResort
          .officialUrl
      ) {

        window.open(
          selectedResort
            .officialUrl,
          '_blank',
          'noopener,noreferrer'
        )

        return

      }


      window.open(
        `https://www.google.com/search?q=${encodeURIComponent(
          `${selectedResort.name} ski resort official`
        )}`,
        '_blank',
        'noopener,noreferrer'
      )

    }


  return (

    <section
      className="
        relative
        overflow-hidden
        rounded-[30px]
        bg-[#0b1621]
        text-white
        shadow-[0_18px_42px_rgba(15,23,42,0.23)]
      "
    >

      {/* Professional mountain briefing background */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
        "
      >

        <div
          className="
            absolute
            -right-16
            -top-20
            h-52
            w-52
            rounded-full
            bg-sky-400/15
            blur-3xl
          "
        />


        <div
          className="
            absolute
            -bottom-20
            left-8
            h-44
            w-44
            rounded-full
            bg-lime-300/[0.07]
            blur-3xl
          "
        />


        <svg
          viewBox="0 0 420 420"

          className="
            absolute
            inset-0
            h-full
            w-full
            opacity-[0.12]
          "

          fill="none"

          aria-hidden="true"
        >

          <path
            d="
              M-30 185
              C55 105 100 125 170 78
              C235 35 286 80 332 51
              C380 22 425 38 465 13
            "
            stroke="white"
            strokeWidth="1.5"
          />

          <path
            d="
              M-30 210
              C55 130 100 150 170 103
              C235 60 286 105 332 76
              C380 47 425 63 465 38
            "
            stroke="white"
            strokeWidth="1"
          />

          <path
            d="
              M-30 235
              C55 155 100 175 170 128
              C235 85 286 130 332 101
              C380 72 425 88 465 63
            "
            stroke="white"
            strokeWidth="0.8"
          />

        </svg>

      </div>


      <div
        className="
          relative
          z-10
          px-5
          pb-5
          pt-5
        "
      >

        {/* ====================================================
            Header
        ==================================================== */}

        <div
          className="
            flex
            items-start
            justify-between
            gap-3
          "
        >

          <div
            className="
              min-w-0
            "
          >

            <p
              className="
                text-[8px]
                font-bold
                tracking-[0.24em]
                text-sky-200/45
              "
            >
              COACH MORNING BRIEF · V2
            </p>


            <div
              className="
                mt-1.5
                flex
                items-center
                gap-2
              "
            >

              <h2
                className="
                  text-[20px]
                  font-semibold
                  tracking-[-0.025em]
                "
              >
                SKI TODAY
              </h2>


              <span
                className="
                  rounded-full
                  border
                  border-lime-300/20
                  bg-lime-300/[0.08]
                  px-2
                  py-1
                  text-[7px]
                  font-bold
                  tracking-[0.15em]
                  text-lime-200/80
                "
              >
                LIVE
              </span>

            </div>

          </div>


          <button
            type="button"

            onClick={
              refresh
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
              border-white/10
              bg-white/[0.05]
              text-[15px]
              text-white/50
              transition
              active:scale-95
            "

            aria-label="重新整理滑雪簡報"
          >
            <span
              className={
                refreshing
                  ? 'animate-spin'
                  : ''
              }
            >
              ↻
            </span>
          </button>

        </div>


        {/* ====================================================
            Resort Selector Trigger
        ==================================================== */}

        <button
          type="button"

          onClick={() =>
            setSelectorOpen(
              current =>
                !current
            )
          }

          className="
            mt-4
            flex
            w-full
            items-center
            justify-between
            gap-3
            rounded-[18px]
            border
            border-white/10
            bg-white/[0.045]
            px-4
            py-3
            text-left
            transition
            active:scale-[0.99]
          "
        >

          <div
            className="
              min-w-0
            "
          >

            <p
              className="
                text-[10px]
                font-bold
                tracking-[0.13em]
                text-white/48
              "
            >
              {
                selectedPrefecture
                  .name
              }
              {' · '}
              {
                selectedPrefecture
                  .enName
              }
            </p>


            <p
              className="
                mt-1
                truncate
                text-[15px]
                font-semibold
                tracking-[-0.01em]
                text-white/95
              "
            >
              {
                selectedResort
                  .shortName
              }
            </p>


            <p
              className="
                mt-[3px]
                truncate
                text-[7px]
                font-medium
                tracking-[0.06em]
                text-white/28
              "
            >
              {
                selectedResort
                  .name
              }
            </p>

          </div>


          <span
            className={`
              shrink-0
              text-[13px]
              text-white/35
              transition-transform
              duration-300

              ${
                selectorOpen
                  ? 'rotate-180'
                  : ''
              }
            `}
          >
            ▾
          </span>

        </button>


        {selectorOpen && (

          <div
            className="
              mt-2
              rounded-[20px]
              border
              border-white/10
              bg-black/20
              p-3
            "
          >

            <p
              className="
                text-[9px]
                font-bold
                tracking-[0.16em]
                text-white/40
              "
            >
              PREFECTURE
            </p>


            <div
              className="
                mt-2
                flex
                gap-2
                overflow-x-auto
                pb-1
                [scrollbar-width:none]
                [&::-webkit-scrollbar]:hidden
              "
            >

              {SKI_PREFECTURES.map(
                prefecture => {

                  const selected =
                    prefecture.id ===
                    selectedPrefectureId


                  return (

                    <button
                      key={
                        prefecture.id
                      }

                      type="button"

                      onClick={() => {

                        setSelectedPrefectureId(
                          prefecture.id
                        )

                      }}

                      className={`
                        shrink-0
                        rounded-full
                        border
                        px-3
                        py-1.5
                        text-[10px]
                        font-semibold
                        transition

                        ${
                          selected
                            ? `
                                border-white/30
                                bg-white/15
                                text-white
                              `
                            : `
                                border-white/[0.06]
                                bg-white/[0.025]
                                text-white/40
                              `
                        }
                      `}
                    >
                      {
                        prefecture.name
                      }
                    </button>

                  )

                }
              )}

            </div>


            <p
              className="
                mt-3
                text-[7px]
                font-bold
                tracking-[0.16em]
                text-white/25
              "
            >
              SKI RESORT
            </p>


            <div
              className="
                mt-2
                grid
                grid-cols-2
                gap-2
              "
            >

              {resortsInPrefecture.map(
                resort => {

                  const selected =
                    resort.id ===
                    selectedResort.id


                  return (

                    <button
                      key={
                        resort.id
                      }

                      type="button"

                      onClick={() => {

                        setSelectedResortId(
                          resort.id
                        )

                        setSelectedPrefectureId(
                          resort.prefectureId
                        )

                        setSelectorOpen(
                          false
                        )

                      }}

                      className={`
                        min-w-0
                        rounded-[13px]
                        border
                        px-3
                        py-2.5
                        text-left
                        transition
                        active:scale-[0.98]

                        ${
                          selected
                            ? `
                                border-lime-300/30
                                bg-lime-300/[0.10]
                              `
                            : `
                                border-white/[0.07]
                                bg-white/[0.025]
                              `
                        }
                      `}
                    >

                      <p
                        className={`
                          truncate
                          text-[9px]
                          font-semibold

                          ${
                            selected
                              ? 'text-lime-200'
                              : 'text-white/60'
                          }
                        `}
                      >
                        {
                          resort.shortName
                        }
                      </p>


                      <p
                        className="
                          mt-1
                          truncate
                          text-[6px]
                          text-white/25
                        "
                      >
                        {
                          resort.name
                        }
                      </p>

                    </button>

                  )

                }
              )}

            </div>

          </div>

        )}


        {/* ====================================================
            Loading / Error
        ==================================================== */}

        {loading && (

          <div
            className="
              mt-5
              flex
              h-[190px]
              items-center
              justify-center
              rounded-[22px]
              border
              border-white/10
              bg-white/[0.035]
            "
          >
            <p
              className="
                text-[11px]
                tracking-[0.12em]
                text-white/35
              "
            >
              ANALYZING MOUNTAIN...
            </p>
          </div>

        )}


        {!loading &&
          error && (

          <div
            className="
              mt-5
              rounded-[22px]
              border
              border-rose-300/15
              bg-rose-300/[0.05]
              px-4
              py-8
              text-center
            "
          >
            <p
              className="
                text-[12px]
                font-semibold
                text-white/75
              "
            >
              無法取得雪況
            </p>

            <p
              className="
                mt-2
                text-[9px]
                text-white/35
              "
            >
              請確認網路後重新整理
            </p>
          </div>

        )}


        {!loading &&
          !error &&
          data && (

          <>

            {/* ==================================================
                Main Brief
            ================================================== */}

            <div
              className="
                mt-5
                grid
                grid-cols-[1fr_98px]
                gap-4
              "
            >

              <div>

                <div
                  className="
                    flex
                    items-center
                    gap-3
                  "
                >

                  <span
                    className="
                      text-[40px]
                      font-light
                      leading-none
                      tracking-[-0.07em]
                    "
                  >
                    {
                      Math.round(
                        data.temperature
                      )
                    }
                    °
                  </span>


                  <div>

                    <p
                      className={`
                        text-[15px]
                        font-bold
                        tracking-[0.12em]
                        ${coachReport.accent}
                      `}
                    >
                      {
                        weatherSymbol(
                          data.weatherCode
                        )
                      }
                      {' '}
                      {
                        coachReport.condition
                      }
                    </p>


                    <p
                      className="
                        mt-1
                        text-[8px]
                        text-white/35
                      "
                    >
                      FEELS {
                        Math.round(
                          data.apparentTemperature
                        )
                      }°
                    </p>

                  </div>

                </div>


                <p
                  className="
                    mt-4
                    max-w-[220px]
                    text-[10px]
                    leading-[1.7]
                    text-white/55
                  "
                >
                  {
                    coachReport.message
                  }
                </p>

              </div>


              <div
                className="
                  rounded-[20px]
                  border
                  border-white/10
                  bg-white/[0.045]
                  px-3
                  py-3
                  text-center
                "
              >

                <p
                  className="
                    text-[7px]
                    font-bold
                    tracking-[0.16em]
                    text-white/30
                  "
                >
                  SKI SCORE
                </p>


                <div
                  className="
                    mt-1
                    flex
                    items-end
                    justify-center
                  "
                >

                  <span
                    className={`
                      text-[34px]
                      font-semibold
                      leading-none
                      ${coachReport.accent}
                    `}
                  >
                    {
                      coachReport.score
                    }
                  </span>

                  <span
                    className="
                      mb-1
                      ml-1
                      text-[8px]
                      text-white/25
                    "
                  >
                    /100
                  </span>

                </div>


                <div
                  className="
                    mt-3
                    h-[3px]
                    overflow-hidden
                    rounded-full
                    bg-white/10
                  "
                >
                  <div
                    className={`
                      h-full
                      rounded-full
                      ${coachReport.bar}
                    `}

                    style={{
                      width:
                        `${coachReport.score}%`,
                    }}
                  />
                </div>


                <p
                  className={`
                    mt-2
                    text-[10px]
                    font-black
                    tracking-[0.16em]
                    ${coachReport.accent}
                  `}
                >
                  GRADE {
                    coachReport.grade
                  }
                </p>


                <p
                  className="
                    mt-2
                    whitespace-nowrap
                    text-[5px]
                    font-semibold
                    tracking-[0.05em]
                    text-white/25
                  "
                >
                  SNOW {
                    coachReport.snowScore
                  }/45
                  {' · '}
                  WEATHER {
                    coachReport.weatherScore
                  }/55
                </p>

              </div>

            </div>


            {/* ==================================================
                Main Metrics
            ================================================== */}

            <div
              className="
                mt-5
                grid
                grid-cols-4
                overflow-hidden
                rounded-[20px]
                border
                border-white/10
                bg-white/[0.035]
              "
            >

              <Metric
                label="24H SNOW"
                value={
                  `${Math.round(
                    data.newSnow24h
                  )}`
                }
                unit="cm"
              />


              <Metric
                label="WIND"
                value={
                  `${Math.round(
                    data.windSpeed
                  )}`
                }
                unit="km/h"
                divided
              />


              <Metric
                label="BASE"
                value={
                  data.snowDepth ===
                  null
                    ? '--'
                    : `${Math.round(
                        data.snowDepth
                      )}`
                }
                unit="cm"
                divided
              />


              <Metric
                label="VIS"
                value={
                  data.visibilityKm ===
                  null
                    ? '--'
                    : data.visibilityKm >=
                      10
                    ? '10+'
                    : data.visibilityKm
                        .toFixed(
                          1
                        )
                }
                unit="km"
                divided
              />

            </div>


            {/* ==================================================
                Next Snow / Freezing Level
            ================================================== */}

            <div
              className="
                mt-3
                grid
                grid-cols-3
                gap-2
              "
            >

              <MiniMetric
                label="NEXT 6H"
                value={
                  `${data.next6hSnow.toFixed(
                    1
                  )} cm`
                }
              />


              <MiniMetric
                label="NEXT 12H"
                value={
                  `${data.next12hSnow.toFixed(
                    1
                  )} cm`
                }
              />


              <MiniMetric
                label="FREEZE LV."
                value={
                  data.freezingLevel ===
                  null
                    ? '--'
                    : `${
                        Math.round(
                          data.freezingLevel
                        )
                      } m`
                }
              />

            </div>


            {/* ==================================================
                Lift Status · V3
            ================================================== */}

            <div
              className="
                mt-3
                overflow-hidden
                rounded-[18px]
                border
                border-white/10
                bg-white/[0.035]
              "
            >

              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-3
                  px-4
                  py-3
                "
              >

                <button
                  type="button"

                  onClick={() => {

                    if (
                      liftStatus
                        ?.lifts
                        ?.length
                    ) {

                      setLiftDetailOpen(
                        current =>
                          !current
                      )

                    }

                  }}

                  className="
                    flex
                    min-w-0
                    flex-1
                    items-center
                    gap-3
                    text-left
                  "
                >

                  <div
                    className={`
                      h-2
                      w-2
                      shrink-0
                      rounded-full

                      ${
                        liftStatus?.live
                          ? 'bg-lime-300 shadow-[0_0_10px_rgba(190,242,100,0.65)]'
                          : liftStatusLoading
                          ? 'animate-pulse bg-sky-200/60'
                          : 'bg-white/25'
                      }
                    `}
                  />


                  <div
                    className="
                      min-w-0
                    "
                  >

                    <div
                      className="
                        flex
                        items-center
                        gap-2
                      "
                    >

                      <p
                        className="
                          text-[7px]
                          font-bold
                          tracking-[0.18em]
                          text-white/30
                        "
                      >
                        LIFT STATUS
                      </p>


                      {liftStatus?.sourceMode ===
                        'official_live' && (

                        <span
                          className="
                            rounded-full
                            bg-lime-300/[0.10]
                            px-1.5
                            py-[2px]
                            text-[6px]
                            font-black
                            tracking-[0.1em]
                            text-lime-200/80
                          "
                        >
                          LIVE
                        </span>

                      )}


                      {liftStatus?.sourceMode ===
                        'official_summary' && (

                        <span
                          className="
                            rounded-full
                            bg-sky-300/[0.08]
                            px-1.5
                            py-[2px]
                            text-[6px]
                            font-black
                            tracking-[0.1em]
                            text-sky-200/60
                          "
                        >
                          SUMMARY
                        </span>

                      )}


                      {liftStatus?.sourceMode ===
                        'official_schedule' && (

                        <span
                          className="
                            rounded-full
                            bg-amber-300/[0.08]
                            px-1.5
                            py-[2px]
                            text-[6px]
                            font-black
                            tracking-[0.1em]
                            text-amber-200/60
                          "
                        >
                          TODAY
                        </span>

                      )}

                    </div>


                    <div
                      className="
                        mt-1
                        flex
                        items-baseline
                        gap-2
                      "
                    >

                      <p
                        className="
                          text-[13px]
                          font-semibold
                          text-white/85
                        "
                      >
                        {
                          liftStatusLoading &&
                          !liftStatus
                            ? 'CHECKING...'
                            : liftStatus &&
                              liftStatus.open !==
                                null &&
                              liftStatus.total !==
                                null
                            ? `${liftStatus.open} / ${liftStatus.total}`
                            : liftStatus?.sourceMode ===
                                'official_only' ||
                              liftStatus?.sourceMode ===
                                'unsupported'
                            ? 'NO LIVE DATA'
                            : 'OFFICIAL CHECK'
                        }
                      </p>


                      {liftStatus &&
                        liftStatus.onHold !==
                          null &&
                        liftStatus.onHold >
                          0 && (

                        <p
                          className="
                            text-[7px]
                            font-semibold
                            text-amber-200/60
                          "
                        >
                          HOLD {
                            liftStatus.onHold
                          }
                        </p>

                      )}

                    </div>


                    <p
                      className="
                        mt-1
                        truncate
                        text-[6px]
                        text-white/20
                      "
                    >
                      {
                        liftStatusError
                          ? 'LIVE API UNAVAILABLE · OFFICIAL LINK AVAILABLE'
                          : liftStatus?.live
                          ? 'AUTO REFRESH · 3 MIN'
                          : liftStatus?.sourceMode ===
                              'official_summary'
                          ? 'OFFICIAL SUMMARY · NOT SECOND-BY-SECOND'
                          : liftStatus?.sourceMode ===
                              'official_schedule'
                          ? 'TODAY OPERATION SCHEDULE'
                          : liftStatus?.sourceMode ===
                              'official_only' ||
                            liftStatus?.sourceMode ===
                              'unsupported'
                          ? '此雪場目前沒有即時 DATA · 請至官網查詢'
                          : 'LIVE ADAPTER NOT AVAILABLE YET'
                      }
                    </p>

                  </div>

                </button>


                <button
                  type="button"

                  onClick={() => {

                    const url =
                      liftStatus
                        ?.sourceUrl ??
                      selectedResort
                        .officialUrl


                    if (
                      url
                    ) {

                      window.open(
                        url,
                        '_blank',
                        'noopener,noreferrer'
                      )

                    } else {

                      openOfficial()

                    }

                  }}

                  className="
                    shrink-0
                    rounded-[12px]
                    border
                    border-white/10
                    bg-white/[0.04]
                    px-3
                    py-2
                    text-[8px]
                    font-bold
                    tracking-[0.1em]
                    text-white/50
                    transition
                    active:scale-[0.98]
                  "
                >
                  OFFICIAL ↗
                </button>

              </div>


              {liftStatus &&
                liftStatus.lifts.length >
                  0 && (

                <div
                  className="
                    border-t
                    border-white/[0.07]
                  "
                >

                  <button
                    type="button"

                    onClick={() =>
                      setLiftDetailOpen(
                        current =>
                          !current
                      )
                    }

                    className="
                      flex
                      w-full
                      items-center
                      justify-between
                      px-4
                      py-2.5
                      text-left
                    "
                  >

                    <p
                      className="
                        text-[7px]
                        font-bold
                        tracking-[0.12em]
                        text-white/30
                      "
                    >
                      LIFT DETAIL
                    </p>


                    <span
                      className={`
                        text-[9px]
                        text-white/25
                        transition-transform

                        ${
                          liftDetailOpen
                            ? 'rotate-180'
                            : ''
                        }
                      `}
                    >
                      ▾
                    </span>

                  </button>


                  {liftDetailOpen && (

                    <div
                      className="
                        grid
                        gap-[1px]
                        bg-white/[0.06]
                      "
                    >

                      {liftStatus.lifts.map(
                        (
                          lift,
                          index
                        ) => (

                          <div
                            key={
                              `${lift.name}-${index}`
                            }

                            className="
                              flex
                              items-center
                              justify-between
                              gap-3
                              bg-[#0b1621]/95
                              px-4
                              py-2.5
                            "
                          >

                            <div
                              className="
                                flex
                                min-w-0
                                items-center
                                gap-2
                              "
                            >

                              {lift.code && (

                                <span
                                  className="
                                    shrink-0
                                    rounded-[6px]
                                    border
                                    border-white/10
                                    bg-white/[0.05]
                                    px-1.5
                                    py-1
                                    font-mono
                                    text-[7px]
                                    font-bold
                                    text-white/45
                                  "
                                >
                                  {
                                    lift.code
                                  }
                                </span>

                              )}


                              <p
                                className="
                                  min-w-0
                                  truncate
                                  text-[8px]
                                  font-medium
                                  text-white/55
                                "
                              >
                                {
                                  lift.name
                                }
                              </p>

                            </div>


                            <span
                              className={`
                                flex
                                shrink-0
                                items-center
                                gap-1.5
                                rounded-full
                                px-2
                                py-1
                                text-[6px]
                                font-black
                                tracking-[0.08em]

                                ${
                                  lift.status ===
                                  'open'
                                    ? `
                                        bg-lime-300/[0.10]
                                        text-lime-200/90
                                      `
                                    : lift.status ===
                                      'hold'
                                    ? `
                                        bg-amber-300/[0.10]
                                        text-amber-200/90
                                      `
                                    : `
                                        bg-rose-400/[0.12]
                                        text-rose-200/90
                                      `
                                }
                              `}
                            >

                              <span
                                className={`
                                  h-[6px]
                                  w-[6px]
                                  rounded-full

                                  ${
                                    lift.status ===
                                    'open'
                                      ? `
                                          bg-lime-300
                                          shadow-[0_0_6px_rgba(190,242,100,0.70)]
                                        `
                                      : lift.status ===
                                        'hold'
                                      ? `
                                          bg-amber-300
                                          shadow-[0_0_6px_rgba(252,211,77,0.55)]
                                        `
                                      : `
                                          bg-rose-400
                                          shadow-[0_0_6px_rgba(251,113,133,0.60)]
                                        `
                                  }
                                `}
                              />


                              {
                                lift.status ===
                                'open'
                                  ? 'OPEN'
                                  : lift.status ===
                                    'hold'
                                  ? 'HOLD'
                                  : 'CLOSED'
                              }

                            </span>

                          </div>

                        )
                      )}

                    </div>

                  )}

                </div>

              )}

            </div>


            {/* ==================================================
                Integrated Snow Forecast
            ================================================== */}

            <div
              className="
                mt-5
                border-t
                border-white/[0.08]
                pt-4
              "
            >

              <button
                type="button"

                onClick={() =>
                  setForecastExpanded(
                    current =>
                      !current
                  )
                }

                className="
                  flex
                  w-full
                  items-center
                  justify-between
                  gap-3
                  text-left
                "
              >

                <div>

                  <p
                    className="
                      text-[7px]
                      font-bold
                      tracking-[0.2em]
                      text-sky-200/35
                    "
                  >
                    SNOW OUTLOOK
                  </p>


                  <p
                    className="
                      mt-1
                      text-[13px]
                      font-semibold
                      text-white/80
                    "
                  >
                    7 日雪況預測
                  </p>

                </div>


                <div
                  className="
                    flex
                    items-center
                    gap-3
                  "
                >

                  <div
                    className="
                      text-right
                    "
                  >
                    <p
                      className="
                        text-[9px]
                        font-semibold
                        text-sky-200/70
                      "
                    >
                      TODAY {
                        data.todaySnow.toFixed(
                          1
                        )
                      } cm
                    </p>

                    <p
                      className="
                        mt-1
                        text-[7px]
                        text-white/25
                      "
                    >
                      MODEL FORECAST
                    </p>
                  </div>


                  <span
                    className={`
                      text-[11px]
                      text-white/30
                      transition-transform
                      duration-300

                      ${
                        forecastExpanded
                          ? 'rotate-180'
                          : ''
                      }
                    `}
                  >
                    ▾
                  </span>

                </div>

              </button>


              {forecastExpanded && (

                <div
                  className="
                    mt-4
                  "
                >

                  <div
                    className="
                      flex
                      gap-2
                      overflow-x-auto
                      pb-2
                      [scrollbar-width:none]
                      [&::-webkit-scrollbar]:hidden
                    "
                  >

                    {data.daily.map(
                      (
                        day,
                        index
                      ) => (

                        <div
                          key={
                            day.date
                          }

                          className={`
                            w-[78px]
                            shrink-0
                            rounded-[16px]
                            border
                            px-2
                            py-3
                            text-center

                            ${
                              index ===
                              0
                                ? `
                                    border-sky-300/20
                                    bg-sky-300/[0.08]
                                  `
                                : `
                                    border-white/[0.07]
                                    bg-white/[0.025]
                                  `
                            }
                          `}
                        >

                          <p
                            className="
                              text-[7px]
                              font-bold
                              text-white/35
                            "
                          >
                            {
                              getWeekday(
                                day.date,
                                index
                              )
                            }
                          </p>


                          <p
                            className="
                              mt-2
                              text-[19px]
                              leading-none
                            "
                          >
                            {
                              weatherSymbol(
                                day.weatherCode
                              )
                            }
                          </p>


                          <p
                            className="
                              mt-2
                              text-[12px]
                              font-semibold
                              text-sky-100/85
                            "
                          >
                            {
                              day.snowfall
                                .toFixed(
                                  1
                                )
                            }
                          </p>


                          <p
                            className="
                              mt-[2px]
                              text-[6px]
                              text-white/25
                            "
                          >
                            SNOW cm
                          </p>


                          <p
                            className="
                              mt-2
                              whitespace-nowrap
                              text-[7px]
                              text-white/35
                            "
                          >
                            {
                              Math.round(
                                day.minTemperature
                              )
                            }°
                            {' / '}
                            {
                              Math.round(
                                day.maxTemperature
                              )
                            }°
                          </p>


                          <p
                            className="
                              mt-1
                              text-[6px]
                              text-white/20
                            "
                          >
                            GUST {
                              Math.round(
                                day.windGust
                              )
                            }
                          </p>

                        </div>

                      )
                    )}

                  </div>


                  <div
                    className="
                      mt-2
                      grid
                      grid-cols-2
                      gap-2
                    "
                  >

                    <MiniMetric
                      label="TODAY SNOW"
                      value={
                        `${data.todaySnow.toFixed(
                          1
                        )} cm`
                      }
                    />


                    <MiniMetric
                      label="7 DAY TOTAL"
                      value={
                        `${
                          data.daily
                            .reduce(
                              (
                                total,
                                day
                              ) =>
                                total +
                                day.snowfall,
                              0
                            )
                            .toFixed(
                              1
                            )
                        } cm`
                      }
                    />

                  </div>

                </div>

              )}

            </div>


            {/* ==================================================
                Footer
            ================================================== */}

            <div
              className="
                mt-4
                flex
                items-center
                justify-between
                gap-3
                border-t
                border-white/[0.07]
                pt-3
              "
            >

              <p
                className="
                  text-[7px]
                  leading-4
                  text-white/25
                "
              >
                OPEN-METEO MODEL
                <br />
                雪深 / 新雪為模式估算
              </p>


              <p
                className="
                  text-right
                  text-[7px]
                  leading-4
                  text-white/25
                "
              >
                UPDATED
                <br />
                {
                  formatJapanTime(
                    data.updatedAt
                  )
                } JST
              </p>

            </div>

          </>

        )}

      </div>

    </section>

  )

}


// ============================================================
// Metric
// ============================================================

function Metric({
  label,
  value,
  unit,
  divided = false,
}: {
  label: string
  value: string
  unit: string
  divided?: boolean
}) {

  return (

    <div
      className={`
        px-2
        py-3
        text-center

        ${
          divided
            ? `
                border-l
                border-white/[0.08]
              `
            : ''
        }
      `}
    >

      <p
        className="
          whitespace-nowrap
          text-[6px]
          font-bold
          tracking-[0.12em]
          text-white/25
        "
      >
        {label}
      </p>


      <p
        className="
          mt-1.5
          text-[14px]
          font-semibold
          leading-none
          text-white/85
        "
      >
        {value}
      </p>


      <p
        className="
          mt-1
          text-[6px]
          font-medium
          text-white/25
        "
      >
        {unit}
      </p>

    </div>

  )

}


// ============================================================
// Mini Metric
// ============================================================

function MiniMetric({
  label,
  value,
}: {
  label: string
  value: string
}) {

  return (

    <div
      className="
        rounded-[14px]
        border
        border-white/[0.07]
        bg-white/[0.025]
        px-3
        py-2.5
      "
    >

      <p
        className="
          text-[6px]
          font-bold
          tracking-[0.13em]
          text-white/25
        "
      >
        {label}
      </p>


      <p
        className="
          mt-1.5
          text-[11px]
          font-semibold
          text-white/70
        "
      >
        {value}
      </p>

    </div>

  )

}


export default SkiTodayCard
