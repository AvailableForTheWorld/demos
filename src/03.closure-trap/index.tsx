import { useState, useEffect, useReducer, useRef, useLayoutEffect, useCallback } from 'react'

export const WrongAnswer = () => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    setInterval(() => {
      setCount(count + 1)
    }, 1000)
  }, [])
  return <div>{count}</div>
}

export const Solution1 = () => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    setInterval(() => {
      setCount((count) => count + 1)
    }, 1000)
  }, [])
  return <div>{count}</div>
}

const reducer = (state: number, action: { type: string; acc: number }) => {
  if (action.type === 'add') {
    return state + action.acc
  }
  return state
}

export const Solution2 = () => {
  const [count, dispatch] = useReducer(reducer, 0)

  useEffect(() => {
    setInterval(() => {
      dispatch({ type: 'add', acc: 2 })
    }, 1000)
  }, [])
  return <div>{count}</div>
}

export const Solution3 = () => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCount(count + 3)
    }, 1000)
    return () => clearInterval(timer)
  }, [count])
  return <div>{count}</div>
}

export const Solution4 = () => {
  const [count, setCount] = useState(0)
  const update = () => {
    setCount(count + 4)
  }
  const ref = useRef<() => void>(update)
  useLayoutEffect(() => {
    ref.current = update
  })

  useEffect(() => {
    const timer = setInterval(() => {
      ref.current?.()
    }, 1000)
    return () => clearInterval(timer)
  }, [])
  return <div>{count}</div>
}

const useInterval = (fn: Function, delay: number) => {
  const ref = useRef(fn)

  useLayoutEffect(() => {
    ref.current = fn
  })

  const cleanRef = useRef<Function>(() => {})

  const clean = useCallback(() => {
    cleanRef.current?.()
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      ref.current()
    }, delay)

    cleanRef.current = () => {
      clearInterval(timer)
    }

    return clean
  }, [delay, clean])

  return clean
}

export const CustomIntervalComp = () => {
  const [count, setCount] = useState(0)

  useInterval(() => setCount(count + 5), 1000)

  return <div>{count}</div>
}
