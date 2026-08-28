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

  const [
    activePage,
    setActivePage,
  ] = useState(
    'home'
  )


  // ==========================================================
  // Swipe Back
  // ==========================================================

  const appRef =
    useRef<HTMLDivElement>(
      null
    )


  const [
    swipeX,
    setSwipeX,
  ] = useState(0)


  const [
    isSwiping,
    setIsSwiping,
  ] = useState(false)


  const gestureRef =
    useRef({

      startX:
        0,

      startY:
        0,

      direction:
        null as GestureDirection,

      active:
        false,

    })


  // ==========================================================
  // Page Render
  // ==========================================================

  const renderPage =
    () => {

      switch (
        activePage
      ) {

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
    event:
      React.PointerEvent<HTMLDivElement>
  ) => {

    const target =
      event.target as HTMLElement


    // Bottom Sheet / modal / 特殊水平捲動元件
    // 不參與全頁 Swipe Back。
    if (
      target.closest(
        '[data-disable-swipe-back="true"]'
      )
    ) {
      return
    }


    // 滑鼠只接受左鍵。
    if (
      event.pointerType ===
        'mouse' &&
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


    setIsSwiping(
      false
    )

  }


  // ==========================================================
  // Pointer Move
  // ==========================================================

  const handlePointerMove = (
    event:
      React.PointerEvent<HTMLDivElement>
  ) => {

    if (
      !gestureRef.current.active
    ) {
      return
    }


    const target =
      event.target as HTMLElement


    // 水平 carousel / day selector 自己處理橫向移動，
    // 避免與全頁 Swipe Back 互搶。
    if (
      target.closest(
        '[data-horizontal-scroll="true"]'
      )
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
      Math.abs(
        dx
      )


    const absY =
      Math.abs(
        dy
      )


    // --------------------------------------------------------
    // Direction Lock
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

      setSwipeX(
        0
      )

      return
    }


    // --------------------------------------------------------
    // 右滑
    // --------------------------------------------------------

    const appWidth =
      appRef.current
        ?.clientWidth ??
      window.innerWidth


    const limitedX =
      Math.min(
        dx,
        appWidth
      )


    setIsSwiping(
      true
    )

    setSwipeX(
      limitedX
    )

  }


  // ==========================================================
  // Pointer Up
  // ==========================================================

  const handlePointerUp =
    () => {

      if (
        !gestureRef.current.active
      ) {
        return
      }


      gestureRef.current.active =
        false


      if (
        gestureRef.current.direction !==
        'horizontal'
      ) {

        gestureRef.current.direction =
          null

        return

      }


      const appWidth =
        appRef.current
          ?.clientWidth ??
        window.innerWidth


      const threshold =
        appWidth *
        0.25


      // --------------------------------------------------------
      // Swipe Success
      // --------------------------------------------------------

      if (
        swipeX >=
        threshold
      ) {

        setIsSwiping(
          false
        )


        setSwipeX(
          appWidth
        )


        window.setTimeout(
          () => {

            onExit()

          },
          220
        )


        return

      }


      // --------------------------------------------------------
      // Swipe Cancel
      // --------------------------------------------------------

      setIsSwiping(
        false
      )

      setSwipeX(
        0
      )

      gestureRef.current.direction =
        null

    }


  // ==========================================================
  // Pointer Cancel
  // ==========================================================

  const handlePointerCancel =
    () => {

      gestureRef.current.active =
        false

      gestureRef.current.direction =
        null


      setIsSwiping(
        false
      )

      setSwipeX(
        0
      )

    }


  // ==========================================================
  // Swipe Opacity
  // ==========================================================

  const appWidth =
    appRef.current
      ?.clientWidth ??
    448


  const swipeProgress =
    Math.min(
      swipeX /
      appWidth,
      1
    )


  const opacity =
    1 -
    swipeProgress *
    0.12


  // ==========================================================
  // Render
  // ==========================================================

  return (

    <div
      ref={
        appRef
      }

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
        h-full
        min-h-0
        w-full
        max-w-md
        flex-col
        overflow-hidden
        bg-slate-950
        shadow-2xl
        shadow-black/20
      "

      style={{

        touchAction:
          'pan-y',

        transform:
          `translateX(${swipeX}px)`,

        opacity,

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

          Header 自己處理 iPhone 上方 Safe Area。
          不參與 Content Scroll。
      ====================================================== */}

      <header
        className="
          relative
          z-20
          shrink-0
          px-6
          pb-3
          pt-[calc(12px+env(safe-area-inset-top))]
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
          CONTENT AREA

          ★ 這裡才是唯一垂直 Scroll 區域
          ★ 高度 = App - Header - BottomNavigation
          ★ BottomNavigation 不在這個區域裡
          ★ 所以內容不可能被 BottomNavigation 蓋住
      ====================================================== */}

      <div
        className="
          relative
          z-10
          min-h-0
          flex-1
          overflow-x-hidden
          overflow-y-auto
          overscroll-contain
          [-webkit-overflow-scrolling:touch]
        "
      >

        {renderPage()}

      </div>


      {/* ======================================================
          BOTTOM NAVIGATION AREA

          ★ 正常 Flex Flow
          ★ 不使用 fixed
          ★ 不使用 absolute
          ★ 真正從 Content 可用高度扣除
          ★ Safe Area 在 BottomNavigation 元件內處理
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