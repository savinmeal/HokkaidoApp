import type {
  LauncherPreferences,
} from '../storage/launcherPreferences'


type LauncherSettingsPanelProps = {
  open: boolean
  preferences: LauncherPreferences
  onClose: () => void
  onChange: (
    next: LauncherPreferences
  ) => void
}


function LauncherSettingsPanel({
  open,
  preferences,
  onClose,
  onChange,
}: LauncherSettingsPanelProps) {

  if (!open) {
    return null
  }


  const toggle = (
    key:
      keyof LauncherPreferences
  ) => {

    onChange({
      ...preferences,
      [key]:
        !preferences[key],
    })

  }


  return (

    <div
      data-disable-swipe-back="true"
      className="
        fixed
        inset-0
        z-[1200]
      "
    >

      <button
        type="button"

        aria-label="關閉 Launcher 設定"

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
          absolute
          bottom-0
          left-1/2
          w-full
          max-w-md
          -translate-x-1/2
          rounded-t-[28px]
          border
          border-white/30
          bg-white/95
          px-5
          pt-4
          pb-[calc(20px+env(safe-area-inset-bottom))]
          shadow-2xl
          backdrop-blur-2xl
        "
      >

        <div
          className="
            mx-auto
            mb-4
            h-1.5
            w-12
            rounded-full
            bg-slate-300
          "
        />


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
                tracking-[0.20em]
                text-slate-400
              "
            >
              LAUNCHER
            </p>


            <h2
              className="
                mt-1
                text-[22px]
                font-semibold
                tracking-[-0.03em]
                text-slate-950
              "
            >
              顯示設定
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
              bg-slate-100
              text-[17px]
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
            mt-5
            space-y-3
          "
        >

          {/* Main sections */}

          <div
            className="
              rounded-[20px]
              border
              border-slate-200
              bg-slate-50
              p-4
            "
          >

            <p
              className="
                mb-3
                text-[11px]
                font-semibold
                tracking-[0.08em]
                text-slate-500
              "
            >
              區塊顯示
            </p>


            <div
              className="
                space-y-4
              "
            >

              <SettingRow
                label="我的旅行"
                checked={
                  preferences.showMyTrips
                }
                onClick={() =>
                  toggle(
                    'showMyTrips'
                  )
                }
              />


              <SettingRow
                label="Quick Access"
                checked={
                  preferences.showQuickAccess
                }
                onClick={() =>
                  toggle(
                    'showQuickAccess'
                  )
                }
              />

            </div>

          </div>


          {/* Apps */}

          <div
            className="
              rounded-[20px]
              border
              border-slate-200
              bg-slate-50
              p-4
            "
          >

            <p
              className="
                mb-3
                text-[11px]
                font-semibold
                tracking-[0.08em]
                text-slate-500
              "
            >
              我的旅行 APP
            </p>


            <div
              className="
                space-y-4
              "
            >

              <SettingRow
                label="履行契約"
                checked={
                  preferences.showTravelPactApp
                }
                onClick={() =>
                  toggle(
                    'showTravelPactApp'
                  )
                }
              />


              <SettingRow
                label="確認清單"
                checked={
                  preferences.showChecklistApp
                }
                onClick={() =>
                  toggle(
                    'showChecklistApp'
                  )
                }
              />

            </div>

          </div>


          {/* Quick access */}

          <div
            className="
              rounded-[20px]
              border
              border-slate-200
              bg-slate-50
              p-4
            "
          >

            <p
              className="
                mb-3
                text-[11px]
                font-semibold
                tracking-[0.08em]
                text-slate-500
              "
            >
              QUICK ACCESS
            </p>


            <div
              className="
                space-y-4
              "
            >

              <SettingRow
                label="我的足跡"
                checked={
                  preferences.showQuickMap
                }
                onClick={() =>
                  toggle(
                    'showQuickMap'
                  )
                }
              />


              <SettingRow
                label="旅行回憶"
                checked={
                  preferences.showQuickMemory
                }
                onClick={() =>
                  toggle(
                    'showQuickMemory'
                  )
                }
              />

            </div>

          </div>

        </div>

      </section>

    </div>

  )

}


type SettingRowProps = {
  label: string
  checked: boolean
  onClick: () => void
}


function SettingRow({
  label,
  checked,
  onClick,
}: SettingRowProps) {

  return (

    <button
      type="button"

      onClick={
        onClick
      }

      className="
        flex
        w-full
        items-center
        justify-between
        gap-4
        text-left
      "
    >

      <span
        className="
          text-[13px]
          font-medium
          text-slate-800
        "
      >
        {label}
      </span>


      <span
        className={`
          relative
          flex
          h-7
          w-12
          shrink-0
          items-center
          rounded-full
          p-1
          transition

          ${
            checked
              ? 'bg-slate-900'
              : 'bg-slate-300'
          }
        `}
      >

        <span
          className={`
            h-5
            w-5
            rounded-full
            bg-white
            shadow-sm
            transition-transform

            ${
              checked
                ? 'translate-x-5'
                : 'translate-x-0'
            }
          `}
        />

      </span>

    </button>

  )

}


export default LauncherSettingsPanel