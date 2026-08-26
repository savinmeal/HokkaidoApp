import {
  useEffect,
  useMemo,
  useState,
} from 'react'


// ============================================================
// Ski Resort Area
// ============================================================

type SkiResort = {
  id: string
  name: string
  shortName: string
  latitude: number
  longitude: number
}


type SkiResortArea = {
  id: string
  label: string
  note?: string
  resorts: SkiResort[]
}


// ============================================================
// Popular Resorts By Weather Area
//
// 各 Weather 城市對應附近代表性人氣滑雪場。
// ============================================================

const SKI_RESORT_AREAS: Record<string, SkiResortArea> = {

  sapporo: {
    id: 'sapporo',
    label: '札幌',
    resorts: [
      {
        id: 'sapporo-teine',
        name: 'SAPPORO TEINE',
        shortName: '手稻',
        latitude: 43.08655,
        longitude: 141.20419,
      },
      {
        id: 'sapporo-kokusai',
        name: '札幌國際滑雪場',
        shortName: '札幌國際',
        latitude: 43.07301,
        longitude: 141.07035,
      },
    ],
  },


  asahikawa: {
    id: 'asahikawa',
    label: '旭川',
    resorts: [
      {
        id: 'kamui-ski-links',
        name: 'KAMUI SKI LINKS',
        shortName: 'KAMUI',
        latitude: 43.70389,
        longitude: 142.18667,
      },
    ],
  },


  furano: {
    id: 'furano',
    label: '富良野',
    resorts: [
      {
        id: 'furano-ski-area',
        name: '富良野滑雪場',
        shortName: '富良野',
        latitude: 43.3300,
        longitude: 142.3503,
      },
    ],
  },


  otaru: {
    id: 'otaru',
    label: '小樽',
    resorts: [
      {
        id: 'otaru-tenguyama',
        name: '小樽天狗山滑雪場',
        shortName: '天狗山',
        latitude: 43.17361,
        longitude: 140.97128,
      },
      {
        id: 'asarigawa',
        name: '朝里川溫泉滑雪場',
        shortName: '朝里川',
        latitude: 43.13832,
        longitude: 141.02596,
      },
    ],
  },


  niseko: {
    id: 'niseko',
    label: '二世古',
    resorts: [
      {
        id: 'grand-hirafu',
        name: 'NISEKO TOKYU GRAND HIRAFU',
        shortName: 'Grand Hirafu',
        latitude: 42.86197,
        longitude: 140.69789,
      },
      {
        id: 'hanazono',
        name: 'NISEKO HANAZONO RESORT',
        shortName: 'Hanazono',
        latitude: 42.89306,
        longitude: 140.69972,
      },
    ],
  },

}


// ============================================================
// Props
// ============================================================

type SnowForecastBlockProps = {
  areaId: string
}


// ============================================================
// API Types
// ============================================================

type SnowApiResponse = {

  hourly: {
    time: string[]
    temperature_2m: number[]
    snowfall: number[]
    snow_depth: number[]
    freezing_level_height: number[]
    visibility: number[]
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


type SnowHour = {
  time: string
  temperature: number
  snowfall: number
  snowDepth: number
  freezingLevel: number
  visibility: number
  windGust: number
}


type SnowDay = {
  date: string
  weatherCode: number
  maxTemperature: number
  minTemperature: number
  snowfall: number
  precipitationProbability: number
  windGust: number
}


type DetailMode =
  | 'today'
  | 'week'


// ============================================================
// Weather Symbol
// ============================================================

function getSnowWeatherSymbol(
  code: number
) {

  if (
    code >= 71 &&
    code <= 77
  ) {
    return '❄︎'
  }

  if (
    code === 85 ||
    code === 86
  ) {
    return '❄︎'
  }

  if (
    code >= 61 &&
    code <= 67
  ) {
    return '☂︎'
  }

  if (code === 0) {
    return '☀︎'
  }

  if (
    code >= 1 &&
    code <= 3
  ) {
    return '☁︎'
  }

  return '◌'
}


// ============================================================
// Japanese Local Time
// ============================================================

function getJapanTimeString() {

  const parts =
    new Intl.DateTimeFormat(
      'sv-SE',
      {
        timeZone:
          'Asia/Tokyo',

        year:
          'numeric',

        month:
          '2-digit',

        day:
          '2-digit',

        hour:
          '2-digit',

        minute:
          '2-digit',

        hour12:
          false,
      }
    )
      .format(
        new Date()
      )


  return parts.replace(
    ' ',
    'T'
  )
}


// ============================================================
// Weekday
// ============================================================

function getWeekday(
  dateString: string,
  index: number
) {

  if (index === 0) {
    return '今天'
  }


  const date =
    new Date(
      `${dateString}T12:00:00`
    )


  return date.toLocaleDateString(
    'zh-TW',
    {
      weekday:
        'short',
    }
  )
}


// ============================================================
// Snow Condition Assessment
//
// 這是 App 內的「滑雪雪況預測指標」。
// 不代表雪場官方公告，也不單純只看積雪厚度。
//
// 綜合考量：
// 1. Snow Depth      地面積雪厚度
// 2. New Snow        今日預估新雪
// 3. Wind Gust       今日最大陣風
// 4. Visibility      今日最低能見度
//
// 分級：
// good     = 綠燈 / 良好
// normal   = 黃燈 / 普通
// poor     = 紅燈 / 惡劣
// ============================================================

type SnowConditionLevel =
  | 'good'
  | 'normal'
  | 'poor'


type SnowConditionAssessment = {
  level: SnowConditionLevel
  label: string
  description: string
  dotClassName: string
  textClassName: string
  badgeClassName: string
}


function getSnowConditionAssessment(
  snowDepthCm: number,
  newSnowCm: number,
  windGustKmh: number,
  visibilityKm: number
): SnowConditionAssessment {

  // ----------------------------------------------------------
  // Critical Conditions
  //
  // 任一條件非常差，直接判定惡劣
  // ----------------------------------------------------------

  if (
    snowDepthCm < 20 ||
    windGustKmh >= 70 ||
    visibilityKm < 0.5
  ) {

    return {
      level: 'poor',
      label: '惡劣',
      description: '雪量或能見度、強風條件不利',
      dotClassName: 'bg-red-400',
      textClassName: 'text-red-300',
      badgeClassName:
        'border-red-300/15 bg-red-400/10',
    }
  }


  // ----------------------------------------------------------
  // Score
  // ----------------------------------------------------------

  let score = 0


  // Snow Depth
  if (snowDepthCm >= 100) {
    score += 2
  }
  else if (snowDepthCm >= 50) {
    score += 1
  }
  else if (snowDepthCm < 30) {
    score -= 2
  }


  // New Snow
  if (
    newSnowCm >= 5 &&
    newSnowCm <= 30
  ) {
    score += 1
  }
  else if (newSnowCm > 40) {
    // 大量新雪雖然可能有 Powder，
    // 但也可能伴隨雪崩風險、視線差、雪道整理問題
    score -= 1
  }


  // Wind Gust
  if (windGustKmh < 35) {
    score += 1
  }
  else if (windGustKmh >= 55) {
    score -= 2
  }


  // Visibility
  if (visibilityKm >= 5) {
    score += 1
  }
  else if (visibilityKm < 2) {
    score -= 2
  }


  // ----------------------------------------------------------
  // Good
  // ----------------------------------------------------------

  if (score >= 3) {

    return {
      level: 'good',
      label: '良好',
      description: '雪量與風、能見度條件適合滑雪',
      dotClassName: 'bg-emerald-400',
      textClassName: 'text-emerald-300',
      badgeClassName:
        'border-emerald-300/15 bg-emerald-400/10',
    }
  }


  // ----------------------------------------------------------
  // Poor
  // ----------------------------------------------------------

  if (score < 0) {

    return {
      level: 'poor',
      label: '惡劣',
      description: '部分條件可能影響滑雪體驗',
      dotClassName: 'bg-red-400',
      textClassName: 'text-red-300',
      badgeClassName:
        'border-red-300/15 bg-red-400/10',
    }
  }


  // ----------------------------------------------------------
  // Normal
  // ----------------------------------------------------------

  return {
    level: 'normal',
    label: '普通',
    description: '可滑雪，但建議持續留意現場狀況',
    dotClassName: 'bg-amber-300',
    textClassName: 'text-amber-200',
    badgeClassName:
      'border-amber-200/15 bg-amber-300/10',
  }
}


// ============================================================
// Snow Forecast Block
// ============================================================

function SnowForecastBlock({
  areaId,
}: SnowForecastBlockProps) {


  // ==========================================================
  // Selected Ski Area / Resort
  // ==========================================================

  const selectedArea =
    SKI_RESORT_AREAS[areaId] ??
    SKI_RESORT_AREAS.niseko


  const [
    selectedResortIndex,
    setSelectedResortIndex,
  ] = useState(0)


  const selectedResort =
    selectedArea.resorts[
      Math.min(
        selectedResortIndex,
        selectedArea.resorts.length - 1
      )
    ]


  // 切換上方 Weather 城市時，
  // 回到該區第一個人氣雪場
  useEffect(() => {

    setSelectedResortIndex(0)

  }, [
    areaId,
  ])


  // ==========================================================
  // State
  // ==========================================================

  const [
    mode,
    setMode,
  ] = useState<DetailMode>(
    'today'
  )


  const [
    hourly,
    setHourly,
  ] = useState<SnowHour[]>([])


  const [
    daily,
    setDaily,
  ] = useState<SnowDay[]>([])


  const [
    loading,
    setLoading,
  ] = useState(true)


  const [
    error,
    setError,
  ] = useState(false)



  // ==========================================================
  // Fetch
  // ==========================================================

  useEffect(() => {

    const controller =
      new AbortController()


    async function fetchSnow() {

      try {

        setLoading(true)

        setError(false)


        const hourlyVariables = [
          'temperature_2m',
          'snowfall',
          'snow_depth',
          'freezing_level_height',
          'visibility',
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
          `&hourly=${hourlyVariables}` +
          `&daily=${dailyVariables}` +
          `&forecast_days=7` +
          `&timezone=Asia%2FTokyo`


        const response =
          await fetch(
            url,
            {
              signal:
                controller.signal,
            }
          )


        if (!response.ok) {

          throw new Error(
            `Snow forecast failed: ${response.status}`
          )

        }


        const data = (await response.json()) as SnowApiResponse



        // ----------------------------------------------------
        // Hourly
        // ----------------------------------------------------

        const hourlyData: SnowHour[] =
          data.hourly.time.map(
            (
              time,
              index
            ) => ({
              time,

              temperature:
                data.hourly
                  .temperature_2m[index],

              snowfall:
                data.hourly
                  .snowfall[index],

              snowDepth:
                data.hourly
                  .snow_depth[index],

              freezingLevel:
                data.hourly
                  .freezing_level_height[index],

              visibility:
                data.hourly
                  .visibility[index],

              windGust:
                data.hourly
                  .wind_gusts_10m[index],
            })
          )



        // ----------------------------------------------------
        // Daily
        // ----------------------------------------------------

        const dailyData: SnowDay[] =
          data.daily.time.map(
            (
              date,
              index
            ) => ({
              date,

              weatherCode:
                data.daily
                  .weather_code[index],

              maxTemperature:
                data.daily
                  .temperature_2m_max[index],

              minTemperature:
                data.daily
                  .temperature_2m_min[index],

              snowfall:
                data.daily
                  .snowfall_sum[index],

              precipitationProbability:
                data.daily
                  .precipitation_probability_max[index],

              windGust:
                data.daily
                  .wind_gusts_10m_max[index],
            })
          )


        setHourly(
          hourlyData
        )


        setDaily(
          dailyData
        )


        setLoading(
          false
        )

      } catch (error) {

        if (
          error instanceof DOMException &&
          error.name === 'AbortError'
        ) {
          return
        }


        console.error(
          error
        )


        setError(
          true
        )


        setLoading(
          false
        )

      }

    }


    fetchSnow()


    return () => {

      controller.abort()

    }

  }, [
    selectedResort.id,
    selectedResort.latitude,
    selectedResort.longitude,
  ])



  // ==========================================================
  // Today
  // ==========================================================

  const japanNow =
    getJapanTimeString()


  const today =
    japanNow.slice(
      0,
      10
    )


  const todayHourly =
    useMemo(
      () =>
        hourly.filter(
          item =>
            item.time.startsWith(
              today
            )
        ),
      [
        hourly,
        today,
      ]
    )



  // ==========================================================
  // Current Hour
  // ==========================================================

  const currentHour =
    useMemo(
      () => {

        if (
          hourly.length === 0
        ) {
          return null
        }


        let closest =
          hourly[0]


        for (
          const item
          of hourly
        ) {

          if (
            item.time <=
            japanNow
          ) {

            closest =
              item

          } else {

            break

          }

        }


        return closest

      },
      [
        hourly,
        japanNow,
      ]
    )



  // ==========================================================
  // Today Summary
  // ==========================================================

  const todaySnow =
    daily[0]?.snowfall ?? 0


  const weekSnow =
    daily.reduce(
      (
        total,
        item
      ) =>
        total +
        item.snowfall,
      0
    )



  const currentSnowDepthCm =
    currentHour
      ? currentHour.snowDepth * 100
      : 0



  const currentFreezingLevel =
    currentHour
      ?.freezingLevel ?? 0



  const maxTodayWindGust =
    todayHourly.length > 0
      ? Math.max(
          ...todayHourly.map(
            item =>
              item.windGust
          )
        )
      : 0



  const minTodayVisibility =
    todayHourly.length > 0
      ? Math.min(
          ...todayHourly.map(
            item =>
              item.visibility
          )
        ) / 1000
      : 0



  // ==========================================================
  // Snow Condition Assessment
  // ==========================================================

  const snowCondition =
    getSnowConditionAssessment(
      currentSnowDepthCm,
      todaySnow,
      maxTodayWindGust,
      minTodayVisibility
    )



  // ==========================================================
  // 6 Hour Snowfall
  // ==========================================================

  const todaySnowTimeline =
    [0, 6, 12, 18].map(
      startHour => {

        const total =
          todayHourly
            .filter(
              item => {

                const hour =
                  Number(
                    item.time.slice(
                      11,
                      13
                    )
                  )


                return (
                  hour >= startHour &&
                  hour < startHour + 6
                )

              }
            )
            .reduce(
              (
                sum,
                item
              ) =>
                sum +
                item.snowfall,
              0
            )


        return {
          hour:
            `${String(
              startHour
            ).padStart(
              2,
              '0'
            )}:00`,

          snowfall:
            total,
        }

      }
    )



  // ==========================================================
  // Render
  // ==========================================================

  return (

    <section
      className="
        relative
        overflow-hidden
        rounded-[28px]
        bg-slate-950
        px-5
        pb-5
        pt-5
        text-white
        shadow-xl
        shadow-slate-900/15
      "
    >


      {/* ======================================================
          Ambient
      ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          -right-16
          -top-16
          h-44
          w-44
          rounded-full
          bg-sky-300/15
          blur-3xl
        "
      />



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
            flex
            items-center
            justify-between
          "
        >

          <p
            className="
              text-[9px]
              font-semibold
              tracking-[0.22em]
              text-white/35
            "
          >
            雪況預測
          </p>


          <div
            className="
              text-right
            "
          >

            <p
              className="
                text-[12px]
                font-medium
                text-white/70
              "
            >
              {selectedArea.label}
            </p>


            {selectedArea.note && (

              <p
                className="
                  mt-1
                  text-[8px]
                  text-white/25
                "
              >
                {selectedArea.note}
              </p>

            )}

          </div>

        </div>



        {/* ====================================================
            Resort Selector
        ==================================================== */}

        <div
          className="
            mt-4
            flex
            gap-2
            overflow-x-auto
            pb-1
            [scrollbar-width:none]
            [&::-webkit-scrollbar]:hidden
          "
        >

          {selectedArea.resorts.map(
            (
              resort,
              index
            ) => {

              const isSelected =
                index ===
                selectedResortIndex


              return (

                <button
                  key={resort.id}

                  type="button"

                  onClick={() => {

                    setSelectedResortIndex(
                      index
                    )

                  }}

                  className={`
                    shrink-0
                    rounded-full
                    border
                    px-3
                    py-1.5
                    text-[10px]
                    font-medium
                    transition-all
                    duration-300

                    ${
                      isSelected
                        ? `
                            border-white/20
                            bg-white/12
                            text-white
                          `
                        : `
                            border-white/[0.06]
                            bg-white/[0.025]
                            text-white/35
                          `
                    }
                  `}
                >
                  {resort.shortName}
                </button>

              )

            }
          )}

        </div>



        {/* Selected Resort */}

        <p
          className="
            mt-2
            text-[10px]
            tracking-[0.04em]
            text-white/35
          "
        >
          {selectedResort.name}
        </p>



        {/* ====================================================
            Loading
        ==================================================== */}

        {loading && (

          <div
            className="
              flex
              h-[180px]
              items-center
              justify-center
            "
          >

            <p
              className="
                text-[12px]
                text-white/35
              "
            >
              取得雪況資料中...
            </p>

          </div>

        )}



        {/* ====================================================
            Error
        ==================================================== */}

        {!loading &&
          error && (

          <div
            className="
              flex
              h-[180px]
              items-center
              justify-center
            "
          >

            <p
              className="
                text-[12px]
                text-white/45
              "
            >
              無法取得雪況資料
            </p>

          </div>

        )}



        {!loading &&
          !error && (

          <>


            {/* ==================================================
                Main Snow

                Left  : Snow Amount + Condition
                Right : Reserved Snow Illustration
            ================================================== */}

            <div
              className="
                mt-5
                grid
                grid-cols-[1fr_118px]
                items-center
                gap-4
              "
            >


              {/* ================================================
                  LEFT
                  Snow Amount
              ================================================ */}

              <div
                className="
                  min-w-0
                  text-left
                "
              >

                <p
                  className="
                    text-[9px]
                    font-medium
                    tracking-[0.18em]
                    text-white/30
                  "
                >
                  TODAY NEW SNOW
                </p>


                <div
                  className="
                    mt-1
                    flex
                    items-start
                  "
                >

                  <span
                    className="
                      text-[54px]
                      font-light
                      leading-none
                      tracking-[-0.05em]
                    "
                  >
                    {todaySnow.toFixed(
                      1
                    )}
                  </span>


                  <span
                    className="
                      ml-2
                      mt-2
                      text-[14px]
                      text-white/45
                    "
                  >
                    cm
                  </span>

                </div>



                {/* ==============================================
                    Condition Assessment
                ============================================== */}

                <div
                  className={`
                    mt-4
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    border
                    px-3
                    py-1.5
                    ${snowCondition.badgeClassName}
                  `}
                >

                  <span
                    className={`
                      h-2
                      w-2
                      rounded-full
                      shadow-[0_0_10px_currentColor]
                      ${snowCondition.dotClassName}
                    `}
                  />


                  <span
                    className={`
                      text-[11px]
                      font-semibold
                      ${snowCondition.textClassName}
                    `}
                  >
                    雪況 {snowCondition.label}
                  </span>

                </div>


                <p
                  className="
                    mt-2
                    max-w-[190px]
                    text-[9px]
                    leading-[1.5]
                    text-white/28
                  "
                >
                  {snowCondition.description}
                </p>

              </div>



              {/* ================================================
                  RIGHT
                  Snow Illustration Slot

                  後續可依雪況放：
                  snow-good.png
                  snow-normal.png
                  snow-poor.png
                  powder.png
                  blizzard.png
              ================================================ */}

              <div
                className="
                  relative
                  flex
                  h-[118px]
                  w-[118px]
                  items-center
                  justify-center
                  justify-self-end
                "
              >

                {/* Placeholder */}

                <div
                  className="
                    pointer-events-none
                    absolute
                    inset-2
                    rounded-full
                    bg-white/[0.025]
                  "
                />


                {/*
                  未來可放：

                  <img
                    src={snowConditionImage}
                    alt=""
                    className="
                      relative
                      z-10
                      h-[108px]
                      w-[108px]
                      object-contain
                    "
                  />
                */}

              </div>

            </div>



            {/* ==================================================
                Snow Metrics
            ================================================== */}

            <div
              className="
                mt-5
                grid
                grid-cols-4
                gap-2
              "
            >


              {/* Snow Depth */}

              <div
                className="
                  text-center
                "
              >

                <p
                  className="
                    text-[13px]
                    font-medium
                    text-white/80
                  "
                >
                  {Math.round(
                    currentSnowDepthCm
                  )}
                  cm
                </p>


                <p
                  className="
                    mt-1
                    text-[7px]
                    tracking-[0.1em]
                    text-white/25
                  "
                >
                  SNOW DEPTH
                </p>

              </div>



              {/* Freezing */}

              <div
                className="
                  text-center
                "
              >

                <p
                  className="
                    text-[13px]
                    font-medium
                    text-white/80
                  "
                >
                  {Math.round(
                    currentFreezingLevel
                  )}
                  m
                </p>


                <p
                  className="
                    mt-1
                    text-[7px]
                    tracking-[0.1em]
                    text-white/25
                  "
                >
                  0°C LEVEL
                </p>

              </div>



              {/* Gust */}

              <div
                className="
                  text-center
                "
              >

                <p
                  className="
                    text-[13px]
                    font-medium
                    text-white/80
                  "
                >
                  {Math.round(
                    maxTodayWindGust
                  )}
                </p>


                <p
                  className="
                    mt-1
                    text-[7px]
                    tracking-[0.1em]
                    text-white/25
                  "
                >
                  GUST KM/H
                </p>

              </div>



              {/* Visibility */}

              <div
                className="
                  text-center
                "
              >

                <p
                  className="
                    text-[13px]
                    font-medium
                    text-white/80
                  "
                >
                  {minTodayVisibility.toFixed(
                    1
                  )}
                  km
                </p>


                <p
                  className="
                    mt-1
                    text-[7px]
                    tracking-[0.1em]
                    text-white/25
                  "
                >
                  VISIBILITY
                </p>

              </div>

            </div>



            {/* ==================================================
                Tabs
            ================================================== */}

            <div
              className="
                mt-6
                grid
                grid-cols-2
                rounded-[16px]
                bg-white/[0.05]
                p-1
              "
            >

              <button
                type="button"

                onClick={() =>
                  setMode(
                    'today'
                  )
                }

                className={`
                  rounded-[13px]
                  py-2
                  text-[11px]
                  font-medium
                  transition-all
                  duration-300

                  ${
                    mode === 'today'
                      ? `
                          bg-white/12
                          text-white
                        `
                      : `
                          text-white/35
                        `
                  }
                `}
              >
                今日雪況
              </button>



              <button
                type="button"

                onClick={() =>
                  setMode(
                    'week'
                  )
                }

                className={`
                  rounded-[13px]
                  py-2
                  text-[11px]
                  font-medium
                  transition-all
                  duration-300

                  ${
                    mode === 'week'
                      ? `
                          bg-white/12
                          text-white
                        `
                      : `
                          text-white/35
                        `
                  }
                `}
              >
                本週雪況
              </button>

            </div>



            {/* ==================================================
                TODAY
            ================================================== */}

            {mode === 'today' && (

              <div
                className="
                  mt-5
                "
              >

                <div
                  className="
                    grid
                    grid-cols-4
                  "
                >

                  {todaySnowTimeline.map(
                    item => (

                    <div
                      key={
                        item.hour
                      }
                      className="
                        text-center
                      "
                    >

                      <p
                        className="
                          text-[9px]
                          text-white/30
                        "
                      >
                        {item.hour}
                      </p>


                      <p
                        className="
                          mt-2
                          text-[18px]
                          font-medium
                          text-white/85
                        "
                      >
                        {item.snowfall.toFixed(
                          1
                        )}
                      </p>


                      <p
                        className="
                          mt-1
                          text-[8px]
                          text-white/25
                        "
                      >
                        cm
                      </p>

                    </div>

                  ))}

                </div>

              </div>

            )}



            {/* ==================================================
                WEEK
            ================================================== */}

            {mode === 'week' && (

              <div
                className="
                  mt-5
                "
              >


                {/* Week Total */}

                <div
                  className="
                    mb-4
                    flex
                    items-end
                    justify-between
                  "
                >

                  <p
                    className="
                      text-[10px]
                      text-white/35
                    "
                  >
                    未來 7 天預估新雪
                  </p>


                  <p
                    className="
                      text-[20px]
                      font-medium
                      text-white/90
                    "
                  >
                    {weekSnow.toFixed(
                      1
                    )}

                    <span
                      className="
                        ml-1
                        text-[10px]
                        font-normal
                        text-white/35
                      "
                    >
                      cm
                    </span>

                  </p>

                </div>



                <div
                  className="
                    divide-y
                    divide-white/[0.07]
                  "
                >

                  {daily.map(
                    (
                      day,
                      index
                    ) => {

                      const date =
                        day.date.slice(
                          5
                        )
                          .replace(
                            '-',
                            '/'
                          )


                      return (

                        <div
                          key={
                            day.date
                          }

                          className="
                            grid
                            grid-cols-[44px_42px_1fr_auto]
                            items-center
                            py-3
                          "
                        >


                          {/* Day */}

                          <div>

                            <p
                              className="
                                text-[11px]
                                font-medium
                                text-white/70
                              "
                            >
                              {getWeekday(
                                day.date,
                                index
                              )}
                            </p>


                            <p
                              className="
                                mt-1
                                text-[8px]
                                text-white/25
                              "
                            >
                              {date}
                            </p>

                          </div>



                          {/* Weather */}

                          <p
                            className="
                              text-center
                              text-[18px]
                              text-white/60
                            "
                          >
                            {getSnowWeatherSymbol(
                              day.weatherCode
                            )}
                          </p>



                          {/* Snow */}

                          <div>

                            <p
                              className="
                                text-[13px]
                                font-medium
                                text-white/85
                              "
                            >
                              {day.snowfall.toFixed(
                                1
                              )}
                              cm
                            </p>


                            <p
                              className="
                                mt-1
                                text-[8px]
                                text-white/25
                              "
                            >
                              NEW SNOW
                            </p>

                          </div>



                          {/* Temp */}

                          <div
                            className="
                              text-right
                            "
                          >

                            <p
                              className="
                                text-[11px]
                                text-white/65
                              "
                            >
                              {Math.round(
                                day.maxTemperature
                              )}
                              °

                              <span
                                className="
                                  mx-1
                                  text-white/20
                                "
                              >
                                /
                              </span>

                              {Math.round(
                                day.minTemperature
                              )}
                              °
                            </p>


                            <p
                              className="
                                mt-1
                                text-[8px]
                                text-white/25
                              "
                            >
                              GUST{' '}

                              {Math.round(
                                day.windGust
                              )}
                            </p>

                          </div>

                        </div>

                      )

                    }
                  )}

                </div>

              </div>

            )}

          </>

        )}

      </div>

    </section>

  )

}


export default SnowForecastBlock