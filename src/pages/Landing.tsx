type LandingProps = {
  onEnter: () => void
}

function Landing({ onEnter }: LandingProps) {
  return (
    <main className="relative flex min-h-screen overflow-hidden bg-slate-950 text-white">

      {/* 背景光暈 */}
      <div className="absolute -left-32 top-20 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="absolute -right-24 bottom-20 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />

      {/* 背景裝飾 */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute left-[12%] top-[18%] text-5xl">
          ❄
        </div>

        <div className="absolute right-[15%] top-[28%] text-3xl">
          ❄
        </div>

        <div className="absolute bottom-[22%] left-[20%] text-2xl">
          ❄
        </div>
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-col px-6 pb-10 pt-16">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-2xl backdrop-blur">
            ✈️
          </div>

          <div>
            <p className="text-xs tracking-[0.25em] text-slate-400">
              MY TRAVEL
            </p>

            <h2 className="font-semibold">
              Travel Memories
            </h2>
          </div>
        </div>

        {/* Main */}
        <div className="mt-auto mb-auto py-16">

          <p className="mb-3 text-sm font-medium text-cyan-300">
            EXPLORE · RECORD · REMEMBER
          </p>

          <h1 className="text-5xl font-bold leading-[1.08] tracking-tight">
            把每一趟旅行
            <br />
            留在地圖上
          </h1>

          <p className="mt-6 max-w-xs text-base leading-7 text-slate-400">
            行程、足跡、照片、任務與滑雪紀錄，
            全部收進自己的旅行世界。
          </p>

          {/* Feature Preview */}
          <div className="mt-10 grid grid-cols-3 gap-3">

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <div className="text-2xl">🗺️</div>
              <p className="mt-3 text-xs text-slate-400">
                GPS
              </p>
              <p className="text-sm font-semibold">
                足跡
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <div className="text-2xl">📷</div>
              <p className="mt-3 text-xs text-slate-400">
                PHOTO
              </p>
              <p className="text-sm font-semibold">
                回憶
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <div className="text-2xl">⛷️</div>
              <p className="mt-3 text-xs text-slate-400">
                SKI
              </p>
              <p className="text-sm font-semibold">
                紀錄
              </p>
            </div>

          </div>
        </div>

        {/* Enter Button */}
        <button
          onClick={onEnter}
          className="
            group
            flex w-full items-center justify-between
            rounded-3xl bg-white
            px-6 py-5
            text-left text-slate-950
            shadow-2xl shadow-black/30
            transition
            active:scale-[0.98]
          "
        >
          <div>
            <p className="text-xs text-slate-500">
              MY TRAVEL WORLD
            </p>

            <p className="mt-1 text-lg font-bold">
              進入旅行世界
            </p>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-950 text-xl text-white transition group-hover:translate-x-1">
            →
          </div>
        </button>

      </div>
    </main>
  )
}

export default Landing