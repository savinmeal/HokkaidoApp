type LauncherProps = {
  onOpenHokkaido: () => void
}

function Launcher({
  onOpenHokkaido,
}: LauncherProps) {

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-sky-200 via-slate-100 to-white">

      {/* Background Decoration */}
      <div className="absolute -right-20 top-20 h-72 w-72 rounded-full bg-white/50 blur-3xl" />
      <div className="absolute -left-20 bottom-10 h-72 w-72 rounded-full bg-blue-200/50 blur-3xl" />

      <div className="relative z-10 mx-auto w-full max-w-md px-5 pb-10 pt-10">

        {/* Top */}
        <div className="flex items-start justify-between">

          <div>
            <p className="text-sm font-medium text-slate-500">
              Good Morning
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              My Travel
            </h1>
          </div>

          <button
            className="
              flex h-11 w-11
              items-center justify-center
              rounded-full bg-white/70
              text-xl shadow-sm
              backdrop-blur
            "
          >
            ⚙️
          </button>

        </div>

        {/* Main Widget */}
        <div className="
          mt-8 overflow-hidden
          rounded-[32px]
          bg-slate-900
          p-6 text-white
          shadow-xl shadow-slate-900/15
        ">

          <div className="flex items-start justify-between">

            <div>
              <p className="text-sm text-slate-400">
                NEXT JOURNEY
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                北海道
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Japan · Winter Trip
              </p>
            </div>

            <div className="
              flex h-14 w-14
              items-center justify-center
              rounded-2xl bg-white/10
              text-3xl
            ">
              ❄️
            </div>

          </div>

          <div className="mt-8 grid grid-cols-3 gap-3">

            <div className="rounded-2xl bg-white/10 p-3">
              <p className="text-xs text-slate-400">
                YEAR
              </p>
              <p className="mt-1 font-semibold">
                2026
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-3">
              <p className="text-xs text-slate-400">
                STYLE
              </p>
              <p className="mt-1 font-semibold">
                🚗 自駕
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-3">
              <p className="text-xs text-slate-400">
                SEASON
              </p>
              <p className="mt-1 font-semibold">
                ❄️ 冬季
              </p>
            </div>

          </div>

        </div>

        {/* Apps */}
        <div className="mt-10">

          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              我的旅行
            </h2>

            <span className="text-xs text-slate-400">
              1 Journey
            </span>
          </div>

          <div className="mt-6 grid grid-cols-4 gap-x-4 gap-y-7">

            {/* Hokkaido */}
            <button
              onClick={onOpenHokkaido}
              className="
                group
                flex flex-col
                items-center
                text-center
              "
            >

              <div className="
                relative
                flex h-[76px] w-[76px]
                items-center justify-center
                overflow-hidden
                rounded-[24px]
                bg-gradient-to-br
                from-cyan-300
                via-blue-500
                to-indigo-700
                text-4xl
                shadow-lg shadow-blue-500/20
                transition
                group-active:scale-95
              ">

                <div className="absolute bottom-0 h-8 w-full bg-white/20" />

                <span className="relative z-10">
                  ❄️
                </span>

              </div>

              <span className="mt-2 text-xs font-semibold leading-4 text-slate-800">
                2026
                <br />
                北海道
              </span>

            </button>

            {/* New Trip */}
            <button
              className="
                flex flex-col
                items-center
                text-center
              "
            >

              <div className="
                flex h-[76px] w-[76px]
                items-center justify-center
                rounded-[24px]
                border border-white/80
                bg-white/60
                text-3xl
                text-slate-400
                shadow-sm
                backdrop-blur
              ">
                +
              </div>

              <span className="mt-2 text-xs font-medium text-slate-500">
                新旅行
              </span>

            </button>

          </div>

        </div>

        {/* Quick Tools */}
        <div className="mt-12">

          <h2 className="text-lg font-bold text-slate-900">
            快速工具
          </h2>

          <div className="mt-4 grid grid-cols-2 gap-3">

            <button className="
              flex items-center gap-3
              rounded-2xl bg-white/70
              p-4 text-left
              shadow-sm backdrop-blur
            ">

              <div className="
                flex h-10 w-10
                items-center justify-center
                rounded-xl bg-slate-100
                text-xl
              ">
                🗺️
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  MAP
                </p>
                <p className="font-semibold text-slate-800">
                  我的足跡
                </p>
              </div>

            </button>

            <button className="
              flex items-center gap-3
              rounded-2xl bg-white/70
              p-4 text-left
              shadow-sm backdrop-blur
            ">

              <div className="
                flex h-10 w-10
                items-center justify-center
                rounded-xl bg-slate-100
                text-xl
              ">
                📷
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  MEMORY
                </p>
                <p className="font-semibold text-slate-800">
                  旅行回憶
                </p>
              </div>

            </button>

          </div>

        </div>

      </div>
    </main>
  )
}

export default Launcher