import { useState, useRef, useEffect } from 'react'

export const BaseUncontrolledComp = () => {
  const onChange = (val: any) => {
    console.log('val', val)
  }

  return <input title="nihao" defaultValue={'hello'} onChange={onChange} />
}

export const BaseUncontrolledComp2 = () => {
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    setTimeout(() => {
      inputRef.current && inputRef.current.focus()
    }, 2000)
  }, [])

  return <input title="nihao" defaultValue={'hello'} ref={inputRef} />
}

export const BaseControlledComp1 = () => {
  const [value, setValue] = useState('hi')

  console.log('controlled comp rendering')
  const onChange = (e: any) => {
    console.log(e.target.value)
    setValue(e.target.value.toUpperCase())
  }

  return <input title="hi" value={value} onChange={onChange} />
}
