function SkiTrackCard() {

  return (

    <section
      className="
        mt-5
        overflow-hidden
        rounded-[28px]
        bg-slate-950
        px-5
        py-5
        text-white
        shadow-xl
        shadow-slate-900/15
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
              text-white/55
            "
          >
            SKI TRACK
          </p>


          <h2
            className="
              mt-1
              text-[17px]
              font-semibold
              tracking-[-0.02em]
              text-white/90
            "
          >
            雪場軌跡紀錄
          </h2>

        </div>


        <div
          className="
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-full
            border
            border-white/10
            bg-white/5
            text-white/60
          "
        >

          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 18c3-6 4-10 8-13" />
            <path d="M10 19c2-5 4-8 9-11" />
            <circle cx="7" cy="7" r="2" />
          </svg>

        </div>

      </div>


      <div
        className="
          relative
          mt-5
          flex
          min-h-[185px]
          items-center
          justify-center
          overflow-hidden
          rounded-[22px]
          border
          border-white/10
          bg-white/[0.035]
          text-center
        "
      >

        <div
          className="
            pointer-events-none
            absolute
            -right-10
            -top-12
            h-36
            w-36
            rounded-full
            bg-sky-400/15
            blur-3xl
          "
        />


        <div
          className="
            relative
            z-10
            px-6
          "
        >

          <p
            className="
              text-[28px]
              font-light
              text-white/30
            "
          >
            ◌
          </p>


          <p
            className="
              mt-3
              text-[13px]
              font-semibold
              tracking-[0.03em]
              text-white/75
            "
          >
            待開發中
          </p>


          <p
            className="
              mt-2
              text-[9px]
              leading-5
              text-white/40
            "
          >
            預計紀錄滑雪趟數、路徑、
            <br />
            Top Speed 與雪場活動資訊
          </p>

        </div>

      </div>

    </section>

  )

}


export default SkiTrackCard