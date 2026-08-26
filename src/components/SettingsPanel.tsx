type SettingsPanelProps = {
  open: boolean
  onClose: () => void
}

function SettingsPanel({
  open,
  onClose,
}: SettingsPanelProps) {
  if (!open) {
    return null
  }

  return (
    <div className="absolute inset-0 z-50">

      {/* Background */}
      <button
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        aria-label="Close settings"
      />

      {/* Panel */}
      <div
        className="
          absolute
          right-0
          top-0
          h-full
          w-[82%]
          max-w-sm
          bg-white
          p-6
          shadow-2xl
        "
      >

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">
              SETTINGS
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              設定
            </h2>
          </div>

          <button
            onClick={onClose}
            className="
              flex h-10 w-10
              items-center justify-center
              rounded-full
              bg-slate-100
              text-xl
            "
          >
            ×
          </button>
        </div>

        <div className="mt-8 space-y-3">

          <button className="w-full rounded-2xl bg-slate-100 p-4 text-left">
            <p className="font-semibold text-slate-800">
              🌐 語言
            </p>
            <p className="mt-1 text-sm text-slate-500">
              繁體中文
            </p>
          </button>

          <button className="w-full rounded-2xl bg-slate-100 p-4 text-left">
            <p className="font-semibold text-slate-800">
              🎨 外觀
            </p>
            <p className="mt-1 text-sm text-slate-500">
              預設主題
            </p>
          </button>

          <button className="w-full rounded-2xl bg-slate-100 p-4 text-left">
            <p className="font-semibold text-slate-800">
              📍 GPS
            </p>
            <p className="mt-1 text-sm text-slate-500">
              尚未啟用
            </p>
          </button>

          <button className="w-full rounded-2xl bg-slate-100 p-4 text-left">
            <p className="font-semibold text-slate-800">
              ℹ️ 關於
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Travel Memories v1.0
            </p>
          </button>

        </div>

      </div>

    </div>
  )
}

export default SettingsPanel