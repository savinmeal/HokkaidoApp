import ClockWidget from '../components/ClockWidget'
import launcherBg from '../assets/launcher-bg.png'
import hokkaidoIcon from '../assets/hokkaido-icon.png'
import { useState } from 'react'
import SettingsPanel from '../components/SettingsPanel'


type LauncherProps = {
  onOpenHokkaido: () => void
}

function Launcher({
  onOpenHokkaido,
}: LauncherProps) {

  const [settingsOpen, setSettingsOpen] = useState(false)
  return (
    <div className="min-h-screen bg-slate-950">


      <main
        className="
          relative
          mx-auto
          min-h-screen
          w-full
          max-w-md
          overflow-hidden
          bg-cover
          bg-center
        "
        style={{
          backgroundImage: `url(${launcherBg})`,
        }}
      >

        {/* 背景淡色遮罩 */}
        <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px]" />

        {/* Background Decoration */}
        <div className="absolute -right-20 top-20 h-72 w-72 rounded-full bg-white/50 blur-3xl" />
        <div className="absolute -left-20 bottom-10 h-72 w-72 rounded-full bg-blue-200/50 blur-3xl" />

        {/* Main Content */}
        <div className="relative z-10 px-5 pb-10 pt-10">

          {/* Top */}
          <div className="flex items-start justify-between">

            <div>
              <ClockWidget />

              <h2 className="mt-3 text-xl font-bold text-slate-900">
                My Travel
              </h2>
            </div>

            <button
            onClick={() => setSettingsOpen(true)}
            className="
                flex h-11 w-11
                items-center justify-center
                rounded-full
                bg-white/70
                text-xl
                shadow-sm
                backdrop-blur
                transition
                active:scale-95
            "
            >
            ⚙️
            </button>

          </div>

          {/* Main Widget */}
          <div
            className="
              mt-8
              overflow-hidden
              rounded-[32px]
              bg-slate-900
              p-6
              text-white
              shadow-xl
              shadow-slate-900/15
            "
          >

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

              <img
                src={hokkaidoIcon}
                alt="北海道"
                className="
                  h-14 w-14
                  rounded-2xl
                  object-cover
                  shadow-md
                "
              />

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

              <span className="text-xs text-slate-500">
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

                <img
                  src={hokkaidoIcon}
                  alt="2026 北海道"
                  className="
                    h-[76px] w-[76px]
                    rounded-[24px]
                    object-cover
                    shadow-lg
                    shadow-blue-500/20
                    transition
                    group-active:scale-95
                  "
                />

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

                <div
                  className="
                    flex h-[76px] w-[76px]
                    items-center justify-center
                    rounded-[24px]
                    border border-white/80
                    bg-white/60
                    text-3xl
                    text-slate-400
                    shadow-sm
                    backdrop-blur
                  "
                >
                  +
                </div>

                <span className="mt-2 text-xs font-medium text-slate-600">
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

              <button
                className="
                  flex items-center gap-3
                  rounded-2xl
                  bg-white/70
                  p-4
                  text-left
                  shadow-sm
                  backdrop-blur
                "
              >

                <div
                  className="
                    flex h-10 w-10
                    items-center justify-center
                    rounded-xl
                    bg-slate-100
                    text-xl
                  "
                >
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

              <button
                className="
                  flex items-center gap-3
                  rounded-2xl
                  bg-white/70
                  p-4
                  text-left
                  shadow-sm
                  backdrop-blur
                "
              >

                <div
                  className="
                    flex h-10 w-10
                    items-center justify-center
                    rounded-xl
                    bg-slate-100
                    text-xl
                  "
                >
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
          {/* Setting Panels */}
          <SettingsPanel
            open={settingsOpen}
            onClose={() => setSettingsOpen(false)}
          />

        </div>

      </main>

    </div>
  )
}

export default Launcher