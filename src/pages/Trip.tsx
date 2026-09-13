import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type WheelEvent as ReactWheelEvent,
} from 'react'

import {
  createPortal,
} from 'react-dom'

import ExpenseBookSheet from '../components/ExpenseBookSheet'

import {
  TRIP_LOCK_STORAGE_KEY,
  TRIP_META_STORAGE_KEY,
  TRIP_STORAGE_KEY,
  generateTripDays,
  tripDays,
  tripInfo,
  type ExpenseCurrency,
  type TripActivity,
  type TripActivityType,
  type TripExpense,
  type TripDay,
  type TripMeta,
} from '../data/tripData'

import {
  EXPENSE_CURRENCIES,
  EXPENSE_DISPLAY_CURRENCY_KEY,
  formatExpenseAmount,
  isExpenseCurrency,
  sumExpensesInCurrency,
} from '../data/expenseCurrency'


// ============================================================
// Activity Form
// ============================================================

type ActivityFormState = {
  time: string
  title: string
  type: TripActivityType
  location: string

  // Optional manual Google Maps override.
  // Example:
  // https://maps.app.goo.gl/xxxx
  googleMapsUrl: string
  mapConfirmed: boolean

  note: string
}


const EMPTY_ACTIVITY_FORM: ActivityFormState = {
  time: '',
  title: '',
  type: 'attraction',
  location: '',
  googleMapsUrl: '',
  mapConfirmed: false,
  note: '',
}


// ============================================================
// Helpers
// ============================================================

function formatDayDate(
  dateString: string
) {
  const date =
    new Date(
      `${dateString}T12:00:00`
    )

  return {
    month:
      date.getMonth() + 1,

    day:
      date.getDate(),

    weekday:
      date
        .toLocaleDateString(
          'en-US',
          {
            weekday: 'short',
          }
        )
        .toUpperCase(),
  }
}


function shiftDateString(
  dateString:
    string,
  days:
    number
) {

  const date =
    new Date(
      `${dateString}T12:00:00`
    )


  date.setDate(
    date.getDate() +
    days
  )


  const year =
    date.getFullYear()


  const month =
    String(
      date.getMonth() + 1
    )
      .padStart(
        2,
        '0'
      )


  const day =
    String(
      date.getDate()
    )
      .padStart(
        2,
        '0'
      )


  return `${year}-${month}-${day}`

}


function formatFullDate(
  dateString: string
) {
  const date =
    new Date(
      `${dateString}T12:00:00`
    )

  return date.toLocaleDateString(
    'zh-TW',
    {
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    }
  )
}


function formatShortDate(
  dateString: string
) {
  const date =
    new Date(
      `${dateString}T12:00:00`
    )

  const month =
    String(
      date.getMonth() + 1
    ).padStart(
      2,
      '0'
    )

  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      '0'
    )

  return `${month}.${day}`
}


function createActivityId() {
  if (
    typeof crypto !== 'undefined' &&
    'randomUUID' in crypto
  ) {
    return crypto.randomUUID()
  }

  return `activity-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`
}



function getActivityExpenseTotal(
  activity: TripActivity | undefined,
  displayCurrency: ExpenseCurrency
) {

  return sumExpensesInCurrency(
    activity?.expenses,
    displayCurrency
  )

}


function loadExpenseDisplayCurrency():
  ExpenseCurrency {

  try {

    const saved =
      localStorage.getItem(
        EXPENSE_DISPLAY_CURRENCY_KEY
      )


    if (
      isExpenseCurrency(
        saved
      )
    ) {
      return saved
    }

  } catch (error) {

    console.error(
      'Expense display currency load failed:',
      error
    )

  }


  return 'JPY'

}


// ============================================================
// Google Maps URLs
//
// Maps URLs 不需要 Google API Key。
// Search:
// https://www.google.com/maps/search/?api=1&query=...
//
// Directions:
// https://www.google.com/maps/dir/?api=1&destination=...
// ============================================================

function buildGoogleMapsSearchUrl(
  location: string,
  context?: string
) {

  const query =
    [
      location.trim(),
      context?.trim(),
    ]
      .filter(
        Boolean
      )
      .join(
        ' '
      )


  return (
    'https://www.google.com/maps/search/' +
    `?api=1&query=${encodeURIComponent(
      query
    )}`
  )
}


function buildGoogleMapsDirectionsUrl(
  location: string
) {

  return (
    'https://www.google.com/maps/dir/' +
    `?api=1&destination=${encodeURIComponent(
      location.trim()
    )}&travelmode=driving`
  )
}


// ============================================================
// Manual Google Maps Link
// ============================================================

function isGoogleMapsUrl(
  value: string
) {

  const input =
    value.trim()


  if (!input) {
    return false
  }


  try {

    const url =
      new URL(
        input
      )


    if (
      url.protocol !==
      'https:'
    ) {
      return false
    }


    const host =
      url.hostname
        .toLowerCase()


    return (
      host ===
        'maps.app.goo.gl' ||
      host ===
        'goo.gl' ||
      host ===
        'www.google.com' ||
      host ===
        'google.com' ||
      host ===
        'maps.google.com'
    )

  } catch {

    return false

  }
}


// ============================================================
// Multi-stop Google Maps Directions
//
// origin intentionally omitted:
// Google Maps can use the device's relevant/current location.
//
// Timeline:
// Current location
//   -> waypoint 1
//   -> waypoint 2
//   -> ...
//   -> final destination
//
// IMPORTANT:
// Manual googleMapsUrl is perfect for single-place navigation,
// but short URLs cannot reliably be converted back into a waypoint.
// Therefore the daily route uses activity.location strings.
// ============================================================

function buildGoogleMapsMultiStopDirectionsUrl(
  activities: TripActivity[]
) {

  const locations =
    activities
      .map(
        activity =>
          activity.location
            ?.trim()
      )
      .filter(
        (
          location
        ): location is string =>
          Boolean(
            location
          )
      )


  if (
    locations.length === 0
  ) {
    return null
  }


  if (
    locations.length === 1
  ) {

    return buildGoogleMapsDirectionsUrl(
      locations[0]
    )

  }


  const destination =
    locations[
      locations.length - 1
    ]


  const waypoints =
    locations.slice(
      0,
      -1
    )


  const params =
    new URLSearchParams({
      api:
        '1',

      destination,

      travelmode:
        'driving',
    })


  if (
    waypoints.length > 0
  ) {

    params.set(
      'waypoints',
      waypoints.join(
        '|'
      )
    )

  }


  return (
    'https://www.google.com/maps/dir/?' +
    params.toString()
  )
}


function openExternalMapUrl(
  url: string
) {

  window.open(
    url,
    '_blank',
    'noopener,noreferrer'
  )
}


function loadTripMeta(): TripMeta {
  try {
    const saved =
      localStorage.getItem(
        TRIP_META_STORAGE_KEY
      )

    if (saved) {
      return {
        ...tripInfo,
        ...(JSON.parse(
          saved
        ) as Partial<TripMeta>),
      }
    }
  } catch (error) {
    console.error(
      'Trip meta load failed:',
      error
    )
  }

  return {
    ...tripInfo,
  }
}


function loadTripDays(): TripDay[] {
  try {
    const saved =
      localStorage.getItem(
        TRIP_STORAGE_KEY
      )

    if (saved) {
      const parsed =
        JSON.parse(
          saved
        ) as TripDay[]

      if (
        Array.isArray(
          parsed
        ) &&
        parsed.length > 0
      ) {
        return parsed
      }
    }
  } catch (error) {
    console.error(
      'Trip days load failed:',
      error
    )
  }

  return tripDays
}


function loadTripLock() {
  try {
    return (
      localStorage.getItem(
        TRIP_LOCK_STORAGE_KEY
      ) === 'true'
    )
  } catch {
    return false
  }
}


// ============================================================
// Trip Page Title
//
// 最上方大標題獨立保存，預設維持「行程」。
// ============================================================

const TRIP_PAGE_TITLE_STORAGE_KEY =
  'travel_v100_trip_page_title_v1'


function loadTripPageTitle() {

  try {

    return (
      localStorage.getItem(
        TRIP_PAGE_TITLE_STORAGE_KEY
      ) ||
      '行程'
    )

  } catch {

    return '行程'

  }

}


// ============================================================
// Activity Icon
// ============================================================

function ActivityIcon({
  type,
  className = '',
}: {
  type: TripActivityType
  className?: string
}) {

  const common = {
    width: 16,
    height: 16,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap:
      'round' as const,
    strokeLinejoin:
      'round' as const,
    className,
    'aria-hidden': true,
  }


  switch (type) {

    case 'transport':
      return (
        <svg {...common}>
          <path d="M4 17h16" />
          <path d="M6 17l1-8h10l1 8" />
          <path d="M8 9l1-3h6l1 3" />
          <circle cx="8" cy="17" r="1.5" />
          <circle cx="16" cy="17" r="1.5" />
        </svg>
      )

    case 'attraction':
      return (
        <svg {...common}>
          <path d="M12 21s6-5.1 6-11a6 6 0 1 0-12 0c0 5.9 6 11 6 11Z" />
          <circle cx="12" cy="10" r="2" />
        </svg>
      )

    case 'food':
      return (
        <svg {...common}>
          <path d="M7 3v8" />
          <path d="M4.5 3v4.5A2.5 2.5 0 0 0 7 10" />
          <path d="M9.5 3v4.5A2.5 2.5 0 0 1 7 10" />
          <path d="M7 10v11" />
          <path d="M16 3v18" />
          <path d="M16 3c3 2 3 7 0 9" />
        </svg>
      )

    case 'hotel':
      return (
        <svg {...common}>
          <path d="M3 11l9-7 9 7" />
          <path d="M5 10v10h14V10" />
          <path d="M9 20v-6h6v6" />
        </svg>
      )

    case 'ski':
      return (
        <svg {...common}>
          <circle cx="14" cy="5" r="1.7" />
          <path d="M12.5 8l-2.5 4 4 2 2.5 4" />
          <path d="M11 10l5 2" />
          <path d="M6 20l13-3" />
          <path d="M5 17l12 4" />
        </svg>
      )

    case 'shopping':
      return (
        <svg {...common}>
          <path d="M5 8h14l-1 12H6L5 8Z" />
          <path d="M9 9V7a3 3 0 0 1 6 0v2" />
        </svg>
      )

    default:
      return (
        <svg {...common}>
          <path d="M12 3l2.2 5.2L20 9l-4 3.8 1 5.7-5-2.8-5 2.8 1-5.7L4 9l5.8-.8L12 3Z" />
        </svg>
      )
  }
}


// ============================================================
// Activity Meta
// ============================================================

type ActivityMeta = {
  label: string
  displayName: string
}


const ACTIVITY_TYPES: TripActivityType[] = [
  'transport',
  'attraction',
  'food',
  'hotel',
  'ski',
  'shopping',
  'other',
]


function getActivityMeta(
  type: TripActivityType
): ActivityMeta {

  switch (type) {
    case 'transport':
      return {
        label: 'TRANSPORT',
        displayName: '交通',
      }

    case 'attraction':
      return {
        label: 'PLACE',
        displayName: '景點',
      }

    case 'food':
      return {
        label: 'FOOD',
        displayName: '餐廳',
      }

    case 'hotel':
      return {
        label: 'STAY',
        displayName: '飯店',
      }

    case 'ski':
      return {
        label: 'SKI',
        displayName: '滑雪',
      }

    case 'shopping':
      return {
        label: 'SHOP',
        displayName: '購物',
      }

    default:
      return {
        label: 'PLAN',
        displayName: '其他',
      }
  }
}


// ============================================================
// Generic Bottom Sheet
// ============================================================

function BottomSheet({
  open,
  onClose,
  children,
}: {
  open: boolean
  onClose: () => void
  children: ReactNode
}) {

  if (
    !open ||
    typeof document === 'undefined'
  ) {
    return null
  }


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
        z-[999]
        flex
        items-end
        justify-center
      "
    >
      <button
        type="button"
        aria-label="關閉"
        onClick={onClose}
        className="
          absolute
          inset-0
          bg-slate-950/35
          backdrop-blur-[2px]
        "
      />

      <section
        className="
          relative
          z-10
          max-h-[90dvh]
          w-full
          max-w-md
          overflow-y-auto
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

        {children}
      </section>
    </div>,
    document.body
  )
}


// ============================================================
// Activity Row
// ============================================================

function ActivityRow({
  activity,
  isLast,
  locked,
  displayCurrency,
  onEdit,
  onOpenExpense,
}: {
  activity: TripActivity
  isLast: boolean
  locked: boolean
  displayCurrency: ExpenseCurrency

  onEdit: (
    activity: TripActivity
  ) => void

  onOpenExpense: (
    activity: TripActivity
  ) => void
}) {

  const meta =
    getActivityMeta(
      activity.type
    )


  const hasLocation =
    Boolean(
      activity.location?.trim()
    )


  const expenseTotal =
    getActivityExpenseTotal(
      activity,
      displayCurrency
    )


  const openNavigation = () => {

    // 使用者有人工確認 Google Maps Link 時，
    // 永遠優先使用指定連結。
    if (
      activity.googleMapsUrl &&
      isGoogleMapsUrl(
        activity.googleMapsUrl
      )
    ) {

      openExternalMapUrl(
        activity.googleMapsUrl
      )

      return
    }


    if (!activity.location) {
      return
    }


    openExternalMapUrl(
      buildGoogleMapsDirectionsUrl(
        activity.location
      )
    )

  }


  return (
    <div
      className="
        grid
        w-full
        grid-cols-[54px_28px_1fr_38px]
        gap-3
        text-left
      "
    >
      {/* Time */}
      <div
        className="
          pt-[4px]
          text-right
        "
      >
        <p
          className="
            text-[11px]
            font-medium
            tracking-[0.03em]
            text-slate-600
          "
        >
          {activity.time || '--:--'}
        </p>
      </div>


      {/* Timeline + Type Icon */}
      <div
        className="
          relative
          flex
          justify-center
        "
      >
        <div
          className="
            relative
            z-10
            flex
            h-7
            w-7
            items-center
            justify-center
            rounded-full
            border
            border-slate-300/80
            bg-white/85
            text-slate-700
            shadow-sm
            backdrop-blur
          "
        >
          <ActivityIcon
            type={activity.type}
            className="h-[14px] w-[14px]"
          />
        </div>

        {!isLast && (
          <div
            className="
              absolute
              bottom-[-20px]
              top-[29px]
              w-px
              bg-slate-300/70
            "
          />
        )}
      </div>


      {/* Main Content */}
      <button
        type="button"
        disabled={locked}
        onClick={() =>
          onEdit(
            activity
          )
        }
        className={`
          min-w-0
          text-left
          transition
          enabled:active:opacity-60
          disabled:cursor-default

          ${
            isLast
              ? 'pb-1'
              : 'pb-7'
          }
        `}
      >
        <p
          className="
            text-[9px]
            font-semibold
            tracking-[0.16em]
            text-slate-500
          "
        >
          {meta.label}
        </p>

        <p
          className="
            mt-1
            text-[15px]
            font-semibold
            leading-[1.35]
            text-slate-950
          "
        >
          {activity.title}
        </p>


        {activity.location && (
          <div
            className="
              mt-1
              flex
              items-center
              gap-1.5
            "
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="
                shrink-0
                text-slate-500
              "
            >
              <path d="M12 21s6-5.1 6-11a6 6 0 1 0-12 0c0 5.9 6 11 6 11Z" />
              <circle cx="12" cy="10" r="2" />
            </svg>

            <p
              className="
                truncate
                text-[11px]
                leading-5
                text-slate-500
              "
            >
              {activity.location}
            </p>

            {
              (
                activity.mapConfirmed ||
                (
                  activity.googleMapsUrl &&
                  isGoogleMapsUrl(
                    activity.googleMapsUrl
                  )
                )
              ) && (
                <span
                  title="已指定 Google Maps 導航位置"
                  className="
                    shrink-0
                    rounded-full
                    bg-emerald-100
                    px-1.5
                    py-0.5
                    text-[8px]
                    font-semibold
                    tracking-[0.05em]
                    text-emerald-700
                  "
                >
                  MAP ✓
                </span>
              )
            }
          </div>
        )}


        {activity.note && (
          <p
            className="
              mt-2
              line-clamp-2
              text-[11px]
              leading-5
              text-slate-500
            "
          >
            {activity.note}
          </p>
        )}
      </button>


      {/* Navigation + Expense */}
      <div
        className={`
          flex
          flex-col
          items-end
          gap-2

          ${
            isLast
              ? 'pb-1'
              : 'pb-7'
          }
        `}
      >

        {hasLocation && (
          <button
            type="button"
            aria-label={`導航到 ${activity.location}`}
            title="Google Maps 導航"
            onClick={openNavigation}
            className="
              mt-1
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-full
              border
              border-sky-200/80
              bg-sky-50/90
              text-sky-600
              shadow-sm
              transition
              active:scale-90
            "
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20 4L10.5 20l-1.8-7.2L2 10l18-6Z" />
              <path d="M8.7 12.8L20 4" />
            </svg>
          </button>
        )}


        <button
          type="button"
          aria-label={`記錄 ${activity.title} 的消費`}
          title="消費記帳"
          onClick={() =>
            onOpenExpense(
              activity
            )
          }
          className="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-full
            border
            border-amber-200/80
            bg-amber-50/90
            text-amber-600
            shadow-sm
            transition
            active:scale-90
          "
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" />
            <path d="M9 8h6" />
            <path d="M9 12h6" />
            <path d="M9 16h3" />
          </svg>
        </button>


        {expenseTotal > 0 && (
          <p
            className="
              max-w-[76px]
              text-right
              text-[11px]
              font-bold
              leading-4
              tracking-[-0.02em]
              text-amber-800
            "
          >
            {formatExpenseAmount(
              expenseTotal,
              displayCurrency
            )}
          </p>
        )}

      </div>
    </div>
  )
}


// ============================================================
// Activity Editor Sheet
// ============================================================

function ActivityEditorSheet({
  open,
  mode,
  dayLabel,
  form,
  locationContext,
  expenseTotal,
  expenseCurrency,
  onChange,
  onClose,
  onSave,
  onDelete,
}: {
  open: boolean
  mode: 'create' | 'edit'
  dayLabel: string
  form: ActivityFormState
  locationContext?: string
  expenseTotal?: number
  expenseCurrency: ExpenseCurrency

  onChange: (
    next: ActivityFormState
  ) => void
  onClose: () => void
  onSave: () => void
  onDelete?: () => void
}) {

  const canSave =
    form.title.trim().length > 0


  // ==========================================================
  // TYPE Horizontal Drag
  //
  // Touch:
  //   使用瀏覽器原生 horizontal scroll
  //
  // Mouse:
  //   按住 TYPE 區域即可左右拖曳
  //
  // Wheel:
  //   滑鼠滾輪在 TYPE 區域上會轉成水平移動
  // ==========================================================

  const typeScrollerRef =
    useRef<HTMLDivElement>(
      null
    )


  const typeDragRef =
    useRef({
      active: false,
      startX: 0,
      scrollLeft: 0,
      moved: false,
    })


  const [
    typeDragging,
    setTypeDragging,
  ] = useState(false)


  const handleTypePointerDown = (
    event: ReactPointerEvent<HTMLDivElement>
  ) => {

    // 不讓 Pointer 事件往 TripApp 傳，
    // 避免水平滑 TYPE 時同時觸發 Swipe Back。
    event.stopPropagation()


    // 手機 / 平板使用瀏覽器原生 touch scroll。
    // 不做 pointer capture，這樣 tap button 仍可正常 click。
    if (
      event.pointerType !==
      'mouse'
    ) {
      return
    }


    const element =
      typeScrollerRef.current


    if (!element) {
      return
    }


    // 先記錄「可能開始拖曳」，
    // 但不要立刻 setPointerCapture。
    // 只有真的移動超過 threshold 才進入 drag，
    // 這樣單純 click TYPE button 不會被吃掉。
    typeDragRef.current = {
      active: true,
      startX:
        event.clientX,
      scrollLeft:
        element.scrollLeft,
      moved: false,
    }

  }


  const handleTypePointerMove = (
    event: ReactPointerEvent<HTMLDivElement>
  ) => {

    event.stopPropagation()


    if (
      !typeDragRef.current.active ||
      event.pointerType !==
      'mouse'
    ) {
      return
    }


    const element =
      typeScrollerRef.current


    if (!element) {
      return
    }


    const dx =
      event.clientX -
      typeDragRef.current.startX


    // 小於 8px 視為 click / tap，
    // 不啟動拖曳，也不阻止 button click。
    if (
      !typeDragRef.current.moved &&
      Math.abs(dx) < 8
    ) {
      return
    }


    if (
      !typeDragRef.current.moved
    ) {

      typeDragRef.current.moved =
        true


      setTypeDragging(
        true
      )


      // 真的開始拖曳後才 capture pointer
      // 避免普通 click 被 scroller 攔截。
      element.setPointerCapture(
        event.pointerId
      )

    }


    element.scrollLeft =
      typeDragRef.current.scrollLeft -
      dx


    event.preventDefault()

  }


  const finishTypePointerDrag = (
    event: ReactPointerEvent<HTMLDivElement>
  ) => {

    event.stopPropagation()


    if (
      !typeDragRef.current.active
    ) {
      return
    }


    typeDragRef.current.active =
      false


    setTypeDragging(
      false
    )


    const element =
      typeScrollerRef.current


    if (
      element?.hasPointerCapture(
        event.pointerId
      )
    ) {

      element.releasePointerCapture(
        event.pointerId
      )

    }


    // moved 保留到 click 階段，
    // 讓拖曳結束後產生的 click 可以被忽略。
    // 再下一個 event loop reset。
    window.setTimeout(
      () => {

        typeDragRef.current.moved =
          false

      },
      0
    )

  }


  const handleTypeWheel = (
    event: ReactWheelEvent<HTMLDivElement>
  ) => {

    const element =
      typeScrollerRef.current


    if (!element) {
      return
    }


    // 在 TYPE 列上滾動滑鼠滾輪時，
    // 優先將垂直 wheel 轉成 horizontal scroll。
    const movement =
      Math.abs(event.deltaX) >
      Math.abs(event.deltaY)
        ? event.deltaX
        : event.deltaY


    if (
      movement === 0
    ) {
      return
    }


    element.scrollLeft +=
      movement


    event.preventDefault()

  }


  return (
    <BottomSheet
      open={open}
      onClose={onClose}
    >
      <div
        className="
          mt-5
          flex
          items-start
          justify-between
          gap-4
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
            {dayLabel}
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
                ? '新增行程'
                : '編輯行程'
            }
          </h2>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-full
            bg-slate-200/70
            text-[18px]
            font-light
            text-slate-600
            transition
            active:scale-95
          "
        >
          ×
        </button>
      </div>


      {
        mode === 'edit' && (
          <div
            className="
              mt-5
              flex
              items-center
              justify-between
              rounded-[18px]
              border
              border-amber-200/70
              bg-amber-50/70
              px-4
              py-3
            "
          >

            <div>
              <p
                className="
                  text-[9px]
                  font-semibold
                  tracking-[0.14em]
                  text-amber-600/70
                "
              >
                TOTAL SPEND
              </p>

              <p
                className="
                  mt-1
                  text-[11px]
                  text-slate-500
                "
              >
                此行程目前總消費
              </p>
            </div>


            <p
              className="
                text-[18px]
                font-semibold
                tracking-[-0.03em]
                text-amber-700
              "
            >
              {formatExpenseAmount(
                expenseTotal ??
                0,
                expenseCurrency
              )}
            </p>

          </div>
        )
      }


      <div
        className="
          mt-6
          space-y-5
        "
      >
        <label className="block">
          <span
            className="
              text-[10px]
              font-semibold
              tracking-[0.12em]
              text-slate-500
            "
          >
            TIME
          </span>

          <input
            type="time"
            value={form.time}
            onChange={event =>
              onChange({
                ...form,
                time:
                  event.target.value,
              })
            }
            className="
              mt-2
              w-full
              rounded-[18px]
              border
              border-slate-200
              bg-white
              px-4
              py-3
              text-[15px]
              text-slate-900
              outline-none
              transition
              focus:border-slate-400
            "
          />
        </label>


        <div>
          <p
            className="
              text-[10px]
              font-semibold
              tracking-[0.12em]
              text-slate-500
            "
          >
            TYPE
          </p>

          <div
            className="
              relative
              -mx-5
              mt-2
            "
          >

            {/* 左側淡出 */}

            <div
              className="
                pointer-events-none
                absolute
                bottom-0
                left-0
                top-0
                z-20
                w-5
                bg-gradient-to-r
                from-[#f7f7f5]
                to-transparent
              "
            />


            {/* 右側淡出 + 提示 */}

            <div
              className="
                pointer-events-none
                absolute
                bottom-0
                right-0
                top-0
                z-20
                flex
                w-9
                items-center
                justify-end
                bg-gradient-to-l
                from-[#f7f7f5]
                via-[#f7f7f5]/80
                to-transparent
                pr-2
              "
            >
              <span
                className="
                  text-[16px]
                  font-light
                  text-slate-500
                "
              >
                ›
              </span>
            </div>


            <div
              ref={
                typeScrollerRef
              }

              data-horizontal-scroll="true"

              onPointerDown={
                handleTypePointerDown
              }

              onPointerMove={
                handleTypePointerMove
              }

              onPointerUp={
                finishTypePointerDrag
              }

              onPointerCancel={
                finishTypePointerDrag
              }

              onWheel={
                handleTypeWheel
              }

              className={`
                flex
                touch-pan-x
                gap-2
                overflow-x-auto
                overflow-y-hidden
                px-5
                pb-2
                pr-12
                overscroll-x-contain
                select-none
                [scrollbar-width:none]
                [-ms-overflow-style:none]
                [&::-webkit-scrollbar]:hidden

                ${
                  typeDragging
                    ? 'cursor-grabbing scroll-auto'
                    : 'cursor-grab scroll-smooth'
                }
              `}

              style={{
                WebkitOverflowScrolling:
                  'touch',
              }}
            >
              {ACTIVITY_TYPES.map(
              type => {
                const meta =
                  getActivityMeta(
                    type
                  )

                const selected =
                  form.type ===
                  type

                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {

                      // 如果剛剛是滑鼠 drag，
                      // 不要把 drag 結尾誤判成選擇 TYPE。
                      if (
                        typeDragRef.current.moved
                      ) {
                        return
                      }


                      onChange({
                        ...form,
                        type,
                      })

                    }}
                    className={`
                      flex
                      shrink-0
                      items-center
                      gap-1.5
                      rounded-full
                      border
                      px-3
                      py-2
                      text-[11px]
                      font-medium
                      transition-all
                      ${
                        selected
                          ? `
                              border-slate-900
                              bg-slate-950
                              text-white
                            `
                          : `
                              border-slate-200
                              bg-white
                              text-slate-600
                            `
                      }
                    `}
                  >
                    <ActivityIcon
                      type={type}
                      className="h-[13px] w-[13px]"
                    />

                    {meta.displayName}
                  </button>
                )
              }
            )}
            </div>
          </div>
        </div>


        <label className="block">
          <span
            className="
              text-[10px]
              font-semibold
              tracking-[0.12em]
              text-slate-500
            "
          >
            TITLE
          </span>

          <input
            type="text"
            value={form.title}
            placeholder="例如：富良野滑雪場"
            onChange={event =>
              onChange({
                ...form,
                title:
                  event.target.value,
              })
            }
            className="
              mt-2
              w-full
              rounded-[18px]
              border
              border-slate-200
              bg-white
              px-4
              py-3
              text-[15px]
              text-slate-900
              outline-none
              transition
              placeholder:text-slate-500
              focus:border-slate-400
            "
          />
        </label>


        <div>
          <label className="block">
            <span
              className="
                text-[10px]
                font-semibold
                tracking-[0.12em]
                text-slate-500
              "
            >
              LOCATION
            </span>

            <input
              type="text"
              value={form.location}
              placeholder="例如：富良野滑雪場"
              onChange={event =>
                onChange({
                  ...form,

                  location:
                    event.target.value,

                  mapConfirmed:
                    false,
                })
              }
              className="
                mt-2
                w-full
                rounded-[18px]
                border
                border-slate-200
                bg-white
                px-4
                py-3
                text-[15px]
                text-slate-900
                outline-none
                transition
                placeholder:text-slate-500
                focus:border-slate-400
              "
            />
          </label>


          {/* Google Maps Search */}

          {form.location.trim() && (

            <button
              type="button"

              onClick={() => {

                openExternalMapUrl(
                  buildGoogleMapsSearchUrl(
                    form.location,
                    locationContext
                  )
                )

              }}

              className="
                mt-2
                flex
                w-full
                items-center
                justify-between
                rounded-[16px]
                border
                border-slate-200
                bg-white/70
                px-4
                py-3
                text-left
                transition
                active:scale-[0.99]
              "
            >

              <div
                className="
                  flex
                  min-w-0
                  items-center
                  gap-3
                "
              >

                <div
                  className="
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-sky-50
                    text-sky-600
                  "
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M12 21s6-5.1 6-11a6 6 0 1 0-12 0c0 5.9 6 11 6 11Z" />
                    <circle cx="12" cy="10" r="2" />
                  </svg>
                </div>


                <div
                  className="
                    min-w-0
                  "
                >

                  <p
                    className="
                      text-[11px]
                      font-medium
                      text-slate-700
                    "
                  >
                    在 Google Maps 確認
                  </p>

                  <p
                    className="
                      mt-0.5
                      truncate
                      text-[9px]
                      text-slate-500
                    "
                  >
                    搜尋「{form.location}」
                  </p>

                </div>

              </div>


              <span
                className="
                  shrink-0
                  text-[15px]
                  font-light
                  text-slate-500
                "
              >
                ↗
              </span>

            </button>

          )}


          <p
            className="
              mt-2
              text-[9px]
              leading-4
              text-slate-500
            "
          >
            先用 Google Maps 確認地點是否正確；如果 Google 搜尋到的不是你要的位置，可以把正確地點的分享連結貼到下方。
          </p>


          {/* Manual Google Maps Override */}

          <div
            className="
              mt-3
              rounded-[18px]
              border
              border-slate-200
              bg-white/45
              p-3
            "
          >

            <div
              className="
                flex
                items-center
                justify-between
                gap-3
              "
            >

              <div>
                <p
                  className="
                    text-[10px]
                    font-semibold
                    tracking-[0.08em]
                    text-slate-600
                  "
                >
                  指定 Google Maps 位置
                </p>

                <p
                  className="
                    mt-1
                    text-[9px]
                    leading-4
                    text-slate-500
                  "
                >
                  選到正確地點後，用 Google Maps「分享 → 複製連結」貼回這裡。
                </p>
              </div>


              {
                form.mapConfirmed && (
                  <span
                    className="
                      shrink-0
                      rounded-full
                      bg-emerald-100
                      px-2
                      py-1
                      text-[8px]
                      font-semibold
                      text-emerald-700
                    "
                  >
                    已確認
                  </span>
                )
              }

            </div>


            <input
              type="url"

              value={
                form.googleMapsUrl
              }

              placeholder="https://maps.app.goo.gl/..."

              onChange={event =>
                onChange({
                  ...form,

                  googleMapsUrl:
                    event.target.value,

                  mapConfirmed:
                    false,
                })
              }

              className={`
                mt-3
                w-full
                rounded-[14px]
                border
                bg-white
                px-3
                py-3
                text-[12px]
                text-slate-900
                outline-none
                transition
                placeholder:text-slate-500

                ${
                  form.googleMapsUrl &&
                  !isGoogleMapsUrl(
                    form.googleMapsUrl
                  )
                    ? `
                        border-red-300
                        focus:border-red-400
                      `
                    : `
                        border-slate-200
                        focus:border-slate-400
                      `
                }
              `}
            />


            {
              form.googleMapsUrl &&
              !isGoogleMapsUrl(
                form.googleMapsUrl
              ) && (
                <p
                  className="
                    mt-2
                    text-[9px]
                    leading-4
                    text-red-500
                  "
                >
                  請貼上 Google Maps 的 HTTPS 分享連結。
                </p>
              )
            }


            {
              form.googleMapsUrl &&
              isGoogleMapsUrl(
                form.googleMapsUrl
              ) && (
                <div
                  className="
                    mt-2
                    flex
                    gap-2
                  "
                >

                  <button
                    type="button"

                    onClick={() =>
                      openExternalMapUrl(
                        form.googleMapsUrl
                      )
                    }

                    className="
                      flex-1
                      rounded-[13px]
                      bg-emerald-50
                      px-3
                      py-2.5
                      text-[10px]
                      font-medium
                      text-emerald-700
                      transition
                      active:scale-[0.99]
                    "
                  >
                    測試指定位置
                  </button>


                  <button
                    type="button"

                    onClick={() =>
                      onChange({
                        ...form,

                        googleMapsUrl:
                          '',

                        mapConfirmed:
                          false,
                      })
                    }

                    className="
                      rounded-[13px]
                      border
                      border-slate-200
                      bg-white
                      px-3
                      py-2.5
                      text-[10px]
                      font-medium
                      text-slate-500
                      transition
                      active:scale-[0.99]
                    "
                  >
                    清除
                  </button>

                </div>
              )
            }


            <button
              type="button"

              disabled={
                !form.location.trim()
              }

              onClick={() =>
                onChange({
                  ...form,

                  mapConfirmed:
                    !form.mapConfirmed,
                })
              }

              className={`
                mt-3
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-[14px]
                border
                px-3
                py-3
                text-[10px]
                font-semibold
                transition
                active:scale-[0.99]
                disabled:cursor-not-allowed
                disabled:opacity-30

                ${
                  form.mapConfirmed
                    ? `
                        border-emerald-200
                        bg-emerald-100
                        text-emerald-700
                      `
                    : `
                        border-slate-200
                        bg-white
                        text-slate-600
                      `
                }
              `}
            >

              <span
                className="
                  flex
                  h-5
                  w-5
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-current
                  text-[11px]
                "
              >
                {
                  form.mapConfirmed
                    ? '✓'
                    : ''
                }
              </span>

              {
                form.mapConfirmed
                  ? '已確認導航位置'
                  : '標記為已確認'
              }

            </button>

          </div>

        </div>


        <label className="block">
          <span
            className="
              text-[10px]
              font-semibold
              tracking-[0.12em]
              text-slate-500
            "
          >
            NOTE
          </span>

          <textarea
            value={form.note}
            rows={4}
            placeholder="備註、訂位資訊、交通提醒..."
            onChange={event =>
              onChange({
                ...form,
                note:
                  event.target.value,
              })
            }
            className="
              mt-2
              w-full
              resize-none
              rounded-[18px]
              border
              border-slate-200
              bg-white
              px-4
              py-3
              text-[14px]
              leading-6
              text-slate-900
              outline-none
              transition
              placeholder:text-slate-500
              focus:border-slate-400
            "
          />
        </label>
      </div>


      <div
        className="
          mt-7
          grid
          gap-3
        "
      >
        <button
          type="button"
          disabled={!canSave}
          onClick={onSave}
          className="
            w-full
            rounded-[18px]
            bg-slate-950
            px-4
            py-4
            text-[14px]
            font-semibold
            text-white
            transition
            active:scale-[0.99]
            disabled:cursor-not-allowed
            disabled:opacity-30
          "
        >
          {
            mode === 'create'
              ? '加入行程'
              : '儲存修改'
          }
        </button>

        {
          mode === 'edit' &&
          onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="
                w-full
                rounded-[18px]
                border
                border-red-200
                bg-red-50
                px-4
                py-3
                text-[12px]
                font-medium
                text-red-500
                transition
                active:scale-[0.99]
              "
            >
              刪除這筆行程
            </button>
          )
        }
      </div>
    </BottomSheet>
  )
}


// ============================================================
// Trip Settings Sheet
// ============================================================

function TripSettingsSheet({
  open,
  form,
  onChange,
  onClose,
  onSave,
}: {
  open: boolean
  form: TripMeta
  onChange: (
    next: TripMeta
  ) => void
  onClose: () => void
  onSave: () => void
}) {

  const dateValid =
    Boolean(
      form.startDate &&
      form.endDate &&
      form.startDate <=
        form.endDate
    )

  const canSave =
    Boolean(
      form.headerLabel.trim() &&
      form.name.trim() &&
      dateValid
    )


  return (
    <BottomSheet
      open={open}
      onClose={onClose}
    >
      <div
        className="
          mt-5
          flex
          items-start
          justify-between
          gap-4
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
            TRIP SETTINGS
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
            編輯旅行
          </h2>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-full
            bg-slate-200/70
            text-[18px]
            font-light
            text-slate-600
            transition
            active:scale-95
          "
        >
          ×
        </button>
      </div>


      <div
        className="
          mt-6
          space-y-5
        "
      >
        <label className="block">
          <span
            className="
              text-[10px]
              font-semibold
              tracking-[0.12em]
              text-slate-500
            "
          >
            HEADER LABEL
          </span>

          <input
            type="text"
            value={form.headerLabel}
            placeholder="2026 HOKKAIDO"
            onChange={event =>
              onChange({
                ...form,
                headerLabel:
                  event.target.value,
              })
            }
            className="
              mt-2
              w-full
              rounded-[18px]
              border
              border-slate-200
              bg-white
              px-4
              py-3
              text-[15px]
              text-slate-900
              outline-none
              transition
              focus:border-slate-400
            "
          />

          <p
            className="
              mt-2
              text-[10px]
              leading-5
              text-slate-500
            "
          >
            這裡就是 Trip 頁左上角原本的「2026 HOKKAIDO」。
          </p>
        </label>


        <label className="block">
          <span
            className="
              text-[10px]
              font-semibold
              tracking-[0.12em]
              text-slate-500
            "
          >
            TRIP NAME
          </span>

          <input
            type="text"
            value={form.name}
            placeholder="北海道冬旅"
            onChange={event =>
              onChange({
                ...form,
                name:
                  event.target.value,
              })
            }
            className="
              mt-2
              w-full
              rounded-[18px]
              border
              border-slate-200
              bg-white
              px-4
              py-3
              text-[15px]
              text-slate-900
              outline-none
              transition
              focus:border-slate-400
            "
          />
        </label>


        <div
          className="
            grid
            grid-cols-2
            gap-3
          "
        >
          <label className="block">
            <span
              className="
                text-[10px]
                font-semibold
                tracking-[0.12em]
                text-slate-500
              "
            >
              START DATE
            </span>

            <input
              type="date"
              value={form.startDate}
              onChange={event =>
                onChange({
                  ...form,
                  startDate:
                    event.target.value,
                })
              }
              className="
                mt-2
                w-full
                rounded-[18px]
                border
                border-slate-200
                bg-white
                px-3
                py-3
                text-[13px]
                text-slate-900
                outline-none
                transition
                focus:border-slate-400
              "
            />
          </label>


          <label className="block">
            <span
              className="
                text-[10px]
                font-semibold
                tracking-[0.12em]
                text-slate-500
              "
            >
              END DATE
            </span>

            <input
              type="date"
              value={form.endDate}
              onChange={event =>
                onChange({
                  ...form,
                  endDate:
                    event.target.value,
                })
              }
              className="
                mt-2
                w-full
                rounded-[18px]
                border
                border-slate-200
                bg-white
                px-3
                py-3
                text-[13px]
                text-slate-900
                outline-none
                transition
                focus:border-slate-400
              "
            />
          </label>
        </div>


        <div
          className="
            rounded-[18px]
            border
            border-slate-200
            bg-white/65
            px-4
            py-3
          "
        >
          <p
            className="
              text-[11px]
              font-medium
              text-slate-700
            "
          >
            日期調整規則
          </p>

          <p
            className="
              mt-1
              text-[10px]
              leading-5
              text-slate-500
            "
          >
            儲存後會依新的起訖日期重新生成 DAY 1、DAY 2…
            相同日期原本的城市與行程內容會保留。
          </p>
        </div>


        {!dateValid && (
          <p
            className="
              text-[11px]
              font-medium
              text-red-500
            "
          >
            結束日期不可早於開始日期。
          </p>
        )}
      </div>


      <button
        type="button"
        disabled={!canSave}
        onClick={onSave}
        className="
          mt-7
          w-full
          rounded-[18px]
          bg-slate-950
          px-4
          py-4
          text-[14px]
          font-semibold
          text-white
          transition
          active:scale-[0.99]
          disabled:cursor-not-allowed
          disabled:opacity-30
        "
      >
        儲存旅行設定
      </button>
    </BottomSheet>
  )
}


// ============================================================
// Trip Page
// ============================================================

function Trip() {

  // ==========================================================
  // Local Data
  // ==========================================================

  const [
    localTripMeta,
    setLocalTripMeta,
  ] = useState<TripMeta>(
    loadTripMeta
  )


  const [
    localTripDays,
    setLocalTripDays,
  ] = useState<TripDay[]>(
    loadTripDays
  )


  const [
    isLocked,
    setIsLocked,
  ] = useState(
    loadTripLock
  )



  const [
    tripPageTitle,
    setTripPageTitle,
  ] = useState(
    loadTripPageTitle
  )


  const [
    displayCurrency,
    setDisplayCurrency,
  ] = useState<ExpenseCurrency>(
    loadExpenseDisplayCurrency
  )


  const [
    dayCurrencyPickerOpen,
    setDayCurrencyPickerOpen,
  ] = useState(false)


  useEffect(() => {
    try {
      localStorage.setItem(
        TRIP_META_STORAGE_KEY,
        JSON.stringify(
          localTripMeta
        )
      )
    } catch (error) {
      console.error(
        'Trip meta save failed:',
        error
      )
    }
  }, [
    localTripMeta,
  ])


  useEffect(() => {
    try {
      localStorage.setItem(
        TRIP_STORAGE_KEY,
        JSON.stringify(
          localTripDays
        )
      )
    } catch (error) {
      console.error(
        'Trip days save failed:',
        error
      )
    }
  }, [
    localTripDays,
  ])


  useEffect(() => {
    try {
      localStorage.setItem(
        TRIP_LOCK_STORAGE_KEY,
        String(
          isLocked
        )
      )
    } catch (error) {
      console.error(
        'Trip lock save failed:',
        error
      )
    }
  }, [
    isLocked,
  ])



  useEffect(() => {

    try {

      localStorage.setItem(
        TRIP_PAGE_TITLE_STORAGE_KEY,
        tripPageTitle
      )

    } catch (error) {

      console.error(
        'Trip page title save failed:',
        error
      )

    }

  }, [
    tripPageTitle,
  ])


  useEffect(() => {

    try {

      localStorage.setItem(
        EXPENSE_DISPLAY_CURRENCY_KEY,
        displayCurrency
      )

    } catch (error) {

      console.error(
        'Expense display currency save failed:',
        error
      )

    }

  }, [
    displayCurrency,
  ])


  // ==========================================================
  // Selected Day
  // ==========================================================

  const [
    selectedDayIndex,
    setSelectedDayIndex,
  ] = useState(0)


  useEffect(() => {
    if (
      selectedDayIndex >
      localTripDays.length - 1
    ) {
      setSelectedDayIndex(
        Math.max(
          0,
          localTripDays.length - 1
        )
      )
    }
  }, [
    localTripDays.length,
    selectedDayIndex,
  ])


  const selectedDay =
    localTripDays[
      selectedDayIndex
    ]


  const selectedDayExpenseTotal =
    useMemo(
      () =>
        selectedDay.activities.reduce(
          (
            total,
            activity
          ) =>
            total +
            getActivityExpenseTotal(
              activity,
              displayCurrency
            ),
          0
        ),
      [
        selectedDay.activities,
        displayCurrency,
      ]
    )


  const wholeTripExpenseTotal =
    useMemo(
      () =>
        localTripDays.reduce(
          (
            tripTotal,
            day
          ) =>
            tripTotal +
            day.activities.reduce(
              (
                dayTotal,
                activity
              ) =>
                dayTotal +
                getActivityExpenseTotal(
                  activity,
                  displayCurrency
                ),
              0
            ),
          0
        ),
      [
        localTripDays,
        displayCurrency,
      ]
    )


  const dayTabsRef =
    useRef<HTMLDivElement>(
      null
    )


  const dayDragRef =
    useRef({
      active: false,
      startX: 0,
      scrollLeft: 0,
      moved: false,
    })


  const [
    dayDragging,
    setDayDragging,
  ] = useState(false)


  const selectedDateInfo =
    useMemo(
      () =>
        formatDayDate(
          selectedDay.date
        ),
      [
        selectedDay.date,
      ]
    )


  // ==========================================================
  // Activity Editor
  // ==========================================================

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
    editingActivityId,
    setEditingActivityId,
  ] = useState<
    string |
    null
  >(
    null
  )


  const [
    activityForm,
    setActivityForm,
  ] = useState<ActivityFormState>({
    ...EMPTY_ACTIVITY_FORM,
  })


  // ==========================================================
  // Trip Settings
  // ==========================================================

  const [
    settingsOpen,
    setSettingsOpen,
  ] = useState(false)


  const [
    tripSettingsForm,
    setTripSettingsForm,
  ] = useState<TripMeta>({
    ...localTripMeta,
  })



  // ==========================================================
  // Long Press Title Editor
  //
  // 1.5 秒長按：
  // - trip: 最上方「行程」大標題
  // - day : 當日「行程規劃」標題
  // ==========================================================

  const [
    titleEditorOpen,
    setTitleEditorOpen,
  ] = useState(false)


  const [
    titleEditorTarget,
    setTitleEditorTarget,
  ] = useState<
    'trip' |
    'day'
  >(
    'day'
  )


  const [
    titleEditorValue,
    setTitleEditorValue,
  ] = useState('')


  const titleLongPressTimerRef =
    useRef<
      number |
      null
    >(
      null
    )


  const titleLongPressRef =
    useRef({
      x: 0,
      y: 0,
      moved: false,
    })



  const settingsLongPressTimerRef =
    useRef<
      number |
      null
    >(
      null
    )


  const settingsLongPressRef =
    useRef({
      x: 0,
      y: 0,
      moved: false,
    })


  // ==========================================================
  // Title Long Press
  // ==========================================================

  const clearTitleLongPress =
    () => {

      if (
        titleLongPressTimerRef.current !==
        null
      ) {

        window.clearTimeout(
          titleLongPressTimerRef.current
        )

        titleLongPressTimerRef.current =
          null

      }

    }


  const startTitleLongPress = (
    event:
      ReactPointerEvent<HTMLElement>,

    target:
      'trip' |
      'day'
  ) => {

    event.stopPropagation()


    if (
      isLocked
    ) {
      return
    }


    titleLongPressRef.current = {
      x:
        event.clientX,

      y:
        event.clientY,

      moved:
        false,
    }


    clearTitleLongPress()


    titleLongPressTimerRef.current =
      window.setTimeout(
        () => {

          if (
            titleLongPressRef.current.moved
          ) {
            return
          }


          setTitleEditorTarget(
            target
          )


          setTitleEditorValue(
            target ===
              'trip'
              ? tripPageTitle
              : (
                  selectedDay.subtitle ||
                  '行程規劃'
                )
          )


          setTitleEditorOpen(
            true
          )


          if (
            typeof navigator !==
              'undefined' &&
            'vibrate' in
              navigator
          ) {

            navigator.vibrate(
              25
            )

          }

        },
        1500
      )

  }


  const moveTitleLongPress = (
    event:
      ReactPointerEvent<HTMLElement>
  ) => {

    event.stopPropagation()


    const dx =
      event.clientX -
      titleLongPressRef.current.x


    const dy =
      event.clientY -
      titleLongPressRef.current.y


    if (
      Math.abs(
        dx
      ) > 10 ||
      Math.abs(
        dy
      ) > 10
    ) {

      titleLongPressRef.current.moved =
        true

      clearTitleLongPress()

    }

  }


  const finishTitleLongPress = (
    event:
      ReactPointerEvent<HTMLElement>
  ) => {

    event.stopPropagation()

    clearTitleLongPress()

  }


  const saveTitleEditor =
    () => {

      const cleanValue =
        titleEditorValue
          .trim()


      if (
        titleEditorTarget ===
        'trip'
      ) {

        setTripPageTitle(
          cleanValue ||
          '行程'
        )

      } else {

        setLocalTripDays(
          currentDays =>
            currentDays.map(
              (
                day,
                dayIndex
              ) =>
                dayIndex ===
                  selectedDayIndex
                  ? {
                      ...day,

                      subtitle:
                        cleanValue,
                    }
                  : day
            )
        )

      }


      setTitleEditorOpen(
        false
      )

  }


  // ==========================================================
  // DAY Selector Horizontal Drag
  //
  // 手機：原生 touch scroll
  // PC：滑鼠按住拖曳
  // ==========================================================

  const handleDayPointerDown = (
    event: ReactPointerEvent<HTMLDivElement>
  ) => {

    event.stopPropagation()


    if (
      event.pointerType !==
      'mouse'
    ) {
      return
    }


    const element =
      dayTabsRef.current


    if (!element) {
      return
    }


    dayDragRef.current = {
      active: true,
      startX:
        event.clientX,
      scrollLeft:
        element.scrollLeft,
      moved: false,
    }

  }


  const handleDayPointerMove = (
    event: ReactPointerEvent<HTMLDivElement>
  ) => {

    event.stopPropagation()


    if (
      !dayDragRef.current.active ||
      event.pointerType !==
      'mouse'
    ) {
      return
    }


    const element =
      dayTabsRef.current


    if (!element) {
      return
    }


    const dx =
      event.clientX -
      dayDragRef.current.startX


    // 小於 8px 視為一般 click
    if (
      !dayDragRef.current.moved &&
      Math.abs(dx) < 8
    ) {
      return
    }


    if (
      !dayDragRef.current.moved
    ) {

      dayDragRef.current.moved =
        true


      setDayDragging(
        true
      )


      element.setPointerCapture(
        event.pointerId
      )

    }


    element.scrollLeft =
      dayDragRef.current.scrollLeft -
      dx


    event.preventDefault()

  }


  const finishDayPointerDrag = (
    event: ReactPointerEvent<HTMLDivElement>
  ) => {

    event.stopPropagation()


    if (
      !dayDragRef.current.active
    ) {
      return
    }


    dayDragRef.current.active =
      false


    setDayDragging(
      false
    )


    const element =
      dayTabsRef.current


    if (
      element?.hasPointerCapture(
        event.pointerId
      )
    ) {

      element.releasePointerCapture(
        event.pointerId
      )

    }


    window.setTimeout(
      () => {

        dayDragRef.current.moved =
          false

      },
      0
    )

  }


  const handleDayWheel = (
    event: ReactWheelEvent<HTMLDivElement>
  ) => {

    const element =
      dayTabsRef.current


    if (!element) {
      return
    }


    const movement =
      Math.abs(event.deltaX) >
      Math.abs(event.deltaY)
        ? event.deltaX
        : event.deltaY


    if (
      movement === 0
    ) {
      return
    }


    element.scrollLeft +=
      movement


    event.preventDefault()

  }



  const extendTripDateRange = (
    direction:
      'previous' |
      'next'
  ) => {

    if (
      isLocked
    ) {
      return
    }


    const currentSelectedDate =
      selectedDay?.date


    const nextStartDate =
      direction ===
        'previous'
        ? shiftDateString(
            localTripMeta.startDate,
            -1
          )
        : localTripMeta.startDate


    const nextEndDate =
      direction ===
        'next'
        ? shiftDateString(
            localTripMeta.endDate,
            1
          )
        : localTripMeta.endDate


    const nextMeta:
      TripMeta =
    {
      ...localTripMeta,

      startDate:
        nextStartDate,

      endDate:
        nextEndDate,
    }


    const nextDays =
      generateTripDays(
        nextStartDate,
        nextEndDate,
        localTripDays
      )


    if (
      nextDays.length ===
      0
    ) {
      return
    }


    setLocalTripMeta(
      nextMeta
    )


    setLocalTripDays(
      nextDays
    )


    const preservedIndex =
      currentSelectedDate
        ? nextDays.findIndex(
            day =>
              day.date ===
              currentSelectedDate
          )
        : -1


    const nextSelectedIndex =
      preservedIndex >=
        0
        ? preservedIndex
        : direction ===
          'previous'
        ? 0
        : nextDays.length - 1


    setSelectedDayIndex(
      nextSelectedIndex
    )


    window.setTimeout(
      () => {

        const container =
          dayTabsRef.current


        if (
          !container
        ) {
          return
        }


        const target =
          direction ===
            'previous'
            ? container.scrollWidth * 0
            : container.scrollWidth


        container.scrollTo({
          left:
            target,

          behavior:
            'smooth',
        })

      },
      0
    )

  }


  const removeEdgeTripDate = (
    direction:
      'previous' |
      'next'
  ) => {

    if (
      isLocked ||
      localTripDays.length <=
        1
    ) {
      return
    }


    const currentSelectedDate =
      selectedDay?.date


    const nextStartDate =
      direction ===
        'previous'
        ? shiftDateString(
            localTripMeta.startDate,
            1
          )
        : localTripMeta.startDate


    const nextEndDate =
      direction ===
        'next'
        ? shiftDateString(
            localTripMeta.endDate,
            -1
          )
        : localTripMeta.endDate


    const nextMeta:
      TripMeta =
    {
      ...localTripMeta,

      startDate:
        nextStartDate,

      endDate:
        nextEndDate,
    }


    const nextDays =
      generateTripDays(
        nextStartDate,
        nextEndDate,
        localTripDays
      )


    if (
      nextDays.length ===
      0
    ) {
      return
    }


    setLocalTripMeta(
      nextMeta
    )


    setLocalTripDays(
      nextDays
    )


    const preservedIndex =
      currentSelectedDate
        ? nextDays.findIndex(
            day =>
              day.date ===
              currentSelectedDate
          )
        : -1


    let nextSelectedIndex =
      preservedIndex


    if (
      nextSelectedIndex <
      0
    ) {

      nextSelectedIndex =
        direction ===
          'previous'
          ? 0
          : nextDays.length - 1

    }


    setSelectedDayIndex(
      nextSelectedIndex
    )


    window.setTimeout(
      () => {

        const container =
          dayTabsRef.current


        if (
          !container
        ) {
          return
        }


        const button =
          container.querySelector(
            `[data-day-index="${nextSelectedIndex}"]`
          ) as HTMLElement | null


        button?.scrollIntoView({
          behavior:
            'smooth',

          inline:
            'center',

          block:
            'nearest',
        })

      },
      0
    )

  }


  // ==========================================================
  // Day Navigation
  // ==========================================================

  const handleSelectDay = (
    index: number
  ) => {
    setSelectedDayIndex(
      index
    )

    const container =
      dayTabsRef.current

    const button =
      container
        ?.querySelector(
          `[data-day-index="${index}"]`
        ) as HTMLElement | null

    if (
      container &&
      button
    ) {
      const targetLeft =
        button.offsetLeft -
        container.clientWidth / 2 +
        button.clientWidth / 2

      container.scrollTo({
        left:
          Math.max(
            0,
            targetLeft
          ),
        behavior:
          'smooth',
      })
    }
  }


  const goPreviousDay = () => {
    if (
      selectedDayIndex <= 0
    ) {
      return
    }

    handleSelectDay(
      selectedDayIndex - 1
    )
  }


  const goNextDay = () => {
    if (
      selectedDayIndex >=
      localTripDays.length - 1
    ) {
      return
    }

    handleSelectDay(
      selectedDayIndex + 1
    )
  }


  // ==========================================================
  // Trip Settings
  // ==========================================================

  const openTripSettings = () => {
    if (isLocked) {
      return
    }

    setTripSettingsForm({
      ...localTripMeta,
    })

    setSettingsOpen(
      true
    )
  }



  const clearSettingsLongPress =
    () => {

      if (
        settingsLongPressTimerRef.current !==
        null
      ) {

        window.clearTimeout(
          settingsLongPressTimerRef.current
        )

        settingsLongPressTimerRef.current =
          null

      }

    }


  const startSettingsLongPress = (
    event:
      ReactPointerEvent<HTMLElement>
  ) => {

    event.stopPropagation()


    if (
      isLocked
    ) {
      return
    }


    settingsLongPressRef.current = {
      x:
        event.clientX,

      y:
        event.clientY,

      moved:
        false,
    }


    clearSettingsLongPress()


    settingsLongPressTimerRef.current =
      window.setTimeout(
        () => {

          if (
            settingsLongPressRef.current.moved
          ) {
            return
          }


          openTripSettings()


          if (
            typeof navigator !==
              'undefined' &&
            'vibrate' in navigator
          ) {

            navigator.vibrate(
              25
            )

          }

        },
        1500
      )

  }


  const moveSettingsLongPress = (
    event:
      ReactPointerEvent<HTMLElement>
  ) => {

    event.stopPropagation()


    const dx =
      event.clientX -
      settingsLongPressRef.current.x


    const dy =
      event.clientY -
      settingsLongPressRef.current.y


    if (
      Math.abs(
        dx
      ) > 10 ||
      Math.abs(
        dy
      ) > 10
    ) {

      settingsLongPressRef.current.moved =
        true

      clearSettingsLongPress()

    }

  }


  const finishSettingsLongPress = (
    event:
      ReactPointerEvent<HTMLElement>
  ) => {

    event.stopPropagation()

    clearSettingsLongPress()

  }


  const saveTripSettings = () => {
    if (
      !tripSettingsForm.startDate ||
      !tripSettingsForm.endDate ||
      tripSettingsForm.startDate >
        tripSettingsForm.endDate
    ) {
      return
    }

    const nextMeta: TripMeta = {
      ...tripSettingsForm,

      headerLabel:
        tripSettingsForm
          .headerLabel
          .trim(),

      name:
        tripSettingsForm
          .name
          .trim(),
    }


    const nextDays =
      generateTripDays(
        nextMeta.startDate,
        nextMeta.endDate,
        localTripDays
      )


    if (
      nextDays.length === 0
    ) {
      return
    }


    const currentSelectedDate =
      selectedDay?.date


    setLocalTripMeta(
      nextMeta
    )

    setLocalTripDays(
      nextDays
    )


    const preservedIndex =
      currentSelectedDate
        ? nextDays.findIndex(
            day =>
              day.date ===
              currentSelectedDate
          )
        : -1


    setSelectedDayIndex(
      preservedIndex >= 0
        ? preservedIndex
        : 0
    )


    setSettingsOpen(
      false
    )
  }


  // ==========================================================
  // Lock
  // ==========================================================

  const toggleLock = () => {
    if (!isLocked) {
      setEditorOpen(false)
      setSettingsOpen(false)
      setEditingActivityId(null)
    }

    setIsLocked(
      current =>
        !current
    )
  }


  // ==========================================================
  // Daily Google Maps Route
  // ==========================================================

  const openSelectedDayRoute = () => {

    const routeActivities =
      selectedDay.activities
        .filter(
          activity =>
            Boolean(
              activity.location?.trim()
            )
        )


    if (
      routeActivities.length === 0
    ) {

      window.alert(
        '這一天目前沒有可導航的 Location。'
      )

      return
    }


    // Google Maps URL waypoint support depends on platform.
    // Mobile browsers officially support fewer waypoints
    // than desktop, so show a lightweight warning for long days.
    if (
      routeActivities.length > 4
    ) {

      const confirmed =
        window.confirm(
          `這一天共有 ${routeActivities.length} 個導航地點。\n\nGoogle Maps 在不同裝置可接受的中途停靠點數量不同；手機瀏覽器通常支援較少。\n\n仍要開啟整天路線嗎？`
        )


      if (!confirmed) {
        return
      }

    }


    const url =
      buildGoogleMapsMultiStopDirectionsUrl(
        routeActivities
      )


    if (!url) {
      return
    }


    openExternalMapUrl(
      url
    )

  }



  // ==========================================================
  // Expense Book
  // ==========================================================

  const [
    expenseBookOpen,
    setExpenseBookOpen,
  ] = useState(false)


  const [
    expenseActivityId,
    setExpenseActivityId,
  ] = useState<
    string |
    null
  >(
    null
  )


  const expenseActivity =
    selectedDay.activities.find(
      activity =>
        activity.id ===
        expenseActivityId
    )


  const openExpenseBook = (
    activity: TripActivity
  ) => {

    setExpenseActivityId(
      activity.id
    )

    setExpenseBookOpen(
      true
    )

  }


  const closeExpenseBook = () => {

    setExpenseBookOpen(
      false
    )

    setExpenseActivityId(
      null
    )

  }


  const updateExpenseBook = (
    expenses: TripExpense[]
  ) => {

    if (
      !expenseActivityId
    ) {
      return
    }


    setLocalTripDays(
      currentDays =>
        currentDays.map(
          (
            day,
            dayIndex
          ) => {

            if (
              dayIndex !==
              selectedDayIndex
            ) {
              return day
            }


            return {
              ...day,

              activities:
                day.activities.map(
                  activity =>
                    activity.id ===
                    expenseActivityId
                      ? {
                          ...activity,

                          expenses,
                        }
                      : activity
                ),
            }

          }
        )
    )

  }



  // ==========================================================
  // Activity Editor Actions
  // ==========================================================

  const openCreateActivity = () => {
    if (isLocked) {
      return
    }

    setEditorMode(
      'create'
    )

    setEditingActivityId(
      null
    )

    setActivityForm({
      ...EMPTY_ACTIVITY_FORM,
    })

    setEditorOpen(
      true
    )
  }


  const openEditActivity = (
    activity: TripActivity
  ) => {
    if (isLocked) {
      return
    }

    setEditorMode(
      'edit'
    )

    setEditingActivityId(
      activity.id
    )

    setActivityForm({
      time:
        activity.time ?? '',
      title:
        activity.title,
      type:
        activity.type,
      location:
        activity.location ?? '',

      googleMapsUrl:
        activity.googleMapsUrl ?? '',

      mapConfirmed:
        activity.mapConfirmed ??
        Boolean(
          activity.googleMapsUrl &&
          isGoogleMapsUrl(
            activity.googleMapsUrl
          )
        ),

      note:
        activity.note ?? '',
    })

    setEditorOpen(
      true
    )
  }


  const closeEditor = () => {
    setEditorOpen(
      false
    )

    setEditingActivityId(
      null
    )
  }


  const saveActivity = () => {
    if (isLocked) {
      return
    }

    const cleanTitle =
      activityForm.title.trim()

    if (
      cleanTitle.length === 0
    ) {
      return
    }


    setLocalTripDays(
      currentDays =>
        currentDays.map(
          (
            day,
            dayIndex
          ) => {

            if (
              dayIndex !==
              selectedDayIndex
            ) {
              return day
            }


            if (
              editorMode ===
              'create'
            ) {
              const newActivity: TripActivity = {
                id:
                  createActivityId(),
                time:
                  activityForm.time ||
                  undefined,
                title:
                  cleanTitle,
                type:
                  activityForm.type,
                location:
                  activityForm
                    .location
                    .trim() ||
                  undefined,

                googleMapsUrl:
                  (
                    activityForm
                      .googleMapsUrl
                      .trim() &&
                    isGoogleMapsUrl(
                      activityForm
                        .googleMapsUrl
                    )
                  )
                    ? activityForm
                        .googleMapsUrl
                        .trim()
                    : undefined,

                mapConfirmed:
                  activityForm.mapConfirmed,

                note:
                  activityForm
                    .note
                    .trim() ||
                  undefined,
                completed:
                  false,
              }

              return {
                ...day,
                activities: [
                  ...day.activities,
                  newActivity,
                ]
                  .sort(
                    (
                      a,
                      b
                    ) =>
                      (
                        a.time ??
                        '99:99'
                      )
                        .localeCompare(
                          b.time ??
                          '99:99'
                        )
                  ),
              }
            }


            return {
              ...day,
              activities:
                day.activities
                  .map(
                    activity =>
                      activity.id ===
                      editingActivityId
                        ? {
                            ...activity,
                            time:
                              activityForm.time ||
                              undefined,
                            title:
                              cleanTitle,
                            type:
                              activityForm.type,
                            location:
                              activityForm
                                .location
                                .trim() ||
                              undefined,

                            googleMapsUrl:
                              (
                                activityForm
                                  .googleMapsUrl
                                  .trim() &&
                                isGoogleMapsUrl(
                                  activityForm
                                    .googleMapsUrl
                                )
                              )
                                ? activityForm
                                    .googleMapsUrl
                                    .trim()
                                : undefined,

                            mapConfirmed:
                              activityForm.mapConfirmed,

                            note:
                              activityForm
                                .note
                                .trim() ||
                              undefined,
                          }
                        : activity
                  )
                  .sort(
                    (
                      a,
                      b
                    ) =>
                      (
                        a.time ??
                        '99:99'
                      )
                        .localeCompare(
                          b.time ??
                          '99:99'
                        )
                  ),
            }
          }
        )
    )

    closeEditor()
  }


  const deleteActivity = () => {
    if (
      isLocked ||
      !editingActivityId
    ) {
      return
    }

    const confirmed =
      window.confirm(
        '確定要刪除這筆行程嗎？'
      )

    if (!confirmed) {
      return
    }


    setLocalTripDays(
      currentDays =>
        currentDays.map(
          (
            day,
            dayIndex
          ) =>
            dayIndex ===
            selectedDayIndex
              ? {
                  ...day,
                  activities:
                    day.activities.filter(
                      activity =>
                        activity.id !==
                        editingActivityId
                    ),
                }
              : day
        )
    )

    closeEditor()
  }


  // ==========================================================
  // Render
  // ==========================================================

  return (
    <main
      className="
        mx-auto
        w-full
        max-w-md
        overflow-x-hidden
        px-5
        pb-6
        pt-3
      "
    >
      {/* ======================================================
          Header
      ====================================================== */}
      <section className="px-1">
        <div>
          <p
            className="
              min-w-0
              truncate
              text-[10px]
              font-semibold
              tracking-[0.22em]
              text-slate-500
            "
          >
            {localTripMeta.headerLabel}
          </p>
        </div>


        <div
          className="
            mt-3
            flex
            items-end
            justify-between
            gap-4
          "
        >
          <div>
            <button
              type="button"

              disabled={
                isLocked
              }

              onPointerDown={
                event =>
                  startTitleLongPress(
                    event,
                    'trip'
                  )
              }

              onPointerMove={
                moveTitleLongPress
              }

              onPointerUp={
                finishTitleLongPress
              }

              onPointerCancel={
                finishTitleLongPress
              }

              onContextMenu={
                event =>
                  event.preventDefault()
              }

              className="
                block
                touch-manipulation
                select-none
                text-left
                disabled:cursor-default
              "
            >
              <h1
                className="
                  text-[32px]
                  font-semibold
                  leading-none
                  tracking-[-0.04em]
                  text-slate-950
                "
              >
                {
                  tripPageTitle ||
                  '行程'
                }
              </h1>
            </button>

            <button
              type="button"

              disabled={
                isLocked
              }

              onPointerDown={
                startSettingsLongPress
              }

              onPointerMove={
                moveSettingsLongPress
              }

              onPointerUp={
                finishSettingsLongPress
              }

              onPointerCancel={
                finishSettingsLongPress
              }

              onContextMenu={
                event =>
                  event.preventDefault()
              }

              aria-label="長按 1.5 秒修改旅行日期"

              className="
                mt-3
                block
                touch-manipulation
                select-none
                text-left
                text-[12px]
                font-medium
                tracking-[0.08em]
                text-slate-500
                transition
                active:text-slate-700
                disabled:cursor-default
              "
            >
              {formatShortDate(
                localTripMeta.startDate
              )}

              <span className="mx-2">
                —
              </span>

              {formatShortDate(
                localTripMeta.endDate
              )}
            </button>
          </div>


          <div
            className="
              min-w-[126px]
              rounded-[18px]
              border
              border-white/60
              bg-white/45
              px-3
              py-2.5
              text-right
              backdrop-blur-xl
            "
          >
            <p
              className="
                text-[9px]
                font-semibold
                tracking-[0.12em]
                text-slate-500
              "
            >
              {
                localTripDays.length
              } DAYS
            </p>

            <p
              className="
                mt-1
                max-w-[150px]
                truncate
                text-[11px]
                font-medium
                text-slate-700
              "
            >
              {localTripMeta.name}
            </p>

            <div
              className="
                mt-2
                border-t
                border-slate-200/70
                pt-2
              "
            >
              <p
                className="
                  text-[8px]
                  font-semibold
                  tracking-[0.12em]
                  text-slate-500
                "
              >
                TRIP SPEND
              </p>

              <p
                className="
                  mt-0.5
                  text-[13px]
                  font-semibold
                  tracking-[-0.02em]
                  text-slate-800
                "
              >
                {formatExpenseAmount(
                  wholeTripExpenseTotal,
                  displayCurrency
                )}
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* ======================================================
          Day Selector

          Tap:
          - Select a day
          - Left / right top ＋ extends the date range by one day
          - Left / right bottom − removes the nearest edge day

          Long press 1.5 sec:
          - Open Trip date settings

          Drag:
          - Horizontal scroll
      ====================================================== */}
      <section
        className="
          -mx-5
          mt-7
        "
      >
        <div
          ref={dayTabsRef}

          data-horizontal-scroll="true"

          onPointerDown={
            event => {

              handleDayPointerDown(
                event
              )

              startSettingsLongPress(
                event
              )

            }
          }

          onPointerMove={
            event => {

              handleDayPointerMove(
                event
              )

              moveSettingsLongPress(
                event
              )

            }
          }

          onPointerUp={
            event => {

              finishDayPointerDrag(
                event
              )

              finishSettingsLongPress(
                event
              )

            }
          }

          onPointerCancel={
            event => {

              finishDayPointerDrag(
                event
              )

              finishSettingsLongPress(
                event
              )

            }
          }

          onWheel={
            handleDayWheel
          }

          className={`
            flex
            touch-pan-x
            gap-2
            overflow-x-auto
            overflow-y-hidden
            px-5
            pb-2
            overscroll-x-contain
            select-none
            [scrollbar-width:none]
            [-ms-overflow-style:none]
            [&::-webkit-scrollbar]:hidden

            ${
              dayDragging
                ? 'cursor-grabbing scroll-auto'
                : 'cursor-grab scroll-smooth'
            }
          `}

          style={{
            WebkitOverflowScrolling:
              'touch',
          }}
        >

          <div
            className="
              flex
              min-w-[64px]
              shrink-0
              flex-col
              overflow-hidden
              rounded-[20px]
              border
              border-dashed
              border-slate-300/80
              bg-white/35
              text-slate-500
              backdrop-blur-xl
            "
          >

            <button
              type="button"

              disabled={
                isLocked
              }

              onClick={() => {

                if (
                  dayDragRef.current.moved
                ) {
                  return
                }


                extendTripDateRange(
                  'previous'
                )

              }}

              aria-label="往前增加一天"

              className="
                flex
                min-h-[43px]
                flex-1
                items-center
                justify-center
                border-b
                border-slate-200/70
                text-[22px]
                font-light
                leading-none
                transition
                active:bg-white/55
                disabled:opacity-30
              "
            >
              ＋
            </button>


            <button
              type="button"

              disabled={
                isLocked ||
                localTripDays.length <=
                  1
              }

              onClick={() => {

                if (
                  dayDragRef.current.moved
                ) {
                  return
                }


                removeEdgeTripDate(
                  'previous'
                )

              }}

              aria-label="刪除最前一天"

              className="
                flex
                min-h-[43px]
                flex-1
                items-center
                justify-center
                text-[23px]
                font-light
                leading-none
                text-slate-400
                transition
                active:bg-white/55
                disabled:opacity-20
              "
            >
              −
            </button>

          </div>


          {localTripDays.map(
            (
              day,
              index
            ) => {
              const info =
                formatDayDate(
                  day.date
                )

              const selected =
                index ===
                selectedDayIndex

              return (
                <button
                  key={day.id}
                  type="button"

                  data-day-index={
                    index
                  }
                  onClick={() => {

                    if (
                      dayDragRef.current.moved
                    ) {
                      return
                    }


                    handleSelectDay(
                      index
                    )

                  }}
                  className={`
                    min-w-[64px]
                    shrink-0
                    rounded-[20px]
                    border
                    px-3
                    py-3
                    text-center
                    transition-all
                    duration-300
                    active:scale-[0.96]
                    ${
                      selected
                        ? `
                            border-slate-900
                            bg-slate-950
                            text-white
                            shadow-md
                            shadow-slate-900/15
                          `
                        : `
                            border-white/60
                            bg-white/45
                            text-slate-700
                            backdrop-blur-xl
                          `
                    }
                  `}
                >
                  <p
                    className={`
                      text-[8px]
                      font-semibold
                      tracking-[0.12em]
                      ${
                        selected
                          ? 'text-white/65'
                          : 'text-slate-500'
                      }
                    `}
                  >
                    DAY {
                      day.dayNumber
                    }
                  </p>

                  <p
                    className="
                      mt-1
                      text-[22px]
                      font-medium
                      leading-none
                    "
                  >
                    {info.day}
                  </p>

                  <p
                    className={`
                      mt-2
                      text-[8px]
                      font-semibold
                      tracking-[0.08em]
                      ${
                        selected
                          ? 'text-white/70'
                          : 'text-slate-500'
                      }
                    `}
                  >
                    {info.weekday}
                  </p>
                </button>
              )
            }
          )}


          <div
            className="
              flex
              min-w-[64px]
              shrink-0
              flex-col
              overflow-hidden
              rounded-[20px]
              border
              border-dashed
              border-slate-300/80
              bg-white/35
              text-slate-500
              backdrop-blur-xl
            "
          >

            <button
              type="button"

              disabled={
                isLocked
              }

              onClick={() => {

                if (
                  dayDragRef.current.moved
                ) {
                  return
                }


                extendTripDateRange(
                  'next'
                )

              }}

              aria-label="往後增加一天"

              className="
                flex
                min-h-[43px]
                flex-1
                items-center
                justify-center
                border-b
                border-slate-200/70
                text-[22px]
                font-light
                leading-none
                transition
                active:bg-white/55
                disabled:opacity-30
              "
            >
              ＋
            </button>


            <button
              type="button"

              disabled={
                isLocked ||
                localTripDays.length <=
                  1
              }

              onClick={() => {

                if (
                  dayDragRef.current.moved
                ) {
                  return
                }


                removeEdgeTripDate(
                  'next'
                )

              }}

              aria-label="刪除最後一天"

              className="
                flex
                min-h-[43px]
                flex-1
                items-center
                justify-center
                text-[23px]
                font-light
                leading-none
                text-slate-400
                transition
                active:bg-white/55
                disabled:opacity-20
              "
            >
              −
            </button>

          </div>

        </div>
      </section>


      {/* ======================================================
          Selected Day
      ====================================================== */}
      <section className="mt-5">
        <div
          className="
            overflow-hidden
            rounded-[28px]
            border
            border-white/60
            bg-white/55
            shadow-sm
            backdrop-blur-2xl
          "
        >
          {/* Day Header */}
          <div
            className="
              px-5
              pb-5
              pt-5
            "
          >
            <div
              className="
                flex
                items-start
                justify-between
                gap-4
              "
            >
              <div>
                <p
                  className="
                    text-[9px]
                    font-semibold
                    tracking-[0.2em]
                    text-slate-500
                  "
                >
                  DAY {
                    selectedDay.dayNumber
                  }
                </p>

                <button
                  type="button"

                  disabled={
                    isLocked
                  }

                  onPointerDown={
                    event =>
                      startTitleLongPress(
                        event,
                        'day'
                      )
                  }

                  onPointerMove={
                    moveTitleLongPress
                  }

                  onPointerUp={
                    finishTitleLongPress
                  }

                  onPointerCancel={
                    finishTitleLongPress
                  }

                  onContextMenu={
                    event =>
                      event.preventDefault()
                  }

                  className="
                    mt-2
                    block
                    touch-manipulation
                    select-none
                    text-left
                    disabled:cursor-default
                  "
                >
                  <h2
                    className="
                      text-[22px]
                      font-semibold
                      tracking-[-0.025em]
                      text-slate-950
                    "
                  >
                    {
                      selectedDay.subtitle ||
                      '行程規劃'
                    }
                  </h2>
                </button>

                <p
                  className="
                    mt-2
                    text-[11px]
                    text-slate-500
                  "
                >
                  {formatFullDate(
                    selectedDay.date
                  )}
                </p>
              </div>


              <div className="text-right">
                <p
                  className="
                    text-[42px]
                    font-light
                    leading-none
                    tracking-[-0.06em]
                    text-slate-500
                  "
                >
                  {
                    String(
                      selectedDateInfo.day
                    ).padStart(
                      2,
                      '0'
                    )
                  }
                </p>

                <p
                  className="
                    mt-1
                    text-[9px]
                    font-semibold
                    tracking-[0.16em]
                    text-slate-500
                  "
                >
                  {
                    String(
                      selectedDateInfo.month
                    ).padStart(
                      2,
                      '0'
                    )
                  } / {
                    selectedDateInfo.weekday
                  }
                </p>
              </div>
            </div>


            {/* Add / Lock */}
            <div
              className="
                mt-5
                flex
                items-center
                gap-2
              "
            >
              <button
                type="button"
                disabled={isLocked}
                onClick={
                  openCreateActivity
                }
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  bg-slate-950
                  px-4
                  py-2.5
                  text-[11px]
                  font-medium
                  text-white
                  shadow-sm
                  transition
                  enabled:active:scale-[0.97]
                  disabled:opacity-30
                "
              >
                <span
                  className="
                    text-[15px]
                    font-light
                    leading-none
                  "
                >
                  +
                </span>

                新增行程
              </button>


              <button
                type="button"
                onClick={toggleLock}
                className={`
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  px-4
                  py-2.5
                  text-[11px]
                  font-medium
                  shadow-sm
                  backdrop-blur-xl
                  transition
                  active:scale-[0.97]
                  ${
                    isLocked
                      ? `
                          border-slate-900
                          bg-slate-950
                          text-white
                        `
                      : `
                          border-slate-300/80
                          bg-white/55
                          text-slate-600
                        `
                  }
                `}
              >
                {isLocked
                  ? (
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <rect
                        x="5"
                        y="10"
                        width="14"
                        height="10"
                        rx="2"
                      />
                      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                    </svg>
                  )
                  : (
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <rect
                        x="5"
                        y="10"
                        width="14"
                        height="10"
                        rx="2"
                      />
                      <path d="M9 10V7a4 4 0 0 1 7.5-2" />
                    </svg>
                  )
                }

                {
                  isLocked
                    ? '已鎖定'
                    : '鎖定'
                }
              </button>


              {/* Daily Multi-stop Route */}

              <button
                type="button"

                onClick={
                  openSelectedDayRoute
                }

                disabled={
                  selectedDay.activities.every(
                    activity =>
                      !activity.location?.trim()
                  )
                }

                aria-label="開啟今日 Google Maps 多停靠點路線"

                title="今日 Google Maps 路線"

                className="
                  ml-auto
                  inline-flex
                  h-10
                  shrink-0
                  items-center
                  justify-center
                  gap-1.5
                  rounded-full
                  border
                  border-sky-200/80
                  bg-sky-50/90
                  px-3
                  text-sky-600
                  shadow-sm
                  backdrop-blur-xl
                  transition
                  enabled:active:scale-[0.96]
                  disabled:cursor-not-allowed
                  disabled:opacity-25
                "
              >

                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle
                    cx="6"
                    cy="18"
                    r="2"
                  />

                  <circle
                    cx="18"
                    cy="6"
                    r="2"
                  />

                  <path d="M8 18h2.5a3 3 0 0 0 3-3v-6a3 3 0 0 1 3-3H16" />

                  <path d="M10 13l3 2-3 2" />
                </svg>


                <span
                  className="
                    text-[10px]
                    font-semibold
                    tracking-[0.04em]
                  "
                >
                  路線
                </span>

              </button>

            </div>


            {isLocked && (
              <p
                className="
                  mt-3
                  text-[10px]
                  leading-5
                  text-slate-500
                "
              >
                行程已鎖定。再次點擊「已鎖定」即可解除編輯鎖。
              </p>
            )}
          </div>


          {/* Timeline */}
          <div
            className="
              border-t
              border-slate-200/70
              px-5
              py-5
            "
          >
            {
              selectedDay.activities.length >
              0
                ? (
                  <div>
                    {
                      selectedDay.activities.map(
                        (
                          activity,
                          index
                        ) => (
                          <ActivityRow
                            key={
                              activity.id
                            }
                            activity={
                              activity
                            }
                            isLast={
                              index ===
                              selectedDay
                                .activities
                                .length - 1
                            }
                            locked={
                              isLocked
                            }

                            displayCurrency={
                              displayCurrency
                            }

                            onEdit={
                              openEditActivity
                            }

                            onOpenExpense={
                              openExpenseBook
                            }
                          />
                        )
                      )
                    }
                  </div>
                )
                : (
                  <button
                    type="button"
                    disabled={isLocked}
                    onClick={
                      openCreateActivity
                    }
                    className="
                      w-full
                      py-5
                      text-center
                      transition
                      enabled:active:opacity-60
                      disabled:cursor-default
                    "
                  >
                    <div
                      className="
                        mx-auto
                        flex
                        h-12
                        w-12
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-slate-200/80
                        bg-white/55
                        text-[20px]
                        font-light
                        text-slate-500
                      "
                    >
                      {
                        isLocked
                          ? '—'
                          : '+'
                      }
                    </div>

                    <p
                      className="
                        mt-4
                        text-[14px]
                        font-medium
                        text-slate-700
                      "
                    >
                      {
                        isLocked
                          ? '這一天沒有行程'
                          : '這一天還沒有行程'
                      }
                    </p>

                    {!isLocked && (
                      <p
                        className="
                          mt-2
                          text-[11px]
                          leading-5
                          text-slate-500
                        "
                      >
                        點一下開始加入交通、景點、餐廳、
                        <br />
                        飯店與滑雪行程。
                      </p>
                    )}
                  </button>
                )
            }
          </div>
        </div>
      </section>


      {/* ======================================================
          Day Expense Total
      ====================================================== */}
      <section
        className="
          mt-4
        "
      >
        <button
          type="button"

          onClick={() =>
            setDayCurrencyPickerOpen(
              current =>
                !current
            )
          }

          className="
            flex
            w-full
            items-center
            justify-between
            rounded-[22px]
            border
            border-amber-200/80
            bg-amber-50/80
            px-4
            py-4
            text-left
            shadow-sm
            backdrop-blur-xl
            transition
            active:scale-[0.99]
          "
        >

          <div>
            <p
              className="
                text-[9px]
                font-semibold
                tracking-[0.16em]
                text-amber-700
              "
            >
              DAY {
                selectedDay.dayNumber
              } SPEND
            </p>

            <p
              className="
                mt-1
                text-[10px]
                text-slate-600
              "
            >
              今日行程總消費 · 點擊切換顯示幣別
            </p>
          </div>


          <div
            className="
              text-right
            "
          >
            <p
              className="
                text-[20px]
                font-semibold
                tracking-[-0.035em]
                text-slate-900
              "
            >
              {formatExpenseAmount(
                selectedDayExpenseTotal,
                displayCurrency
              )}
            </p>

            <p
              className="
                mt-1
                text-[8px]
                font-semibold
                tracking-[0.12em]
                text-slate-500
              "
            >
              {displayCurrency}
              {' '}
              {dayCurrencyPickerOpen
                ? '⌃'
                : '⌄'}
            </p>
          </div>

        </button>


        {dayCurrencyPickerOpen && (

          <div
            className="
              mt-2
              grid
              grid-cols-3
              gap-2
              rounded-[18px]
              border
              border-white/60
              bg-white/60
              p-2
              backdrop-blur-xl
            "
          >

            {EXPENSE_CURRENCIES.map(
              currency => {

                const selected =
                  currency ===
                  displayCurrency


                return (
                  <button
                    key={
                      currency
                    }

                    type="button"

                    onClick={() => {

                      setDisplayCurrency(
                        currency
                      )

                      setDayCurrencyPickerOpen(
                        false
                      )

                    }}

                    className={`
                      rounded-[13px]
                      border
                      px-3
                      py-2.5
                      text-[10px]
                      font-semibold
                      transition
                      active:scale-[0.98]

                      ${
                        selected
                          ? `
                              border-slate-900
                              bg-slate-950
                              text-white
                            `
                          : `
                              border-slate-200
                              bg-white
                              text-slate-700
                            `
                      }
                    `}
                  >
                    {currency}
                  </button>
                )

              }
            )}

          </div>

        )}


        <p
          className="
            mt-2
            px-1
            text-[8px]
            leading-4
            text-slate-500
          "
        >
          多幣別總額使用 App 本機顯示匯率換算；每筆原始消費金額與幣別仍完整保留。
        </p>

      </section>


      {/* ======================================================
          Day Navigation
      ====================================================== */}
      <section
        className="
          mt-4
          grid
          grid-cols-2
          gap-3
        "
      >
        <button
          type="button"
          disabled={
            selectedDayIndex === 0
          }
          onClick={goPreviousDay}
          className="
            rounded-[18px]
            border
            border-white/60
            bg-white/40
            px-4
            py-3
            text-left
            backdrop-blur-xl
            transition
            active:scale-[0.98]
            disabled:opacity-30
          "
        >
          <p
            className="
              text-[8px]
              font-semibold
              tracking-[0.15em]
              text-slate-500
            "
          >
            PREVIOUS
          </p>

          <p
            className="
              mt-1
              text-[12px]
              font-medium
              text-slate-700
            "
          >
            ← 前一天
          </p>
        </button>


        <button
          type="button"
          disabled={
            selectedDayIndex ===
            localTripDays.length - 1
          }
          onClick={goNextDay}
          className="
            rounded-[18px]
            border
            border-white/60
            bg-white/40
            px-4
            py-3
            text-right
            backdrop-blur-xl
            transition
            active:scale-[0.98]
            disabled:opacity-30
          "
        >
          <p
            className="
              text-[8px]
              font-semibold
              tracking-[0.15em]
              text-slate-500
            "
          >
            NEXT
          </p>

          <p
            className="
              mt-1
              text-[12px]
              font-medium
              text-slate-700
            "
          >
            後一天 →
          </p>
        </button>
      </section>


      {/* ======================================================
          Editors
      ====================================================== */}
      <ActivityEditorSheet
        open={editorOpen}
        mode={editorMode}
        dayLabel={
          `DAY ${selectedDay.dayNumber} · ${formatFullDate(
            selectedDay.date
          )}`
        }
        form={activityForm}

        locationContext={
          selectedDay.city
            ? `${selectedDay.city} Hokkaido Japan`
            : 'Hokkaido Japan'
        }

        expenseTotal={
          getActivityExpenseTotal(
            selectedDay.activities.find(
              activity =>
                activity.id ===
                editingActivityId
            ),
            displayCurrency
          )
        }

        expenseCurrency={
          displayCurrency
        }

        onChange={
          setActivityForm
        }
        onClose={
          closeEditor
        }
        onSave={
          saveActivity
        }
        onDelete={
          editorMode === 'edit'
            ? deleteActivity
            : undefined
        }
      />


      <ExpenseBookSheet
        open={
          expenseBookOpen &&
          Boolean(
            expenseActivity
          )
        }

        activityTitle={
          expenseActivity?.title ??
          ''
        }

        expenses={
          expenseActivity?.expenses ??
          []
        }

        displayCurrency={
          displayCurrency
        }

        onChange={
          updateExpenseBook
        }

        onClose={
          closeExpenseBook
        }
      />


      <BottomSheet
        open={
          titleEditorOpen
        }

        onClose={() =>
          setTitleEditorOpen(
            false
          )
        }
      >

        <div
          className="
            mt-5
          "
        >

          <p
            className="
              text-[9px]
              font-semibold
              tracking-[0.18em]
              text-slate-500
            "
          >
            {
              titleEditorTarget ===
                'trip'
                ? 'TRIP TITLE'
                : `DAY ${selectedDay.dayNumber}`
            }
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
            修改標題
          </h2>


          <input
            autoFocus
            type="text"

            value={
              titleEditorValue
            }

            onChange={
              event =>
                setTitleEditorValue(
                  event.target.value
                )
            }

            onKeyDown={
              event => {

                if (
                  event.key ===
                  'Enter'
                ) {

                  saveTitleEditor()

                }

              }
            }

            placeholder={
              titleEditorTarget ===
                'trip'
                ? '例如：行程'
                : '例如：富良野滑雪日'
            }

            className="
              mt-6
              w-full
              rounded-[18px]
              border
              border-slate-200
              bg-white
              px-4
              py-3.5
              text-[16px]
              font-medium
              text-slate-950
              outline-none
              transition
              placeholder:text-slate-400
              focus:border-slate-400
            "
          />


          <p
            className="
              mt-3
              text-[10px]
              leading-5
              text-slate-500
            "
          >
            {
              titleEditorTarget ===
                'trip'
                ? '這個名稱會顯示在 Trip 頁最上方的大標題。'
                : '這個名稱只會套用到目前選擇的這一天。'
            }
          </p>


          <button
            type="button"

            onClick={
              saveTitleEditor
            }

            className="
              mt-6
              w-full
              rounded-[18px]
              bg-slate-950
              px-4
              py-4
              text-[14px]
              font-semibold
              text-white
              transition
              active:scale-[0.99]
            "
          >
            儲存
          </button>

        </div>

      </BottomSheet>


      <TripSettingsSheet
        open={settingsOpen}
        form={tripSettingsForm}
        onChange={
          setTripSettingsForm
        }
        onClose={() =>
          setSettingsOpen(
            false
          )
        }
        onSave={
          saveTripSettings
        }
      />
    </main>
  )
}


export default Trip