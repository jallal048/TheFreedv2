import { useEffect, useRef, useState, useCallback } from 'react'

interface UseIntersectionObserverOptions {
  root?: Element | null
  rootMargin?: string
  threshold?: number | number[]
  freezeOnceVisible?: boolean
  onIntersect?: (entry: IntersectionObserverEntry) => void
}

export const useIntersectionObserver = ({
  root = null,
  rootMargin = '0px',
  threshold = 0,
  freezeOnceVisible = false,
  onIntersect
}: UseIntersectionObserverOptions = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasBeenVisible, setHasBeenVisible] = useState(false)
  const targetRef = useRef<HTMLElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  const reset = useCallback(() => {
    setIsIntersecting(false)
    setHasBeenVisible(false)
  }, [])

  useEffect(() => {
    const target = targetRef.current
    if (!target) return

    // Cleanup previous observer
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        const isElementIntersecting = entry.isIntersecting
        
        setIsIntersecting(isElementIntersecting)
        
        if (isElementIntersecting && !hasBeenVisible) {
          setHasBeenVisible(true)
          onIntersect?.(entry)
        }

        // Freeze once visible if requested
        if (freezeOnceVisible && hasBeenVisible && observerRef.current) {
          observerRef.current.disconnect()
        }
      },
      {
        root,
        rootMargin,
        threshold,
      }
    )

    observerRef.current.observe(target)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [root, rootMargin, threshold, freezeOnceVisible, onIntersect, hasBeenVisible])

  return {
    ref: targetRef,
    isIntersecting,
    hasBeenVisible,
    reset,
  }
}

export default useIntersectionObserver