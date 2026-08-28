import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'

import ClockWidget from '../components/ClockWidget'
import TravelPact from '../components/TravelPact'
import LauncherSettingsPanel from '../components/LauncherSettingsPanel'
import QuickChecklistSheet from '../components/QuickChecklistSheet'

import launcherBg from '../assets/launcher-bg.png'
import hokkaidoIcon from '../assets/hokkaido-icon.png'
import travelPactIcon from '../assets/travel-pact-icon.png'
import checklistIcon from '../assets/checklist-icon.png'

import {
  type LauncherPreferences,
  loadLauncherPreferences,
  saveLauncherPreferences,
} from '../storage/launcherPreferences'


// ============================================================
// Desktop Types
// ============================================================

type DesktopAppKey =
  | 'newTrip'
  | 'hokkaido'
  | 'travelPact'
  | 'checklist'


type DesktopPosition = {
  column: number
  row: number
}


type DesktopLayout = Record<
  DesktopAppKey,
  DesktopPosition
>


const DESKTOP_LAYOUT_KEY =
  'travel_launcher_desktop_layout_v3'


const DEFAULT_DESKTOP_LAYOUT:
  DesktopLayout = {

  newTrip: {
    column: 0,
    row: 0,
  },

  hokkaido: {
    column: 3,
    row: 0,
  },

  travelPact: {
    column: 2,
    row: 3,
  },

  checklist: {
    column: 3,
    row: 3,
  },
}


function loadDesktopLayout():
  DesktopLayout {

  try {

    const raw =
      localStorage.getItem(
        DESKTOP_LAYOUT_KEY
      )


    if (raw) {

      const parsed =
        JSON.parse(
          raw
        ) as Partial<DesktopLayout>


      return {
        ...DEFAULT_DESKTOP_LAYOUT,
        ...parsed,
      }

    }

  } catch {
    // Ignore invalid stored layout.
  }


  return {
    ...DEFAULT_DESKTOP_LAYOUT,
  }

}


// ============================================================
// Props
// ============================================================

type LauncherProps = {
  onOpenHokkaido: () => void
}


// ============================================================
// Launcher
// ============================================================

function Launcher({
  onOpenHokkaido,
}: LauncherProps) {

  const [
    settingsOpen,
    setSettingsOpen,
  ] = useState(false)


  const [
    travelPactOpen,
    setTravelPactOpen,
  ] = useState(false)


  const [
    checklistOpen,
    setChecklistOpen,
  ] = useState(false)


  const [
    preferences,
    setPreferences,
  ] = useState<LauncherPreferences>(
    loadLauncherPreferences
  )


  const [
    desktopLayout,
    setDesktopLayout,
  ] = useState<DesktopLayout>(
    loadDesktopLayout
  )


  const [
    draggingApp,
    setDraggingApp,
  ] = useState<
    DesktopAppKey |
    null
  >(
    null
  )


  const desktopRef =
    useRef<HTMLDivElement>(
      null
    )


  const dragRef =
    useRef({
      app:
        null as DesktopAppKey | null,

      startX:
        0,

      startY:
        0,

      pointerId:
        0,

      longPress:
        false,

      moved:
        false,

      timer:
        null as number | null,
    })


  const suppressClickRef =
    useRef<
      DesktopAppKey |
      null
    >(
      null
    )


  // ==========================================================
  // Persist
  // ==========================================================

  useEffect(() => {

    saveLauncherPreferences(
      preferences
    )

  }, [
    preferences,
  ])


  useEffect(() => {

    try {

      localStorage.setItem(
        DESKTOP_LAYOUT_KEY,
        JSON.stringify(
          desktopLayout
        )
      )

    } catch {
      // Ignore localStorage error.
    }

  }, [
    desktopLayout,
  ])


  // ==========================================================
  // Helpers
  // ==========================================================

  const clearTimer =
    () => {

      if (
        dragRef.current.timer !==
        null
      ) {

        window.clearTimeout(
          dragRef.current.timer
        )


        dragRef.current.timer =
          null

      }

    }


  const placeAppAtPointer = (
    app:
      DesktopAppKey,

    clientX:
      number,

    clientY:
      number
  ) => {

    const desktop =
      desktopRef.current


    if (!desktop) {
      return
    }


    const rect =
      desktop.getBoundingClientRect()


    const localX =
      Math.max(
        0,
        Math.min(
          rect.width - 1,
          clientX -
            rect.left
        )
      )


    const localY =
      Math.max(
        0,
        Math.min(
          rect.height - 1,
          clientY -
            rect.top
        )
      )


    const column =
      Math.floor(
        localX /
        (
          rect.width /
          4
        )
      )


    const row =
      Math.floor(
        localY /
        (
          rect.height /
          4
        )
      )


    setDesktopLayout(
      current => {

        const currentPosition =
          current[app]


        const occupied =
          (
            Object.entries(
              current
            ) as [
              DesktopAppKey,
              DesktopPosition,
            ][]
          ).find(
            (
              [
                key,
                position,
              ]
            ) =>
              key !== app &&
              position.column ===
                column &&
              position.row ===
                row
          )


        if (occupied) {

          const [
            occupiedKey,
          ] =
            occupied


          return {
            ...current,

            [app]: {
              column,
              row,
            },

            [occupiedKey]:
              currentPosition,
          }

        }


        return {
          ...current,

          [app]: {
            column,
            row,
          },
        }

      }
    )

  }


  // ==========================================================
  // Global pointer tracking
  //
  // 長按啟動後，拖曳不再依賴 button 自己收到 pointermove。
  // 即使手指離開 icon 範圍仍然可以正常移動。
  // ==========================================================

  useEffect(() => {

    const handleWindowPointerMove =
      (
        event:
          PointerEvent
      ) => {

        const state =
          dragRef.current


        if (
          state.app === null
        ) {
          return
        }


        const dx =
          event.clientX -
          state.startX


        const dy =
          event.clientY -
          state.startY


        const distance =
          Math.hypot(
            dx,
            dy
          )


        // Long press 還沒成立以前，
        // 手指若明顯移動就取消 long press。
        if (
          !state.longPress
        ) {

          if (
            distance >
            12
          ) {

            state.moved =
              true


            clearTimer()

          }


          return

        }


        event.preventDefault()


        state.moved =
          true


        placeAppAtPointer(
          state.app,
          event.clientX,
          event.clientY
        )

      }


    const handleWindowPointerUp =
      (
        event:
          PointerEvent
      ) => {

        const state =
          dragRef.current


        if (
          state.app === null
        ) {
          return
        }


        if (
          state.pointerId !==
          event.pointerId
        ) {
          return
        }


        clearTimer()


        if (
          state.longPress
        ) {

          suppressClickRef.current =
            state.app

        }


        dragRef.current = {
          app:
            null,

          startX:
            0,

          startY:
            0,

          pointerId:
            0,

          longPress:
            false,

          moved:
            false,

          timer:
            null,
        }


        setDraggingApp(
          null
        )

      }


    window.addEventListener(
      'pointermove',
      handleWindowPointerMove,
      {
        passive:
          false,
      }
    )


    window.addEventListener(
      'pointerup',
      handleWindowPointerUp
    )


    window.addEventListener(
      'pointercancel',
      handleWindowPointerUp
    )


    return () => {

      window.removeEventListener(
        'pointermove',
        handleWindowPointerMove
      )


      window.removeEventListener(
        'pointerup',
        handleWindowPointerUp
      )


      window.removeEventListener(
        'pointercancel',
        handleWindowPointerUp
      )

    }

  }, [])


  // ==========================================================
  // Pointer Down
  // ==========================================================

  const startLongPress = (
    app:
      DesktopAppKey,

    event:
      ReactPointerEvent<HTMLButtonElement>
  ) => {

    if (
      event.pointerType ===
        'mouse' &&
      event.button !== 0
    ) {
      return
    }


    clearTimer()


    dragRef.current = {
      app,

      startX:
        event.clientX,

      startY:
        event.clientY,

      pointerId:
        event.pointerId,

      longPress:
        false,

      moved:
        false,

      timer:
        null,
    }


    dragRef.current.timer =
      window.setTimeout(
        () => {

          if (
            dragRef.current.app !==
            app
          ) {
            return
          }


          dragRef.current.longPress =
            true


          suppressClickRef.current =
            app


          setDraggingApp(
            app
          )

        },
        500
      )

  }


  // ==========================================================
  // Click
  // ==========================================================

  const activateApp = (
    app:
      DesktopAppKey,

    action:
      () => void
  ) => {

    if (
      suppressClickRef.current ===
      app
    ) {

      suppressClickRef.current =
        null

      return
    }


    action()

  }


  // ==========================================================
  // Render
  // ==========================================================

  return (

    <div
      className="
        relative
        h-full
        w-full
        overflow-hidden
        bg-slate-950
      "
    >

      <main
        className="
          relative
          mx-auto
          h-full
          w-full
          max-w-md
          overflow-hidden
          bg-cover
          bg-center
        "

        style={{
          backgroundImage:
            `url(${launcherBg})`,
        }}
      >

        {/* Background */}

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            bg-gradient-to-b
            from-white/10
            via-white/5
            to-slate-950/20
          "
        />


        {/* Content */}

        <div
          className="
            relative
            z-10
            flex
            h-full
            min-h-0
            flex-col
            overflow-hidden
            px-5
            pt-[calc(16px+env(safe-area-inset-top))]
            pb-[calc(18px+env(safe-area-inset-bottom))]
          "
        >

          {/* Header */}

          <div
            className="
              flex
              shrink-0
              items-start
              justify-between
              px-1
            "
          >

            <ClockWidget />


            <button
              type="button"

              aria-label="Launcher 設定"

              onClick={() =>
                setSettingsOpen(
                  true
                )
              }

              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-full
                border
                border-white/40
                bg-white/55
                text-lg
                shadow-sm
                backdrop-blur-xl
                transition
                active:scale-95
              "
            >
              ⚙
            </button>

          </div>


          {/* My Apps */}

          {
            preferences.showMyTrips && (

              <section
                className="
                  mt-5
                  flex
                  min-h-0
                  flex-1
                  flex-col
                "
              >

                <div
                  className="
                    flex
                    shrink-0
                    items-center
                    justify-between
                    px-1
                  "
                >

                  <h2
                    className="
                      text-[15px]
                      font-semibold
                      text-slate-900
                    "
                  >
                    我的旅行
                  </h2>


                  <span
                    className="
                      text-[9px]
                      font-medium
                      tracking-[0.12em]
                      text-slate-600/65
                    "
                  >
                    長按可排列
                  </span>

                </div>


                <div
                  ref={
                    desktopRef
                  }

                  className="
                    relative
                    mt-3
                    grid
                    min-h-[300px]
                    flex-1
                    grid-cols-4
                    grid-rows-4
                    gap-1
                  "
                >

                  {/* New Trip */}

                  <DesktopAppSlot
                    position={
                      desktopLayout.newTrip
                    }

                    dragging={
                      draggingApp ===
                      'newTrip'
                    }

                    onPointerDown={
                      event =>
                        startLongPress(
                          'newTrip',
                          event
                        )
                    }

                    onClick={() =>
                      activateApp(
                        'newTrip',
                        () => {}
                      )
                    }
                  >
                    <NewTripAppVisual />
                  </DesktopAppSlot>


                  {/* Hokkaido */}

                  <DesktopAppSlot
                    position={
                      desktopLayout.hokkaido
                    }

                    dragging={
                      draggingApp ===
                      'hokkaido'
                    }

                    onPointerDown={
                      event =>
                        startLongPress(
                          'hokkaido',
                          event
                        )
                    }

                    onClick={() =>
                      activateApp(
                        'hokkaido',
                        onOpenHokkaido
                      )
                    }
                  >
                    <LauncherAppVisual
                      label="北海道"

                      imageSrc={
                        hokkaidoIcon
                      }

                      imageAlt="2026 北海道"
                    />
                  </DesktopAppSlot>


                  {/* Travel Pact */}

                  {
                    preferences.showTravelPactApp && (

                      <DesktopAppSlot
                        position={
                          desktopLayout.travelPact
                        }

                        dragging={
                          draggingApp ===
                          'travelPact'
                        }

                        onPointerDown={
                          event =>
                            startLongPress(
                              'travelPact',
                              event
                            )
                        }

                        onClick={() =>
                          activateApp(
                            'travelPact',
                            () =>
                              setTravelPactOpen(
                                true
                              )
                          )
                        }
                      >
                        <LauncherAppVisual
                          label="履行契約"

                          imageSrc={
                            travelPactIcon
                          }

                          imageAlt="履行契約"
                        />
                      </DesktopAppSlot>

                    )
                  }


                  {/* Checklist */}

                  {
                    preferences.showChecklistApp && (

                      <DesktopAppSlot
                        position={
                          desktopLayout.checklist
                        }

                        dragging={
                          draggingApp ===
                          'checklist'
                        }

                        onPointerDown={
                          event =>
                            startLongPress(
                              'checklist',
                              event
                            )
                        }

                        onClick={() =>
                          activateApp(
                            'checklist',
                            () =>
                              setChecklistOpen(
                                true
                              )
                          )
                        }
                      >
                        <LauncherAppVisual
                          label="確認清單"

                          imageSrc={
                            checklistIcon
                          }

                          imageAlt="確認清單"
                        />
                      </DesktopAppSlot>

                    )
                  }

                </div>

              </section>

            )
          }


          {/* Quick Access */}

          {
            preferences.showQuickAccess && (

              <section
                className="
                  mt-3
                  shrink-0
                "
              >

                <p
                  className="
                    mb-3
                    px-1
                    text-[10px]
                    font-semibold
                    tracking-[0.20em]
                    text-slate-700/65
                  "
                >
                  QUICK ACCESS
                </p>


                <div
                  className="
                    grid
                    grid-cols-2
                    gap-3
                  "
                >

                  {
                    preferences.showQuickMap && (

                      <QuickAccessCard
                        eyebrow="Map"
                        title="我的足跡"
                        icon="🗺"
                      />

                    )
                  }


                  {
                    preferences.showQuickMemory && (

                      <QuickAccessCard
                        eyebrow="Memory"
                        title="旅行回憶"
                        icon="◉"
                      />

                    )
                  }

                </div>

              </section>

            )
          }

        </div>


        <LauncherSettingsPanel
          open={
            settingsOpen
          }

          preferences={
            preferences
          }

          onClose={() =>
            setSettingsOpen(
              false
            )
          }

          onChange={
            setPreferences
          }
        />


        <TravelPact
          open={
            travelPactOpen
          }

          onClose={() =>
            setTravelPactOpen(
              false
            )
          }
        />


        <QuickChecklistSheet
          open={
            checklistOpen
          }

          onClose={() =>
            setChecklistOpen(
              false
            )
          }
        />

      </main>

    </div>

  )

}


// ============================================================
// Desktop App Slot
// ============================================================

function DesktopAppSlot({
  position,
  dragging,
  onPointerDown,
  onClick,
  children,
}: {
  position: DesktopPosition
  dragging: boolean

  onPointerDown:
    (
      event:
        ReactPointerEvent<HTMLButtonElement>
    ) => void

  onClick:
    () => void

  children:
    ReactNode
}) {

  return (

    <button
      type="button"

      onPointerDown={
        onPointerDown
      }

      onClick={
        onClick
      }

      onContextMenu={
        event =>
          event.preventDefault()
      }

      className={`
        flex
        min-h-0
        min-w-0
        items-center
        justify-center
        self-center
        justify-self-center
        select-none
        transition
        duration-150

        ${
          dragging
            ? `
                z-20
                scale-110
                opacity-80
              `
            : `
                active:scale-95
              `
        }
      `}

      style={{
        gridColumnStart:
          position.column +
          1,

        gridRowStart:
          position.row +
          1,

        touchAction:
          'none',
      }}
    >
      {children}
    </button>

  )

}


// ============================================================
// App Visual
// ============================================================

function LauncherAppVisual({
  label,
  imageSrc,
  imageAlt,
}: {
  label: string
  imageSrc: string
  imageAlt: string
}) {

  return (

    <span
      className="
        flex
        w-[74px]
        flex-col
        items-center
        text-center
      "
    >

      <img
        src={
          imageSrc
        }

        alt={
          imageAlt
        }

        draggable={false}

        className="
          h-[64px]
          w-[64px]
          rounded-[20px]
          object-cover
          shadow-lg
          shadow-slate-900/15
        "
      />


      <span
        className="
          mt-1.5
          block
          w-full
          truncate
          text-[11px]
          font-medium
          leading-4
          text-slate-800
          drop-shadow-[0_1px_1px_rgba(255,255,255,0.6)]
        "
      >
        {label}
      </span>

    </span>

  )

}


// ============================================================
// New Trip
// ============================================================

function NewTripAppVisual() {

  return (

    <span
      className="
        flex
        w-[74px]
        flex-col
        items-center
        text-center
      "
    >

      <span
        className="
          flex
          h-[64px]
          w-[64px]
          items-center
          justify-center
          rounded-[20px]
          border
          border-white/60
          bg-white/48
          text-[24px]
          font-light
          text-slate-500
          shadow-sm
          backdrop-blur-xl
        "
      >
        +
      </span>


      <span
        className="
          mt-1.5
          text-[11px]
          font-medium
          text-slate-700
        "
      >
        新旅行
      </span>

    </span>

  )

}


// ============================================================
// Quick Access
// ============================================================

function QuickAccessCard({
  eyebrow,
  title,
  icon,
}: {
  eyebrow: string
  title: string
  icon: string
}) {

  return (

    <button
      type="button"

      className="
        flex
        min-w-0
        items-center
        gap-3
        rounded-[20px]
        border
        border-white/50
        bg-white/48
        p-3.5
        text-left
        shadow-sm
        backdrop-blur-xl
        transition
        active:scale-[0.98]
      "
    >

      <div
        className="
          flex
          h-9
          w-9
          shrink-0
          items-center
          justify-center
          rounded-[13px]
          bg-white/70
          text-[17px]
        "
      >
        {icon}
      </div>


      <div
        className="
          min-w-0
        "
      >

        <p
          className="
            text-[10px]
            text-slate-600
          "
        >
          {eyebrow}
        </p>


        <p
          className="
            truncate
            text-[13px]
            font-semibold
            text-slate-900
          "
        >
          {title}
        </p>

      </div>

    </button>

  )

}


export default Launcher
