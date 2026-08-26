import { useState } from 'react'

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

  const [stage, setStage] =
    useState<AppStage>('landing')


  // ============================================================
  // Landing → Launcher
  // ============================================================
  const handleEnterLauncher = () => {

    setStage('landingToLauncher')

    window.setTimeout(() => {

      setStage('launcher')

    }, 420)
  }


  // ============================================================
  // Launcher → Trip
  //
  // Step 1:
  // 先把 TripApp 建立在畫面下方
  //
  // Step 2:
  // 下一個 browser frame 才開始往上移
  //
  // 這樣瀏覽器才能真正看到 transition
  // ============================================================
  const handleOpenHokkaido = () => {

    // 先 mount
    setStage('tripPreparing')


    // 等 browser render 初始位置
    window.requestAnimationFrame(() => {

      window.requestAnimationFrame(() => {

        // 開始由下往上
        setStage('tripEntering')

      })

    })


    // 動畫完成
    window.setTimeout(() => {

      setStage('trip')

    }, 430)
  }


  // ============================================================
  // Trip → Launcher
  //
  // 往下滑 + Fade Out
  // ============================================================
  const handleExitHokkaido = () => {

    setStage('tripLeaving')

    window.setTimeout(() => {

      setStage('launcher')

    }, 420)
  }


  // ============================================================
  // State
  // ============================================================

  const isLanding =
    stage === 'landing'

  const isLandingToLauncher =
    stage === 'landingToLauncher'


  const showTrip =
    stage === 'tripPreparing' ||
    stage === 'tripEntering' ||
    stage === 'trip' ||
    stage === 'tripLeaving'


  const isTripPreparing =
    stage === 'tripPreparing'

  const isTripEntering =
    stage === 'tripEntering'

  const isTrip =
    stage === 'trip'

  const isTripLeaving =
    stage === 'tripLeaving'


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
          LAUNCHER

          Landing 時：
          Launcher 放在稍微下面並透明

          Landing → Launcher：
          Launcher 由下往上 Fade In

          Trip 開啟後：
          Launcher 留在背景
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
                  translate-y-10
                  opacity-0
                `
              : isLandingToLauncher
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



      {/* ======================================================
          LANDING

          Landing → Launcher：
          Landing 自己 Fade Out

          Launcher 從下面進來
      ====================================================== */}

      {(isLanding || isLandingToLauncher) && (

        <div
          className={`
            relative
            z-30

            transition-all
            duration-[400ms]
            ease-out

            ${
              isLandingToLauncher
                ? `
                    -translate-y-3
                    opacity-0
                  `
                : `
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

      )}



      {/* ======================================================
          TRIP APP

          tripPreparing
          ↓
          在畫面下方 + 透明

          tripEntering
          ↓
          往上滑 + Fade In

          trip
          ↓
          正常顯示

          tripLeaving
          ↓
          往下滑 + Fade Out
      ====================================================== */}

      {showTrip && (

        <div
          className={`
            absolute
            inset-0
            z-40

            transition-all
            duration-[400ms]
            ease-out

            ${
              isTripPreparing
                ? `
                    translate-y-8
                    opacity-0
                  `

              : isTripEntering
                ? `
                    translate-y-0
                    opacity-100
                  `

              : isTrip
                ? `
                    translate-y-0
                    opacity-100
                  `

              : isTripLeaving
                ? `
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

      )}

    </div>
  )
}

export default App