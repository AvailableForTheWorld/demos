import { useState, useEffect, useImperativeHandle, useRef } from 'react'
import { CALENDAR_DATE } from './constants'
import './styles.css'
import { nanoid } from 'nanoid'
import { useMergeState } from '../05.uncontrolled/useMergeState'

export interface MiniCalendarRef {
  setState: (date: Date) => void
  getState: () => Date
}

interface MiniCalendarProps {
  defaultValue?: Date
  value?: Date
  onChange?: (date: Date) => void
  ref?: React.Ref<MiniCalendarRef>
}

export const MiniCalendar = (props: MiniCalendarProps) => {
  const { defaultValue, value, onChange, ref } = props
  const [date, setDate] = useMergeState(new Date(), {
    defaultValue,
    value,
    onChange
  })
  const [days, setDays] = useState<any>([])
  const handlePrevMonth = () => {
    setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1))
  }
  const handleNextMonth = () => {
    setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1))
  }

  useImperativeHandle(ref, () => {
    return {
      setState(date: Date) {
        setDate(date)
      },
      getState() {
        return date
      }
    }
  })

  const dayOfMonth = (year: number, month: number) => {
    const date = new Date(year, month + 1, 0)
    return date.getDate()
  }

  const firstDayMonth = (year: number, month: number) => {
    const date = new Date(year, month, 1)
    return date.getDay()
  }

  const modifyDaySettings = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const curDayOfMonth = dayOfMonth(year, month)
    const curFirstDayMonth = firstDayMonth(year, month)
    const days = []

    const clickHandler = (i: number) => {
      const date = new Date(year, month, i + 1)
      setDate(date)
    }

    for (let i = 0; i < curFirstDayMonth; ++i) {
      days.push({
        id: nanoid(),
        type: 'empty',
        text: '',
        clickHandler: () => void 0
      })
    }
    for (let i = 0; i < curDayOfMonth; ++i) {
      days.push({
        id: nanoid(),
        type: 'day',
        text: (i + 1).toString(),
        className: i + 1 === date.getDate() ? 'day selected' : 'day',
        clickHandler: () => clickHandler(i)
      })
    }
    setDays(days)
  }

  useEffect(() => {
    modifyDaySettings(date)
  }, [date])

  return (
    <section className="calendar">
      <div className="header">
        <button onClick={handlePrevMonth}>&lt;</button>
        <div>
          {date.getFullYear()}-{date.getMonth() + 1}
        </div>
        <button onClick={handleNextMonth}>&gt;</button>
      </div>
      <div className="days">
        {Array.prototype.concat(CALENDAR_DATE, days).map((item) => {
          return (
            <div key={item.id} className={item.className || 'day'} onClick={item.clickHandler}>
              {item.text}
            </div>
          )
        })}
      </div>
    </section>
  )
}

export const MiniCalendarWrapper = () => {
  const ref = useRef<MiniCalendarRef>(null)
  const [date, setDate] = useState(new Date(2023, 1, 28))
  useEffect(() => {
    setTimeout(() => {
      ref.current?.setState(new Date(2019, 8, 14))
    }, 2000)

    setTimeout(() => {
      console.log(ref.current?.getState())
    }, 6000)
  }, [])
  return (
    <MiniCalendar
      ref={ref}
      defaultValue={new Date(2020, 9, 10)}
      value={date}
      onChange={(curDate: Date) => {
        console.log('curDate: ', curDate)
        setDate(curDate)
      }}
    />
  )
}
