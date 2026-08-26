import { useEffect, useState } from 'react'

function ClockWidget() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const timeText = now.toLocaleTimeString('zh-TW', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

  const dateText = now.toLocaleDateString('zh-TW', {
    month: '2-digit',
    day: '2-digit',
    weekday: 'long',
  })

  const hour = now.getHours()

  let greeting = 'Good Evening'

  if (hour < 12) {
    greeting = 'Good Morning'
  } else if (hour < 18) {
    greeting = 'Good Afternoon'
  }

  return (
    <div>
      <p className="text-sm font-medium text-slate-500">
        {greeting}
      </p>

      <div className="mt-1 flex items-end gap-3">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          {timeText}
        </h1>

        <p className="pb-1 text-sm text-slate-500">
          {dateText}
        </p>
      </div>
    </div>
  )
}

export default ClockWidget