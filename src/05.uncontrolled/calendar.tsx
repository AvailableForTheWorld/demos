import { ChangeEvent, useState, useRef, useEffect } from 'react'
import { useMergeState } from './useMergeState'

interface CalendarProps {
  value?: Date
  defaultValue?: Date
  onChange?: (data: Date) => void
}

export const Calendar = (props: CalendarProps) => {
  const { value: propsValue, defaultValue, onChange } = props
  const [value, setValue] = useState(() => {
    if (propsValue) {
      return propsValue
    }
    return defaultValue
  })

  console.log('rendering')
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (propsValue === undefined && !isFirstRender.current) {
      setValue(propsValue)
    }
    isFirstRender.current = false
  }, [propsValue])

  const mergedValue = propsValue === undefined ? defaultValue : propsValue

  const changeValue = (date: Date) => {
    if (propsValue === undefined) {
      setValue(date)
    }
    onChange?.(date)
  }

  return (
    <div>
      {mergedValue?.toLocaleTimeString()}
      <div onClick={() => changeValue(new Date())}>now</div>
    </div>
  )
}

export const CalendarNew = (props: CalendarProps) => {
  const { value: propsValue, defaultValue, onChange } = props

  const [value, setValue] = useMergeState(new Date(), {
    value: propsValue,
    defaultValue,
    onChange
  })

  return (
    <div>
      {value?.toLocaleTimeString()}
      <div onClick={() => setValue(new Date())}>now</div>
    </div>
  )
}
