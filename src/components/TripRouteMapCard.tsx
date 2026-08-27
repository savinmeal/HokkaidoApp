import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import {
  TRIP_STORAGE_KEY,
  tripDays,
  type TripActivity,
  type TripDay,
} from '../data/tripData'

import {
  loadTripGpsTracks,
  saveTripGpsTracks,
  type TripDayGpsTrack,
  type TripGpsPoint,
} from '../data/tripGpsTrackStorage'


function loadTripDays():
  TripDay[] {

  try {

    const saved =
      localStorage.getItem(
        TRIP_STORAGE_KEY
      )


    if (!saved) {
      return tripDays
    }


    const parsed =
      JSON.parse(
        saved
      ) as
        TripDay[]


    return (
      Array.isArray(
        parsed
      ) &&
      parsed.length > 0
    )
      ? parsed
      : tripDays

  } catch (error) {

    console.error(
      'Map trip days load failed:',
      error
    )


    return tripDays

  }

}


function formatDayLabel(
  dateString: string
) {

  const date =
    new Date(
      `${dateString}T12:00:00`
    )


  return date.toLocaleDateString(
    'zh-TW',
    {
      month:
        'numeric',

      day:
        'numeric',

      weekday:
        'short',
    }
  )

}


function haversineMeters(
  a: TripGpsPoint,
  b: TripGpsPoint
) {

  const radius =
    6371000


  const toRad =
    (
      value: number
    ) =>
      value *
      Math.PI /
      180


  const dLat =
    toRad(
      b.latitude -
      a.latitude
    )


  const dLon =
    toRad(
      b.longitude -
      a.longitude
    )


  const lat1 =
    toRad(
      a.latitude
    )


  const lat2 =
    toRad(
      b.latitude
    )


  const h =
    Math.sin(
      dLat / 2
    ) ** 2 +
    Math.cos(
      lat1
    ) *
    Math.cos(
      lat2
    ) *
    Math.sin(
      dLon / 2
    ) ** 2


  return (
    2 *
    radius *
    Math.asin(
      Math.sqrt(
        h
      )
    )
  )

}


function getActivitySymbol(
  activity:
    TripActivity
) {

  switch (
    activity.type
  ) {

    case 'food':
      return 'F'

    case 'hotel':
      return 'H'

    case 'ski':
      return 'S'

    case 'shopping':
      return '$'

    case 'transport':
      return 'T'

    default:
      return '•'

  }

}


type ProjectedPoint = {
  x: number
  y: number
}


function TripRouteMapCard() {

  const [
    days,
  ] = useState<TripDay[]>(
    loadTripDays
  )


  const [
    selectedDayIndex,
    setSelectedDayIndex,
  ] = useState(0)


  const [
    tracks,
    setTracks,
  ] = useState<
    TripDayGpsTrack[]
  >(
    loadTripGpsTracks
  )


  const [
    recording,
    setRecording,
  ] = useState(false)


  const [
    gpsMessage,
    setGpsMessage,
  ] = useState('')


  const watchIdRef =
    useRef<
      number |
      null
    >(
      null
    )


  const selectedDay =
    days[
      Math.min(
        selectedDayIndex,
        days.length - 1
      )
    ]


  const selectedTrack =
    tracks.find(
      track =>
        track.date ===
        selectedDay?.date
    )


  const points =
    selectedTrack?.points ??
    []


  const locatedActivities =
    selectedDay?.activities.filter(
      activity =>
        typeof activity.latitude ===
          'number' &&
        typeof activity.longitude ===
          'number'
    ) ??
    []


  useEffect(() => {

    saveTripGpsTracks(
      tracks
    )

  }, [
    tracks,
  ])


  useEffect(() => {

    return () => {

      if (
        watchIdRef.current !==
        null
      ) {

        navigator.geolocation
          ?.clearWatch(
            watchIdRef.current
          )

      }

    }

  }, [])


  const allCoordinates =
    useMemo(
      () => [

        ...points.map(
          point => ({
            latitude:
              point.latitude,

            longitude:
              point.longitude,
          })
        ),

        ...locatedActivities.map(
          activity => ({
            latitude:
              activity.latitude as number,

            longitude:
              activity.longitude as number,
          })
        ),

      ],
      [
        points,
        locatedActivities,
      ]
    )


  const bounds =
    useMemo(
      () => {

        if (
          allCoordinates.length ===
          0
        ) {
          return null
        }


        const lats =
          allCoordinates.map(
            point =>
              point.latitude
          )


        const lons =
          allCoordinates.map(
            point =>
              point.longitude
          )


        let minLat =
          Math.min(
            ...lats
          )


        let maxLat =
          Math.max(
            ...lats
          )


        let minLon =
          Math.min(
            ...lons
          )


        let maxLon =
          Math.max(
            ...lons
          )


        if (
          Math.abs(
            maxLat -
            minLat
          ) <
          0.0001
        ) {

          minLat -=
            0.0001

          maxLat +=
            0.0001

        }


        if (
          Math.abs(
            maxLon -
            minLon
          ) <
          0.0001
        ) {

          minLon -=
            0.0001

          maxLon +=
            0.0001

        }


        const latPadding =
          (
            maxLat -
            minLat
          ) *
          0.12


        const lonPadding =
          (
            maxLon -
            minLon
          ) *
          0.12


        return {
          minLat:
            minLat -
            latPadding,

          maxLat:
            maxLat +
            latPadding,

          minLon:
            minLon -
            lonPadding,

          maxLon:
            maxLon +
            lonPadding,
        }

      },
      [
        allCoordinates,
      ]
    )


  const project =
    (
      latitude: number,
      longitude: number
    ):
      ProjectedPoint => {

      if (!bounds) {

        return {
          x:
            50,

          y:
            50,
        }

      }


      const x =
        (
          (
            longitude -
            bounds.minLon
          ) /
          (
            bounds.maxLon -
            bounds.minLon
          )
        ) *
        100


      const y =
        100 -
        (
          (
            latitude -
            bounds.minLat
          ) /
          (
            bounds.maxLat -
            bounds.minLat
          )
        ) *
        100


      return {
        x,
        y,
      }

    }


  const polyline =
    points
      .map(
        point => {

          const projected =
            project(
              point.latitude,
              point.longitude
            )


          return (
            `${projected.x},` +
            `${projected.y}`
          )

        }
      )
      .join(
        ' '
      )


  const totalDistance =
    useMemo(
      () => {

        let total =
          0


        for (
          let index = 1;
          index < points.length;
          index += 1
        ) {

          total +=
            haversineMeters(
              points[
                index - 1
              ],
              points[
                index
              ]
            )

        }


        return total

      },
      [
        points,
      ]
    )


  const stopRecording =
    () => {

      if (
        watchIdRef.current !==
        null
      ) {

        navigator.geolocation
          .clearWatch(
            watchIdRef.current
          )

      }


      watchIdRef.current =
        null


      setRecording(
        false
      )


      setGpsMessage(
        'GPS 紀錄已停止'
      )

    }


  const startRecording =
    () => {

      if (
        !selectedDay
      ) {
        return
      }


      if (
        !navigator.geolocation
      ) {

        setGpsMessage(
          '此瀏覽器不支援 GPS 定位'
        )

        return
      }


      if (
        !window.isSecureContext
      ) {

        setGpsMessage(
          'GPS 紀錄需要 HTTPS 安全連線'
        )

        return
      }


      setGpsMessage(
        '正在取得 GPS 定位...'
      )


      const id =
        navigator.geolocation
          .watchPosition(
            position => {

              const nextPoint:
                TripGpsPoint =
              {
                latitude:
                  position.coords
                    .latitude,

                longitude:
                  position.coords
                    .longitude,

                accuracy:
                  position.coords
                    .accuracy,

                timestamp:
                  position.timestamp,
              }


              setTracks(
                current => {

                  const existing =
                    current.find(
                      track =>
                        track.date ===
                        selectedDay.date
                    )


                  const existingPoints =
                    existing?.points ??
                    []


                  const lastPoint =
                    existingPoints[
                      existingPoints.length -
                      1
                    ]


                  if (lastPoint) {

                    const distance =
                      haversineMeters(
                        lastPoint,
                        nextPoint
                      )


                    const seconds =
                      (
                        nextPoint.timestamp -
                        lastPoint.timestamp
                      ) /
                      1000


                    if (
                      distance < 5 &&
                      seconds < 8
                    ) {
                      return current
                    }

                  }


                  const nextPoints =
                    [
                      ...existingPoints,
                      nextPoint,
                    ]


                  if (existing) {

                    return current.map(
                      track =>
                        track.date ===
                        selectedDay.date
                          ? {
                              ...track,

                              points:
                                nextPoints,
                            }
                          : track
                    )

                  }


                  return [
                    ...current,

                    {
                      date:
                        selectedDay.date,

                      points:
                        nextPoints,
                    },
                  ]

                }
              )


              setGpsMessage(
                `GPS 紀錄中 · 精度約 ${Math.round(
                  position.coords
                    .accuracy
                )} m`
              )

            },

            error => {

              console.error(
                'GPS watch failed:',
                error
              )


              setGpsMessage(
                error.code ===
                error.PERMISSION_DENIED
                  ? '定位權限未開啟'
                  : 'GPS 定位暫時無法取得'
              )


              setRecording(
                false
              )

            },

            {
              enableHighAccuracy:
                true,

              maximumAge:
                5000,

              timeout:
                15000,
            }
          )


      watchIdRef.current =
        id


      setRecording(
        true
      )

    }


  const clearSelectedDayTrack =
    () => {

      if (
        !selectedDay ||
        points.length ===
        0
      ) {
        return
      }


      const confirmed =
        window.confirm(
          `確定要清除 DAY ${selectedDay.dayNumber} 的 GPS 軌跡嗎？`
        )


      if (!confirmed) {
        return
      }


      stopRecording()


      setTracks(
        current =>
          current.filter(
            track =>
              track.date !==
              selectedDay.date
          )
      )

    }


  if (
    !selectedDay
  ) {
    return null
  }


  return (

    <section
      className="
        mt-5
      "
    >

      <div
        className="
          overflow-hidden
          rounded-[28px]
          border
          border-white/50
          bg-white/55
          px-5
          pb-5
          pt-5
          shadow-sm
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

          <div>

            <p
              className="
                text-[9px]
                font-semibold
                tracking-[0.18em]
                text-slate-500
              "
            >
              TRIP ROUTE
            </p>


            <h2
              className="
                mt-1
                text-[17px]
                font-semibold
                tracking-[-0.02em]
                text-slate-950
              "
            >
              行程軌跡
            </h2>

          </div>


          <div
            className="
              text-right
            "
          >

            <p
              className="
                text-[13px]
                font-semibold
                text-slate-800
              "
            >
              {
                (
                  totalDistance /
                  1000
                ).toFixed(
                  1
                )
              }
              {' '}
              km
            </p>


            <p
              className="
                mt-1
                text-[8px]
                tracking-[0.1em]
                text-slate-500
              "
            >
              {
                points.length
              }
              {' '}
              GPS POINTS
            </p>

          </div>

        </div>


        {/* Day Selector */}

        <div
          data-horizontal-scroll="true"

          onPointerDown={event => {
            event.stopPropagation()
          }}

          className="
            mt-4
            flex
            touch-pan-x
            gap-2
            overflow-x-auto
            pb-1
            [scrollbar-width:none]
            [&::-webkit-scrollbar]:hidden
          "
        >

          {days.map(
            (
              day,
              index
            ) => {

              const active =
                index ===
                selectedDayIndex


              return (
                <button
                  key={
                    day.id
                  }

                  type="button"

                  onClick={() => {

                    if (recording) {

                      stopRecording()

                    }


                    setSelectedDayIndex(
                      index
                    )

                  }}

                  className={`
                    shrink-0
                    rounded-full
                    border
                    px-3
                    py-2
                    text-[9px]
                    font-semibold
                    transition

                    ${
                      active
                        ? `
                            border-slate-900
                            bg-slate-950
                            text-white
                          `
                        : `
                            border-slate-200
                            bg-white/70
                            text-slate-600
                          `
                    }
                  `}
                >
                  DAY {
                    day.dayNumber
                  }
                </button>
              )

            }
          )}

        </div>


        <p
          className="
            mt-2
            text-[9px]
            text-slate-500
          "
        >
          DAY {
            selectedDay.dayNumber
          }
          {' · '}
          {
            selectedDay.city ||
            '未設定城市'
          }
          {' · '}
          {
            formatDayLabel(
              selectedDay.date
            )
          }
        </p>


        {/* Map Canvas */}

        <div
          className="
            relative
            mt-4
            h-[270px]
            overflow-hidden
            rounded-[22px]
            border
            border-slate-200
            bg-slate-100
          "
        >

          {/* Placeholder offline basemap */}
          <div
            className="
              absolute
              inset-0
              opacity-60
            "

            style={{
              backgroundImage:
                `
                  linear-gradient(
                    rgba(100,116,139,0.10) 1px,
                    transparent 1px
                  ),
                  linear-gradient(
                    90deg,
                    rgba(100,116,139,0.10) 1px,
                    transparent 1px
                  )
                `,

              backgroundSize:
                '28px 28px',
            }}
          />


          <div
            className="
              pointer-events-none
              absolute
              left-4
              top-4
              rounded-full
              bg-white/85
              px-2.5
              py-1.5
              text-[8px]
              font-semibold
              tracking-[0.08em]
              text-slate-500
              shadow-sm
              backdrop-blur
            "
          >
            OFFLINE BASEMAP · PHASE 2
          </div>


          {
            points.length >
            1
              ? (
                <svg
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  className="
                    absolute
                    inset-0
                    h-full
                    w-full
                  "
                  aria-label="GPS 軌跡"
                >

                  <polyline
                    points={
                      polyline
                    }
                    fill="none"
                    stroke="rgb(14 165 233)"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                  />

                </svg>
              )
              : (
                <div
                  className="
                    absolute
                    inset-0
                    flex
                    items-center
                    justify-center
                    px-8
                    text-center
                  "
                >

                  <div>

                    <p
                      className="
                        text-[13px]
                        font-semibold
                        text-slate-600
                      "
                    >
                      尚無 GPS 軌跡
                    </p>


                    <p
                      className="
                        mt-2
                        text-[9px]
                        leading-5
                        text-slate-500
                      "
                    >
                      點「開始 GPS」後，
                      <br />
                      Map 頁保持開啟即可開始紀錄。
                    </p>

                  </div>

                </div>
              )
          }


          {/* Trip Activity Markers */}

          {locatedActivities.map(
            activity => {

              const position =
                project(
                  activity.latitude as number,
                  activity.longitude as number
                )


              return (
                <div
                  key={
                    activity.id
                  }

                  className="
                    absolute
                    z-20
                    -translate-x-1/2
                    -translate-y-1/2
                  "

                  style={{
                    left:
                      `${position.x}%`,

                    top:
                      `${position.y}%`,
                  }}
                >

                  <div
                    className="
                      flex
                      h-6
                      w-6
                      items-center
                      justify-center
                      rounded-full
                      border-2
                      border-white
                      bg-slate-950
                      text-[8px]
                      font-bold
                      text-white
                      shadow-md
                    "
                  >
                    {
                      getActivitySymbol(
                        activity
                      )
                    }
                  </div>


                  <p
                    className="
                      absolute
                      left-1/2
                      top-7
                      max-w-[90px]
                      -translate-x-1/2
                      truncate
                      rounded-full
                      bg-white/90
                      px-2
                      py-1
                      text-[7px]
                      font-semibold
                      text-slate-700
                      shadow-sm
                      backdrop-blur
                    "
                  >
                    {
                      activity.title
                    }
                  </p>

                </div>
              )

            }
          )}

        </div>


        {/* GPS Controls */}

        <div
          className="
            mt-3
            grid
            grid-cols-[1fr_auto]
            gap-2
          "
        >

          <button
            type="button"

            onClick={
              recording
                ? stopRecording
                : startRecording
            }

            className={`
              rounded-[15px]
              px-4
              py-3
              text-[10px]
              font-semibold
              transition
              active:scale-[0.99]

              ${
                recording
                  ? `
                      bg-red-500
                      text-white
                    `
                  : `
                      bg-slate-950
                      text-white
                    `
              }
            `}
          >
            {
              recording
                ? '停止 GPS'
                : '開始 GPS'
            }
          </button>


          <button
            type="button"

            disabled={
              points.length ===
              0
            }

            onClick={
              clearSelectedDayTrack
            }

            className="
              rounded-[15px]
              border
              border-slate-200
              bg-white
              px-4
              py-3
              text-[10px]
              font-semibold
              text-slate-600
              disabled:opacity-30
            "
          >
            清除
          </button>

        </div>


        {gpsMessage && (

          <p
            className="
              mt-2
              text-[9px]
              leading-4
              text-slate-500
            "
          >
            {
              gpsMessage
            }
          </p>

        )}


        {
          locatedActivities.length ===
          0 && (

            <p
              className="
                mt-3
                rounded-[14px]
                bg-slate-100
                px-3
                py-2.5
                text-[8px]
                leading-4
                text-slate-500
              "
            >
              Trip Activity 目前若沒有 latitude / longitude，
              路徑仍可顯示，但景點 icon 需等未來加入座標後才會自動疊上。
            </p>

          )
        }

      </div>

    </section>

  )

}


export default TripRouteMapCard