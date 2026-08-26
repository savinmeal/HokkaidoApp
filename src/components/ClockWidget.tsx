import { useEffect, useState } from 'react'

function ClockWidget() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date())
    }, 30_000)

    return () => {
      window.clearInterval(timer)
    }
  }, [])

  // ------------------------------------------------------------
  // 時間
  // ------------------------------------------------------------
  const timeText = now.toLocaleTimeString('zh-TW', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

  // ------------------------------------------------------------
  // 日期
  // ------------------------------------------------------------
  const month = now.getMonth() + 1
  const day = now.getDate()

  const weekday = now.toLocaleDateString('zh-TW', {
    weekday: 'long',
  })

  // ------------------------------------------------------------
  // Greeting
  // ------------------------------------------------------------
  const hour = now.getHours()

  let greeting = 'GOOD EVENING'

  if (hour < 5) {
    greeting = 'GOOD NIGHT'
  } else if (hour < 12) {
    greeting = 'GOOD MORNING'
  } else if (hour < 18) {
    greeting = 'GOOD AFTERNOON'
  }

  return (
    <div className="select-none">

      {/* Greeting */}
      <p
        className="
          text-[10px]
          font-medium
          tracking-[0.26em]
          text-slate-800
        "
      >
        {greeting}
      </p>

      {/* Time */}
      <div className="mt-1">

        <p
          className="
            text-[52px]
            font-light
            leading-none
            tracking-[-0.055em]
            text-slate-900
          "
        >
          {timeText}
        </p>

      </div>

      {/* Date */}
      <div className="mt-2 flex items-center gap-2">

        <span
          className="
            text-[13px]
            font-medium
            text-slate-800
          "
        >
          {month}月{day}日
        </span>

        <span className="h-1 w-1 rounded-full bg-slate-600/40" />

        <span
          className="
            text-[13px]
            font-medium
            text-slate-800
          "
        >
          {weekday}
        </span>

      </div>

    </div>
  )
}

export default ClockWidget