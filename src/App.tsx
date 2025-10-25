import { useState } from 'react'
import { CalendarNew } from './05.uncontrolled'

function App() {
  const [value, setValue] = useState(new Date())
  console.log('app rendering')
  return (
    <div className="App">
      <CalendarNew
        defaultValue={new Date()}
        onChange={(date) => {
          // setValue(date)
        }}
      />
    </div>
  )
}

export default App
