import { Dispatch, SetStateAction, useState, useRef, useEffect, useCallback } from 'react'
export const useMergeState = <T>(
  defaultStateValue: T,
  props?: {
    defaultValue?: T
    value?: T
    onChange?: (val: T) => void
  }
): [T, Dispatch<SetStateAction<T>>] => {
  const { defaultValue, value: propsValue, onChange } = props || {}
  const [state, setStateValue] = useState(() => {
    if (propsValue) {
      return propsValue
    }
    if (defaultValue) return defaultValue

    return defaultStateValue
  })
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (propsValue !== undefined && !isFirstRender.current) {
      setStateValue(propsValue)
    }
    isFirstRender.current = false
  }, [propsValue])

  const isFunction = (value: any): value is Function => {
    return typeof value === 'function'
  }

  const setState = useCallback(
    (value: SetStateAction<T>) => {
      const res = isFunction(value) ? value(state) : value
      if (propsValue === undefined) {
        setStateValue(res)
      }
      onChange?.(res)
    },
    [state]
  )

  const mergedValue = propsValue === undefined ? state : propsValue

  return [mergedValue, setState]
}
