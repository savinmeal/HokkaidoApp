import SnowForecastBlock from '../components/SnowForecastBlock'
import HomeEditPanel from '../components/HomeEditPanel'
import PaymentMethodWallet from '../components/PaymentMethodWallet'
import SnowPassWallet from '../components/SnowPassWallet'

import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'

import {
  TRIP_STORAGE_KEY,
  tripDays,
  tripInfo,
  tripRegions,
  type TripDay,
} from '../data/tripData'

import {
  loadHomeModuleVisibility,
  saveHomeModuleVisibility,
  type HomeModuleVisibility,
} from '../data/homePreferences'


// ============================================================
// Weather Regions
//
// 與 Trip Page 共用同一份城市資料。
// ============================================================

const WEATHER_REGIONS =
  tripRegions


// ============================================================
// Japan Local Date
// ============================================================

function getJapanDateString() {

  return new Intl.DateTimeFormat(
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
    }
  )
    .format(
      new Date()
    )
}


// ============================================================
// Initial Weather Region
//
// 若今天剛好是旅行日期，且該 DAY 已設定城市，
// Home 第一次開啟時自動顯示該城市。
//
// 旅行日期之外仍預設札幌，使用者可自由手動切換。
// ============================================================

function getInitialWeatherRegionIndex() {

  if (
    typeof window ===
    'undefined'
  ) {
    return 0
  }


  try {

    const saved =
      localStorage.getItem(
        TRIP_STORAGE_KEY
      )


    let days: TripDay[] =
      tripDays


    if (saved) {

      const parsed =
        JSON.parse(
          saved
        ) as TripDay[]


      if (
        Array.isArray(
          parsed
        ) &&
        parsed.length > 0
      ) {
        days =
          parsed
      }

    }


    const today =
      getJapanDateString()


    const todayTripDay =
      days.find(
        day =>
          day.date === today
      )


    if (
      !todayTripDay?.regionId
    ) {
      return 0
    }


    const regionIndex =
      WEATHER_REGIONS.findIndex(
        region =>
          region.id ===
          todayTripDay.regionId
      )


    return regionIndex >= 0
      ? regionIndex
      : 0

  } catch (error) {

    console.error(
      'Weather trip region load failed:',
      error
    )


    return 0

  }
}


// ============================================================
// Weather Types
// ============================================================

type HourlyWeather = {
  time: string
  temperature: number
  apparentTemperature: number
  humidity: number
  precipitationProbability: number
  weatherCode: number
  windSpeed: number
}


type DailyWeather = {
  date: string
  weatherCode: number
  minTemperature: number
  maxTemperature: number
  precipitationProbability: number
}


type WeatherData = {
  temperature: number
  apparentTemperature: number
  humidity: number
  windSpeed: number
  weatherCode: number
  time: string
  hourly: HourlyWeather[]
  daily: DailyWeather[]
}


// ============================================================
// Open-Meteo Response
// ============================================================

type OpenMeteoResponse = {
  current: {
    temperature_2m: number
    apparent_temperature: number
    relative_humidity_2m: number
    wind_speed_10m: number
    weather_code: number
    time: string
  }

  hourly: {
    time: string[]
    temperature_2m: number[]
    apparent_temperature: number[]
    relative_humidity_2m: number[]
    precipitation_probability: number[]
    weather_code: number[]
    wind_speed_10m: number[]
  }

  daily: {
    time: string[]
    weather_code: number[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    precipitation_probability_max: number[]
  }
}


// ============================================================
// Weather Description
// ============================================================

type WeatherDescription = {
  label: string
  symbol: string
}


function getWeatherDescription(
  code: number
): WeatherDescription {

  if (code === 0) {
    return {
      label: '晴朗',
      symbol: '☀︎',
    }
  }

  if (
    code === 1 ||
    code === 2
  ) {
    return {
      label: '晴時多雲',
      symbol: '◒',
    }
  }

  if (code === 3) {
    return {
      label: '陰天',
      symbol: '☁︎',
    }
  }

  if (
    code === 45 ||
    code === 48
  ) {
    return {
      label: '霧',
      symbol: '≋',
    }
  }

  if (
    code >= 51 &&
    code <= 57
  ) {
    return {
      label: '毛毛雨',
      symbol: '☂︎',
    }
  }

  if (
    code >= 61 &&
    code <= 67
  ) {
    return {
      label: '降雨',
      symbol: '☂︎',
    }
  }

  if (
    code >= 71 &&
    code <= 77
  ) {
    return {
      label: '降雪',
      symbol: '❄︎',
    }
  }

  if (
    code >= 80 &&
    code <= 82
  ) {
    return {
      label: '陣雨',
      symbol: '☂︎',
    }
  }

  if (
    code === 85 ||
    code === 86
  ) {
    return {
      label: '陣雪',
      symbol: '❄︎',
    }
  }

  if (code >= 95) {
    return {
      label: '雷雨',
      symbol: 'ϟ',
    }
  }

  return {
    label: '未知',
    symbol: '—',
  }
}


// ============================================================
// Weather Gesture
// ============================================================

type WeatherGestureDirection =
  | 'horizontal'
  | 'vertical'
  | null


type WeatherDetailMode =
  | 'today'
  | 'week'


function formatWeekDate(
  date: string,
  index: number
) {

  const value =
    new Date(
      `${date}T00:00:00+09:00`
    )


  const weekday =
    value.toLocaleDateString(
      'zh-TW',
      {
        weekday: 'short',
        timeZone: 'Asia/Tokyo',
      }
    )


  const dateLabel =
    value.toLocaleDateString(
      'zh-TW',
      {
        month: 'numeric',
        day: 'numeric',
        timeZone: 'Asia/Tokyo',
      }
    )


  return {
    dayLabel:
      index === 0
        ? '今天'
        : weekday,

    dateLabel,
  }
}


// ============================================================
// Home
// ============================================================

function Home() {


  // ==========================================================
  // Home Module Visibility
  // ==========================================================

  const [
    homeEditOpen,
    setHomeEditOpen,
  ] = useState(false)


  const [
    homeVisibility,
    setHomeVisibility,
  ] = useState<HomeModuleVisibility>(
    loadHomeModuleVisibility
  )


  useEffect(() => {

    saveHomeModuleVisibility(
      homeVisibility
    )

  }, [
    homeVisibility,
  ])



  // ==========================================================
  // Weather Region
  // ==========================================================

  const [
    selectedRegionIndex,
    setSelectedRegionIndex,
  ] = useState(
    getInitialWeatherRegionIndex
  )


  const selectedRegion =
    WEATHER_REGIONS[selectedRegionIndex]



  // ==========================================================
  // Weather State
  // ==========================================================

  const [
    weather,
    setWeather,
  ] = useState<WeatherData | null>(null)


  const [
    weatherLoading,
    setWeatherLoading,
  ] = useState(true)


  const [
    weatherError,
    setWeatherError,
  ] = useState(false)



  // ==========================================================
  // Detail Expand
  // ==========================================================

  const [
    weatherExpanded,
    setWeatherExpanded,
  ] = useState(false)


  const [
    weatherDetailMode,
    setWeatherDetailMode,
  ] = useState<WeatherDetailMode>('today')



  // ==========================================================
  // Weather Cache
  // ==========================================================

  const weatherCacheRef =
    useRef<Record<string, WeatherData>>({})



  // ==========================================================
  // Weather Swipe
  // ==========================================================

  const weatherGestureRef =
    useRef({

      startX: 0,

      startY: 0,

      active: false,

      direction:
        null as WeatherGestureDirection,

    })


  const [
    weatherDragX,
    setWeatherDragX,
  ] = useState(0)


  const [
    weatherDragging,
    setWeatherDragging,
  ] = useState(false)



  // ==========================================================
  // Fetch Weather
  // ==========================================================

  useEffect(() => {

    const region =
      WEATHER_REGIONS[selectedRegionIndex]


    const cached =
      weatherCacheRef.current[
        region.id
      ]


    if (cached) {

      setWeather(cached)

      setWeatherLoading(false)

      setWeatherError(false)

      return

    }


    const controller =
      new AbortController()


    async function fetchWeather() {

      try {

        setWeatherLoading(true)

        setWeatherError(false)


        const currentVariables = [
          'temperature_2m',
          'apparent_temperature',
          'relative_humidity_2m',
          'weather_code',
          'wind_speed_10m',
        ].join(',')


        const hourlyVariables = [
          'temperature_2m',
          'apparent_temperature',
          'relative_humidity_2m',
          'precipitation_probability',
          'weather_code',
          'wind_speed_10m',
        ].join(',')


        const dailyVariables = [
          'weather_code',
          'temperature_2m_max',
          'temperature_2m_min',
          'precipitation_probability_max',
        ].join(',')


        const url =
          `https://api.open-meteo.com/v1/forecast` +
          `?latitude=${region.latitude}` +
          `&longitude=${region.longitude}` +
          `&current=${currentVariables}` +
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
            `Weather API failed: ${response.status}`
          )

        }


        const data =
          (await response.json()) as OpenMeteoResponse



        // ----------------------------------------------------
        // Hourly
        // ----------------------------------------------------

        const hourly: HourlyWeather[] =
          data.hourly.time.map(
            (
              time,
              index
            ) => ({
              time,

              temperature:
                data.hourly
                  .temperature_2m[index],

              apparentTemperature:
                data.hourly
                  .apparent_temperature[index],

              humidity:
                data.hourly
                  .relative_humidity_2m[index],

              precipitationProbability:
                data.hourly
                  .precipitation_probability[index],

              weatherCode:
                data.hourly
                  .weather_code[index],

              windSpeed:
                data.hourly
                  .wind_speed_10m[index],
            })
          )



        // ----------------------------------------------------
        // Daily
        // ----------------------------------------------------

        const daily: DailyWeather[] =
          data.daily.time.map(
            (
              date,
              index
            ) => ({
              date,

              weatherCode:
                data.daily
                  .weather_code[index],

              minTemperature:
                data.daily
                  .temperature_2m_min[index],

              maxTemperature:
                data.daily
                  .temperature_2m_max[index],

              precipitationProbability:
                data.daily
                  .precipitation_probability_max[index],
            })
          )



        const weatherData: WeatherData = {

          temperature:
            data.current.temperature_2m,

          apparentTemperature:
            data.current.apparent_temperature,

          humidity:
            data.current.relative_humidity_2m,

          windSpeed:
            data.current.wind_speed_10m,

          weatherCode:
            data.current.weather_code,

          time:
            data.current.time,

          hourly,

          daily,

        }



        weatherCacheRef.current[
          region.id
        ] = weatherData


        setWeather(
          weatherData
        )


        setWeatherLoading(
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
          'Weather fetch failed:',
          error
        )


        setWeatherError(
          true
        )


        setWeatherLoading(
          false
        )

      }

    }


    fetchWeather()


    return () => {

      controller.abort()

    }

  }, [
    selectedRegionIndex,
  ])



  // ==========================================================
  // Weather Pointer Down
  // ==========================================================

  const handleWeatherPointerDown = (
    event: ReactPointerEvent<HTMLDivElement>
  ) => {

    event.stopPropagation()


    weatherGestureRef.current = {

      startX:
        event.clientX,

      startY:
        event.clientY,

      active:
        true,

      direction:
        null,

    }


    setWeatherDragging(
      false
    )

  }



  // ==========================================================
  // Weather Pointer Move
  // ==========================================================

  const handleWeatherPointerMove = (
    event: ReactPointerEvent<HTMLDivElement>
  ) => {

    event.stopPropagation()


    if (
      !weatherGestureRef.current.active
    ) {
      return
    }


    const dx =
      event.clientX -
      weatherGestureRef.current.startX


    const dy =
      event.clientY -
      weatherGestureRef.current.startY


    const absX =
      Math.abs(dx)


    const absY =
      Math.abs(dy)



    if (
      weatherGestureRef.current.direction ===
      null
    ) {

      if (
        absX < 8 &&
        absY < 8
      ) {
        return
      }


      if (
        absX >
        absY * 1.15
      ) {

        weatherGestureRef.current.direction =
          'horizontal'

      } else {

        weatherGestureRef.current.direction =
          'vertical'

      }

    }



    if (
      weatherGestureRef.current.direction ===
      'vertical'
    ) {

      setWeatherDragX(0)

      return

    }



    const limitedX =
      Math.max(
        -90,
        Math.min(
          dx,
          90
        )
      )


    setWeatherDragging(
      true
    )


    setWeatherDragX(
      limitedX
    )

  }



  // ==========================================================
  // Weather Pointer Up
  // ==========================================================

  const handleWeatherPointerUp = (
    event: ReactPointerEvent<HTMLDivElement>
  ) => {

    event.stopPropagation()


    if (
      !weatherGestureRef.current.active
    ) {
      return
    }


    weatherGestureRef.current.active =
      false


    setWeatherDragging(
      false
    )



    if (
      weatherGestureRef.current.direction ===
      'horizontal'
    ) {

      if (
        weatherDragX < -45
      ) {

        setSelectedRegionIndex(
          current =>
            Math.min(
              current + 1,
              WEATHER_REGIONS.length - 1
            )
        )

      }

      else if (
        weatherDragX > 45
      ) {

        setSelectedRegionIndex(
          current =>
            Math.max(
              current - 1,
              0
            )
        )

      }

    }


    weatherGestureRef.current.direction =
      null


    setWeatherDragX(
      0
    )

  }



  // ==========================================================
  // Pointer Cancel
  // ==========================================================

  const handleWeatherPointerCancel = (
    event: ReactPointerEvent<HTMLDivElement>
  ) => {

    event.stopPropagation()


    weatherGestureRef.current.active =
      false


    weatherGestureRef.current.direction =
      null


    setWeatherDragging(
      false
    )


    setWeatherDragX(
      0
    )

  }



  // ==========================================================
  // Weather Description
  // ==========================================================

  const weatherDescription =
    weather
      ? getWeatherDescription(
          weather.weatherCode
        )
      : null



  // ==========================================================
  // Detail Data
  // ==========================================================

  const hourlyWeather =
    weather?.hourly ?? []


  const todayDate =
    weather?.time
      ? weather.time.slice(
          0,
          10
        )
      : ''


  const todayHourlyWeather =
    hourlyWeather.filter(
      item =>
        item.time.startsWith(
          todayDate
        )
    )


  // 00 / 03 / 06 / 09 / 12 / 15 / 18 / 21
  const detailWeather =
    todayHourlyWeather.filter(
      (
        _,
        index
      ) =>
        index % 3 === 0
    )


  const weeklyWeather =
    weather?.daily ?? []


  const dayTemperatures =
    todayHourlyWeather.map(
      item =>
        item.temperature
    )


  const dayMinTemperature =
    dayTemperatures.length > 0
      ? Math.min(
          ...dayTemperatures
        )
      : 0


  const dayMaxTemperature =
    dayTemperatures.length > 0
      ? Math.max(
          ...dayTemperatures
        )
      : 0


  const precipitationProbabilities =
    todayHourlyWeather.map(
      item =>
        item.precipitationProbability
    )


  const maxPrecipitationProbability =
    precipitationProbabilities.length > 0
      ? Math.max(
          ...precipitationProbabilities
        )
      : 0



  // ==========================================================
  // Trip Date
  // ==========================================================

  const startDisplay =
    '12.25'


  const endDisplay =
    '01.02'



  // ==========================================================
  // Render
  // ==========================================================

  return (

    <main
      className="
        mx-auto
        w-full
        max-w-md
        px-6
        pb-10
        pt-6
      "
    >


      <div
        className="
          mb-3
          flex
          justify-end
        "
      >
        <button
          type="button"
          aria-label="編輯 Home 顯示"

          onPointerDown={event => {
            event.stopPropagation()
          }}

          onClick={() =>
            setHomeEditOpen(
              true
            )
          }

          className="
            rounded-full
            border
            border-slate-300/80
            bg-white/55
            px-3
            py-1.5
            text-[9px]
            font-semibold
            tracking-[0.12em]
            text-slate-700
            shadow-sm
            backdrop-blur-xl
            transition
            active:scale-[0.97]
          "
        >
          EDIT
        </button>
      </div>


      {/* ======================================================
          Trip Header
      ====================================================== */}

      <section>

        <p
          className="
            text-[10px]
            font-semibold
            tracking-[0.28em]
            text-slate-600
          "
        >
          2026 HOKKAIDO
        </p>


        <div
          className="
            mt-3
            flex
            items-end
            justify-between
          "
        >

          <div>

            <h1
              className="
                text-[34px]
                font-semibold
                leading-none
                tracking-[-0.035em]
                text-slate-950
              "
            >
              {tripInfo.name}
            </h1>


            <p
              className="
                mt-3
                text-[13px]
                font-medium
                tracking-[0.08em]
                text-slate-600
              "
            >
              {startDisplay}

              <span className="mx-2">
                —
              </span>

              {endDisplay}
            </p>

          </div>


          <div
            className="
              text-right
              text-[11px]
              leading-5
              text-slate-600
            "
          >
            HOKKAIDO
            <br />
            JAPAN
          </div>

        </div>

      </section>



      {/* ======================================================
          WEATHER BLOCK
      ====================================================== */}

      {homeVisibility.weather && (
      <section className="mt-8">

        <div
          onPointerDown={
            handleWeatherPointerDown
          }

          onPointerMove={
            handleWeatherPointerMove
          }

          onPointerUp={
            handleWeatherPointerUp
          }

          onPointerCancel={
            handleWeatherPointerCancel
          }

          className="
            relative
            touch-pan-y
            select-none
            overflow-hidden
            rounded-[28px]
            bg-slate-950
            px-6
            pb-4
            pt-4
            text-white
            shadow-xl
            shadow-slate-900/15
          "

          style={{

            transform:
              `translateX(${weatherDragX * 0.12}px)`,

            transition:
              weatherDragging
                ? 'none'
                : `
                    transform 300ms
                    cubic-bezier(0.22, 1, 0.36, 1)
                  `,

          }}
        >


          {/* ==================================================
              Swipe Arrow - Left
          ================================================== */}

          <div
            className="
              pointer-events-none
              absolute
              left-[9px]
              top-[42%]
              z-20
              -translate-y-1/2
            "
          >

            <div
              className="
                h-0
                w-0
                border-b-[5px]
                border-r-[7px]
                border-t-[5px]
                border-b-transparent
                border-r-white/25
                border-t-transparent
              "
            />

          </div>



          {/* ==================================================
              Swipe Arrow - Right
          ================================================== */}

          <div
            className="
              pointer-events-none
              absolute
              right-[9px]
              top-[42%]
              z-20
              -translate-y-1/2
            "
          >

            <div
              className="
                h-0
                w-0
                border-b-[5px]
                border-l-[7px]
                border-t-[5px]
                border-b-transparent
                border-l-white/25
                border-t-transparent
              "
            />

          </div>



          {/* ==================================================
              Ambient Background
          ================================================== */}

          <div
            className="
              pointer-events-none
              absolute
              -right-10
              -top-14
              h-40
              w-40
              rounded-full
              bg-sky-400/20
              blur-3xl
            "
          />


          <div
            className="
              pointer-events-none
              absolute
              -bottom-12
              -left-10
              h-32
              w-32
              rounded-full
              bg-white/5
              blur-3xl
            "
          />



          <div
            className="
              relative
              z-10
            "
          >


            {/* =================================================
                Location
            ================================================= */}

            <div>

              <p
                className="
                  text-[13px]
                  font-medium
                  text-white/80
                "
              >
                {selectedRegion.name}


                <span
                  className="
                    ml-2
                    text-[10px]
                    tracking-[0.15em]
                    text-white/35
                  "
                >
                  {selectedRegion.englishName}
                </span>

              </p>

            </div>



            {/* =================================================
                Loading
            ================================================= */}

            {weatherLoading && (

              <div
                className="
                  flex
                  h-[115px]
                  items-center
                "
              >

                <p
                  className="
                    text-[14px]
                    text-white/50
                  "
                >
                  取得天氣資料中...
                </p>

              </div>

            )}



            {/* =================================================
                Error
            ================================================= */}

            {!weatherLoading &&
              weatherError && (

              <div
                className="
                  flex
                  h-[115px]
                  items-center
                "
              >

                <div>

                  <p
                    className="
                      text-[14px]
                      font-medium
                      text-white/80
                    "
                  >
                    無法取得天氣資料
                  </p>


                  <p
                    className="
                      mt-2
                      text-[11px]
                      text-white/40
                    "
                  >
                    請確認目前網路連線
                  </p>

                </div>

              </div>

            )}



            {/* =================================================
                Compact Current Weather
            ================================================= */}

            {!weatherLoading &&
              !weatherError &&
              weather && (

              <div className="mt-2">

                <div
                  className="
                    grid
                    grid-cols-[1fr_92px_1fr]
                    items-center
                    gap-2
                  "
                >


                  {/* ===========================================
                      LEFT
                      Temperature
                  =========================================== */}

                  <div>

                    <div
                      className="
                        flex
                        items-start
                      "
                    >

                      <span
                        className="
                          text-[60px]
                          font-light
                          leading-[0.85]
                          tracking-[-0.065em]
                        "
                      >
                        {Math.round(
                          weather.temperature
                        )}
                      </span>


                      <span
                        className="
                          ml-1
                          mt-1
                          text-[20px]
                          font-light
                          text-white/55
                        "
                      >
                        °
                      </span>

                    </div>


                    <p
                      className="
                        mt-2
                        text-[10px]
                        text-white/40
                      "
                    >
                      體感

                      <span
                        className="
                          ml-2
                          font-medium
                          text-white/70
                        "
                      >
                        {Math.round(
                          weather.apparentTemperature
                        )}
                        °
                      </span>

                    </p>

                  </div>



                  {/* ===========================================
                      CENTER
                      Weather Illustration Slot

                      未來可以放天氣圖片 / 動畫
                  =========================================== */}

                  <div
                    className="
                      flex
                      h-[90px]
                      w-[92px]
                      items-center
                      justify-center
                    "
                  >

                    {/*
                      未來可以依 weather.weatherCode
                      在這裡放：

                      <img
                        src={weatherImage}
                        alt=""
                        className="
                          h-[82px]
                          w-[82px]
                          object-contain
                        "
                      />
                    */}

                  </div>



                  {/* ===========================================
                      RIGHT
                      Weather Status + Humidity + Wind
                  =========================================== */}

                  <div
                    className="
                      flex
                      flex-col
                      items-end
                      justify-center
                    "
                  >


                    {/* Weather Status */}

                    <div className="text-right">

                      <p
                        className="
                          text-[25px]
                          font-light
                          leading-none
                          text-white/75
                        "
                      >
                        {
                          weatherDescription?.symbol
                        }
                      </p>


                      <p
                        className="
                          mt-1
                          text-[12px]
                          font-medium
                          text-white/85
                        "
                      >
                        {
                          weatherDescription?.label
                        }
                      </p>

                    </div>



                    {/* Humidity / Wind */}

                    <div
                      className="
                        mt-3
                        flex
                        items-start
                        justify-end
                        gap-3
                      "
                    >


                      {/* Humidity */}

                      <div className="text-right">

                        <p
                          className="
                            text-[12px]
                            font-medium
                            leading-none
                            text-white/75
                          "
                        >
                          {Math.round(
                            weather.humidity
                          )}
                          %
                        </p>


                        <p
                          className="
                            mt-1
                            text-[7px]
                            tracking-[0.08em]
                            text-white/30
                          "
                        >
                          HUMIDITY
                        </p>

                      </div>



                      {/* Wind */}

                      <div className="text-right">

                        <p
                          className="
                            whitespace-nowrap
                            text-[12px]
                            font-medium
                            leading-none
                            text-white/75
                          "
                        >
                          {Math.round(
                            weather.windSpeed
                          )}

                          <span
                            className="
                              ml-[2px]
                              text-[7px]
                              font-normal
                              text-white/35
                            "
                          >
                            km/h
                          </span>

                        </p>


                        <p
                          className="
                            mt-1
                            text-[7px]
                            tracking-[0.08em]
                            text-white/30
                          "
                        >
                          WIND
                        </p>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

            )}



            {/* ==================================================
                Region Selector
            ================================================== */}

            <div
              className="
                mt-4
                border-t
                border-white/10
                pt-3
              "
            >

              <div
                className="
                  grid
                  grid-cols-5
                  gap-1
                "
              >

                {WEATHER_REGIONS.map(
                  (
                    region,
                    index
                  ) => {

                    const isSelected =
                      index ===
                      selectedRegionIndex


                    return (

                      <button
                        key={region.id}

                        type="button"

                        onPointerDown={(
                          event
                        ) => {

                          event.stopPropagation()

                        }}

                        onClick={() => {

                          setSelectedRegionIndex(
                            index
                          )

                        }}

                        className="
                          relative
                          py-2
                          text-center
                          transition
                          active:scale-95
                        "
                      >

                        <span
                          className={`
                            text-[10px]
                            transition-colors
                            duration-200

                            ${
                              isSelected
                                ? `
                                    font-semibold
                                    text-white
                                  `
                                : `
                                    font-medium
                                    text-white/35
                                  `
                            }
                          `}
                        >
                          {region.name}
                        </span>


                        <div
                          className={`
                            absolute
                            bottom-0
                            left-1/2
                            h-[2px]
                            -translate-x-1/2
                            rounded-full
                            bg-white
                            transition-all
                            duration-300

                            ${
                              isSelected
                                ? `
                                    w-3
                                    opacity-100
                                  `
                                : `
                                    w-0
                                    opacity-0
                                  `
                            }
                          `}
                        />

                      </button>

                    )

                  }
                )}

              </div>

            </div>



            {/* ==================================================
                Expanded Detail
            ================================================== */}

            <div
              className={`
                overflow-hidden
                transition-all
                duration-500
                ease-[cubic-bezier(0.22,1,0.36,1)]

                ${
                  weatherExpanded
                    ? `
                        mt-4
                        max-h-[1200px]
                        opacity-100
                      `
                    : `
                        mt-0
                        max-h-0
                        opacity-0
                      `
                }
              `}
            >

              <div
                className="
                  border-t
                  border-white/10
                  pt-4
                "
              >

                <style>
                  {`
                    @keyframes weatherDetailFade {
                      from {
                        opacity: 0;
                        transform: translateY(6px);
                      }

                      to {
                        opacity: 1;
                        transform: translateY(0);
                      }
                    }
                  `}
                </style>


                {/* ==============================================
                    Detail Mode Tabs
                ============================================== */}

                <div
                  className="
                    grid
                    grid-cols-2
                    rounded-[16px]
                    bg-white/[0.05]
                    p-1
                  "
                >

                  <button
                    type="button"

                    onPointerDown={(
                      event
                    ) => {
                      event.stopPropagation()
                    }}

                    onClick={() => {
                      setWeatherDetailMode(
                        'today'
                      )
                    }}

                    className={`
                      rounded-[12px]
                      px-3
                      py-2
                      text-[11px]
                      font-medium
                      transition-all
                      duration-300

                      ${
                        weatherDetailMode ===
                        'today'
                          ? `
                              bg-white/[0.12]
                              text-white
                              shadow-sm
                            `
                          : `
                              text-white/35
                            `
                      }
                    `}
                  >
                    今日天氣
                  </button>


                  <button
                    type="button"

                    onPointerDown={(
                      event
                    ) => {
                      event.stopPropagation()
                    }}

                    onClick={() => {
                      setWeatherDetailMode(
                        'week'
                      )
                    }}

                    className={`
                      rounded-[12px]
                      px-3
                      py-2
                      text-[11px]
                      font-medium
                      transition-all
                      duration-300

                      ${
                        weatherDetailMode ===
                        'week'
                          ? `
                              bg-white/[0.12]
                              text-white
                              shadow-sm
                            `
                          : `
                              text-white/35
                            `
                      }
                    `}
                  >
                    本周天氣
                  </button>

                </div>



                {/* ==============================================
                    Today Detail
                ============================================== */}

                {weatherDetailMode ===
                  'today' && (

                  <div
                    key="today"

                    style={{
                      animation:
                        'weatherDetailFade 240ms ease-out',
                    }}
                  >

                    <div
                      className="
                        mt-4
                        flex
                        items-center
                        justify-between
                      "
                    >

                      <p
                        className="
                          text-[13px]
                          font-medium
                          text-white/85
                        "
                      >
                        {selectedRegion.name} · 今日天氣
                      </p>


                      <span
                        className="
                          text-[10px]
                          text-white/30
                        "
                      >
                        00 — 24
                      </span>

                    </div>



                    {/* Day Summary */}

                    <div
                      className="
                        mt-4
                        grid
                        grid-cols-3
                        overflow-hidden
                        rounded-[18px]
                        border
                        border-white/10
                        bg-white/[0.04]
                      "
                    >

                      <div
                        className="
                          px-3
                          py-3
                          text-center
                        "
                      >

                        <p
                          className="
                            text-[8px]
                            tracking-[0.15em]
                            text-white/30
                          "
                        >
                          LOW
                        </p>


                        <p
                          className="
                            mt-1
                            text-[16px]
                            font-medium
                            text-white/80
                          "
                        >
                          {Math.round(
                            dayMinTemperature
                          )}
                          °
                        </p>

                      </div>


                      <div
                        className="
                          border-x
                          border-white/10
                          px-3
                          py-3
                          text-center
                        "
                      >

                        <p
                          className="
                            text-[8px]
                            tracking-[0.15em]
                            text-white/30
                          "
                        >
                          HIGH
                        </p>


                        <p
                          className="
                            mt-1
                            text-[16px]
                            font-medium
                            text-white/80
                          "
                        >
                          {Math.round(
                            dayMaxTemperature
                          )}
                          °
                        </p>

                      </div>


                      <div
                        className="
                          px-3
                          py-3
                          text-center
                        "
                      >

                        <p
                          className="
                            text-[8px]
                            tracking-[0.15em]
                            text-white/30
                          "
                        >
                          PRECIP
                        </p>


                        <p
                          className="
                            mt-1
                            text-[16px]
                            font-medium
                            text-white/80
                          "
                        >
                          {Math.round(
                            maxPrecipitationProbability
                          )}
                          %
                        </p>

                      </div>

                    </div>



                    {/* 3-Hour Weather */}

                    <div
                      className="
                        mt-5
                        grid
                        grid-cols-4
                        gap-x-2
                        gap-y-4
                      "
                    >

                      {detailWeather.map(
                        item => {

                          const description =
                            getWeatherDescription(
                              item.weatherCode
                            )


                          const hour =
                            item.time.slice(
                              11,
                              16
                            )


                          return (

                            <div
                              key={
                                item.time
                              }

                              className="
                                text-center
                              "
                            >

                              <p
                                className="
                                  text-[9px]
                                  font-medium
                                  tracking-[0.06em]
                                  text-white/35
                                "
                              >
                                {hour}
                              </p>


                              <p
                                className="
                                  mt-2
                                  text-[20px]
                                  leading-none
                                  text-white/75
                                "
                              >
                                {
                                  description.symbol
                                }
                              </p>


                              <p
                                className="
                                  mt-2
                                  text-[14px]
                                  font-medium
                                  text-white/85
                                "
                              >
                                {Math.round(
                                  item.temperature
                                )}
                                °
                              </p>


                              <p
                                className="
                                  mt-1
                                  text-[9px]
                                  text-sky-200/50
                                "
                              >
                                {Math.round(
                                  item
                                    .precipitationProbability
                                )}
                                %
                              </p>

                            </div>

                          )

                        }
                      )}

                    </div>

                  </div>

                )}



                {/* ==============================================
                    Week Detail
                ============================================== */}

                {weatherDetailMode ===
                  'week' && (

                  <div
                    key="week"

                    className="
                      mt-3
                      divide-y
                      divide-white/10
                    "

                    style={{
                      animation:
                        'weatherDetailFade 240ms ease-out',
                    }}
                  >

                    {weeklyWeather.map(
                      (
                        item,
                        index
                      ) => {

                        const description =
                          getWeatherDescription(
                            item.weatherCode
                          )


                        const dateInfo =
                          formatWeekDate(
                            item.date,
                            index
                          )


                        return (

                          <div
                            key={
                              item.date
                            }

                            className="
                              grid
                              grid-cols-[62px_1fr_auto]
                              items-center
                              gap-3
                              py-3
                            "
                          >

                            {/* Date */}

                            <div>

                              <p
                                className="
                                  text-[11px]
                                  font-medium
                                  text-white/80
                                "
                              >
                                {
                                  dateInfo.dayLabel
                                }
                              </p>


                              <p
                                className="
                                  mt-1
                                  text-[9px]
                                  text-white/30
                                "
                              >
                                {
                                  dateInfo.dateLabel
                                }
                              </p>

                            </div>



                            {/* Weather */}

                            <div
                              className="
                                flex
                                items-center
                                gap-3
                              "
                            >

                              <span
                                className="
                                  w-6
                                  text-center
                                  text-[20px]
                                  text-white/75
                                "
                              >
                                {
                                  description.symbol
                                }
                              </span>


                              <div>

                                <p
                                  className="
                                    text-[11px]
                                    font-medium
                                    text-white/75
                                  "
                                >
                                  {
                                    description.label
                                  }
                                </p>


                                <p
                                  className="
                                    mt-1
                                    text-[9px]
                                    text-sky-200/45
                                  "
                                >
                                  降水 {
                                    Math.round(
                                      item
                                        .precipitationProbability
                                    )
                                  }%
                                </p>

                              </div>

                            </div>



                            {/* Temperature */}

                            <div
                              className="
                                min-w-[68px]
                                text-right
                              "
                            >

                              <p
                                className="
                                  text-[13px]
                                  font-medium
                                  text-white/85
                                "
                              >
                                {Math.round(
                                  item
                                    .maxTemperature
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

                                <span
                                  className="
                                    text-white/45
                                  "
                                >
                                  {Math.round(
                                    item
                                      .minTemperature
                                  )}
                                  °
                                </span>

                              </p>

                            </div>

                          </div>

                        )

                      }
                    )}

                  </div>

                )}

              </div>

            </div>



            {/* ==================================================
                Detail Toggle
            ================================================== */}

            <button
              type="button"

              onPointerDown={(
                event
              ) => {

                event.stopPropagation()

              }}

              onClick={() => {

                setWeatherExpanded(
                  current =>
                    !current
                )

              }}

              className="
                mt-4
                flex
                w-full
                items-center
                justify-center
                gap-2
                border-t
                border-white/10
                pt-4
                text-center
                transition
                active:opacity-50
              "
            >

              <span
                className="
                  text-[9px]
                  font-medium
                  tracking-[0.14em]
                  text-white/30
                "
              >
                {
                  weatherExpanded
                    ? 'Tap to close detail'
                    : 'Tap for detail info'
                }
              </span>


              <span
                className={`
                  text-[10px]
                  text-white/25
                  transition-transform
                  duration-500

                  ${
                    weatherExpanded
                      ? 'rotate-180'
                      : 'rotate-0'
                  }
                `}
              >
                ▾
              </span>

            </button>

          </div>

        </div>

      </section>
      )}



      {/* ======================================================
          SKI SNOW FORECAST
      ====================================================== */}

      {homeVisibility.snowForecast && (
      <section
        className="mt-5"
        onPointerDown={(event) => {
          // 避免操作雪況 Block 時觸發 TripApp 的整頁 Swipe Back
          event.stopPropagation()
        }}
      >

        <SnowForecastBlock
          areaId={selectedRegion.id}
        />

      </section>
      )}




      {homeVisibility.snowPass && (
        <SnowPassWallet />
      )}


      {homeVisibility.paymentMethods && (
        <PaymentMethodWallet />
      )}


      {/* ======================================================
          Trip Status
      ====================================================== */}

      {homeVisibility.tripStatus && (
      <section className="mt-10">

        <div
          className="
            flex
            items-center
            justify-between
          "
        >

          <h2
            className="
              text-[16px]
              font-semibold
              text-slate-950
            "
          >
            旅程
          </h2>


          <span
            className="
              text-[10px]
              font-medium
              tracking-[0.16em]
              text-slate-500
            "
          >
            {tripInfo.type}
          </span>

        </div>



        <div
          className="
            mt-4
            overflow-hidden
            rounded-[24px]
            border
            border-white/50
            bg-white/55
            shadow-sm
            backdrop-blur-xl
          "
        >


          <button
            type="button"

            className="
              flex
              w-full
              items-center
              justify-between
              px-5
              py-5
              text-left
            "
          >

            <div>

              <p
                className="
                  text-[15px]
                  font-medium
                  text-slate-900
                "
              >
                行程規劃
              </p>


              <p
                className="
                  mt-1
                  text-[12px]
                  text-slate-500
                "
              >
                尚未完成
              </p>

            </div>


            <span
              className="
                text-xl
                font-light
                text-slate-400
              "
            >
              ›
            </span>

          </button>



          <div
            className="
              ml-5
              h-px
              bg-slate-200/70
            "
          />



          <button
            type="button"

            className="
              flex
              w-full
              items-center
              justify-between
              px-5
              py-5
              text-left
            "
          >

            <div>

              <p
                className="
                  text-[15px]
                  font-medium
                  text-slate-900
                "
              >
                地圖紀錄
              </p>


              <p
                className="
                  mt-1
                  text-[12px]
                  text-slate-500
                "
              >
                尚未開始
              </p>

            </div>


            <span
              className="
                text-xl
                font-light
                text-slate-400
              "
            >
              ›
            </span>

          </button>



          <div
            className="
              ml-5
              h-px
              bg-slate-200/70
            "
          />



          <button
            type="button"

            className="
              flex
              w-full
              items-center
              justify-between
              px-5
              py-5
              text-left
            "
          >

            <div>

              <p
                className="
                  text-[15px]
                  font-medium
                  text-slate-900
                "
              >
                旅行回憶
              </p>


              <p
                className="
                  mt-1
                  text-[12px]
                  text-slate-500
                "
              >
                等待旅程開始
              </p>

            </div>


            <span
              className="
                text-xl
                font-light
                text-slate-400
              "
            >
              ›
            </span>

          </button>

        </div>

      </section>
      )}



      {/* ======================================================
          Planning
      ====================================================== */}

      {homeVisibility.quickLinks && (
      <section className="mt-10">

        <p
          className="
            text-[10px]
            font-medium
            tracking-[0.22em]
            text-slate-500
          "
        >
          BEFORE THE TRIP
        </p>


        <h2
          className="
            mt-2
            text-[21px]
            font-semibold
            tracking-[-0.02em]
            text-slate-950
          "
        >
          準備這趟旅行
        </h2>



        <div
          className="
            mt-5
            grid
            grid-cols-2
            gap-3
          "
        >


          <button
            type="button"

            className="
              rounded-[22px]
              border
              border-white/50
              bg-white/45
              p-5
              text-left
              shadow-sm
              backdrop-blur-xl
              transition
              active:scale-[0.98]
            "
          >

            <p
              className="
                text-[11px]
                text-slate-500
              "
            >
              MISSION
            </p>


            <p
              className="
                mt-6
                text-[16px]
                font-semibold
                text-slate-900
              "
            >
              旅行任務
            </p>

          </button>



          <button
            type="button"

            className="
              rounded-[22px]
              bg-slate-900/90
              p-5
              text-left
              text-white
              shadow-sm
              backdrop-blur-xl
              transition
              active:scale-[0.98]
            "
          >

            <p
              className="
                text-[11px]
                text-white/45
              "
            >
              PLACES
            </p>


            <p
              className="
                mt-6
                text-[16px]
                font-semibold
              "
            >
              收藏地點
            </p>

          </button>

        </div>

      </section>
      )}

      <HomeEditPanel
        open={
          homeEditOpen
        }

        visibility={
          homeVisibility
        }

        onChange={
          setHomeVisibility
        }

        onClose={() =>
          setHomeEditOpen(
            false
          )
        }
      />


    </main>

  )

}


export default Home