import { tripInfo } from '../data/tripData'


function Home() {

  // ------------------------------------------------------------
  // Countdown
  // ------------------------------------------------------------
  const today = new Date()

  const startDate = new Date(
    `${tripInfo.startDate}T00:00:00`
  )

  const difference =
    startDate.getTime() -
    today.getTime()

  const daysUntilTrip = Math.max(
    0,
    Math.ceil(
      difference /
      (1000 * 60 * 60 * 24)
    )
  )


  // ------------------------------------------------------------
  // 日期顯示
  // ------------------------------------------------------------
  const startDisplay = '12.25'
  const endDisplay = '01.02'


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

      {/* ======================================================
          Trip Header
      ====================================================== */}

      <section>

        <p
          className="
            text-[10px]
            font-semibold
            tracking-[0.28em]
            text-slate-500
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
                text-slate-500
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
              text-slate-500
            "
          >
            HOKKAIDO
            <br />
            JAPAN
          </div>

        </div>

      </section>



      {/* ======================================================
          Countdown
      ====================================================== */}

      <section
        className="
          relative
          mt-8
          overflow-hidden
          rounded-[28px]
          bg-slate-950
          px-6
          py-6
          text-white
          shadow-xl
          shadow-slate-900/10
        "
      >

        {/* Decoration */}
        <div
          className="
            absolute
            -right-12
            -top-12
            h-36
            w-36
            rounded-full
            bg-blue-400/20
            blur-3xl
          "
        />


        <div className="relative z-10">

          <p
            className="
              text-[10px]
              font-medium
              tracking-[0.24em]
              text-white/50
            "
          >
            NEXT JOURNEY
          </p>


          <div
            className="
              mt-5
              flex
              items-end
              justify-between
            "
          >

            <div>

              <p
                className="
                  text-[64px]
                  font-light
                  leading-[0.9]
                  tracking-[-0.06em]
                "
              >
                {daysUntilTrip}
              </p>


              <p
                className="
                  mt-3
                  text-[11px]
                  font-medium
                  tracking-[0.24em]
                  text-white/50
                "
              >
                DAYS TO GO
              </p>

            </div>


            <div className="pb-1 text-right">

              <p
                className="
                  text-[12px]
                  text-white/50
                "
              >
                出發
              </p>

              <p
                className="
                  mt-1
                  text-[16px]
                  font-medium
                "
              >
                2026.12.25
              </p>

            </div>

          </div>

        </div>

      </section>



      {/* ======================================================
          Trip Status
      ====================================================== */}

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
              text-slate-400
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
            border-slate-200
            bg-white
          "
        >

          {/* 行程 */}
          <button
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
                  text-slate-400
                "
              >
                尚未完成
              </p>

            </div>


            <span
              className="
                text-xl
                font-light
                text-slate-300
              "
            >
              ›
            </span>

          </button>


          <div
            className="
              ml-5
              h-px
              bg-slate-100
            "
          />


          {/* GPS */}
          <button
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
                  text-slate-400
                "
              >
                尚未開始
              </p>

            </div>


            <span
              className="
                text-xl
                font-light
                text-slate-300
              "
            >
              ›
            </span>

          </button>


          <div
            className="
              ml-5
              h-px
              bg-slate-100
            "
          />


          {/* Memory */}
          <button
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
                  text-slate-400
                "
              >
                等待旅程開始
              </p>

            </div>


            <span
              className="
                text-xl
                font-light
                text-slate-300
              "
            >
              ›
            </span>

          </button>

        </div>

      </section>



      {/* ======================================================
          Planning
      ====================================================== */}

      <section className="mt-10">

        <p
          className="
            text-[10px]
            font-medium
            tracking-[0.22em]
            text-slate-400
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

          {/* Mission */}
          <button
            className="
              rounded-[22px]
              bg-slate-200/70
              p-5
              text-left
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


          {/* Saved Places */}
          <button
            className="
              rounded-[22px]
              bg-slate-900
              p-5
              text-left
              text-white
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

    </main>
  )
}

export default Home