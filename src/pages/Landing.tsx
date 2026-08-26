import { useRef, useState } from 'react'
import landingBg from '../assets/landing-bg.png'

type LandingProps = {
  onEnter: () => void
}

function Landing({ onEnter }: LandingProps) {

  const sliderRef = useRef<HTMLDivElement>(null)
  const knobRef = useRef<HTMLDivElement>(null)

  const [dragX, setDragX] = useState(0)
  const [dragging, setDragging] = useState(false)

  const TRACK_PADDING = 4

  // ------------------------------------------------------------
  // 取得 Slider 最大可移動距離
  // ------------------------------------------------------------
  const getMaxDrag = () => {

    if (
      !sliderRef.current ||
      !knobRef.current
    ) {
      return 0
    }

    const trackWidth =
      sliderRef.current.clientWidth

    const knobWidth =
      knobRef.current.clientWidth

    return (
      trackWidth -
      knobWidth -
      TRACK_PADDING * 2
    )
  }

  // ------------------------------------------------------------
  // 開始拖曳
  // ------------------------------------------------------------
  const handlePointerDown = (
    event: React.PointerEvent<HTMLDivElement>
  ) => {

    setDragging(true)

    event.currentTarget.setPointerCapture(
      event.pointerId
    )
  }

  // ------------------------------------------------------------
  // 拖曳中
  // ------------------------------------------------------------
  const handlePointerMove = (
    event: React.PointerEvent<HTMLDivElement>
  ) => {

    if (
      !dragging ||
      !sliderRef.current ||
      !knobRef.current
    ) {
      return
    }

    const rect =
      sliderRef.current.getBoundingClientRect()

    const knobWidth =
      knobRef.current.clientWidth

    const maxDrag =
      getMaxDrag()

    let newX =
      event.clientX -
      rect.left -
      TRACK_PADDING -
      knobWidth / 2

    // 限制拖曳範圍
    newX = Math.max(
      0,
      Math.min(newX, maxDrag)
    )

    setDragX(newX)
  }

  // ------------------------------------------------------------
  // 放開 Slider
  // ------------------------------------------------------------
  const handlePointerUp = () => {

    if (!dragging) {
      return
    }

    setDragging(false)

    const maxDrag =
      getMaxDrag()

    // 滑超過 88% 才進入
    if (
      maxDrag > 0 &&
      dragX >= maxDrag * 0.88
    ) {

      setDragX(maxDrag)

      setTimeout(() => {
        onEnter()
      }, 180)

      return
    }

    // 沒滑到底，自動回原位
    setDragX(0)
  }

  return (
    <div className="min-h-screen bg-slate-950">

      <main
        className="
          relative
          mx-auto
          flex
          min-h-screen
          w-full
          max-w-md
          overflow-x-hidden
          bg-cover
          bg-center
          text-white
        "
        style={{
          backgroundImage: `url(${landingBg})`,
        }}
      >

        {/* Background Gradient */}
        <div
          className="
            absolute
            inset-0
            bg-gradient-to-b
            from-slate-950/10
            via-slate-950/20
            to-slate-950/90
          "
        />

        {/* Cold Tone */}
        <div
          className="
            absolute
            inset-0
            bg-blue-950/10
          "
        />

        {/* Content */}
        <div
          className="
            relative
            z-10
            flex
            min-h-screen
            w-full
            flex-col
            px-7
            pb-10
            pt-12
          "
        >

          {/* Brand */}
          <div>

            <p
              className="
                text-[11px]
                font-medium
                tracking-[0.32em]
                text-white/70
              "
            >
              TRAVEL MEMORIES
            </p>

          </div>

          {/* Main Text */}
          <div className="mt-auto pb-10">

            <h1
              className="
                max-w-xs
                text-[48px]
                font-semibold
                leading-[1.08]
                tracking-[-0.04em]
                text-white
                drop-shadow-xl
              "
            >
              把旅行
              <br />
              留在路上
            </h1>

            <p
              className="
                mt-5
                max-w-[280px]
                text-[15px]
                leading-7
                text-white/70
              "
            >
              記錄每一次出發，
              <br />
              以及真正走過的地方。
            </p>

          </div>

          {/* Slide To Enter */}
          <div
            ref={sliderRef}
            className="
              relative
              h-[60px]
              w-full
              touch-none
              select-none
              overflow-hidden
              rounded-[30px]
              border
              border-white/20
              bg-white/15
              p-1
              shadow-2xl
              shadow-black/30
              backdrop-blur-md
            "
          >

            {/* Slide Text */}
            <div
              className="
                pointer-events-none
                absolute
                inset-0
                flex
                items-center
                justify-center
                text-[15px]
                font-medium
                tracking-[0.04em]
                text-white/75
              "
            >
              滑動開始旅程
            </div>

            {/* Slider */}
            <div
              ref={knobRef}

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
                handlePointerUp
              }

              className="
                absolute
                left-1
                top-1
                z-10

                h-[52px]
                w-[25%]

                cursor-grab

                rounded-[26px]

                border
                border-white/80

                bg-white/95

                shadow-lg
                shadow-black/15

                backdrop-blur-md

                active:cursor-grabbing
              "

              style={{
                transform:
                  `translateX(${dragX}px)`,

                transition:
                  dragging
                    ? 'none'
                    : 'transform 320ms cubic-bezier(0.22, 1, 0.36, 1)',
              }}
            />

          </div>

        </div>

      </main>

    </div>
  )
}

export default Landing