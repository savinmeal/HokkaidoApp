import {
  useState,
} from 'react'

import './App.css'

import Landing from './pages/Landing'
import Launcher from './pages/Launcher'
import TripApp from './TripApp'


type AppStage =
  | 'landing'
  | 'landingToLauncher'
  | 'launcher'
  | 'tripPreparing'
  | 'tripEntering'
  | 'trip'
  | 'tripLeaving'


function App() {

  const [
    stage,
    setStage,
  ] = useState<AppStage>(
    'landing'
  )


  // ============================================================
  // Landing → Launcher
  // ============================================================

  const handleEnterLauncher =
    () => {

      setStage(
        'landingToLauncher'
      )


      window.setTimeout(
        () => {

          setStage(
            'launcher'
          )

        },
        420
      )

    }


  // ============================================================
  // Launcher → Trip
  // ============================================================

  const handleOpenHokkaido =
    () => {

      setStage(
        'tripPreparing'
      )


      window.requestAnimationFrame(
        () => {

          window.requestAnimationFrame(
            () => {

              setStage(
                'tripEntering'
              )

            }
          )

        }
      )


      window.setTimeout(
        () => {

          setStage(
            'trip'
          )

        },
        430
      )

    }


  // ============================================================
  // Trip → Launcher
  // ============================================================

  const handleExitHokkaido =
    () => {

      setStage(
        'tripLeaving'
      )


      window.setTimeout(
        () => {

          setStage(
            'launcher'
          )

        },
        420
      )

    }


  // ============================================================
  // Stage
  // ============================================================

  const isLanding =
    stage ===
    'landing'


  const isLandingToLauncher =
    stage ===
    'landingToLauncher'


  const showLauncher =
    stage !==
    'landing'


  const showTrip =
    stage ===
      'tripPreparing' ||
    stage ===
      'tripEntering' ||
    stage ===
      'trip' ||
    stage ===
      'tripLeaving'


  const isTripPreparing =
    stage ===
    'tripPreparing'


  const isTripEntering =
    stage ===
    'tripEntering'


  const isTrip =
    stage ===
    'trip'


  const isTripLeaving =
    stage ===
    'tripLeaving'


  // ============================================================
  // Render
  // ============================================================

  return (

    <div
      className="
        relative
        h-[100dvh]
        w-full
        overflow-hidden
        bg-slate-950
      "
    >

      {/* ======================================================
          LAUNCHER

          ★ 初始 landing 階段完全不 mount Launcher。
          因此第一頁不可能穿透看到 Launcher。

          landingToLauncher 才 mount 到 Landing 後方，
          以保留原本淡入效果。
      ====================================================== */}

      {
        showLauncher && (

          <div
            className={`
              absolute
              inset-0
              z-10
              h-full
              w-full
              overflow-hidden

              transition-all
              duration-[400ms]
              ease-out

              ${
                isLandingToLauncher
                  ? `
                      translate-y-0
                      opacity-100
                    `
                  : `
                      translate-y-0
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

        )
      }


      {/* ======================================================
          LANDING
      ====================================================== */}

      {
        (
          isLanding ||
          isLandingToLauncher
        ) && (

          <div
            className={`
              absolute
              inset-0
              z-30
              h-full
              w-full
              overflow-hidden

              transition-all
              duration-[400ms]
              ease-out

              ${
                isLandingToLauncher
                  ? `
                      pointer-events-none
                      -translate-y-3
                      opacity-0
                    `
                  : `
                      pointer-events-auto
                      translate-y-0
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

        )
      }


      {/* ======================================================
          TRIP APP
      ====================================================== */}

      {
        showTrip && (

          <div
            className={`
              absolute
              inset-0
              z-40
              h-full
              w-full
              overflow-hidden
              bg-slate-950

              transition-all
              duration-[400ms]
              ease-out

              ${
                isTripPreparing
                  ? `
                      pointer-events-none
                      translate-y-8
                      opacity-0
                    `

                : isTripEntering
                  ? `
                      pointer-events-auto
                      translate-y-0
                      opacity-100
                    `

                : isTrip
                  ? `
                      pointer-events-auto
                      translate-y-0
                      opacity-100
                    `

                : isTripLeaving
                  ? `
                      pointer-events-none
                      translate-y-8
                      opacity-0
                    `

                : ''
              }
            `}
          >

            <TripApp
              onExit={
                handleExitHokkaido
              }
            />

          </div>

        )
      }

    </div>

  )

}


export default App
