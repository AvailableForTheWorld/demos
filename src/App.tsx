import { useState } from 'react'
import { MiniCalendarWrapper } from './07.mini-calendar'

function App() {
  const [value, setValue] = useState(new Date())
  console.log('app rendering')
  return (
    <div className="App">
      <MiniCalendarWrapper />
    </div>
  )
}

export default App
