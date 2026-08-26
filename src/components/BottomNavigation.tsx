type BottomNavigationProps = {
  activePage: string
  onPageChange: (page: string) => void
}


type NavigationItem = {
  page: string
  label: string
  icon:
    | 'home'
    | 'trip'
    | 'map'
    | 'memory'
    | 'more'
}


const items: NavigationItem[] = [
  {
    page: 'home',
    label: 'Home',
    icon: 'home',
  },
  {
    page: 'trip',
    label: 'Trip',
    icon: 'trip',
  },
  {
    page: 'map',
    label: 'Map',
    icon: 'map',
  },
  {
    page: 'memory',
    label: 'Memory',
    icon: 'memory',
  },
  {
    page: 'more',
    label: 'More',
    icon: 'more',
  },
]


// ============================================================
// Navigation Icon
// ============================================================

type NavigationIconProps = {
  type: NavigationItem['icon']
  active: boolean
}


function NavigationIcon({
  type,
  active,
}: NavigationIconProps) {

  const commonClass = `
    h-[21px]
    w-[21px]
    transition-all
    duration-200
    ${
      active
        ? 'stroke-slate-950'
        : 'stroke-slate-500'
    }
  `


  // ------------------------------------------------------------
  // Home
  // ------------------------------------------------------------

  if (type === 'home') {

    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={commonClass}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >

        <path d="M3.5 10.5L12 3.8L20.5 10.5" />

        <path d="M5.5 9.5V20H18.5V9.5" />

        <path d="M9.5 20V14H14.5V20" />

      </svg>
    )
  }


  // ------------------------------------------------------------
  // Trip
  // ------------------------------------------------------------

  if (type === 'trip') {

    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={commonClass}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >

        <rect
          x="4"
          y="5"
          width="16"
          height="15"
          rx="3"
        />

        <path d="M8 3.5V7" />

        <path d="M16 3.5V7" />

        <path d="M4 9.5H20" />

        <path d="M8 13H10" />

        <path d="M14 13H16" />

        <path d="M8 16.5H10" />

      </svg>
    )
  }


  // ------------------------------------------------------------
  // Map
  // ------------------------------------------------------------

  if (type === 'map') {

    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={commonClass}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >

        <path
          d="
            M3.5 6.5
            8.5 4
            15.5 6.5
            20.5 4
            V17.5
            L15.5 20
            8.5 17.5
            3.5 20
            Z
          "
        />

        <path d="M8.5 4V17.5" />

        <path d="M15.5 6.5V20" />

      </svg>
    )
  }


  // ------------------------------------------------------------
  // Memory
  // ------------------------------------------------------------

  if (type === 'memory') {

    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={commonClass}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >

        <path
          d="
            M6 7
            H8.5
            L10 5
            H14
            L15.5 7
            H18
            C19.7 7
            21 8.3
            21 10
            V17
            C21 18.7
            19.7 20
            18 20
            H6
            C4.3 20
            3 18.7
            3 17
            V10
            C3 8.3
            4.3 7
            6 7
            Z
          "
        />

        <circle
          cx="12"
          cy="13.5"
          r="3.2"
        />

      </svg>
    )
  }


  // ------------------------------------------------------------
  // More
  // ------------------------------------------------------------

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={commonClass}
      strokeWidth="1.8"
      strokeLinecap="round"
    >

      <circle
        cx="5"
        cy="12"
        r="1"
        fill="currentColor"
        stroke="none"
      />

      <circle
        cx="12"
        cy="12"
        r="1"
        fill="currentColor"
        stroke="none"
      />

      <circle
        cx="19"
        cy="12"
        r="1"
        fill="currentColor"
        stroke="none"
      />

    </svg>
  )
}


// ============================================================
// Bottom Navigation
// ============================================================

function BottomNavigation({
  activePage,
  onPageChange,
}: BottomNavigationProps) {

  return (

    <div
      className="
        w-full
        px-3
        pb-[max(10px,env(safe-area-inset-bottom))]
        pt-2
      "
    >

      <nav
        className="
          relative
          mx-auto
          w-full
          overflow-hidden
          rounded-[26px]
          border
          border-white/40
          bg-white/25
          shadow-[0_10px_35px_rgba(15,23,42,0.16)]
          backdrop-blur-2xl
          backdrop-saturate-150
        "
      >

        {/* ====================================================
            Glass Highlight

            上方增加一層很淡的亮面
            讓玻璃感更明顯
        ==================================================== */}

        <div
          className="
            pointer-events-none
            absolute
            inset-x-0
            top-0
            h-px
            bg-white/70
          "
        />


        {/* ====================================================
            Navigation Items
        ==================================================== */}

        <div
          className="
            relative
            z-10
            grid
            grid-cols-5
            px-2
            py-2
          "
        >

          {items.map((item) => {

            const isActive =
              activePage === item.page


            return (

              <button
                key={item.page}

                type="button"

                onClick={() => {
                  onPageChange(item.page)
                }}

                className="
                  group
                  relative
                  flex
                  min-h-[54px]
                  flex-col
                  items-center
                  justify-center
                  gap-[5px]
                  rounded-[18px]
                  transition-all
                  duration-200
                  active:scale-[0.94]
                "
              >


                {/* ============================================
                    Active Background

                    不做整個大膠囊
                    只給 active item 一點淡淡霧化
                ============================================ */}

                <div
                  className={`
                    pointer-events-none
                    absolute
                    inset-[3px]
                    rounded-[16px]
                    transition-all
                    duration-300

                    ${
                      isActive
                        ? `
                            scale-100
                            bg-white/35
                            opacity-100
                            shadow-sm
                          `
                        : `
                            scale-90
                            opacity-0
                          `
                    }
                  `}
                />


                {/* ============================================
                    Active Indicator
                ============================================ */}

                <div
                  className={`
                    absolute
                    top-[3px]
                    z-10
                    h-[2px]
                    rounded-full
                    bg-slate-900
                    transition-all
                    duration-300

                    ${
                      isActive
                        ? `
                            w-4
                            opacity-100
                          `
                        : `
                            w-0
                            opacity-0
                          `
                    }
                  `}
                />


                {/* ============================================
                    Icon
                ============================================ */}

                <div
                  className={`
                    relative
                    z-10
                    flex
                    h-6
                    items-center
                    justify-center
                    transition-all
                    duration-200

                    ${
                      isActive
                        ? '-translate-y-[1px]'
                        : ''
                    }
                  `}
                >

                  <NavigationIcon
                    type={item.icon}
                    active={isActive}
                  />

                </div>


                {/* ============================================
                    Label
                ============================================ */}

                <span
                  className={`
                    relative
                    z-10
                    text-[10px]
                    leading-none
                    transition-all
                    duration-200

                    ${
                      isActive
                        ? `
                            font-semibold
                            text-slate-950
                          `
                        : `
                            font-medium
                            text-slate-500
                          `
                    }
                  `}
                >
                  {item.label}
                </span>

              </button>

            )

          })}

        </div>

      </nav>

    </div>

  )
}


export default BottomNavigation