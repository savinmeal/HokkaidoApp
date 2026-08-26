import { useState } from 'react'

import Landing from './pages/Landing'
import Launcher from './pages/Launcher'
import TripApp from './TripApp'

type Screen =
  | 'landing'
  | 'launcher'
  | 'hokkaido'

function App() {

  const [screen, setScreen] =
    useState<Screen>('landing')

  if (screen === 'landing') {
    return (
      <Landing
        onEnter={() => setScreen('launcher')}
      />
    )
  }

  if (screen === 'hokkaido') {
    return (
      <TripApp
        onExit={() => setScreen('launcher')}
      />
    )
  }

  return (
    <Launcher
      onOpenHokkaido={() =>
        setScreen('hokkaido')
      }
    />
  )
}

export default App