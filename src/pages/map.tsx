import {
  useEffect,
  useState,
} from 'react'

import MapEditPanel from '../components/MapEditPanel'
import SkiResortMapCard from '../components/SkiResortMapCard'
import SkiTrackCard from '../components/SkiTrackCard'
import TripRouteMapCard from '../components/TripRouteMapCard'

import {
  loadMapModuleVisibility,
  saveMapModuleVisibility,
  type MapModuleVisibility,
} from '../data/mapPreferences'


function Map() {

  const [
    settingsOpen,
    setSettingsOpen,
  ] = useState(false)


  const [
    visibility,
    setVisibility,
  ] = useState<MapModuleVisibility>(
    loadMapModuleVisibility
  )


  useEffect(() => {

    saveMapModuleVisibility(
      visibility
    )

  }, [
    visibility,
  ])


  return (

    <main
      className="
        mx-auto
        w-full
        max-w-md
        px-6
        pb-10
        pt-6
      "
    >

      {/* Header */}

      <section>

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
                text-[10px]
                font-semibold
                tracking-[0.28em]
                text-slate-600
              "
            >
              HOKKAIDO MAP
            </p>


            <h1
              className="
                mt-2
                text-[32px]
                font-semibold
                leading-none
                tracking-[-0.035em]
                text-slate-950
              "
            >
              地圖與軌跡
            </h1>


            <p
              className="
                mt-3
                text-[11px]
                leading-5
                text-slate-500
              "
            >
              Ski · Trail Map · Trip Route
            </p>

          </div>


          <button
            type="button"

            aria-label="Map 顯示設定"

            onPointerDown={event => {
              event.stopPropagation()
            }}

            onClick={() =>
              setSettingsOpen(
                true
              )
            }

            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-full
              border
              border-slate-300/80
              bg-white/55
              text-slate-700
              shadow-sm
              backdrop-blur-xl
              transition
              active:scale-95
            "
          >

            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle
                cx="12"
                cy="12"
                r="3"
              />

              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06-2.12 2.12-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V20h-3v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06-2.12-2.12.06-.06A1.65 1.65 0 0 0 7.2 15a1.65 1.65 0 0 0-1.51-1H5.6v-3h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06L8.93 6l.06.06A1.65 1.65 0 0 0 10.8 6.4a1.65 1.65 0 0 0 1-1.51V4.8h3v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06 2.12 2.12-.06.06A1.65 1.65 0 0 0 19.4 10a1.65 1.65 0 0 0 1.51 1H21v3h-.09a1.65 1.65 0 0 0-1.51 1Z" />
            </svg>

          </button>

        </div>

      </section>


      {visibility.skiTrack && (
        <SkiTrackCard />
      )}


      {visibility.skiMaps && (
        <SkiResortMapCard />
      )}


      {visibility.tripRoute && (
        <TripRouteMapCard />
      )}


      <MapEditPanel
        open={
          settingsOpen
        }

        visibility={
          visibility
        }

        onChange={
          setVisibility
        }

        onClose={() =>
          setSettingsOpen(
            false
          )
        }
      />

    </main>

  )

}


export default Map