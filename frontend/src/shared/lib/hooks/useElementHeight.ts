import { useLayoutEffect, useState } from 'react'

/** Measures the border box, including safe-area padding and wrapped content. */
export function useElementHeight<T extends HTMLElement>() {
  const [element, setElement] = useState<T | null>(null)
  const [height, setHeight] = useState<number>()

  useLayoutEffect(() => {
    if (!element) {
      setHeight(undefined)
      return
    }

    const measure = () => setHeight(element.getBoundingClientRect().height)
    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(element, { box: 'border-box' })
    return () => observer.disconnect()
  }, [element])

  return { ref: setElement, height }
}
