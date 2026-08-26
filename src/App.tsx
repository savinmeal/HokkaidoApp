import { useState } from 'react'

import Landing from './pages/Landing'
import Launcher from './pages/Launcher'
import TripApp from './TripApp'

type Screen =
  | 'landing'
  | 'launcher'
  | 'hokkaido'

function App() {

  const [screen, setScreen] =
    useState<Screen>('landing')

  const [landingExit, setLandingExit] =
    useState(false)

  // ------------------------------------------------------------
  // Landing → Launcher
  // ------------------------------------------------------------
  const handleEnterLauncher = () => {

    // 啟動轉場動畫
    setLandingExit(true)

    // 動畫結束後正式切換頁面
    window.setTimeout(() => {

      setScreen('launcher')

      // 重設狀態
      setLandingExit(false)

    }, 550)
  }

  // ------------------------------------------------------------
  // Hokkaido App
  // ------------------------------------------------------------
  if (screen === 'hokkaido') {

    return (
      <TripApp
        onExit={() =>
          setScreen('launcher')
        }
      />
    )
  }

  // ------------------------------------------------------------
  // Launcher
  // ------------------------------------------------------------
  if (screen === 'launcher') {

    return (
      <Launcher
        onOpenHokkaido={() =>
          setScreen('hokkaido')
        }
      />
    )
  }

  // ------------------------------------------------------------
  // Landing
  // ------------------------------------------------------------
  return (
    <div
      className="
        relative
        min-h-screen
        overflow-hidden
        bg-slate-950
      "
    >

      {/* Launcher 預先放在 Landing 後面 */}
      <div
        className={`
          absolute
          inset-0
          transition-all
          duration-500
          ease-out

          ${
            landingExit
              ? `
                  translate-y-0
                  scale-100
                  opacity-100
                `
              : `
                  translate-y-8
                  scale-[0.985]
                  opacity-0
                `
          }
        `}
      >
        <Launcher
          onOpenHokkaido={() =>
            setScreen('hokkaido')
          }
        />
      </div>


      {/* Landing */}
      <div
        className={`
          relative
          z-10

          transition-all
          duration-400
          ease-out

          ${
            landingExit
              ? `
                  scale-[1.04]
                  opacity-0
                `
              : `
                  scale-100
                  opacity-100
                `
          }
        `}
      >
        <Landing
          onEnter={handleEnterLauncher}
        />
      </div>

    </div>
  )
}

export default App