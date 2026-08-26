import {
  useMemo,
  useRef,
  useState,
} from 'react'


import {
  tripDays,
  tripInfo,
  type TripActivity,
  type TripActivityType,
} from '../data/tripData'


// ============================================================
// Helpers
// ============================================================

function formatDayDate(
  dateString: string
) {

  const date =
    new Date(
      `${dateString}T12:00:00`
    )


  const month =
    date.getMonth() + 1


  const day =
    date.getDate()


  const weekday =
    date.toLocaleDateString(
      'en-US',
      {
        weekday: 'short',
      }
    )
      .toUpperCase()


  return {
    month,
    day,
    weekday,
  }
}


function formatFullDate(
  dateString: string
) {

  const date =
    new Date(
      `${dateString}T12:00:00`
    )


  return date.toLocaleDateString(
    'zh-TW',
    {
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    }
  )
}


// ============================================================
// Activity Visual
// ============================================================

type ActivityMeta = {
  label: string
  symbol: string
}


function getActivityMeta(
  type: TripActivityType
): ActivityMeta {

  switch (type) {

    case 'transport':
      return {
        label: 'TRANSPORT',
        symbol: '↗',
      }

    case 'attraction':
      return {
        label: 'PLACE',
        symbol: '○',
      }

    case 'food':
      return {
        label: 'FOOD',
        symbol: '◇',
      }

    case 'hotel':
      return {
        label: 'STAY',
        symbol: '□',
      }

    case 'ski':
      return {
        label: 'SKI',
        symbol: '△',
      }

    case 'shopping':
      return {
        label: 'SHOP',
        symbol: '＋',
      }

    default:
      return {
        label: 'PLAN',
        symbol: '·',
      }

  }
}


// ============================================================
// Activity Row
// ============================================================

type ActivityRowProps = {
  activity: TripActivity
  isLast: boolean
}


function ActivityRow({
  activity,
  isLast,
}: ActivityRowProps) {

  const meta =
    getActivityMeta(
      activity.type
    )


  return (

    <div
      className="
        grid
        grid-cols-[54px_18px_1fr]
        gap-3
      "
    >


      {/* Time */}

      <div
        className="
          pt-[2px]
          text-right
        "
      >

        <p
          className="
            text-[11px]
            font-medium
            tracking-[0.03em]
            text-slate-600
          "
        >
          {activity.time || '--:--'}
        </p>

      </div>



      {/* Timeline */}

      <div
        className="
          relative
          flex
          justify-center
        "
      >

        <div
          className="
            relative
            z-10
            mt-[2px]
            flex
            h-[18px]
            w-[18px]
            items-center
            justify-center
            rounded-full
            border
            border-slate-300/80
            bg-white/80
            text-[8px]
            text-slate-700
            backdrop-blur
          "
        >
          {meta.symbol}
        </div>


        {!isLast && (

          <div
            className="
              absolute
              bottom-[-18px]
              top-[20px]
              w-px
              bg-slate-300/60
            "
          />

        )}

      </div>



      {/* Content */}

      <div
        className={`
          ${isLast
            ? 'pb-1'
            : 'pb-7'}
        `}
      >

        <p
          className="
            text-[9px]
            font-semibold
            tracking-[0.16em]
            text-slate-400
          "
        >
          {meta.label}
        </p>


        <p
          className="
            mt-1
            text-[15px]
            font-semibold
            leading-[1.35]
            text-slate-950
          "
        >
          {activity.title}
        </p>


        {activity.location && (

          <p
            className="
              mt-1
              text-[11px]
              leading-5
              text-slate-500
            "
          >
            {activity.location}
          </p>

        )}


        {activity.note && (

          <p
            className="
              mt-2
              text-[11px]
              leading-5
              text-slate-500
            "
          >
            {activity.note}
          </p>

        )}

      </div>

    </div>

  )
}


// ============================================================
// Trip Page
// ============================================================

function Trip() {


  const [
    selectedDayIndex,
    setSelectedDayIndex,
  ] = useState(0)


  const selectedDay =
    tripDays[selectedDayIndex]


  const dayTabsRef =
    useRef<HTMLDivElement>(null)



  const selectedDateInfo =
    useMemo(
      () =>
        formatDayDate(
          selectedDay.date
        ),
      [
        selectedDay.date,
      ]
    )



  // ==========================================================
  // Select Day
  // ==========================================================

  const handleSelectDay = (
    index: number
  ) => {

    setSelectedDayIndex(
      index
    )


    const container =
      dayTabsRef.current


    const button =
      container
        ?.children[
          index
        ] as HTMLElement | undefined


    if (
      container &&
      button
    ) {

      const targetLeft =
        button.offsetLeft -
        container.clientWidth / 2 +
        button.clientWidth / 2


      container.scrollTo({
        left:
          Math.max(
            0,
            targetLeft
          ),

        behavior:
          'smooth',
      })

    }

  }



  // ==========================================================
  // Previous / Next
  // ==========================================================

  const goPreviousDay = () => {

    if (
      selectedDayIndex <= 0
    ) {
      return
    }


    handleSelectDay(
      selectedDayIndex - 1
    )

  }


  const goNextDay = () => {

    if (
      selectedDayIndex >=
      tripDays.length - 1
    ) {
      return
    }


    handleSelectDay(
      selectedDayIndex + 1
    )

  }



  // ==========================================================
  // Render
  // ==========================================================

  return (

    <main
      className="
        mx-auto
        w-full
        max-w-md
        px-5
        pb-12
        pt-3
      "
    >


      {/* ======================================================
          Header
      ====================================================== */}

      <section
        className="
          px-1
        "
      >

        <p
          className="
            text-[10px]
            font-semibold
            tracking-[0.28em]
            text-slate-500
          "
        >
          {tripInfo.year} HOKKAIDO
        </p>


        <div
          className="
            mt-3
            flex
            items-end
            justify-between
            gap-4
          "
        >

          <div>

            <h1
              className="
                text-[32px]
                font-semibold
                leading-none
                tracking-[-0.04em]
                text-slate-950
              "
            >
              行程
            </h1>


            <p
              className="
                mt-3
                text-[12px]
                font-medium
                tracking-[0.08em]
                text-slate-500
              "
            >
              12.25 — 01.02
            </p>

          </div>


          <div
            className="
              text-right
            "
          >

            <p
              className="
                text-[10px]
                font-medium
                tracking-[0.12em]
                text-slate-400
              "
            >
              {tripDays.length} DAYS
            </p>


            <p
              className="
                mt-1
                text-[11px]
                font-medium
                text-slate-600
              "
            >
              {tripInfo.name}
            </p>

          </div>

        </div>

      </section>



      {/* ======================================================
          Day Selector
      ====================================================== */}

      <section
        className="
          -mx-5
          mt-7
        "
      >

        <div
          ref={dayTabsRef}

          className="
            flex
            gap-2
            overflow-x-auto
            px-5
            pb-2
            [scrollbar-width:none]
            [&::-webkit-scrollbar]:hidden
          "
        >

          {tripDays.map(
            (
              day,
              index
            ) => {

              const info =
                formatDayDate(
                  day.date
                )


              const isSelected =
                index ===
                selectedDayIndex


              return (

                <button
                  key={day.id}

                  type="button"

                  onClick={() =>
                    handleSelectDay(
                      index
                    )
                  }

                  className={`
                    min-w-[64px]
                    shrink-0
                    rounded-[20px]
                    border
                    px-3
                    py-3
                    text-center
                    transition-all
                    duration-300
                    active:scale-[0.96]

                    ${
                      isSelected
                        ? `
                            border-slate-900
                            bg-slate-950
                            text-white
                            shadow-md
                            shadow-slate-900/15
                          `
                        : `
                            border-white/60
                            bg-white/45
                            text-slate-700
                            backdrop-blur-xl
                          `
                    }
                  `}
                >

                  <p
                    className={`
                      text-[8px]
                      font-semibold
                      tracking-[0.12em]

                      ${
                        isSelected
                          ? 'text-white/45'
                          : 'text-slate-400'
                      }
                    `}
                  >
                    DAY {day.dayNumber}
                  </p>


                  <p
                    className="
                      mt-1
                      text-[22px]
                      font-medium
                      leading-none
                    "
                  >
                    {info.day}
                  </p>


                  <p
                    className={`
                      mt-2
                      text-[8px]
                      font-semibold
                      tracking-[0.08em]

                      ${
                        isSelected
                          ? 'text-white/50'
                          : 'text-slate-400'
                      }
                    `}
                  >
                    {info.weekday}
                  </p>

                </button>

              )

            }
          )}

        </div>

      </section>



      {/* ======================================================
          Selected Day
      ====================================================== */}

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
            border-white/60
            bg-white/55
            shadow-sm
            backdrop-blur-2xl
          "
        >


          {/* Day Header */}

          <div
            className="
              px-5
              pb-5
              pt-5
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
                    tracking-[0.2em]
                    text-slate-400
                  "
                >
                  DAY {selectedDay.dayNumber}
                </p>


                <h2
                  className="
                    mt-2
                    text-[22px]
                    font-semibold
                    tracking-[-0.025em]
                    text-slate-950
                  "
                >
                  {
                    selectedDay.city ||
                    '行程尚未安排'
                  }
                </h2>


                <p
                  className="
                    mt-2
                    text-[11px]
                    text-slate-500
                  "
                >
                  {formatFullDate(
                    selectedDay.date
                  )}
                </p>


                {selectedDay.subtitle && (

                  <p
                    className="
                      mt-2
                      text-[11px]
                      text-slate-500
                    "
                  >
                    {selectedDay.subtitle}
                  </p>

                )}

              </div>


              <div
                className="
                  text-right
                "
              >

                <p
                  className="
                    text-[42px]
                    font-light
                    leading-none
                    tracking-[-0.06em]
                    text-slate-300
                  "
                >
                  {
                    String(
                      selectedDateInfo.day
                    ).padStart(
                      2,
                      '0'
                    )
                  }
                </p>


                <p
                  className="
                    mt-1
                    text-[9px]
                    font-semibold
                    tracking-[0.16em]
                    text-slate-400
                  "
                >
                  {
                    String(
                      selectedDateInfo.month
                    ).padStart(
                      2,
                      '0'
                    )
                  } / {
                    selectedDateInfo.weekday
                  }
                </p>

              </div>

            </div>

          </div>



          {/* ==================================================
              Timeline
          ================================================== */}

          <div
            className="
              border-t
              border-slate-200/70
              px-5
              py-5
            "
          >

            {selectedDay.activities.length > 0
              ? (

                <div>

                  {selectedDay.activities.map(
                    (
                      activity,
                      index
                    ) => (

                      <ActivityRow
                        key={
                          activity.id
                        }

                        activity={
                          activity
                        }

                        isLast={
                          index ===
                          selectedDay
                            .activities
                            .length - 1
                        }
                      />

                    )
                  )}

                </div>

              )
              : (

                <div
                  className="
                    py-5
                    text-center
                  "
                >

                  <div
                    className="
                      mx-auto
                      flex
                      h-12
                      w-12
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-slate-200/80
                      bg-white/55
                      text-[20px]
                      font-light
                      text-slate-400
                    "
                  >
                    +
                  </div>


                  <p
                    className="
                      mt-4
                      text-[14px]
                      font-medium
                      text-slate-700
                    "
                  >
                    這一天還沒有行程
                  </p>


                  <p
                    className="
                      mt-2
                      text-[11px]
                      leading-5
                      text-slate-400
                    "
                  >
                    後續可加入交通、景點、餐廳、
                    <br />
                    飯店與滑雪行程。
                  </p>

                </div>

              )
            }

          </div>

        </div>

      </section>



      {/* ======================================================
          Day Navigation
      ====================================================== */}

      <section
        className="
          mt-4
          grid
          grid-cols-2
          gap-3
        "
      >

        <button
          type="button"

          disabled={
            selectedDayIndex === 0
          }

          onClick={
            goPreviousDay
          }

          className="
            rounded-[18px]
            border
            border-white/60
            bg-white/40
            px-4
            py-3
            text-left
            backdrop-blur-xl
            transition
            active:scale-[0.98]
            disabled:opacity-30
          "
        >

          <p
            className="
              text-[8px]
              font-semibold
              tracking-[0.15em]
              text-slate-400
            "
          >
            PREVIOUS
          </p>


          <p
            className="
              mt-1
              text-[12px]
              font-medium
              text-slate-700
            "
          >
            ← 前一天
          </p>

        </button>



        <button
          type="button"

          disabled={
            selectedDayIndex ===
            tripDays.length - 1
          }

          onClick={
            goNextDay
          }

          className="
            rounded-[18px]
            border
            border-white/60
            bg-white/40
            px-4
            py-3
            text-right
            backdrop-blur-xl
            transition
            active:scale-[0.98]
            disabled:opacity-30
          "
        >

          <p
            className="
              text-[8px]
              font-semibold
              tracking-[0.15em]
              text-slate-400
            "
          >
            NEXT
          </p>


          <p
            className="
              mt-1
              text-[12px]
              font-medium
              text-slate-700
            "
          >
            後一天 →
          </p>

        </button>

      </section>

    </main>

  )
}


export default Trip