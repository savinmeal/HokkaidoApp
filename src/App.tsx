import { useState } from 'react'

import Landing from './pages/Landing'
import Launcher from './pages/Launcher'
import TripApp from './TripApp'

type AppStage =
  | 'landing'
  | 'landingToLauncher'
  | 'launcher'
  | 'launcherToHokkaido'
  | 'hokkaido'

function App() {

  const [stage, setStage] =
    useState<AppStage>('landing')

  // ------------------------------------------------------------
  // Landing → Launcher
  // ------------------------------------------------------------
  const handleEnterLauncher = () => {

    setStage('landingToLauncher')

    window.setTimeout(() => {
      setStage('launcher')
    }, 420)
  }


  // ------------------------------------------------------------
  // Launcher → Hokkaido
  // ------------------------------------------------------------
  const handleOpenHokkaido = () => {

    setStage('launcherToHokkaido')

    window.setTimeout(() => {
      setStage('hokkaido')
    }, 420)
  }


  // ------------------------------------------------------------
  // Hokkaido → Launcher
  // ------------------------------------------------------------
  const handleExitHokkaido = () => {

    setStage('launcher')
  }


  // ============================================================
  // Hokkaido
  // ============================================================
  if (stage === 'hokkaido') {

    return (
      <TripApp
        onExit={handleExitHokkaido}
      />
    )
  }


  const isLanding =
    stage === 'landing'

  const isLandingTransition =
    stage === 'landingToLauncher'

  const isLauncher =
    stage === 'launcher'

  const isLauncherTransition =
    stage === 'launcherToHokkaido'


  return (
    <div
      className="
        relative
        min-h-screen
        overflow-hidden
        bg-slate-950
      "
    >

      {/* ======================================================
          Launcher
          
          重點：
          從 Landing 開始它就一直是同一個 Launcher。
          不會在轉場完成後重新 mount。
      ====================================================== */}
      <div
        className={`
          absolute
          inset-0

          transition-all
          duration-[400ms]
          ease-out

          ${
            isLanding
              ? `
                  translate-y-6
                  scale-[0.985]
                  opacity-0
                `
              : isLandingTransition
              ? `
                  translate-y-0
                  scale-100
                  opacity-100
                `
              : isLauncherTransition
              ? `
                  -translate-x-3
                  scale-[0.97]
                  opacity-0
                `
              : `
                  translate-x-0
                  translate-y-0
                  scale-100
                  opacity-100
                `
          }
        `}
      >

        <Launcher
          onOpenHokkaido={
            handleOpenHokkaido
          }
        />

      </div>


      {/* ======================================================
          Landing
      ====================================================== */}
      {(isLanding || isLandingTransition) && (

        <div
          className={`
            relative
            z-20

            transition-all
            duration-[400ms]
            ease-out

            ${
              isLandingTransition
                ? `
                    scale-[1.03]
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
            onEnter={
              handleEnterLauncher
            }
          />

        </div>

      )}


      {/* ======================================================
          TripApp Transition Layer
      ====================================================== */}
      {isLauncherTransition && (

        <div
          className="
            absolute
            inset-0
            z-30

            animate-[tripEnter_400ms_ease-out_forwards]
          "
          style={{
            animation: 'tripEnter 400ms ease-out forwards',
          }}
        >

          <TripApp
            onExit={handleExitHokkaido}
          />

        </div>

      )}

    </div>
  )
}

export default App