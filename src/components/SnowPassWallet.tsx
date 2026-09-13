import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from 'react'

import {
  createPortal,
} from 'react-dom'

import {
  createSnowPassRecord,
  deleteSnowPassPhoto,
  getSnowPassPhoto,
  loadSnowPasses,
  saveSnowPasses,
  saveSnowPassPhoto,
  type SnowPassRecord,
  type TicketType,
} from '../data/snowPassStorage'


// ============================================================
// Photo Hook
// ============================================================

function useSnowPassPhotoUrl(
  photoId:
    string |
    undefined
) {

  const [
    url,
    setUrl,
  ] = useState<string | null>(
    null
  )


  useEffect(() => {

    let cancelled =
      false

    let objectUrl:
      string |
      null =
      null


    const load =
      async () => {

        if (!photoId) {
          setUrl(null)
          return
        }


        try {

          const blob =
            await getSnowPassPhoto(
              photoId
            )


          if (
            !blob ||
            cancelled
          ) {
            return
          }


          objectUrl =
            URL.createObjectURL(
              blob
            )


          setUrl(
            objectUrl
          )

        } catch (error) {

          console.error(
            'Snow pass photo load failed:',
            error
          )

        }

      }


    void load()


    return () => {

      cancelled =
        true


      if (objectUrl) {

        URL.revokeObjectURL(
          objectUrl
        )

      }

    }

  }, [
    photoId,
  ])


  return url

}


// ============================================================
// Ticket Helpers
// ============================================================

function getTicketType(
  record:
    SnowPassRecord
):
  TicketType {

  return (
    record.ticketType ??
    'ski'
  )

}


function getSerial(
  record:
    SnowPassRecord
) {

  return (
    record.id
      .replace(
        /[^a-zA-Z0-9]/g,
        ''
      )
      .slice(-6)
      .toUpperCase()
      .padStart(
        6,
        '0'
      )
  )

}


// ============================================================
// Clickable Ticket Photo
// ============================================================

function TicketPhoto({
  record,
  heightClass =
    'h-[160px]',
  frameClass =
    '',
  imageClass =
    '',
  onOpenImage,
}: {
  record:
    SnowPassRecord

  heightClass?:
    string

  frameClass?:
    string

  imageClass?:
    string

  onOpenImage:
    (
      url:
        string,
      name:
        string
    ) => void
}) {

  const url =
    useSnowPassPhotoUrl(
      record.photoId
    )


  return (

    <button
      type="button"

      onPointerDown={event => {
        // 圖片本身是點擊展開區域，
        // 不觸發外層長按編輯。
        event.stopPropagation()
      }}

      onPointerUp={event => {
        event.stopPropagation()
      }}

      onClick={event => {

        event.stopPropagation()


        if (url) {

          onOpenImage(
            url,
            record.name
          )

        }

      }}

      className={`
        relative
        flex
        ${heightClass}
        w-full
        items-center
        justify-center
        overflow-hidden
        ${frameClass}
      `}
    >

      {url
        ? (
          <img
            src={
              url
            }

            alt={
              record.name
            }

            draggable={false}

            className={`
              h-full
              w-full
              select-none
              object-contain
              ${imageClass}
            `}
          />
        )
        : (
          <p
            className="
              text-[10px]
              font-medium
              tracking-[0.08em]
              text-[#7d7969]
            "
          >
            読み込み中...
          </p>
        )
      }


      {/* Expand hint */}

      {url && (

        <span
          className="
            pointer-events-none
            absolute
            bottom-2
            right-2
            flex
            h-7
            w-7
            items-center
            justify-center
            rounded-full
            border
            border-black/10
            bg-white/85
            text-[13px]
            text-slate-700
            shadow-sm
            backdrop-blur
          "
        >
          ↗
        </span>

      )}

    </button>

  )

}


// ============================================================
// Ski Lift Ticket
// Japanese paper リフト券
// ============================================================

function SkiTicketSlide({
  record,
  onOpenImage,
}: {
  record:
    SnowPassRecord

  onOpenImage:
    (
      url:
        string,
      name:
        string
    ) => void
}) {

  const serial =
    getSerial(
      record
    )


  return (

    <div
      className="
        relative
        mx-auto
        h-[302px]
        w-[calc(100%-6px)]
        max-w-[345px]
        overflow-hidden
        rounded-[4px]
        border
        border-[#b8ae91]
        bg-[#f4efd8]
        text-[#252820]
        shadow-[0_10px_24px_rgba(55,48,30,0.16)]
      "

      style={{
        backgroundImage:
          `
            radial-gradient(
              circle at 12% 18%,
              rgba(120,103,68,0.07) 0 0.7px,
              transparent 0.8px
            ),
            radial-gradient(
              circle at 76% 60%,
              rgba(120,103,68,0.055) 0 0.7px,
              transparent 0.8px
            ),
            repeating-linear-gradient(
              0deg,
              rgba(92,80,55,0.018) 0px,
              rgba(92,80,55,0.018) 1px,
              transparent 1px,
              transparent 5px
            )
          `,
      }}
    >

      {/* Ticket color header */}

      <div
        className="
          absolute
          inset-x-0
          top-0
          h-[52px]
          bg-[#2d7777]
        "
      >

        <div
          className="
            absolute
            inset-y-0
            right-0
            w-[78px]
            bg-[#e86e55]
          "
        />


        <div
          className="
            absolute
            inset-y-0
            right-[78px]
            w-[7px]
            bg-[#e7bd4f]
          "
        />


        <svg
          viewBox="0 0 72 34"

          className="
            absolute
            left-3
            top-[9px]
            h-[31px]
            w-[66px]
            opacity-90
          "

          aria-hidden="true"
        >

          <path
            d="
              M3 29
              L22 8
              L32 19
              L43 5
              L68 29
            "
            fill="none"
            stroke="#f7f2dc"
            strokeWidth="3.2"
            strokeLinecap="square"
            strokeLinejoin="miter"
          />

          <path
            d="
              M18 14
              L22 8
              L26 13
            "
            fill="none"
            stroke="#f7f2dc"
            strokeWidth="1.5"
          />

        </svg>


        <div
          className="
            absolute
            left-[84px]
            top-[9px]
          "
        >

          <p
            className="
              text-[9px]
              font-black
              tracking-[0.16em]
              text-[#f7f2dc]
            "
          >
            北海道 スキーリフト
          </p>

          <p
            className="
              mt-[3px]
              text-[7px]
              font-semibold
              tracking-[0.2em]
              text-[#f7f2dc]/70
            "
          >
            HOKKAIDO WINTER PASS
          </p>

        </div>


        <div
          className="
            absolute
            right-[10px]
            top-[7px]
            text-right
            text-[#fff8e7]
          "
        >

          <p
            className="
              text-[8px]
              font-bold
              tracking-[0.12em]
            "
          >
            大人
          </p>

          <p
            className="
              mt-[1px]
              text-[18px]
              font-black
              leading-none
            "
          >
            1日
          </p>

          <p
            className="
              mt-[1px]
              text-[6px]
              font-bold
              tracking-[0.1em]
              opacity-75
            "
          >
            DAY PASS
          </p>

        </div>

      </div>


      {/* Punch hole */}

      <div
        className="
          absolute
          left-[10px]
          top-[60px]
          z-20
          h-[13px]
          w-[13px]
          rounded-full
          border
          border-[#b7ad91]
          bg-[#ddd5ba]
          shadow-inner
        "
      />


      {/* Main body */}

      <div
        className="
          absolute
          bottom-0
          left-0
          right-[54px]
          top-[52px]
          px-[29px]
          pb-3
          pt-3
        "
      >

        <div
          className="
            flex
            items-start
            justify-between
            gap-3
          "
        >

          <div
            className="
              min-w-0
            "
          >

            <p
              className="
                text-[7px]
                font-bold
                tracking-[0.12em]
                text-[#6a6759]
              "
            >
              スキーリフト 1日券
            </p>

            <p
              className="
                mt-[2px]
                truncate
                text-[13px]
                font-black
                tracking-[0.02em]
                text-[#252820]
              "
            >
              {
                record.name ||
                'HOKKAIDO'
              }
            </p>

          </div>


          <div
            className="
              shrink-0
              border
              border-[#77705d]
              px-[7px]
              py-[4px]
              text-center
            "
          >

            <p
              className="
                text-[6px]
                font-bold
                tracking-[0.08em]
                text-[#656153]
              "
            >
              NO.
            </p>

            <p
              className="
                mt-[1px]
                font-mono
                text-[8px]
                font-bold
                tracking-[0.08em]
              "
            >
              {serial}
            </p>

          </div>

        </div>


        {/* Image takes a larger share of the ticket */}

        <div
          className="
            relative
            mt-[7px]
          "
        >

          <TicketPhoto
            record={
              record
            }

            onOpenImage={
              onOpenImage
            }

            heightClass="h-[170px]"

            frameClass="
              border
              border-[#aaa184]
              bg-[#fffdf4]
              p-[5px]
            "

            imageClass="
              mix-blend-multiply
            "
          />


          <span
            className="
              pointer-events-none
              absolute
              left-[4px]
              top-[4px]
              h-[8px]
              w-[8px]
              border-l
              border-t
              border-[#4d4d43]/55
            "
          />

          <span
            className="
              pointer-events-none
              absolute
              bottom-[4px]
              right-[4px]
              h-[8px]
              w-[8px]
              border-b
              border-r
              border-[#4d4d43]/55
            "
          />

        </div>


        <div
          className="
            mt-[5px]
            flex
            items-end
            justify-between
            gap-3
          "
        >

          <p
            className="
              text-[6px]
              font-semibold
              leading-[1.45]
              text-[#777160]
            "
          >
            ※ 本券はご本人様のみ有効
            <br />
            ※ 改札時に提示してください
          </p>


          <div
            className="
              rotate-[-4deg]
              border-2
              border-[#b55a4d]/55
              px-[7px]
              py-[3px]
              text-center
              text-[#a04e43]/70
            "
          >

            <p
              className="
                text-[7px]
                font-black
                tracking-[0.14em]
              "
            >
              2026
            </p>

          </div>

        </div>

      </div>


      {/* Perforated stub */}

      <div
        className="
          absolute
          bottom-0
          right-0
          top-[52px]
          w-[54px]
          border-l
          border-dashed
          border-[#8e876f]/70
          bg-[#ebe2c4]
        "
      >

        <div
          className="
            absolute
            -left-[6px]
            top-[28px]
            h-[12px]
            w-[12px]
            rounded-full
            bg-white
          "
        />

        <div
          className="
            absolute
            -left-[6px]
            bottom-[28px]
            h-[12px]
            w-[12px]
            rounded-full
            bg-white
          "
        />


        <div
          className="
            absolute
            inset-0
            flex
            items-center
            justify-center
          "
        >

          <p
            className="
              rotate-90
              whitespace-nowrap
              text-[8px]
              font-black
              tracking-[0.22em]
              text-[#5e5b50]
            "
          >
            リフト券 · 1 DAY
          </p>

        </div>


        <div
          className="
            absolute
            bottom-3
            left-1/2
            -translate-x-1/2
            font-mono
            text-[6px]
            font-bold
            text-[#777160]
          "
        >
          {serial.slice(-4)}
        </div>

      </div>

    </div>

  )

}


// ============================================================
// JR Green Ticket
// Inspired by Japanese JR green ticket / 指定席券 styling.
// ============================================================

function TrainTicketSlide({
  record,
  onOpenImage,
}: {
  record:
    SnowPassRecord

  onOpenImage:
    (
      url:
        string,
      name:
        string
    ) => void
}) {

  const serial =
    getSerial(
      record
    )


  return (

    <div
      className="
        relative
        mx-auto
        h-[302px]
        w-[calc(100%-6px)]
        max-w-[345px]
        overflow-hidden
        rounded-[3px]
        border
        border-[#8fa894]
        bg-[#dce8d8]
        text-[#163f2a]
        shadow-[0_10px_24px_rgba(30,60,40,0.15)]
      "

      style={{
        backgroundImage:
          `
            repeating-linear-gradient(
              0deg,
              rgba(39,89,55,0.025) 0px,
              rgba(39,89,55,0.025) 1px,
              transparent 1px,
              transparent 4px
            ),
            repeating-linear-gradient(
              90deg,
              rgba(255,255,255,0.08) 0px,
              rgba(255,255,255,0.08) 1px,
              transparent 1px,
              transparent 8px
            )
          `,
      }}
    >

      {/* JR-like green band */}

      <div
        className="
          absolute
          inset-x-0
          top-0
          h-[48px]
          border-b
          border-[#22633c]/30
          bg-[#2f7d4d]
          text-[#f4f8e9]
        "
      >

        <div
          className="
            absolute
            left-4
            top-[8px]
          "
        >

          <p
            className="
              text-[8px]
              font-black
              tracking-[0.18em]
            "
          >
            JR · GREEN TICKET
          </p>

          <p
            className="
              mt-[2px]
              text-[15px]
              font-black
              tracking-[0.08em]
            "
          >
            グリーン券
          </p>

        </div>


        <div
          className="
            pointer-events-none
            absolute
            right-[92px]
            top-1/2
            -translate-y-1/2
            text-[26px]
            font-black
            tracking-[-0.06em]
            text-white/18
            select-none
          "
        >
          JR
        </div>


        <div
          className="
            absolute
            right-3
            top-[7px]
            border
            border-white/45
            px-2
            py-[4px]
            text-center
          "
        >

          <p
            className="
              text-[6px]
              font-bold
              tracking-[0.1em]
            "
          >
            指定席
          </p>

          <p
            className="
              mt-[1px]
              text-[11px]
              font-black
            "
          >
            GREEN
          </p>

        </div>

      </div>


      {/* Dot-matrix ticket info */}

      <div
        className="
          absolute
          inset-x-0
          top-[48px]
          px-4
          pt-3
        "
      >

        <div
          className="
            flex
            items-start
            justify-between
            gap-2
            font-mono
          "
        >

          <div>

            <p
              className="
                text-[8px]
                font-bold
                tracking-[0.08em]
                text-[#315a40]
              "
            >
              ご利用区間 / TRAIN
            </p>

            <p
              className="
                mt-[2px]
                max-w-[230px]
                truncate
                text-[15px]
                font-black
                tracking-[0.04em]
                text-[#163f2a]
              "
            >
              {
                record.name ||
                'JR HOKKAIDO'
              }
            </p>

          </div>


          <div
            className="
              border
              border-[#477357]/45
              bg-[#edf4e7]/60
              px-2
              py-1
              text-center
            "
          >

            <p
              className="
                text-[6px]
                font-bold
              "
            >
              券番号
            </p>

            <p
              className="
                mt-[1px]
                text-[8px]
                font-black
              "
            >
              {serial}
            </p>

          </div>

        </div>


        {/* Larger uploaded ticket image */}

        <div
          className="
            mt-[8px]
          "
        >

          <TicketPhoto
            record={
              record
            }

            onOpenImage={
              onOpenImage
            }

            heightClass="h-[188px]"

            frameClass="
              border
              border-[#73907a]/50
              bg-[#f4f8ed]
              p-[5px]
            "
          />

        </div>


        <div
          className="
            mt-[5px]
            flex
            items-center
            justify-between
            font-mono
            text-[6px]
            font-bold
            text-[#55705b]
          "
        >

          <span>
            JR HOKKAIDO · 指定席券
          </span>

          <span>
            自動改札機対応
          </span>

        </div>

      </div>

    </div>

  )

}


// ============================================================
// Airline Boarding Pass
// ============================================================

function FlightTicketSlide({
  record,
  onOpenImage,
}: {
  record:
    SnowPassRecord

  onOpenImage:
    (
      url:
        string,
      name:
        string
    ) => void
}) {

  const serial =
    getSerial(
      record
    )


  return (

    <div
      className="
        relative
        mx-auto
        h-[302px]
        w-[calc(100%-6px)]
        max-w-[345px]
        overflow-hidden
        rounded-[8px]
        border
        border-[#bcc7d3]
        bg-[#f6f8fa]
        text-[#17283b]
        shadow-[0_10px_24px_rgba(37,55,75,0.15)]
      "
    >

      <div
        className="
          absolute
          inset-x-0
          top-0
          h-[50px]
          bg-[#173f64]
          text-white
        "
      >

        <div
          className="
            absolute
            left-4
            top-[8px]
          "
        >

          <p
            className="
              text-[7px]
              font-bold
              tracking-[0.18em]
              text-sky-100/65
            "
          >
            JAPAN DOMESTIC / INTERNATIONAL
          </p>

          <p
            className="
              mt-[2px]
              text-[15px]
              font-black
              tracking-[0.08em]
            "
          >
            BOARDING PASS
          </p>

        </div>


        <div
          className="
            pointer-events-none
            absolute
            right-[86px]
            top-1/2
            -translate-y-1/2
            text-white/16
            select-none
          "
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 64 64"
            className="h-[26px] w-[26px]"
            fill="none"
          >
            <path
              d="
                M8 35
                L28 31
                L49 17
                C52 15 55 15 56 17
                C57 19 55 22 52 24
                L38 34
                L49 41
                L46 45
                L32 39
                L22 47
                L18 44
                L24 37
                L8 35
                Z
              "
              fill="currentColor"
            />
          </svg>
        </div>


        <div
          className="
            absolute
            right-4
            top-[7px]
            text-right
          "
        >

          <p className="text-[6px] text-white/60">
            CLASS
          </p>

          <p className="text-[16px] font-black">
            Y
          </p>

        </div>

      </div>


      <div
        className="
          absolute
          inset-x-0
          top-[50px]
          px-4
          pt-3
        "
      >

        <div
          className="
            flex
            items-start
            justify-between
            gap-3
          "
        >

          <div className="min-w-0">

            <p
              className="
                text-[7px]
                font-bold
                tracking-[0.14em]
                text-slate-500
              "
            >
              PASSENGER / ROUTE
            </p>

            <p
              className="
                mt-[2px]
                truncate
                text-[14px]
                font-black
                tracking-[0.03em]
                text-[#17324c]
              "
            >
              {
                record.name ||
                'HOKKAIDO FLIGHT'
              }
            </p>

          </div>


          <div
            className="
              shrink-0
              border-l
              border-slate-300
              pl-3
              text-right
            "
          >

            <p className="text-[6px] font-bold text-slate-400">
              BOOKING
            </p>

            <p className="mt-[1px] font-mono text-[8px] font-black">
              {serial}
            </p>

          </div>

        </div>


        <div
          className="
            mt-[8px]
          "
        >

          <TicketPhoto
            record={
              record
            }

            onOpenImage={
              onOpenImage
            }

            heightClass="h-[184px]"

            frameClass="
              border
              border-slate-300
              bg-white
              p-[5px]
            "
          />

        </div>


        <div
          className="
            mt-[5px]
            flex
            items-center
            justify-between
            text-[6px]
            font-semibold
            tracking-[0.1em]
            text-slate-500
          "
        >

          <span>
            E-TICKET / QR
          </span>

          <span>
            BOARDING PASS
          </span>

        </div>

      </div>

    </div>

  )

}



// ============================================================
// Other Ticket
// Vintage Taiwan Rail hard ticket inspired styling.
// ============================================================

function OtherTicketSlide({
  record,
  onOpenImage,
}: {
  record:
    SnowPassRecord

  onOpenImage:
    (
      url:
        string,
      name:
        string
    ) => void
}) {

  const serial =
    getSerial(
      record
    )


  return (

    <div
      className="
        relative
        mx-auto
        h-[302px]
        w-[calc(100%-6px)]
        max-w-[345px]
        overflow-hidden
        rounded-[3px]
        border
        border-[#587054]
        bg-[#d9e0aa]
        text-[#21361f]
        shadow-[0_12px_24px_rgba(57,78,46,0.16)]
      "
      style={{
        backgroundImage:
          `
            repeating-linear-gradient(
              90deg,
              rgba(64,92,59,0.04) 0px,
              rgba(64,92,59,0.04) 1px,
              transparent 1px,
              transparent 6px
            ),
            repeating-linear-gradient(
              0deg,
              rgba(255,255,255,0.04) 0px,
              rgba(255,255,255,0.04) 1px,
              transparent 1px,
              transparent 5px
            ),
            linear-gradient(
              180deg,
              rgba(255,255,255,0.18) 0%,
              rgba(255,255,255,0) 16%
            )
          `,
      }}
    >

      <div
        className="
          absolute
          inset-x-0
          top-0
          h-[44px]
          border-b-2
          border-[#51684b]/55
          bg-[#6a865f]
          text-[#f8f6e8]
        "
      >

        <div
          className="
            absolute
            left-4
            top-[7px]
          "
        >

          <p
            className="
              text-[7px]
              font-black
              tracking-[0.26em]
              text-white/80
            "
          >
            TRAVEL TICKET
          </p>

          <p
            className="
              mt-[2px]
              text-[13px]
              font-black
              tracking-[0.18em]
            "
          >
            復古旅遊硬票
          </p>

        </div>


        <div
          className="
            pointer-events-none
            absolute
            left-1/2
            top-[5px]
            -translate-x-1/2
            select-none
          "
          aria-hidden="true"
        >

          <div
            className="
              flex
              h-[32px]
              w-[42px]
              items-center
              justify-center
              rounded-[5px]
              border
              border-white/55
              bg-white/[0.06]
              shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]
            "
          >

            <svg
              viewBox="0 0 60 44"
              className="
                h-[24px]
                w-[34px]
                text-white/82
              "
              fill="none"
            >

              <path
                d="
                  M7 11
                  H53
                  M7 33
                  H53
                "
                stroke="currentColor"
                strokeWidth="3.2"
                strokeLinecap="round"
              />

              <path
                d="
                  M14 10
                  V34
                  M46 10
                  V34
                "
                stroke="currentColor"
                strokeWidth="3.2"
                strokeLinecap="round"
              />

              <path
                d="
                  M20 14
                  H40
                  V30
                  H20
                  Z
                "
                stroke="currentColor"
                strokeWidth="3"
                strokeLinejoin="round"
              />

              <path
                d="
                  M24 18
                  H36
                  M24 26
                  H36
                "
                stroke="currentColor"
                strokeWidth="2.6"
                strokeLinecap="round"
              />

            </svg>

          </div>

        </div>


        <div
          className="
            absolute
            right-4
            top-[8px]
            text-right
          "
        >

          <p
            className="
              text-[6px]
              font-bold
              tracking-[0.14em]
              text-white/65
            "
          >
            TYPE
          </p>

          <p
            className="
              mt-[1px]
              text-[11px]
              font-black
              tracking-[0.12em]
            "
          >
            OTHER
          </p>

        </div>

      </div>


      <div
        className="
          absolute
          left-0
          top-[44px]
          h-[13px]
          w-full
          border-b
          border-dashed
          border-[#78916f]/85
          bg-[#ced89f]
        "
      />


      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-[63px]
          -translate-x-1/2
          whitespace-nowrap
          text-[18px]
          font-black
          tracking-[0.08em]
          text-[#4e774e]/14
          select-none
        "
      >
        十分 → 幸福
      </div>


      <div
        className="
          absolute
          inset-x-0
          bottom-0
          top-[57px]
          px-4
          pb-3
          pt-4
        "
      >

        <div
          className="
            flex
            items-start
            justify-between
            gap-2
          "
        >

          <div className="min-w-0">

            <p
              className="
                text-[8px]
                font-bold
                tracking-[0.13em]
                text-[#577053]
              "
            >
              區間 / 名稱
            </p>

            <p
              className="
                mt-[2px]
                max-w-[230px]
                truncate
                text-[15px]
                font-black
                tracking-[0.06em]
                text-[#19301c]
              "
            >
              {
                record.name ||
                '十分 → 幸福'
              }
            </p>

          </div>


          <div
            className="
              shrink-0
              rounded-[3px]
              border
              border-[#5f7858]/45
              bg-[#ebf0d0]/80
              px-2
              py-1
              text-center
              shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]
            "
          >

            <p
              className="
                text-[6px]
                font-bold
                tracking-[0.1em]
                text-[#607560]
              "
            >
              票號
            </p>

            <p
              className="
                mt-[1px]
                font-mono
                text-[8px]
                font-black
                tracking-[0.12em]
                text-[#1a351f]
              "
            >
              {serial}
            </p>

          </div>

        </div>


        <div
          className="
            relative
            mt-[8px]
            overflow-hidden
            rounded-[3px]
            border
            border-[#839975]/60
            bg-[#eef3d7]
            p-[6px]
            shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]
          "
        >

          <TicketPhoto
            record={
              record
            }

            onOpenImage={
              onOpenImage
            }

            heightClass="h-[176px]"

            frameClass="
              rounded-[2px]
              border
              border-[#9caf91]/55
              bg-[#fcfff7]
              p-[4px]
            "
          />


          <div
            className="
              pointer-events-none
              absolute
              right-[8px]
              top-[8px]
              rounded-[3px]
              border
              border-[#6b825f]/35
              bg-[#e9efcf]/88
              px-2
              py-[2px]
              text-[8px]
              font-black
              tracking-[0.14em]
              text-[#436446]/75
            "
          >
            硬票
          </div>

        </div>


        <div
          className="
            relative
            mt-[7px]
            overflow-hidden
            rounded-[8px]
            border
            border-[#7a926c]/30
            bg-[#e7eed0]/82
            px-3
            py-2
          "
        >

          <div
            className="
              flex
              items-center
              justify-between
              text-[7px]
              font-semibold
              text-[#52674e]
            "
          >

            <span>
              VINTAGE RAIL STYLE
            </span>

            <span>
              COLLECTIBLE PASS
            </span>

          </div>

        </div>

      </div>

    </div>

  )

}


// ============================================================
// Ticket Slide Router
// ============================================================

function SnowPassSlide({
  record,
  onOpenImage,
}: {
  record:
    SnowPassRecord

  onOpenImage:
    (
      url:
        string,
      name:
        string
    ) => void
}) {

  const ticketType =
    getTicketType(
      record
    )


  if (
    ticketType ===
    'train'
  ) {

    return (
      <TrainTicketSlide
        record={
          record
        }

        onOpenImage={
          onOpenImage
        }
      />
    )

  }


  if (
    ticketType ===
    'flight'
  ) {

    return (
      <FlightTicketSlide
        record={
          record
        }

        onOpenImage={
          onOpenImage
        }
      />
    )

  }


  if (
    ticketType ===
    'other'
  ) {

    return (
      <OtherTicketSlide
        record={
          record
        }

        onOpenImage={
          onOpenImage
        }
      />
    )

  }


  return (
    <SkiTicketSlide
      record={
        record
      }

      onOpenImage={
        onOpenImage
      }
    />
  )

}


// ============================================================
// Image Lightbox
// ============================================================

function TicketImageLightbox({
  open,
  url,
  name,
  onClose,
}: {
  open:
    boolean

  url:
    string |
    null

  name:
    string

  onClose:
    () => void
}) {

  if (
    !open ||
    !url ||
    typeof document ===
      'undefined'
  ) {
    return null
  }


  return createPortal(

    <div
      data-disable-swipe-back="true"

      className="
        fixed
        inset-0
        z-[1300]
        flex
        items-center
        justify-center
        bg-slate-950/90
        px-4
        py-[calc(18px+env(safe-area-inset-top))]
        backdrop-blur-md
      "

      onPointerDown={event => {
        event.stopPropagation()
      }}
    >

      <button
        type="button"

        aria-label="關閉票券圖片"

        onClick={
          onClose
        }

        className="
          absolute
          inset-0
        "
      />


      <div
        className="
          relative
          z-10
          flex
          max-h-[88dvh]
          w-full
          max-w-md
          flex-col
        "
      >

        <div
          className="
            mb-3
            flex
            items-center
            justify-between
            gap-3
            px-1
            text-white
          "
        >

          <div className="min-w-0">

            <p
              className="
                text-[8px]
                font-bold
                tracking-[0.16em]
                text-white/45
              "
            >
              TICKET IMAGE
            </p>

            <p
              className="
                mt-1
                truncate
                text-[14px]
                font-semibold
              "
            >
              {name}
            </p>

          </div>


          <button
            type="button"

            onClick={
              onClose
            }

            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-white/10
              text-[20px]
              text-white
            "
          >
            ×
          </button>

        </div>


        <div
          className="
            min-h-0
            flex-1
            overflow-auto
            rounded-[18px]
            bg-white
            p-2
          "
        >

          <img
            src={
              url
            }

            alt={
              name
            }

            draggable={false}

            className="
              mx-auto
              max-h-[80dvh]
              w-auto
              max-w-full
              object-contain
            "
          />

        </div>

      </div>

    </div>,
    document.body
  )

}


// ============================================================
// Editor Sheet
// ============================================================


type SnowPassEditorProps = {
  open:
    boolean

  mode:
    'create' |
    'edit'

  record?:
    SnowPassRecord

  onSave:
    (
      ticketType:
        TicketType,
      name:
        string,
      file:
        File |
        null
    ) => Promise<void>

  onDelete?:
    () => Promise<void>

  onClose:
    () => void
}


function SnowPassEditor({
  open,
  mode,
  record,
  onSave,
  onDelete,
  onClose,
}: SnowPassEditorProps) {

  const [
    ticketType,
    setTicketType,
  ] = useState<TicketType>(
    'ski'
  )


  const [
    name,
    setName,
  ] = useState('')


  const [
    file,
    setFile,
  ] = useState<
    File |
    null
  >(
    null
  )


  const [
    previewUrl,
    setPreviewUrl,
  ] = useState<
    string |
    null
  >(
    null
  )


  const [
    saving,
    setSaving,
  ] = useState(false)


  const inputRef =
    useRef<HTMLInputElement>(
      null
    )


  useEffect(() => {

    if (!open) {
      return
    }


    setTicketType(
      record?.ticketType ??
      'ski'
    )


    setName(
      record?.name ??
      ''
    )

    setFile(
      null
    )

    setPreviewUrl(
      null
    )

  }, [
    open,
    record,
  ])


  useEffect(() => {

    if (!file) {
      return
    }


    const url =
      URL.createObjectURL(
        file
      )


    setPreviewUrl(
      url
    )


    return () => {

      URL.revokeObjectURL(
        url
      )

    }

  }, [
    file,
  ])


  if (
    !open ||
    typeof document ===
      'undefined'
  ) {
    return null
  }


  const canSave =
    name.trim().length >
      0 &&
    (
      mode === 'edit' ||
      Boolean(
        file
      )
    )


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

      className="
        fixed
        inset-0
        z-[1150]
        flex
        items-end
        justify-center
      "
    >

      <button
        type="button"
        aria-label="關閉票券編輯"
        onClick={
          onClose
        }
        className="
          absolute
          inset-0
          bg-slate-950/40
          backdrop-blur-[2px]
        "
      />


      <section
        className="
          relative
          z-10
          w-full
          max-w-md
          rounded-t-[30px]
          bg-[#f7f7f5]
          px-5
          pb-[calc(24px+env(safe-area-inset-bottom))]
          pt-3
          shadow-2xl
        "
      >

        <div
          className="
            mx-auto
            h-1
            w-10
            rounded-full
            bg-slate-300
          "
        />


        <div
          className="
            mt-5
            flex
            items-start
            justify-between
          "
        >

          <div>

            <p
              className="
                text-[9px]
                font-semibold
                tracking-[0.18em]
                text-slate-500
              "
            >
              TICKET WALLET
            </p>


            <h2
              className="
                mt-1
                text-[24px]
                font-semibold
                tracking-[-0.03em]
                text-slate-950
              "
            >
              {
                mode === 'create'
                  ? '新增票券'
                  : '編輯票券'
              }
            </h2>

          </div>


          <button
            type="button"
            onClick={
              onClose
            }
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              bg-slate-200/80
              text-[18px]
              text-slate-700
            "
          >
            ×
          </button>

        </div>


        {/* Ticket type selector */}

        <div
          className="
            mt-4
            rounded-[12px]
            border
            border-slate-200
            bg-slate-100/80
            px-3
            py-2.5
          "
        >

          <p
            className="
              text-[9px]
              font-medium
              leading-5
              text-slate-500
            "
          >
            提示：建立完成後，長按票券即可進入編輯。
          </p>

        </div>


        <div
          className="
            mt-5
          "
        >

          <p
            className="
              text-[10px]
              font-semibold
              tracking-[0.1em]
              text-slate-600
            "
          >
            TICKET TYPE
          </p>


          <div
            className="
              mt-2
              grid
              grid-cols-4
              gap-2
            "
          >

            {(
              [
                {
                  id:
                    'ski',

                  label:
                    '雪票',

                  sub:
                    'リフト券',

                  icon:
                    '⛷',
                },
                {
                  id:
                    'train',

                  label:
                    '車票',

                  sub:
                    'JR 券',

                  icon:
                    '🚆',
                },
                {
                  id:
                    'flight',

                  label:
                    '機票',

                  sub:
                    'BOARDING',

                  icon:
                    '✈',
                },
                {
                  id:
                    'other',

                  label:
                    '其他',

                  sub:
                    '票券',

                  icon:
                    '🎫',
                },
              ] as const
            ).map(
              item => {

                const selected =
                  ticketType ===
                  item.id


                return (

                  <button
                    key={
                      item.id
                    }

                    type="button"

                    onClick={() =>
                      setTicketType(
                        item.id
                      )
                    }

                    className={`
                      rounded-[15px]
                      border
                      px-2
                      py-3
                      text-center
                      transition
                      active:scale-[0.98]

                      ${
                        selected
                          ? `
                              border-slate-900
                              bg-slate-900
                              text-white
                              shadow-sm
                            `
                          : `
                              border-slate-200
                              bg-white
                              text-slate-700
                            `
                      }
                    `}
                  >

                    <div
                      className="
                        text-[18px]
                        leading-none
                      "
                    >
                      {item.icon}
                    </div>

                    <p
                      className="
                        mt-2
                        text-[11px]
                        font-bold
                      "
                    >
                      {item.label}
                    </p>

                    <p
                      className={`
                        mt-1
                        text-[7px]
                        font-semibold
                        tracking-[0.08em]

                        ${
                          selected
                            ? 'text-white/55'
                            : 'text-slate-400'
                        }
                      `}
                    >
                      {item.sub}
                    </p>

                  </button>

                )

              }
            )}

          </div>

        </div>


        <label
          className="
            mt-5
            block
          "
        >

          <span
            className="
              text-[10px]
              font-semibold
              tracking-[0.1em]
              text-slate-600
            "
          >
            NAME / CODE
          </span>


          <input
            type="text"
            value={
              name
            }
            placeholder={
              ticketType ===
                'train'
                ? '例如：札幌 → 旭川 / JR HOKKAIDO'
                : ticketType ===
                  'flight'
                ? '例如：TPE → CTS / BR116'
                : ticketType ===
                  'other'
                ? '例如：十分 → 幸福 / 旅遊紀念票'
                : '例如：FURANO / NISEKO'
            }
            onChange={event =>
              setName(
                event.target.value
              )
            }
            className="
              mt-2
              w-full
              rounded-[16px]
              border
              border-slate-200
              bg-white
              px-4
              py-3
              text-[14px]
              text-slate-900
              outline-none
              placeholder:text-slate-400
              focus:border-slate-400
            "
          />

        </label>


        <div
          className="
            mt-4
          "
        >

          <button
            type="button"
            onClick={() =>
              inputRef.current
                ?.click()
            }
            className="
              w-full
              rounded-[16px]
              border
              border-slate-200
              bg-white
              px-4
              py-3
              text-[11px]
              font-semibold
              text-slate-700
            "
          >
            {
              mode === 'edit'
                ? '重新選擇票券圖片'
                : ticketType ===
                  'train'
                ? '選擇 JR 車票圖片'
                : ticketType ===
                  'flight'
                ? '選擇機票 / Boarding Pass 圖片'
                : ticketType ===
                  'other'
                ? '選擇其他票券圖片'
                : '選擇雪票照片'
            }
          </button>


          <input
            ref={
              inputRef
            }
            type="file"
            accept="image/*"
            onChange={(
              event:
                ChangeEvent<HTMLInputElement>
            ) => {

              const next =
                event.target.files?.[
                  0
                ] ??
                null


              setFile(
                next
              )


              event.target.value =
                ''

            }}
            className="hidden"
          />


          {previewUrl && (

            <div
              className="
                mt-3
                flex
                h-[180px]
                items-center
                justify-center
                rounded-[18px]
                bg-white
                p-3
              "
            >
              <img
                src={
                  previewUrl
                }
                alt="票券預覽"
                className="
                  h-full
                  w-full
                  object-contain
                "
              />
            </div>

          )}

        </div>


        <button
          type="button"
          disabled={
            !canSave ||
            saving
          }

          onClick={() => {

            setSaving(
              true
            )


            void onSave(
              ticketType,
              name,
              file
            )
              .finally(
                () => {

                  setSaving(
                    false
                  )

                }
              )

          }}

          className="
            mt-5
            w-full
            rounded-[17px]
            bg-slate-950
            px-4
            py-4
            text-[13px]
            font-semibold
            text-white
            disabled:opacity-30
          "
        >
          {
            saving
              ? '儲存中...'
              : '儲存'
          }
        </button>


        {
          mode === 'edit' &&
          onDelete && (

            <button
              type="button"

              onClick={() => {

                void onDelete()

              }}

              className="
                mt-2
                w-full
                rounded-[15px]
                px-4
                py-3
                text-[11px]
                font-semibold
                text-red-500
              "
            >
              刪除此票券
            </button>

          )
        }

      </section>

    </div>,
    document.body
  )

}


// ============================================================
// Main Component
// ============================================================

function SnowPassWallet() {

  const [
    records,
    setRecords,
  ] = useState<
    SnowPassRecord[]
  >(
    loadSnowPasses
  )


  const [
    selectedIndex,
    setSelectedIndex,
  ] = useState(0)


  const [
    editorOpen,
    setEditorOpen,
  ] = useState(false)


  const [
    editorMode,
    setEditorMode,
  ] = useState<
    'create' |
    'edit'
  >(
    'create'
  )


  const [
    lightboxUrl,
    setLightboxUrl,
  ] = useState<
    string |
    null
  >(
    null
  )


  const [
    lightboxName,
    setLightboxName,
  ] = useState('')


  const scrollerRef =
    useRef<HTMLDivElement>(
      null
    )


  const longPressTimerRef =
    useRef<
      number |
      null
    >(
      null
    )


  const pressRef =
    useRef({
      x:
        0,

      y:
        0,

      moved:
        false,
    })


  const current =
    records[
      selectedIndex
    ]


  useEffect(() => {

    saveSnowPasses(
      records
    )


    if (
      selectedIndex >
      records.length - 1
    ) {

      setSelectedIndex(
        Math.max(
          0,
          records.length - 1
        )
      )

    }

  }, [
    records,
    selectedIndex,
  ])


  const openTicketImage = (
    url:
      string,

    name:
      string
  ) => {

    setLightboxUrl(
      url
    )

    setLightboxName(
      name
    )

  }


  const clearLongPress =
    () => {

      if (
        longPressTimerRef.current !==
        null
      ) {

        window.clearTimeout(
          longPressTimerRef.current
        )

        longPressTimerRef.current =
          null

      }

    }


  const handlePassPointerDown =
    (
      event:
        ReactPointerEvent<HTMLDivElement>
    ) => {

      event.stopPropagation()


      pressRef.current = {
        x:
          event.clientX,

        y:
          event.clientY,

        moved:
          false,
      }


      clearLongPress()


      if (!current) {
        return
      }


      longPressTimerRef.current =
        window.setTimeout(
          () => {

            if (
              pressRef.current.moved
            ) {
              return
            }


            setEditorMode(
              'edit'
            )

            setEditorOpen(
              true
            )

          },
          650
        )

    }


  const handlePassPointerMove =
    (
      event:
        ReactPointerEvent<HTMLDivElement>
    ) => {

      event.stopPropagation()


      const dx =
        event.clientX -
        pressRef.current.x


      const dy =
        event.clientY -
        pressRef.current.y


      if (
        Math.abs(
          dx
        ) > 8 ||
        Math.abs(
          dy
        ) > 8
      ) {

        pressRef.current.moved =
          true

        clearLongPress()

      }

    }


  const finishPassPointer =
    (
      event:
        ReactPointerEvent<HTMLDivElement>
    ) => {

      event.stopPropagation()

      clearLongPress()

    }


  const handleScroll =
    () => {

      const element =
        scrollerRef.current


      if (
        !element ||
        records.length === 0
      ) {
        return
      }


      const index =
        Math.round(
          element.scrollLeft /
          Math.max(
            element.clientWidth,
            1
          )
        )


      setSelectedIndex(
        Math.max(
          0,
          Math.min(
            index,
            records.length - 1
          )
        )
      )

    }


  const handleWheel =
    (
      event:
        ReactWheelEvent<HTMLDivElement>
    ) => {

      const element =
        scrollerRef.current


      if (!element) {
        return
      }


      if (
        Math.abs(
          event.deltaY
        ) >
        Math.abs(
          event.deltaX
        )
      ) {

        element.scrollLeft +=
          event.deltaY

        event.preventDefault()

      }

    }


  const openCreate =
    () => {

      setEditorMode(
        'create'
      )

      setEditorOpen(
        true
      )

    }


  const saveEditor =
    async (
      ticketType:
        TicketType,
      name:
        string,
      file:
        File |
        null
    ) => {

      if (
        editorMode ===
        'create'
      ) {

        if (!file) {
          return
        }


        const photoId =
          await saveSnowPassPhoto(
            file
          )


        const next =
          createSnowPassRecord(
            name,
            photoId,
            ticketType
          )


        setRecords(
          currentRecords => [
            ...currentRecords,
            next,
          ]
        )


        window.setTimeout(
          () => {

            const element =
              scrollerRef.current


            if (!element) {
              return
            }


            element.scrollTo({
              left:
                element.scrollWidth,

              behavior:
                'smooth',
            })

          },
          0
        )

      } else if (current) {

        let nextPhotoId =
          current.photoId


        if (file) {

          nextPhotoId =
            await saveSnowPassPhoto(
              file
            )


          try {

            await deleteSnowPassPhoto(
              current.photoId
            )

          } catch (error) {

            console.error(
              'Old snow pass photo cleanup failed:',
              error
            )

          }

        }


        setRecords(
          currentRecords =>
            currentRecords.map(
              item =>
                item.id ===
                current.id
                  ? {
                      ...item,

                      ticketType,

                      name:
                        name.trim(),

                      photoId:
                        nextPhotoId,
                    }
                  : item
            )
        )

      }


      setEditorOpen(
        false
      )

    }


  const deleteCurrent =
    async () => {

      if (!current) {
        return
      }


      const confirmed =
        window.confirm(
          `確定要刪除票券「${current.name}」嗎？`
        )


      if (!confirmed) {
        return
      }


      try {

        await deleteSnowPassPhoto(
          current.photoId
        )

      } catch (error) {

        console.error(
          'Snow pass photo delete failed:',
          error
        )

      }


      setRecords(
        currentRecords =>
          currentRecords.filter(
            item =>
              item.id !==
              current.id
          )
      )


      setEditorOpen(
        false
      )

    }


  return (

    <section
      className="
        mt-5
      "
    >

      <div
        className="
          relative
          overflow-hidden
          rounded-[20px]
          border
          border-[#c7bfa5]
          bg-[#eee6cf]
          px-3
          pb-3
          pt-3
          text-[#292b24]
          shadow-[0_10px_28px_rgba(69,60,39,0.12)]
        "

        style={{
          backgroundImage:
            `
              repeating-linear-gradient(
                0deg,
                rgba(98,83,49,0.018) 0px,
                rgba(98,83,49,0.018) 1px,
                transparent 1px,
                transparent 6px
              )
            `,
        }}
      >

        {/* ==================================================
            Header / ticket office style
        ================================================== */}

        <div
          className="
            flex
            items-start
            justify-between
            gap-4
            px-1
          "
        >

          <div>

            <div
              className="
                flex
                items-center
                gap-2
              "
            >

              <span
                className="
                  inline-block
                  h-[7px]
                  w-[7px]
                  rounded-full
                  bg-[#cf604e]
                "
              />

              <p
                className="
                  text-[8px]
                  font-black
                  tracking-[0.16em]
                  text-[#5f5c50]
                "
              >
                TRAVEL TICKETS
              </p>

            </div>


            <p
              className="
                mt-[3px]
                text-[15px]
                font-black
                tracking-[0.06em]
                text-[#292b24]
              "
            >
              快速票券
            </p>


            <p
              className="
                mt-[2px]
                text-[7px]
                font-semibold
                tracking-[0.16em]
                text-[#777160]
              "
            >
              QUICK TICKET WALLET
            </p>

          </div>


          <button
            type="button"

            onClick={
              openCreate
            }

            aria-label="新增票券"

            className="
              flex
              h-[38px]
              w-[38px]
              items-center
              justify-center
              rounded-full
              border
              border-[#8b836d]
              bg-[#f8f3df]
              text-[22px]
              font-light
              leading-none
              text-[#4d4c43]
              shadow-[2px_2px_0_rgba(94,82,56,0.10)]
              transition
              active:translate-y-px
            "
          >
            ＋
          </button>

        </div>


        <div
          className="
            mx-1
            mt-3
            border-t
            border-dashed
            border-[#9b927a]/70
          "
        />


        {records.length === 0
          ? (
            <button
              type="button"

              onClick={
                openCreate
              }

              className="
                relative
                mt-3
                flex
                h-[214px]
                w-full
                flex-col
                items-center
                justify-center
                overflow-hidden
                border
                border-[#b9af91]
                bg-[#f6efd8]
                text-center
                shadow-inner
              "
            >

              {/* Blank-ticket color strip */}

              <div
                className="
                  absolute
                  inset-x-0
                  top-0
                  h-[34px]
                  bg-[#2d7777]
                "
              >

                <div
                  className="
                    absolute
                    right-0
                    top-0
                    h-full
                    w-[72px]
                    bg-[#e86e55]
                  "
                />

              </div>


              <div
                className="
                  mt-5
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-[#a69c7f]
                  bg-[#ede4c9]
                  text-[24px]
                  font-light
                  text-[#666153]
                "
              >
                ＋
              </div>


              <p
                className="
                  mt-3
                  text-[12px]
                  font-black
                  tracking-[0.04em]
                  text-[#393a33]
                "
              >
                票券を追加
              </p>


              <p
                className="
                  mt-1
                  text-[9px]
                  font-medium
                  text-[#777160]
                "
              >
                加入雪票 / JR 車票 / 機票 / 其他
              </p>


              <div
                className="
                  absolute
                  bottom-4
                  text-[7px]
                  font-semibold
                  tracking-[0.16em]
                  text-[#989079]
                "
              >
                HOKKAIDO · 2026
              </div>

            </button>
          )
          : (
            <>

              <div
                ref={
                  scrollerRef
                }

                data-horizontal-scroll="true"

                onPointerDown={
                  handlePassPointerDown
                }

                onPointerMove={
                  handlePassPointerMove
                }

                onPointerUp={
                  finishPassPointer
                }

                onPointerCancel={
                  finishPassPointer
                }

                onScroll={
                  handleScroll
                }

                onWheel={
                  handleWheel
                }

                className="
                  mt-3
                  flex
                  touch-pan-x
                  snap-x
                  snap-mandatory
                  overflow-x-auto
                  overscroll-x-contain
                  scroll-smooth
                  [scrollbar-width:none]
                  [&::-webkit-scrollbar]:hidden
                "
              >

                {records.map(
                  record => (

                    <div
                      key={
                        record.id
                      }

                      className="
                        min-w-full
                        snap-center
                        px-[1px]
                        py-1
                      "
                    >
                      <SnowPassSlide
                        record={
                          record
                        }

                        onOpenImage={
                          openTicketImage
                        }
                      />
                    </div>

                  )
                )}

              </div>


              {/* Ticket wallet footer */}

              <div
                className="
                  mt-2
                  flex
                  items-center
                  justify-between
                  gap-3
                  border-t
                  border-dashed
                  border-[#9b927a]/65
                  px-1
                  pt-2
                "
              >

                <div
                  className="
                    min-w-0
                  "
                >

                  <p
                    className="
                      truncate
                      text-[11px]
                      font-black
                      tracking-[0.04em]
                      text-[#383930]
                    "
                  >
                    {
                      current?.name ??
                      ''
                    }
                  </p>


                  <p
                    className="
                      mt-[2px]
                      text-[7px]
                      font-semibold
                      tracking-[0.1em]
                      text-[#827b68]
                    "
                  >
                    {
                      selectedIndex + 1
                    } / {
                      records.length
                    }
                    {' · '}
                    長押しで編集
                  </p>

                </div>


                <div
                  className="
                    flex
                    items-center
                    gap-[5px]
                  "
                >

                  {records.map(
                    record => (

                      <span
                        key={
                          record.id
                        }

                        className={`
                          h-[5px]
                          rounded-full
                          transition-all
                          duration-300

                          ${
                            record.id ===
                            current?.id
                              ? `
                                  w-[18px]
                                  bg-[#2d7777]
                                `
                              : `
                                  w-[5px]
                                  bg-[#a69d83]
                                `
                          }
                        `}
                      />

                    )
                  )}

                </div>

              </div>

            </>
          )
        }

      </div>


      <TicketImageLightbox
        open={
          Boolean(
            lightboxUrl
          )
        }

        url={
          lightboxUrl
        }

        name={
          lightboxName
        }

        onClose={() => {

          setLightboxUrl(
            null
          )

          setLightboxName(
            ''
          )

        }}
      />


      <SnowPassEditor
        open={
          editorOpen
        }

        mode={
          editorMode
        }

        record={
          editorMode ===
          'edit'
            ? current
            : undefined
        }

        onSave={
          saveEditor
        }

        onDelete={
          editorMode ===
          'edit'
            ? deleteCurrent
            : undefined
        }

        onClose={() =>
          setEditorOpen(
            false
          )
        }
      />

    </section>

  )

}


export default SnowPassWallet
