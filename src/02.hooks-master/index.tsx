import {
  useEffect,
  useState,
  useLayoutEffect,
  useReducer,
  useRef,
  useImperativeHandle,
  forwardRef,
  ForwardRefRenderFunction,
  createContext,
  useContext,
  memo,
  useMemo,
  useCallback
} from 'react'
import { produce } from 'immer'

let timer: NodeJS.Timeout | null = null
export const Counter = () => {
  const [num, setNum] = useState(0)
  useLayoutEffect(() => {
    queryData().then((data: number) => {
      setNum(data)
    })
    return () => {
      clearTimeout(timer as NodeJS.Timeout)
    }
  }, [])
  return (
    <section>
      <div onClick={() => setNum((pre) => pre + 1)}>{num}</div>
    </section>
  )
}

async function queryData(): Promise<number> {
  return new Promise((res, rej) => {
    timer = setTimeout(() => {
      res(new Date().getTime())
    }, 1000)
  })
}

export const Counter2 = () => {
  const [num, setNum] = useState(() => 1 + 1)
  useEffect(() => {
    const timer = setInterval(() => {
      console.log(num)
    }, 1000)

    return () => clearInterval(timer)
  }, [num])

  return <div onClick={() => setNum((prev) => prev + 1)}>{num}</div>
}

const reducer = (state: TData, action: TAction) => {
  if (action.type === 'add') {
    return produce(state, (item) => {
      item.a.b.c += action.acc
    })
  }
  if (action.type === 'minus') {
    return produce(state, (item) => {
      item.a.b.c -= action.acc
    })
  }
  return state
}

type TAction = { type: 'add'; acc: number } | { type: 'minus'; acc: number }

type TData = {
  a: {
    b: {
      c: number
      d: number
    }
  }
  e: number
}

const initialState = {
  a: {
    b: {
      c: 1,
      d: 2
    }
  },
  e: 3
}

export const Counter3 = () => {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [newState, setNewState] = useState(initialState)
  return (
    <div>
      <div onClick={() => dispatch({ type: 'add', acc: 2 })}>add</div>
      <div onClick={() => dispatch({ type: 'minus', acc: 3 })}>minus</div>
      <div
        onClick={() => {
          setNewState(
            produce(newState, (item) => {
              item.a.b.d += 5
            })
          )
        }}
      >
        add2
      </div>
      <div>{JSON.stringify(state)}</div>
      <div>{JSON.stringify(newState)}</div>
    </div>
  )
}

export const CurInput = () => {
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])
  return <input placeholder="hello" ref={inputRef}></input>
}

export const ChildComp: ForwardRefRenderFunction<HTMLInputElement> = (props, inputRef) => {
  return <input placeholder="hello" ref={inputRef}></input>
}

const ChildInput = forwardRef(ChildComp)

export const ParentInput = () => {
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])
  return (
    <>
      <ChildInput ref={inputRef} />
    </>
  )
}

type curInputProps = {
  aaa: () => void
}

export const ChildComp2: ForwardRefRenderFunction<curInputProps> = (props, ref) => {
  const inputRef = useRef<HTMLInputElement>(null)
  useImperativeHandle(ref, () => {
    return {
      aaa() {
        inputRef.current && inputRef.current?.focus()
      }
    }
  }, [inputRef])
  return (
    <div>
      <input placeholder="hi" ref={inputRef} />
    </div>
  )
}

const ChildInput2 = forwardRef(ChildComp2)

export const ParentComp2 = () => {
  const ref = useRef<curInputProps>(null)
  useEffect(() => {
    ref.current && ref.current.aaa()
  }, [])
  return (
    <>
      <ChildInput2 ref={ref} />
    </>
  )
}

const contentContext = createContext(666)

export const ParentComp3 = () => {
  return (
    <contentContext.Provider value={333}>
      <ChildComp3 />
    </contentContext.Provider>
  )
}

const ChildComp3 = () => {
  return <GrandChildComp3 />
}

const GrandChildComp3 = () => {
  const content = useContext(contentContext)
  return <div>value: {content}</div>
}

export const ParentComp4 = () => {
  const [num, setNum] = useState(0)
  const [count, setCount] = useState(-100)

  const callback = () => {
    console.log('this is callback')
  }

  const memoCount = useMemo(() => count, [])

  const storedCallback = useCallback(callback, [])
  useEffect(() => {
    setInterval(() => {
      setNum(Math.floor(Math.random() * 100))
    }, 1000)
  }, [])
  return <MemoChildComp4 count={memoCount} cb={storedCallback}></MemoChildComp4>
}

const ChildComp4 = (props: { count: number; cb: () => void }) => {
  console.log(props.count)
  props.cb()
  return <div>{props.count}</div>
}

const MemoChildComp4 = memo(ChildComp4)
