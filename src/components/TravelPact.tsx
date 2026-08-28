import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'

import {
  createPortal,
} from 'react-dom'


// ============================================================
// Storage
// ============================================================

const TRAVEL_PACT_SIGNATURE_KEY =
  'travel_v100_travel_pact_signature_v1'

const TRAVEL_PACT_LOCK_KEY =
  'travel_v100_travel_pact_locked_v1'


// ============================================================
// Contract Content
// ============================================================

const PACT_ITEMS = [
  {
    title:
      '好旅伴基本原則',

    content:
      '旅途中不無故抱怨、不遷怒、不冷戰。累、餓、冷、想睡或心情不好，可以直接說，但不把情緒丟給旅伴。',
  },

  {
    title:
      '行程可以調整',

    content:
      '計畫是方向，不是軍令。遇到天氣、塞車、雪況、體力或突發狀況時，以大家安全與開心為優先，接受臨時修改行程。',
  },

  {
    title:
      '不催、不拖、互相尊重',

    content:
      '需要準時的行程一起準時；想多拍一張照片、逛久一點或休息一下時，也互相給彼此合理的空間。',
  },

  {
    title:
      '肚子餓要說',

    content:
      '禁止因為太餓卻不說，最後開始不耐煩。任何人進入「需要吃東西」狀態，都有權提出補給要求。',
  },

  {
    title:
      '開車與導航互相幫忙',

    content:
      '駕駛專心開車，副駕協助導航、找停車場與確認路線。坐車的人不當事後諸葛，也不在雪地路況緊張時製造額外壓力。',
  },

  {
    title:
      '滑雪安全第一',

    content:
      '不勉強彼此挑戰超過能力的雪道。有人累了、受傷、害怕或想休息時，以安全為優先，不用逞強。',
  },

  {
    title:
      '消費透明',

    content:
      '共同支出盡量記帳。對價格、預算或想買的東西有疑慮就直接討論，不用猜對方心裡在想什麼。',
  },

  {
    title:
      '照片互相支援',

    content:
      '看到好看的景色記得幫旅伴拍照；拍不好可以重拍，不嫌麻煩，也不要只顧自己拍。',
  },

  {
    title:
      '身體狀況誠實回報',

    content:
      '不舒服、暈車、頭痛、太冷、太累或需要休息時要說。旅伴不是讀心術專家，誠實回報才能互相照顧。',
  },

  {
    title:
      '發生爭執的處理方式',

    content:
      '有意見可以講，但不翻舊帳、不人身攻擊。如果情緒太高，優先找地方坐下、喝熱飲或吃東西，冷靜後再處理。',
  },

  {
    title:
      '共同維護旅遊氣氛',

    content:
      '遇到下雪、迷路、排隊、店家休息或任何意外時，優先一起想辦法，而不是找人怪罪。意外有時候也是旅行的一部分。',
  },

  {
    title:
      '留下值得記得的回憶',

    content:
      '這趟旅行的目標不是完美執行每一項行程，而是一起平安回家，而且想到這趟旅程時，還會想再一起出發。',
  },
] as const


// ============================================================
// Props
// ============================================================

type TravelPactProps = {
  open: boolean
  onClose: () => void
}


// ============================================================
// Component
// ============================================================

function TravelPact({
  open,
  onClose,
}: TravelPactProps) {

  const canvasRef =
    useRef<HTMLCanvasElement>(
      null
    )


  const signatureAreaRef =
    useRef<HTMLDivElement>(
      null
    )


  const drawingRef =
    useRef({
      active:
        false,

      hasInk:
        false,

      lastX:
        0,

      lastY:
        0,
    })


  const unlockTimerRef =
    useRef<number | null>(
      null
    )


  const unlockPressRef =
    useRef({
      x:
        0,

      y:
        0,

      moved:
        false,
    })


  const [
    locked,
    setLocked,
  ] = useState(
    () =>
      localStorage.getItem(
        TRAVEL_PACT_LOCK_KEY
      ) === 'true'
  )


  const [
    signatureData,
    setSignatureData,
  ] = useState(
    () =>
      localStorage.getItem(
        TRAVEL_PACT_SIGNATURE_KEY
      ) ??
      ''
  )


  const [
    signatureVersion,
    setSignatureVersion,
  ] = useState(0)


  // ==========================================================
  // Open / Close Animation
  //
  // shouldRender:
  //   控制元件是否仍留在 DOM，讓關閉動畫有時間播放。
  //
  // animationOpen:
  //   true  = 契約停在畫面中央
  //   false = 契約位於畫面下方
  // ==========================================================

  const [
    shouldRender,
    setShouldRender,
  ] = useState(
    open
  )


  const [
    animationOpen,
    setAnimationOpen,
  ] = useState(
    false
  )


  useEffect(() => {

    let closeTimer:
      number |
      null =
      null


    let openStartTimer:
      number |
      null =
      null


    let frame1:
      number |
      null =
      null


    let frame2:
      number |
      null =
      null


    if (open) {

      // 先確保卷軸真的 render 在畫面下方。
      setAnimationOpen(
        false
      )


      setShouldRender(
        true
      )


      // 這裡不用只依賴 RAF。
      // 保留一個很短、肉眼幾乎感覺不到的起始停留，
      // 讓瀏覽器一定先 paint「卷軸在畫面下方」，
      // 再開始往上滑。
      openStartTimer =
        window.setTimeout(
          () => {

            frame1 =
              window.requestAnimationFrame(
                () => {

                  frame2 =
                    window.requestAnimationFrame(
                      () => {

                        setAnimationOpen(
                          true
                        )

                      }
                    )

                }
              )

          },
          70
        )

    } else {

      // 關閉時整卷直接往畫面下方滑出。
      setAnimationOpen(
        false
      )


      // 滑出完成後才真正 unmount。
      closeTimer =
        window.setTimeout(
          () => {

            setShouldRender(
              false
            )

          },
          560
        )

    }


    return () => {

      if (
        closeTimer !==
        null
      ) {
        window.clearTimeout(
          closeTimer
        )
      }


      if (
        openStartTimer !==
        null
      ) {
        window.clearTimeout(
          openStartTimer
        )
      }


      if (
        frame1 !==
        null
      ) {
        window.cancelAnimationFrame(
          frame1
        )
      }


      if (
        frame2 !==
        null
      ) {
        window.cancelAnimationFrame(
          frame2
        )
      }

    }

  }, [
    open,
  ])


  // ==========================================================
  // Canvas Setup
  // ==========================================================

  useEffect(() => {

    if (
      !open ||
      locked
    ) {
      return
    }


    const canvas =
      canvasRef.current


    if (!canvas) {
      return
    }


    const setup =
      () => {

        const rect =
          canvas.getBoundingClientRect()


        const dpr =
          Math.max(
            1,
            window.devicePixelRatio ||
            1
          )


        canvas.width =
          Math.round(
            rect.width *
            dpr
          )


        canvas.height =
          Math.round(
            rect.height *
            dpr
          )


        const context =
          canvas.getContext(
            '2d'
          )


        if (!context) {
          return
        }


        // 直接在 canvas backing-store pixel 座標繪圖。
        // 不再使用 context.setTransform(dpr, ...)，
        // 避免簽名區高度改變後 CSS / Canvas 座標比例不同步。
        context.resetTransform()


        context.lineCap =
          'round'

        context.lineJoin =
          'round'

        context.lineWidth =
          2.2 *
          dpr

        context.strokeStyle =
          '#292524'


        drawingRef.current.hasInk =
          false


        if (
          signatureData
        ) {

          const image =
            new Image()


          image.onload =
            () => {

              // 舊版簽名可能是在較矮的 145px 區塊保存。
              // 以 contain 方式放回新 Canvas，避免直接把 Y 軸拉成 2 倍。
              const scale =
                Math.min(
                  canvas.width /
                    image.naturalWidth,

                  canvas.height /
                    image.naturalHeight
                )


              const drawWidth =
                image.naturalWidth *
                scale


              const drawHeight =
                image.naturalHeight *
                scale


              const drawX =
                (
                  canvas.width -
                  drawWidth
                ) /
                2


              const drawY =
                (
                  canvas.height -
                  drawHeight
                ) /
                2


              context.drawImage(
                image,
                drawX,
                drawY,
                drawWidth,
                drawHeight
              )


              drawingRef.current.hasInk =
                true


              setSignatureVersion(
                current =>
                  current + 1
              )

            }


          image.src =
            signatureData

        }

      }


    const frame =
      window.requestAnimationFrame(
        setup
      )


    return () => {

      window.cancelAnimationFrame(
        frame
      )

    }

  }, [
    open,
    locked,
    signatureData,
  ])


  // ==========================================================
  // Cleanup Hidden Unlock Timer
  // ==========================================================

  useEffect(() => {

    if (open) {
      return
    }


    if (
      unlockTimerRef.current !==
      null
    ) {

      window.clearTimeout(
        unlockTimerRef.current
      )


      unlockTimerRef.current =
        null

    }

  }, [
    open,
  ])


  // ==========================================================
  // Signature Draw Helpers
  // ==========================================================

  const getCanvasPoint = (
    event:
      ReactPointerEvent<HTMLCanvasElement>
  ) => {

    const canvas =
      canvasRef.current


    if (!canvas) {

      return {
        x:
          0,

        y:
          0,
      }

    }


    const rect =
      canvas.getBoundingClientRect()


    const scaleX =
      rect.width > 0
        ? canvas.width /
          rect.width
        : 1


    const scaleY =
      rect.height > 0
        ? canvas.height /
          rect.height
        : 1


    return {
      x:
        (
          event.clientX -
          rect.left
        ) *
        scaleX,

      y:
        (
          event.clientY -
          rect.top
        ) *
        scaleY,
    }

  }


  const handleSignaturePointerDown = (
    event:
      ReactPointerEvent<HTMLCanvasElement>
  ) => {

    event.stopPropagation()


    const canvas =
      canvasRef.current


    if (!canvas) {
      return
    }


    const point =
      getCanvasPoint(
        event
      )


    drawingRef.current.active =
      true

    drawingRef.current.lastX =
      point.x

    drawingRef.current.lastY =
      point.y


    canvas.setPointerCapture(
      event.pointerId
    )

  }


  const handleSignaturePointerMove = (
    event:
      ReactPointerEvent<HTMLCanvasElement>
  ) => {

    event.stopPropagation()


    if (
      !drawingRef.current.active
    ) {
      return
    }


    const canvas =
      canvasRef.current


    if (!canvas) {
      return
    }


    const context =
      canvas.getContext(
        '2d'
      )


    if (!context) {
      return
    }


    const point =
      getCanvasPoint(
        event
      )


    context.beginPath()

    context.moveTo(
      drawingRef.current.lastX,
      drawingRef.current.lastY
    )

    context.lineTo(
      point.x,
      point.y
    )

    context.stroke()


    drawingRef.current.lastX =
      point.x

    drawingRef.current.lastY =
      point.y

    drawingRef.current.hasInk =
      true


    setSignatureVersion(
      current =>
        current + 1
    )

  }


  const finishSignature = (
    event:
      ReactPointerEvent<HTMLCanvasElement>
  ) => {

    event.stopPropagation()


    drawingRef.current.active =
      false


    const canvas =
      canvasRef.current


    if (
      canvas?.hasPointerCapture(
        event.pointerId
      )
    ) {

      canvas.releasePointerCapture(
        event.pointerId
      )

    }

  }


  const clearSignature =
    () => {

      const canvas =
        canvasRef.current


      if (!canvas) {
        return
      }


      const context =
        canvas.getContext(
          '2d'
        )


      if (!context) {
        return
      }


      context.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
      )


      drawingRef.current.hasInk =
        false


      setSignatureData(
        ''
      )


      setSignatureVersion(
        current =>
          current + 1
      )

    }


  const confirmSignature =
    () => {

      const canvas =
        canvasRef.current


      if (
        !canvas ||
        !drawingRef.current.hasInk
      ) {
        return
      }


      const data =
        canvas.toDataURL(
          'image/png'
        )


      setSignatureData(
        data
      )

      setLocked(
        true
      )


      localStorage.setItem(
        TRAVEL_PACT_SIGNATURE_KEY,
        data
      )


      localStorage.setItem(
        TRAVEL_PACT_LOCK_KEY,
        'true'
      )

    }


  // ==========================================================
  // Hidden Unlock Gesture
  // ==========================================================

  const clearUnlockTimer =
    () => {

      if (
        unlockTimerRef.current !==
        null
      ) {

        window.clearTimeout(
          unlockTimerRef.current
        )


        unlockTimerRef.current =
          null

      }

  }


  const handleLockedPointerDown = (
    event:
      ReactPointerEvent<HTMLDivElement>
  ) => {

    event.stopPropagation()


    if (!locked) {
      return
    }


    unlockPressRef.current = {
      x:
        event.clientX,

      y:
        event.clientY,

      moved:
        false,
    }


    clearUnlockTimer()


    unlockTimerRef.current =
      window.setTimeout(
        () => {

          if (
            unlockPressRef.current.moved
          ) {
            return
          }


          setLocked(
            false
          )


          localStorage.setItem(
            TRAVEL_PACT_LOCK_KEY,
            'false'
          )


          unlockTimerRef.current =
            null

        },
        10000
      )

  }


  const handleLockedPointerMove = (
    event:
      ReactPointerEvent<HTMLDivElement>
  ) => {

    event.stopPropagation()


    if (!locked) {
      return
    }


    const dx =
      event.clientX -
      unlockPressRef.current.x


    const dy =
      event.clientY -
      unlockPressRef.current.y


    if (
      Math.abs(
        dx
      ) >
        12 ||
      Math.abs(
        dy
      ) >
        12
    ) {

      unlockPressRef.current.moved =
        true


      clearUnlockTimer()

    }

  }


  const finishLockedPress = (
    event:
      ReactPointerEvent<HTMLDivElement>
  ) => {

    event.stopPropagation()

    clearUnlockTimer()

  }


  // ==========================================================
  // Render
  // ==========================================================

  if (
    !shouldRender ||
    typeof document ===
      'undefined'
  ) {
    return null
  }


  // Force React to observe signature draw state.
  void signatureVersion


  return createPortal(

    <div
      data-disable-swipe-back="true"

      onPointerDown={event => {
        event.stopPropagation()
      }}

      onPointerMove={event => {
        event.stopPropagation()
      }}

      onPointerUp={event => {
        event.stopPropagation()
      }}

      onPointerCancel={event => {
        event.stopPropagation()
      }}

      className="
        fixed
        inset-0
        z-[1300]
        flex
        items-center
        justify-center
        overflow-hidden
        px-4
        py-[calc(16px+env(safe-area-inset-top))]
      "
    >

      {/* Clickable area outside the scroll */}

      <button
        type="button"

        aria-label="關閉旅行履行契約"

        onClick={
          onClose
        }

        className={`
          absolute
          inset-0
          z-0
          transition-[background-color,backdrop-filter]
          duration-[360ms]
          ease-out

          ${
            animationOpen
              ? `
                  bg-slate-950/65
                  backdrop-blur-[4px]
                `
              : `
                  bg-slate-950/0
                  backdrop-blur-0
                `
          }
        `}
      />


      <div
        className="
          relative
          z-10
          flex
          max-h-[92dvh]
          w-full
          max-w-md
          flex-col
          will-change-transform
        "

        style={{
          transform:
            animationOpen
              ? 'translate3d(0, 0, 0)'
              : 'translate3d(0, 110vh, 0)',

          transition:
            'transform 520ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >

        {/* Top wooden roll */}

        <div
          className="
            relative
            z-20
            mx-2
            h-8
            rounded-full
            border
            border-amber-950/35
            bg-gradient-to-b
            from-[#b86d2b]
            via-[#7b3f18]
            to-[#4b250f]
            shadow-[0_8px_18px_rgba(41,20,8,0.38),inset_0_2px_1px_rgba(255,225,180,0.28),inset_0_-3px_4px_rgba(39,18,7,0.35)]
          "
        >

          {/* Wood grain */}

          <div
            className="
              pointer-events-none
              absolute
              inset-x-4
              top-[7px]
              h-px
              rounded-full
              bg-amber-200/20
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              inset-x-8
              bottom-[6px]
              h-px
              rounded-full
              bg-amber-950/35
            "
          />


          {/* Left handle */}

          <div
            className="
              absolute
              -left-[14px]
              top-1/2
              h-10
              w-6
              -translate-y-1/2
            "
          >

            <div
              className="
                absolute
                left-0
                top-1/2
                h-5
                w-3
                -translate-y-1/2
                rounded-l-full
                border
                border-amber-950/35
                bg-[#4b250f]
                shadow-md
              "
            />

            <div
              className="
                absolute
                right-0
                top-1/2
                h-9
                w-4
                -translate-y-1/2
                rounded-full
                border
                border-amber-950/40
                bg-gradient-to-r
                from-[#8f4d20]
                via-[#5f2e13]
                to-[#3d1d0c]
                shadow-md
              "
            />

            <div
              className="
                absolute
                right-[5px]
                top-1/2
                h-2
                w-2
                -translate-y-1/2
                rounded-full
                bg-amber-200/30
              "
            />

          </div>


          {/* Right handle */}

          <div
            className="
              absolute
              -right-[14px]
              top-1/2
              h-10
              w-6
              -translate-y-1/2
            "
          >

            <div
              className="
                absolute
                right-0
                top-1/2
                h-5
                w-3
                -translate-y-1/2
                rounded-r-full
                border
                border-amber-950/35
                bg-[#4b250f]
                shadow-md
              "
            />

            <div
              className="
                absolute
                left-0
                top-1/2
                h-9
                w-4
                -translate-y-1/2
                rounded-full
                border
                border-amber-950/40
                bg-gradient-to-l
                from-[#8f4d20]
                via-[#5f2e13]
                to-[#3d1d0c]
                shadow-md
              "
            />

            <div
              className="
                absolute
                left-[5px]
                top-1/2
                h-2
                w-2
                -translate-y-1/2
                rounded-full
                bg-amber-200/30
              "
            />

          </div>

        </div>


        {/* Scroll */}

        <section
          className="
            relative
            -mt-2
            min-h-0
            flex-1
            overflow-y-auto
            overscroll-contain
            border-x
            border-amber-900/25
            bg-[#f4e7c7]
            px-6
            pb-9
            pt-9
            text-stone-800
            shadow-[0_18px_38px_rgba(38,24,12,0.30),inset_16px_0_24px_-24px_rgba(78,44,17,0.55),inset_-16px_0_24px_-24px_rgba(78,44,17,0.55)]
            [-webkit-overflow-scrolling:touch]
          "

          style={{
            backgroundImage:
              `
                radial-gradient(
                  circle at 15% 12%,
                  rgba(120,53,15,0.05),
                  transparent 26%
                ),
                radial-gradient(
                  circle at 85% 70%,
                  rgba(120,53,15,0.04),
                  transparent 30%
                ),
                linear-gradient(
                  90deg,
                  rgba(120,53,15,0.06),
                  transparent 10%,
                  transparent 90%,
                  rgba(120,53,15,0.06)
                )
              `,
          }}
        >

          {/* Parchment curled side edges */}

          <div
            className="
              pointer-events-none
              sticky
              top-0
              z-[5]
              h-0
            "
          >

            <div
              className="
                absolute
                -left-6
                top-0
                h-[92dvh]
                w-5
                bg-gradient-to-r
                from-amber-950/10
                via-amber-800/[0.04]
                to-transparent
              "
            />

            <div
              className="
                absolute
                -right-6
                top-0
                h-[92dvh]
                w-5
                bg-gradient-to-l
                from-amber-950/10
                via-amber-800/[0.04]
                to-transparent
              "
            />

          </div>


          <button
            type="button"
            onClick={
              onClose
            }
            className="
              absolute
              right-4
              top-4
              z-20
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-full
              border
              border-stone-700/15
              bg-stone-900/5
              text-[18px]
              font-light
              text-stone-700
            "
          >
            ×
          </button>


          <div
            className="
              text-center
            "
          >

            <p
              className="
                text-[9px]
                font-bold
                tracking-[0.28em]
                text-amber-900/55
              "
            >
              HOKKAIDO JOURNEY · 2026
            </p>


            <h1
              className="
                mt-3
                text-[29px]
                font-bold
                tracking-[0.08em]
                text-stone-900
              "
            >
              旅行履行契約
            </h1>


            <div
              className="
                mx-auto
                mt-4
                h-px
                w-20
                bg-stone-700/35
              "
            />


            <p
              className="
                mx-auto
                mt-4
                max-w-[290px]
                text-[11px]
                leading-6
                text-stone-700
              "
            >
              本契約不是為了限制旅行，
              而是提醒簽署人：
              出門在外，行程可以亂，
              旅伴感情不能亂。
            </p>

          </div>


          <div
            className="
              mt-7
              space-y-5
            "
          >

            {PACT_ITEMS.map(
              (
                item,
                index
              ) => (

                <article
                  key={
                    item.title
                  }
                  className="
                    grid
                    grid-cols-[28px_1fr]
                    gap-3
                  "
                >

                  <div
                    className="
                      flex
                      h-7
                      w-7
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-amber-900/20
                      bg-amber-900/[0.06]
                      text-[10px]
                      font-bold
                      text-amber-950/65
                    "
                  >
                    {
                      String(
                        index + 1
                      ).padStart(
                        2,
                        '0'
                      )
                    }
                  </div>


                  <div>

                    <h2
                      className="
                        text-[13px]
                        font-bold
                        tracking-[0.02em]
                        text-stone-900
                      "
                    >
                      {item.title}
                    </h2>


                    <p
                      className="
                        mt-1.5
                        text-[10px]
                        leading-[1.75]
                        text-stone-700
                      "
                    >
                      {item.content}
                    </p>

                  </div>

                </article>

              )
            )}

          </div>


          <div
            className="
              mt-8
              border-y
              border-stone-700/20
              py-5
              text-center
            "
          >

            <p
              className="
                text-[11px]
                font-bold
                tracking-[0.08em]
                text-stone-900
              "
            >
              最終約定
            </p>


            <p
              className="
                mt-2
                text-[10px]
                leading-6
                text-stone-700
              "
            >
              簽名代表我願意努力當一個好旅伴。
              <br />
              遇到問題一起處理，遇到好事一起開心，
              <br />
              平安出發，也平安回家。
            </p>

          </div>


          {/* Signature */}

          <div
            className="
              mt-7
            "
          >

            <div
              className="
                flex
                items-end
                justify-between
                gap-3
              "
            >

              <div>

                <p
                  className="
                    text-[9px]
                    font-bold
                    tracking-[0.18em]
                    text-stone-600
                  "
                >
                  SIGNATURE
                </p>


                <p
                  className="
                    mt-1
                    text-[11px]
                    font-semibold
                    text-stone-800
                  "
                >
                  旅伴簽名
                </p>

              </div>


              {locked && (
                <span
                  className="
                    rounded-full
                    border
                    border-emerald-800/15
                    bg-emerald-900/[0.07]
                    px-2.5
                    py-1
                    text-[8px]
                    font-bold
                    tracking-[0.08em]
                    text-emerald-900/70
                  "
                >
                  SIGNED
                </span>
              )}

            </div>


            <div
              ref={
                signatureAreaRef
              }

              onPointerDown={
                handleLockedPointerDown
              }

              onPointerMove={
                handleLockedPointerMove
              }

              onPointerUp={
                finishLockedPress
              }

              onPointerCancel={
                finishLockedPress
              }

              onContextMenu={event => {
                event.preventDefault()
              }}

              className="
                relative
                mt-3
                h-[290px]
                overflow-hidden
                rounded-[16px]
                border
                border-stone-700/25
                bg-[#fbf4df]/80
                shadow-inner
                select-none
              "
            >

              <div
                className="
                  pointer-events-none
                  absolute
                  bottom-8
                  left-5
                  right-5
                  h-px
                  bg-stone-500/30
                "
              />


              {locked
                ? (
                  signatureData && (
                    <img
                      src={
                        signatureData
                      }
                      alt="已簽署"
                      draggable={false}
                      className="
                        h-full
                        w-full
                        select-none
                        object-contain
                      "
                    />
                  )
                )
                : (
                  <canvas
                    ref={
                      canvasRef
                    }

                    onPointerDown={
                      handleSignaturePointerDown
                    }

                    onPointerMove={
                      handleSignaturePointerMove
                    }

                    onPointerUp={
                      finishSignature
                    }

                    onPointerCancel={
                      finishSignature
                    }

                    className="
                      relative
                      z-10
                      h-full
                      w-full
                      touch-none
                      cursor-crosshair
                    "
                  />
                )
              }

            </div>


            {!locked && (
              <div
                className="
                  mt-3
                  grid
                  grid-cols-[auto_1fr]
                  gap-2
                "
              >

                <button
                  type="button"
                  onClick={
                    clearSignature
                  }
                  className="
                    rounded-[14px]
                    border
                    border-stone-700/20
                    bg-white/25
                    px-4
                    py-3
                    text-[10px]
                    font-bold
                    text-stone-700
                    transition
                    active:scale-[0.98]
                  "
                >
                  清除
                </button>


                <button
                  type="button"

                  disabled={
                    !drawingRef.current
                      .hasInk
                  }

                  onClick={
                    confirmSignature
                  }

                  className="
                    rounded-[14px]
                    bg-stone-900
                    px-4
                    py-3
                    text-[10px]
                    font-bold
                    tracking-[0.08em]
                    text-[#f4e7c7]
                    transition
                    active:scale-[0.98]
                    disabled:opacity-30
                  "
                >
                  確認簽署
                </button>

              </div>
            )}


            {locked && (
              <p
                className="
                  mt-3
                  text-center
                  text-[9px]
                  tracking-[0.06em]
                  text-stone-600
                "
              >
                契約已確認 · 願旅途平安順利
              </p>
            )}

          </div>

        </section>


        {/* Bottom wooden roll */}

        <div
          className="
            relative
            z-20
            -mt-2
            mx-2
            h-8
            rounded-full
            border
            border-amber-950/35
            bg-gradient-to-b
            from-[#b86d2b]
            via-[#7b3f18]
            to-[#4b250f]
            shadow-[0_8px_18px_rgba(41,20,8,0.38),inset_0_2px_1px_rgba(255,225,180,0.28),inset_0_-3px_4px_rgba(39,18,7,0.35)]
          "
        >

          {/* Wood grain */}

          <div
            className="
              pointer-events-none
              absolute
              inset-x-4
              top-[7px]
              h-px
              rounded-full
              bg-amber-200/20
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              inset-x-8
              bottom-[6px]
              h-px
              rounded-full
              bg-amber-950/35
            "
          />


          {/* Left handle */}

          <div
            className="
              absolute
              -left-[14px]
              top-1/2
              h-10
              w-6
              -translate-y-1/2
            "
          >

            <div
              className="
                absolute
                left-0
                top-1/2
                h-5
                w-3
                -translate-y-1/2
                rounded-l-full
                border
                border-amber-950/35
                bg-[#4b250f]
                shadow-md
              "
            />

            <div
              className="
                absolute
                right-0
                top-1/2
                h-9
                w-4
                -translate-y-1/2
                rounded-full
                border
                border-amber-950/40
                bg-gradient-to-r
                from-[#8f4d20]
                via-[#5f2e13]
                to-[#3d1d0c]
                shadow-md
              "
            />

          </div>


          {/* Right handle */}

          <div
            className="
              absolute
              -right-[14px]
              top-1/2
              h-10
              w-6
              -translate-y-1/2
            "
          >

            <div
              className="
                absolute
                right-0
                top-1/2
                h-5
                w-3
                -translate-y-1/2
                rounded-r-full
                border
                border-amber-950/35
                bg-[#4b250f]
                shadow-md
              "
            />

            <div
              className="
                absolute
                left-0
                top-1/2
                h-9
                w-4
                -translate-y-1/2
                rounded-full
                border
                border-amber-950/40
                bg-gradient-to-l
                from-[#8f4d20]
                via-[#5f2e13]
                to-[#3d1d0c]
                shadow-md
              "
            />

          </div>

        </div>

      </div>

    </div>,
    document.body
  )

}


export default TravelPact
