import { useState } from 'react'

import Home from './pages/Home'
import Trip from './pages/Trip'
import Map from './pages/Map'
import Memory from './pages/Memory'
import More from './pages/More'

import BottomNavigation from './components/BottomNavigation'

type TripAppProps = {
  onExit: () => void
}

function TripApp({
  onExit,
}: TripAppProps) {

  const [activePage, setActivePage] = useState('Home')

  const renderPage = () => {

    switch (activePage) {

      case 'Trip':
        return <Trip />

      case 'Map':
        return <Map />

      case 'Memory':
        return <Memory />

      case 'More':
        return <More />

      default:
        return <Home />
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">

      {/* 上方返回桌面 */}
      <div className="mx-auto max-w-md px-5 pt-4">
        <button
          onClick={onExit}
          className="text-sm font-medium text-slate-500"
        >
          ← 我的旅行
        </button>
      </div>

      {renderPage()}

      <BottomNavigation
        activePage={activePage}
        onPageChange={setActivePage}
      />

    </div>
  )
}

export default TripApp