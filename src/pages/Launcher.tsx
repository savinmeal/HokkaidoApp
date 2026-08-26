import { useState } from 'react'

import ClockWidget from '../components/ClockWidget'
import SettingsPanel from '../components/SettingsPanel'

import launcherBg from '../assets/launcher-bg.png'
import hokkaidoIcon from '../assets/hokkaido-icon.png'

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

        {/* 背景遮罩 */}
        <div
          className="
            absolute
            inset-0
            bg-gradient-to-b
            from-white/10
            via-white/5
            to-slate-950/20
          "
        />

        {/* Main Content */}
        <div
          className="
            relative
            z-10
            flex
            min-h-screen
            flex-col
            px-6
            pb-10
            pt-10
          "
        >

          {/* Header */}
          <div className="flex items-start justify-between">

            <div>

              <ClockWidget />

            </div>

            <button
              onClick={() => setSettingsOpen(true)}
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-full
                border
                border-white/40
                bg-white/55
                text-lg
                shadow-sm
                backdrop-blur-xl
                transition
                active:scale-95
              "
            >
              ⚙
            </button>

          </div>


          {/* Featured Trip */}
          <button
            onClick={onOpenHokkaido}
            className="
              group
              relative
              mt-10
              w-full
              overflow-hidden
              rounded-[30px]
              border
              border-white/40
              bg-white/40
              p-5
              text-left
              shadow-xl
              shadow-slate-900/10
              backdrop-blur-xl
              transition
              duration-200
              active:scale-[0.985]
            "
          >

            <div className="flex items-center gap-4">

              <img
                src={hokkaidoIcon}
                alt="2026 北海道"
                className="
                  h-[72px]
                  w-[72px]
                  rounded-[22px]
                  object-cover
                  shadow-lg
                  shadow-blue-900/20
                "
              />

              <div className="min-w-0 flex-1">

                <p
                  className="
                    text-[10px]
                    font-medium
                    tracking-[0.22em]
                    text-slate-600
                  "
                >
                  2026 · JAPAN
                </p>

                <h2
                  className="
                    mt-1
                    text-[24px]
                    font-semibold
                    tracking-[-0.02em]
                    text-slate-900
                  "
                >
                  北海道
                </h2>

                <p
                  className="
                    mt-1
                    text-sm
                    text-slate-600
                  "
                >
                  Winter road trip
                </p>

              </div>

              <div
                className="
                  text-2xl
                  text-slate-500
                  transition
                  group-hover:translate-x-1
                "
              >
                ›
              </div>

            </div>

          </button>


          {/* Travel Apps */}
          <div className="mt-10">

            <div className="flex items-center justify-between">

              <h2
                className="
                  text-[15px]
                  font-semibold
                  text-slate-900
                "
              >
                我的旅行
              </h2>

              <span
                className="
                  text-[11px]
                  text-slate-600
                "
              >
                1 Journey
              </span>

            </div>


            <div
              className="
                mt-5
                grid
                grid-cols-4
                gap-x-4
                gap-y-7
              "
            >

              {/* Hokkaido */}
              <button
                onClick={onOpenHokkaido}
                className="
                  group
                  flex
                  flex-col
                  items-center
                  text-center
                "
              >

                <img
                  src={hokkaidoIcon}
                  alt="2026 北海道"
                  className="
                    h-[72px]
                    w-[72px]
                    rounded-[22px]
                    object-cover
                    shadow-lg
                    shadow-blue-900/20
                    transition
                    group-active:scale-95
                  "
                />

                <span
                  className="
                    mt-2
                    text-[12px]
                    font-medium
                    leading-4
                    text-slate-800
                  "
                >
                  北海道
                </span>

              </button>


              {/* New Trip */}
              <button
                className="
                  flex
                  flex-col
                  items-center
                  text-center
                "
              >

                <div
                  className="
                    flex
                    h-[72px]
                    w-[72px]
                    items-center
                    justify-center
                    rounded-[22px]
                    border
                    border-white/60
                    bg-white/45
                    text-2xl
                    font-light
                    text-slate-500
                    shadow-sm
                    backdrop-blur-lg
                  "
                >
                  +
                </div>

                <span
                  className="
                    mt-2
                    text-[12px]
                    font-medium
                    text-slate-700
                  "
                >
                  新旅行
                </span>

              </button>

            </div>

          </div>


          {/* Spacer */}
          <div className="flex-1" />


          {/* Quick Access */}
          <div>

            <p
              className="
                mb-4
                text-[11px]
                font-medium
                tracking-[0.22em]
                text-slate-700/70
              "
            >
              QUICK ACCESS
            </p>

            <div className="grid grid-cols-2 gap-3">

              <button
                className="
                  flex
                  items-center
                  gap-3
                  rounded-[22px]
                  border
                  border-white/50
                  bg-white/50
                  p-4
                  text-left
                  shadow-sm
                  backdrop-blur-xl
                  transition
                  active:scale-[0.98]
                "
              >

                <div
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-[14px]
                    bg-white/70
                    text-lg
                  "
                >
                  🗺
                </div>

                <div>

                  <p
                    className="
                      text-[11px]
                      text-slate-600
                    "
                  >
                    Map
                  </p>

                  <p
                    className="
                      text-sm
                      font-semibold
                      text-slate-900
                    "
                  >
                    我的足跡
                  </p>

                </div>

              </button>


              <button
                className="
                  flex
                  items-center
                  gap-3
                  rounded-[22px]
                  border
                  border-white/50
                  bg-white/50
                  p-4
                  text-left
                  shadow-sm
                  backdrop-blur-xl
                  transition
                  active:scale-[0.98]
                "
              >

                <div
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-[14px]
                    bg-white/70
                    text-lg
                  "
                >
                  ◉
                </div>

                <div>

                  <p
                    className="
                      text-[11px]
                      text-slate-600
                    "
                  >
                    Memory
                  </p>

                  <p
                    className="
                      text-sm
                      font-semibold
                      text-slate-900
                    "
                  >
                    旅行回憶
                  </p>

                </div>

              </button>

            </div>

          </div>

        </div>


        {/* Settings */}
        <SettingsPanel
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
        />

      </main>

    </div>
  )
}

export default Launcher