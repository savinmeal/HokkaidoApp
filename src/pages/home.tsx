import { todayTrip } from '../data/tripData'

function Home() {
  return (
    <main className="mx-auto max-w-md px-5 pb-28 pt-6">
      <p className="text-sm text-slate-500">
        2026/12/25 - 2027/01/02
      </p>

      <h1 className="mt-1 text-3xl font-bold text-slate-900">
        北海道之旅
      </h1>

      <div className="mt-6 rounded-3xl bg-slate-900 p-5 text-white">
        <p className="text-sm opacity-70">Today</p>

        <h2 className="mt-1 text-2xl font-bold">
          Day {todayTrip.day} / {todayTrip.totalDays}
        </h2>

        <p className="mt-2">
          📍 {todayTrip.city}
        </p>
      </div>

      <h2 className="mt-8 text-xl font-bold text-slate-900">
        今日行程
      </h2>

      <div className="mt-4 space-y-3">
        {todayTrip.activities.map((activity) => (
          <div
            key={`${activity.time}-${activity.title}`}
            className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm"
          >
            <div className="w-12 text-sm font-semibold text-slate-500">
              {activity.time}
            </div>

            <div className="text-2xl">
              {activity.icon}
            </div>

            <div className="font-medium text-slate-900">
              {activity.title}
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}

export default Home