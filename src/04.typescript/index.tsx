import {
  ReactNode,
  FC,
  useState,
  useRef,
  useLayoutEffect,
  useEffect,
  useImperativeHandle,
  forwardRef,
  ForwardRefRenderFunction,
  PropsWithChildren,
  CSSProperties,
  HTMLAttributes,
  AnchorHTMLAttributes,
  MouseEvent
} from 'react'

interface AaaProps {
  name: string
  content: ReactNode
}

const Aaa: FC<AaaProps> = (props: AaaProps) => {
  return (
    <div>
      {props.name}
      {props.content}
    </div>
  )
}

export const Bbb = () => {
  return <Aaa name="hello" content="this is norman"></Aaa>
}

export const CustomUseStateType = () => {
  const [count, setCount] = useState<number>(0)

  return <div onClick={() => setCount((prev) => prev + 1)}>{count}</div>
}

export const CustomUseRefType1 = () => {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <div>
      <input placeholder="a" ref={ref} />
    </div>
  )
}

interface customRef2 {
  num: number
}

export const CustomUseRefType2 = () => {
  const [count, setCount] = useState<number>(0)
  const ref = useRef<customRef2>(null)

  useLayoutEffect(() => {
    ref.current = { num: 3 }
  })

  useEffect(() => {
    setCount(ref.current?.num!)
  }, [])

  return <div>{count}</div>
}

interface ImperativeHandleRef {
  aaa: () => void
}

interface ImperativeHandleProps {
  name: string
}

const CustomUseImperativeHandle: ForwardRefRenderFunction<ImperativeHandleRef, ImperativeHandleProps> = (
  props,
  ref
) => {
  const initRef = useRef<HTMLInputElement>(null)
  useImperativeHandle(
    ref,
    () => ({
      aaa() {
        initRef.current && initRef.current.focus()
      }
    }),
    [initRef]
  )
  return <input placeholder="hello" ref={initRef} value={props.name}></input>
}

const WrapperedImperativeHandle = forwardRef(CustomUseImperativeHandle)

export const CustomParentImperativeHandle = () => {
  const outerRef = useRef<ImperativeHandleRef>(null)
  useEffect(() => {
    const timer = setTimeout(() => {
      outerRef.current && outerRef.current.aaa()
    }, 5400)
    return () => clearTimeout(timer)
  }, [])
  return <WrapperedImperativeHandle name="hel" ref={outerRef}></WrapperedImperativeHandle>
}

type CccProps = PropsWithChildren<{
  content: ReactNode
  color: CSSProperties['color']
  styles?: CSSProperties
}>

const Ccc = (props: CccProps) => {
  return (
    <div
      style={{
        color: props.color,
        ...props.styles
      }}
    >
      {props.content}
      {props.children}
    </div>
  )
}

export const Ddd = () => {
  return (
    <Ccc
      content={<div>hello</div>}
      color="green"
      styles={{
        background: 'blue'
      }}
    >
      <div>world</div>
    </Ccc>
  )
}

interface EeeProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  url: string
  label: string
  clickHandler: (e: MouseEvent<HTMLDivElement>) => void
}

const Eee = (props: EeeProps) => {
  return (
    <>
      <a {...props}>{props.label}</a>
      <div onClick={props.clickHandler}>click click</div>
    </>
  )
}

export const Fff = () => {
  return (
    <Eee
      href="https://www.bing.com/"
      target="__black"
      clickHandler={(e) => {
        // e.stopPropagation()
        e.preventDefault()
      }}
      url="https://www.google.com/"
      label="hello google"
    ></Eee>
  )
}
