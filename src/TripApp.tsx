import {
  useRef,
  useState,
} from 'react'

import Home from './pages/home'
import Trip from './pages/Trip'
import Map from './pages/map'
import Memory from './pages/memory'
import More from './pages/more'

import BottomNavigation from './components/BottomNavigation'

import launcherBg from './assets/launcher-bg.png'


// ============================================================
// Props
// ============================================================

type TripAppProps = {
  onExit: () => void
}


// ============================================================
// Gesture
// ============================================================

type GestureDirection =
  | 'horizontal'
  | 'vertical'
  | null


// ============================================================
// Trip App
// ============================================================

function TripApp({
  onExit,
}: TripAppProps) {


  // ==========================================================
  // Page
  // ==========================================================

  const [activePage, setActivePage] =
    useState('home')



  // ==========================================================
  // Swipe Back
  // ==========================================================

  const appRef =
    useRef<HTMLDivElement>(null)


  const [swipeX, setSwipeX] =
    useState(0)


  const [isSwiping, setIsSwiping] =
    useState(false)


  const gestureRef = useRef({

    startX: 0,

    startY: 0,

    direction:
      null as GestureDirection,

    active: false,

  })



  // ==========================================================
  // Page Render
  // ==========================================================

  const renderPage = () => {

    switch (activePage) {

      case 'home':
        return <Home />

      case 'trip':
        return <Trip />

      case 'map':
        return <Map />

      case 'memory':
        return <Memory />

      case 'more':
        return <More />

      default:
        return <Home />

    }

  }



  // ==========================================================
  // Pointer Down
  // ==========================================================

  const handlePointerDown = (
    event: React.PointerEvent<HTMLDivElement>
  ) => {

    // 滑鼠只接受左鍵
    if (
      event.pointerType === 'mouse' &&
      event.button !== 0
    ) {
      return
    }


    gestureRef.current = {

      startX:
        event.clientX,

      startY:
        event.clientY,

      direction:
        null,

      active:
        true,

    }


    setIsSwiping(false)

  }



  // ==========================================================
  // Pointer Move
  // ==========================================================

  const handlePointerMove = (
    event: React.PointerEvent<HTMLDivElement>
  ) => {

    if (
      !gestureRef.current.active
    ) {
      return
    }


    const dx =
      event.clientX -
      gestureRef.current.startX


    const dy =
      event.clientY -
      gestureRef.current.startY


    const absX =
      Math.abs(dx)


    const absY =
      Math.abs(dy)



    // --------------------------------------------------------
    // Direction Lock
    //
    // 移動超過 8px 才開始判斷方向
    // --------------------------------------------------------

    if (
      gestureRef.current.direction ===
      null
    ) {

      if (
        absX < 8 &&
        absY < 8
      ) {
        return
      }


      // 水平移動明顯大於垂直
      if (
        absX >
        absY * 1.15
      ) {

        gestureRef.current.direction =
          'horizontal'

      } else {

        gestureRef.current.direction =
          'vertical'

      }

    }



    // --------------------------------------------------------
    // Vertical
    //
    // 上下操作交給原本的 Scroll
    // --------------------------------------------------------

    if (
      gestureRef.current.direction ===
      'vertical'
    ) {
      return
    }



    // --------------------------------------------------------
    // 不接受往左滑
    // --------------------------------------------------------

    if (
      dx <= 0
    ) {

      setSwipeX(0)

      return
    }



    // --------------------------------------------------------
    // 右滑
    // --------------------------------------------------------

    const appWidth =
      appRef.current?.clientWidth ??
      window.innerWidth


    // 防止超過整個 App 寬度
    const limitedX =
      Math.min(
        dx,
        appWidth
      )


    setIsSwiping(true)

    setSwipeX(limitedX)

  }



  // ==========================================================
  // Pointer Up
  // ==========================================================

  const handlePointerUp = () => {

    if (
      !gestureRef.current.active
    ) {
      return
    }


    gestureRef.current.active =
      false



    // --------------------------------------------------------
    // 如果剛剛是上下 Scroll
    // 不做任何返回
    // --------------------------------------------------------

    if (
      gestureRef.current.direction !==
      'horizontal'
    ) {

      gestureRef.current.direction =
        null

      return

    }



    const appWidth =
      appRef.current?.clientWidth ??
      window.innerWidth


    // --------------------------------------------------------
    // 返回門檻
    //
    // App 寬度 25%
    // --------------------------------------------------------

    const threshold =
      appWidth * 0.25



    // --------------------------------------------------------
    // Swipe Success
    // --------------------------------------------------------

    if (
      swipeX >= threshold
    ) {

      setIsSwiping(false)


      // 先將整個 App 滑到右邊
      setSwipeX(appWidth)


      window.setTimeout(() => {

        onExit()

      }, 220)


      return

    }



    // --------------------------------------------------------
    // Swipe Cancel
    //
    // 沒滑夠 → 彈回原位
    // --------------------------------------------------------

    setIsSwiping(false)

    setSwipeX(0)

    gestureRef.current.direction =
      null

  }



  // ==========================================================
  // Pointer Cancel
  // ==========================================================

  const handlePointerCancel = () => {

    gestureRef.current.active =
      false

    gestureRef.current.direction =
      null

    setIsSwiping(false)

    setSwipeX(0)

  }



  // ==========================================================
  // Swipe Opacity
  // ==========================================================

  const appWidth =
    appRef.current?.clientWidth ??
    448


  const swipeProgress =
    Math.min(
      swipeX / appWidth,
      1
    )


  const opacity =
    1 -
    swipeProgress * 0.12



  // ==========================================================
  // Render
  // ==========================================================

  return (

    <div
      ref={appRef}

      onPointerDown={
        handlePointerDown
      }

      onPointerMove={
        handlePointerMove
      }

      onPointerUp={
        handlePointerUp
      }

      onPointerCancel={
        handlePointerCancel
      }

      className="
        relative
        mx-auto
        flex
        h-[100dvh]
        w-full
        max-w-md
        flex-col
        overflow-hidden
        shadow-2xl
        shadow-black/20
      "

      style={{

        // 上下 Scroll 保留原生行為
        touchAction:
          'pan-y',

        // 整個 App 跟著右滑
        transform:
          `translateX(${swipeX}px)`,

        opacity,

        // 拖曳時跟手
        // 放手後才加入動畫
        transition:
          isSwiping
            ? 'none'
            : `
                transform 300ms
                cubic-bezier(0.22, 1, 0.36, 1),
                opacity 300ms ease
              `,

      }}
    >


      {/* ======================================================
          FIXED BACKGROUND

          ★ 背景完全獨立
          ★ 永遠固定為 100dvh
          ★ 不跟 Home Content 高度變化
          ★ 不跟 Scroll 移動
      ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          z-0
          bg-cover
          bg-center
          bg-no-repeat
        "

        style={{
          backgroundImage:
            `url(${launcherBg})`,
        }}
      />



      {/* ======================================================
          BACKGROUND OVERLAY

          很淡的白色遮罩
          讓文字在雪景上比較清楚
      ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          z-[1]
          bg-white/15
        "
      />



      {/* ======================================================
          HEADER

          固定
          不參與 Scroll
      ====================================================== */}

      <header
        className="
          relative
          z-20
          shrink-0
          px-6
          pb-3
          pt-5
        "
      >

        <button
          type="button"

          onClick={
            onExit
          }

          className="
            text-[13px]
            font-medium
            text-slate-600
            transition
            active:opacity-50
          "
        >
          ← 我的旅行
        </button>

      </header>



      {/* ======================================================
          CONTENT

          ★ 唯一 Scroll 區域
          ★ 背景不會一起 Scroll
      ====================================================== */}

      <div
        className="
          relative
          z-10
          min-h-0
          flex-1
          overflow-y-auto
          overflow-x-hidden
          overscroll-contain
        "
      >

        {renderPage()}

      </div>



      {/* ======================================================
          BOTTOM NAVIGATION

          固定在 App 最下方
          不跟內容 Scroll
      ====================================================== */}

      <div
        className="
          relative
          z-50
          shrink-0
        "
      >

        <BottomNavigation

          activePage={
            activePage
          }

          onPageChange={
            setActivePage
          }

        />

      </div>


    </div>

  )
}


export default TripApp