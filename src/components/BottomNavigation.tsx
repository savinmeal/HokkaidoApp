type BottomNavigationProps = {
  activePage: string
  onPageChange: (page: string) => void
}

function BottomNavigation({
  activePage,
  onPageChange,
}: BottomNavigationProps) {

  const items = [
    { icon: '🏠', label: 'Home' },
    { icon: '🗓️', label: 'Trip' },
    { icon: '🗺️', label: 'Map' },
    { icon: '📷', label: 'Memory' },
    { icon: '•••', label: 'More' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-md justify-around px-2 py-3">

        {items.map((item) => {
          const isActive = activePage === item.label

          return (
            <button
              key={item.label}
              onClick={() => onPageChange(item.label)}
              className={`flex flex-col items-center gap-1 text-xs ${
                isActive
                  ? 'font-bold text-slate-900'
                  : 'text-slate-400'
              }`}
            >
              <span className="text-xl">
                {item.icon}
              </span>

              <span>
                {item.label}
              </span>
            </button>
          )
        })}

      </div>
    </nav>
  )
}

export default BottomNavigation