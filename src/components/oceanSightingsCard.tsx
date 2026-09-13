import {
  useEffect,
  useMemo,
  useState,
} from 'react'


import {
  fetchOceanSightings,
  OCEAN_SIGHTING_REGION_NAMES,
  type OceanSightingCategory,
  type OceanSightingItem,
  type OceanSightingsResponse,
} from '../data/oceanSightings'


// ============================================================
// Sightings Icon
// ============================================================

function SightingIcon({
  category,
}: {
  category:
    OceanSightingCategory
}) {

  if (
    category ===
      'manta' ||
    category ===
      'ray'
  ) {

    return (

      <svg
        viewBox="0 0 32 24"
        className="
          h-[22px]
          w-[29px]
        "
        fill="none"
        aria-hidden="true"
      >

        <path
          d="
            M16 11
            C11 4 5 3 2.5 5.5
            C6.5 7.4 8 11 8.5 15
            C11 14.1 13.1 14.1 16 17.8
            C18.9 14.1 21 14.1 23.5 15
            C24 11 25.5 7.4 29.5 5.5
            C27 3 21 4 16 11Z
          "
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        <path
          d="M16 11V21"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />

      </svg>

    )

  }


  if (
    category ===
    'turtle'
  ) {

    return (

      <svg
        viewBox="0 0 32 24"
        className="
          h-[22px]
          w-[29px]
        "
        fill="none"
        aria-hidden="true"
      >

        <ellipse
          cx="16"
          cy="12"
          rx="7"
          ry="5.5"
          stroke="currentColor"
          strokeWidth="1.5"
        />

        <path
          d="M9.2 9L4 5.5M9.2 15L4 18.5M22.8 9L28 5.5M22.8 15L28 18.5"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />

        <path
          d="M23 12H29"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />

      </svg>

    )

  }


  if (
    category ===
      'cetacean'
  ) {

    return (

      <svg
        viewBox="0 0 34 24"
        className="
          h-[22px]
          w-[30px]
        "
        fill="none"
        aria-hidden="true"
      >

        <path
          d="
            M3 13
            C8 6 17 5 24 9
            C27 10.7 29 11 32 9
            C31 12.5 29 15 25 16
            C18 19 10 18 5 15
            Z
          "
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        <path
          d="M24 9C24 5.5 26 3.5 29 3"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />

      </svg>

    )

  }


  // Fish / shark / whale shark / school / sunfish / wildlife

  return (

    <svg
      viewBox="0 0 34 24"
      className="
        h-[22px]
        w-[30px]
      "
      fill="none"
      aria-hidden="true"
    >

      <path
        d="
          M5 12
          C9 5.8 20 5.6 26 9.5
          L32 5.5
          L30.5 12
          L32 18.5
          L26 14.5
          C20 18.4 9 18.2 5 12Z
        "
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      <circle
        cx="10"
        cy="10"
        r="1"
        fill="currentColor"
      />


      {category ===
        'whale-shark' && (

        <>
          <circle
            cx="14"
            cy="9"
            r=".7"
            fill="currentColor"
          />

          <circle
            cx="18"
            cy="12"
            r=".7"
            fill="currentColor"
          />

          <circle
            cx="21"
            cy="9.5"
            r=".7"
            fill="currentColor"
          />

          <circle
            cx="14.5"
            cy="14"
            r=".7"
            fill="currentColor"
          />
        </>

      )}

    </svg>

  )

}


// ============================================================
// Time
// ============================================================

function getFreshness(
  date:
    string
) {

  const timestamp =
    Date.parse(
      date
    )


  const days =
    Number.isFinite(
      timestamp
    )
      ? Math.max(
          0,
          Math.floor(
            (
              Date.now() -
              timestamp
            ) /
            86400000
          )
        )
      : 999


  if (
    days <=
    3
  ) {

    return {
      label:
        'VERY RECENT',

      days,
    }

  }


  if (
    days <=
    7
  ) {

    return {
      label:
        'RECENT',

      days,
    }

  }


  if (
    days <=
    30
  ) {

    return {
      label:
        'THIS MONTH',

      days,
    }

  }


  return {
    label:
      'ARCHIVE',

    days,
  }

}


function formatSightingDate(
  date:
    string
) {

  const parsed =
    new Date(
      date
    )


  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {
    return '--'
  }


  return new Intl.DateTimeFormat(
    'zh-TW',
    {
      month:
        'numeric',

      day:
        'numeric',
    }
  )
    .format(
      parsed
    )

}


// ============================================================
// Source
// ============================================================

function sourceBadge(
  item:
    OceanSightingItem
) {

  switch (
    item.kind
  ) {

    case 'official':
      return 'OFFICIAL'

    case 'threads':
      return 'THREADS'

    case 'youtube':
      return 'YOUTUBE'

    default:
      return 'NEWS'

  }

}



function sourceBadgeClass(
  item:
    OceanSightingItem
) {

  switch (
    item.kind
  ) {

    case 'youtube':
      return `
        border-red-400/35
        bg-red-500/28
        text-red-100
      `

    case 'threads':
      return `
        border-white/15
        bg-black/70
        text-white/90
      `

    case 'official':
      return `
        border-emerald-300/18
        bg-emerald-300/[0.08]
        text-emerald-100/78
      `

    default:
      return `
        border-white/[0.06]
        bg-white/[0.025]
        text-white/27
      `

  }

}


function SourceStatusLight({
  label,
  active,
}: {
  label:
    string

  active:
    boolean
}) {

  return (

    <div
      className="
        flex
        items-center
        gap-1.5
      "
    >

      <span
        className="
          relative
          flex
          h-[8px]
          w-[8px]
          shrink-0
        "
      >

        <span
          className={`
            absolute
            inset-0
            rounded-full

            ${
              active
                ? 'bg-emerald-400/28'
                : 'bg-red-400/24'
            }
          `}
        />

        <span
          className={`
            relative
            h-[8px]
            w-[8px]
            rounded-full

            ${
              active
                ? 'bg-emerald-400'
                : 'bg-red-400'
            }
          `}
        />

      </span>


      <span
        className={`
          text-[length:var(--dh-f6)]
          font-black
          tracking-[0.07em]

          ${
            active
              ? 'text-emerald-100/78'
              : 'text-red-100/65'
          }
        `}
      >
        {label}
      </span>

    </div>

  )

}


// ============================================================
// Item
// ============================================================

function SightingRow({
  item,
}: {
  item:
    OceanSightingItem
}) {

  const freshness =
    getFreshness(
      item.date
    )


  const content = (

    <div
      className="
        flex
        w-full
        items-center
        gap-3
        rounded-[16px]
        border
        border-white/[0.05]
        bg-white/[0.025]
        px-3
        py-3
        text-left
        transition
      "
    >

      <div
        className="
          flex
          h-[39px]
          w-[42px]
          shrink-0
          items-center
          justify-center
          rounded-[13px]
          border
          border-amber-200/15
          bg-amber-200/[0.045]
          text-amber-100/72
        "
      >

        <SightingIcon
          category={
            item.category
          }
        />

      </div>


      <div
        className="
          min-w-0
          flex-1
        "
      >

        <div
          className="
            flex
            min-w-0
            items-center
            gap-2
          "
        >

          <p
            className="
              truncate
              text-[length:var(--dh-f11)]
              font-semibold
              text-white/86
            "
          >
            {item.speciesLabel}
          </p>


          <span
            className={`
              shrink-0
              rounded-full
              border
              px-1.5
              py-[2px]
              text-[length:var(--dh-f6)]
              font-black
              tracking-[0.06em]

              ${sourceBadgeClass(
                item
              )}
            `}
          >
            {sourceBadge(
              item
            )}
          </span>

        </div>


        <p
          className="
            mt-[3px]
            truncate
            text-[length:var(--dh-f8)]
            font-medium
            text-white/45
          "
        >
          {item.title}
        </p>


        {(item.authorName ||
          item.kind ===
            'threads' ||
          item.kind ===
            'youtube') && (

          <p
            className={`
              mt-1
              truncate
              text-[length:var(--dh-f7)]
              font-semibold

              ${
                item.kind ===
                  'youtube'
                  ? 'text-red-100/48'
                  : item.kind ===
                      'threads'
                    ? 'text-white/48'
                    : 'text-amber-100/34'
              }
            `}
          >
            {
              item.authorName ??
              item.sourceName
            }
          </p>

        )}


        <p
          className="
            mt-1
            truncate
            text-[length:var(--dh-f7)]
            font-semibold
            tracking-[0.04em]
            text-white/24
          "
        >
          {item.regionName}
          {' · '}
          {item.locationLabel}
          {' · '}
          {formatSightingDate(
            item.date
          )}
          {
            item.count !==
              null
              ? ` · ${item.count}`
              : ''
          }
        </p>

      </div>


      <div
        className="
          shrink-0
          text-right
        "
      >

        <p
          className="
            text-[length:var(--dh-f6)]
            font-black
            tracking-[0.06em]
            text-amber-100/46
          "
        >
          {freshness.label}
        </p>


        <p
          className="
            mt-1
            text-[length:var(--dh-f7)]
            font-semibold
            text-white/22
          "
        >
          {
            freshness.days ===
              0
              ? 'TODAY'
              : `${freshness.days}D`
          }
        </p>

      </div>

    </div>

  )


  if (
    !item.url
  ) {
    return content
  }


  return (

    <a
      href={
        item.url
      }

      target="_blank"
      rel="noopener noreferrer"

      onPointerDown={
        event =>
          event.stopPropagation()
      }

      className="
        block
        active:scale-[0.99]
      "
    >
      {content}
    </a>

  )

}


// ============================================================
// Component
// ============================================================

export default function OceanSightingsCard({
  regionId,
}: {
  regionId:
    string
}) {

  const [
    data,
    setData,
  ] = useState<
    OceanSightingsResponse |
    null
  >(
    null
  )


  const [
    loading,
    setLoading,
  ] = useState(
    true
  )


  const [
    error,
    setError,
  ] = useState<
    string |
    null
  >(
    null
  )


  const [
    expanded,
    setExpanded,
  ] = useState(
    false
  )


  const refresh =
    async (
      signal?:
        AbortSignal
    ) => {

      setLoading(
        true
      )


      try {

        const next =
          await fetchOceanSightings({
            regionId,
            limit:
              12,
            days:
              120,
            signal,
          })


        setData(
          next
        )

        setError(
          null
        )

      } catch (
        nextError
      ) {

        if (
          signal
            ?.aborted
        ) {
          return
        }


        setError(
          nextError instanceof
            Error
            ? nextError.message
            : '資料讀取失敗'
        )

      } finally {

        if (
          !signal
            ?.aborted
        ) {

          setLoading(
            false
          )

        }

      }

    }


  useEffect(() => {

    const controller =
      new AbortController()


    setExpanded(
      false
    )


    void refresh(
      controller.signal
    )


    const timer =
      window.setInterval(
        () => {

          void refresh(
            controller.signal
          )

        },
        30 *
        60 *
        1000
      )


    return () => {

      controller.abort()

      window.clearInterval(
        timer
      )

    }

  }, [
    regionId,
  ])


  const visibleItems =
    useMemo(
      () =>
        data
          ?.items
          .slice(
            0,
            expanded
              ? 12
              : 4
          ) ??
        [],
      [
        data,
        expanded,
      ]
    )


  const requestedRegionName =
    OCEAN_SIGHTING_REGION_NAMES[
      regionId
    ] ??
    '目前區域'


  const usedRegionName =
    data
      ? OCEAN_SIGHTING_REGION_NAMES[
          data.usedRegionId
        ] ??
        requestedRegionName
      : requestedRegionName


  return (

    <div
      className="
        mx-4
        mt-3
        overflow-hidden
        rounded-[22px]
        border
        border-amber-100/[0.10]
        bg-gradient-to-br
        from-[#142718]/78
        via-[#08252d]/76
        to-[#03151e]/78
        backdrop-blur-xl
      "
    >

      <div
        className="
          flex
          items-start
          justify-between
          gap-3
          px-3.5
          pb-3
          pt-3.5
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
                relative
                flex
                h-[9px]
                w-[9px]
              "
            >

              <span
                className="
                  absolute
                  inset-0
                  animate-ping
                  rounded-full
                  bg-amber-200/30
                "
              />

              <span
                className="
                  relative
                  h-[9px]
                  w-[9px]
                  rounded-full
                  bg-amber-200/75
                "
              />

            </span>


            <p
              className="
                text-[length:var(--dh-f8)]
                font-black
                tracking-[0.15em]
                text-amber-100/52
              "
            >
              OCEAN SIGHTINGS
            </p>

          </div>


          <p
            className="
              mt-1
              text-[length:var(--dh-f14)]
              font-semibold
              text-white/88
            "
          >
            近期大物雷達
          </p>


          <p
            className="
              mt-1
              text-[length:var(--dh-f7)]
              font-semibold
              text-white/25
            "
          >
            {
              data
                ?.fallbackToTaiwan
                ? `${requestedRegionName}近期無資料 · 顯示${usedRegionName}`
                : usedRegionName
            }
          </p>

        </div>


        <button
          type="button"

          onClick={() => {
            void refresh()
          }}

          disabled={
            loading
          }

          className="
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-full
            border
            border-amber-100/10
            bg-white/[0.025]
            text-[length:var(--dh-f11)]
            text-amber-100/38
            transition
            active:scale-90
            disabled:opacity-30
          "
          aria-label="重新整理近期大物目擊"
        >
          ↻
        </button>

      </div>


      <div
        className="
          border-t
          border-white/[0.045]
          px-3
          pb-3
          pt-3
        "
      >

        {loading &&
         !data && (

          <div
            className="
              rounded-[16px]
              border
              border-white/[0.05]
              bg-white/[0.02]
              px-3
              py-5
              text-center
            "
          >

            <p
              className="
                text-[length:var(--dh-f9)]
                font-semibold
                text-white/30
              "
            >
              正在掃描近期海洋目擊資料…
            </p>

          </div>

        )}


        {!loading &&
         visibleItems.length ===
          0 && (

          <div
            className="
              rounded-[16px]
              border
              border-white/[0.05]
              bg-white/[0.02]
              px-3
              py-5
              text-center
            "
          >

            <p
              className="
                text-[length:var(--dh-f9)]
                font-semibold
                text-white/34
              "
            >
              近期沒有符合條件的大物目擊資料
            </p>


            {error && (

              <p
                className="
                  mt-2
                  text-[length:var(--dh-f7)]
                  text-white/20
                "
              >
                {error}
              </p>

            )}

          </div>

        )}


        {visibleItems.length >
          0 && (

          <div
            className="
              space-y-2
            "
          >

            {visibleItems.map(
              item => (

                <SightingRow
                  key={
                    item.id
                  }

                  item={
                    item
                  }
                />

              )
            )}

          </div>

        )}


        {(
          data
            ?.items
            .length ??
          0
        ) >
          4 && (

          <button
            type="button"

            onClick={() =>
              setExpanded(
                current =>
                  !current
              )
            }

            className="
              mt-2
              flex
              w-full
              items-center
              justify-center
              rounded-[12px]
              border
              border-white/[0.045]
              bg-white/[0.018]
              py-2
              text-[length:var(--dh-f7)]
              font-semibold
              tracking-[0.06em]
              text-white/28
            "
          >
            {
              expanded
                ? '收合'
                : `查看更多 ${
                    Math.min(
                      data
                        ?.items
                        .length ??
                      0,
                      12
                    )
                  } 筆`
            }
          </button>

        )}


        <div
          className="
            mt-3
            flex
            flex-wrap
            items-center
            gap-x-3
            gap-y-1
            border-t
            border-white/[0.045]
            pt-3
          "
        >

          <SourceStatusLight
            label="iOCEAN"
            active={
              Boolean(
                data
                  ?.officialAvailable
              )
            }
          />


          <SourceStatusLight
            label="NEWS"
            active={
              Boolean(
                data
                  ?.newsAvailable
              )
            }
          />


          <SourceStatusLight
            label="THREADS"
            active={
              Boolean(
                data
                  ?.threadsAvailable
              )
            }
          />


          <SourceStatusLight
            label="YOUTUBE"
            active={
              Boolean(
                data
                  ?.youtubeAvailable
              )
            }
          />

          <span
            className="
              w-full
              text-[length:var(--dh-f6)]
              font-semibold
              leading-4
              text-white/18
            "
          >
            社群目擊未經官方驗證 · 目擊紀錄 ≠ 今日可見機率
          </span>

        </div>

      </div>

    </div>

  )

}
