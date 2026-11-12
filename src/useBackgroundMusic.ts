import { useEffect, useRef, useState } from 'react'
import { music } from './content'

export function useBackgroundMusic() {
  const audio = useRef<HTMLAudioElement>(null)
  const frame = useRef(0)
  const request = useRef(0)
  const [requested, setRequested] = useState(false)
  const [playing, setPlaying] = useState(false)

  useEffect(() => () => {
    request.current++
    cancelAnimationFrame(frame.current)
    audio.current?.pause()
  }, [])

  function play() {
    const element = audio.current
    if (!element) return
    setRequested(true)
    const current = ++request.current
    cancelAnimationFrame(frame.current)
    element.volume = 0
    // Start synchronously from the candle/button click, preserving user activation.
    void element.play().then(() => {
      if (current !== request.current || element.paused) return
      const started = performance.now()
      const target = Math.max(0, Math.min(1, music.volume))
      const fade = (now: number) => {
        if (current !== request.current || element.paused) return
        const progress = music.fadeInMs > 0 ? Math.min(1, (now - started) / music.fadeInMs) : 1
        element.volume = target * progress * progress * (3 - 2 * progress)
        if (progress < 1) frame.current = requestAnimationFrame(fade)
      }
      frame.current = requestAnimationFrame(fade)
    }).catch(() => {
      // The persistent play control permits retry if media loading was interrupted.
      if (current === request.current) setPlaying(false)
    })
  }

  function toggle() {
    const element = audio.current
    if (!element) return
    if (element.paused) play()
    else {
      request.current++
      cancelAnimationFrame(frame.current)
      element.pause()
    }
  }

  return { audio, requested, playing, setPlaying, play, toggle }
}
