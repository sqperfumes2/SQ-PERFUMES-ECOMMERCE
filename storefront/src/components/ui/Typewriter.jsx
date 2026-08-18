import { useEffect, useState } from 'react'

export default function Typewriter({ text, className = '' }) {
  const [shown, setShown] = useState('')

  useEffect(() => {
    if (!text) {
      setShown('')
      return undefined
    }

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setShown(text)
      return undefined
    }

    let index = 0
    let direction = 1
    let timer

    const step = () => {
      index += direction
      if (index >= text.length) {
        index = text.length
        direction = -1
        setShown(text)
        timer = setTimeout(step, 2400)
        return
      }
      if (index <= 0) {
        index = 0
        direction = 1
        setShown('')
        timer = setTimeout(step, 450)
        return
      }
      setShown(text.slice(0, index))
      timer = setTimeout(step, direction > 0 ? 36 : 18)
    }

    timer = setTimeout(step, 350)
    return () => clearTimeout(timer)
  }, [text])

  return (
    <p className={`relative ${className}`} aria-label={text}>
      <span className="invisible" aria-hidden="true">
        {text}
      </span>
      <span className="absolute inset-0" aria-hidden="true">
        {shown}
        <span className="ml-0.5 inline-block h-[0.9em] w-[2px] translate-y-[0.12em] bg-gold align-middle animate-pulse" />
      </span>
    </p>
  )
}
