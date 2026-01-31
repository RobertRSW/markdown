import { useState, useEffect, useCallback } from 'react'

interface RegisterSWOptions {
  immediate?: boolean
  onNeedRefresh?: () => void
  onOfflineReady?: () => void
  onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void
  onRegisterError?: (error: Error) => void
}

export function usePWAUpdate() {
  const [needRefresh, setNeedRefresh] = useState(false)
  const [offlineReady, setOfflineReady] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    // Dynamically import the virtual:pwa-register module
    import('virtual:pwa-register').then(({ registerSW }) => {
      const updateSW = registerSW({
        immediate: true,
        onNeedRefresh() {
          setNeedRefresh(true)
        },
        onOfflineReady() {
          setOfflineReady(true)
        },
        onRegistered(r: ServiceWorkerRegistration | undefined) {
          if (r) {
            setRegistration(r)
            // Check for updates every hour
            setInterval(() => {
              r.update()
            }, 60 * 60 * 1000)
          }
        },
        onRegisterError(error: Error) {
          console.error('SW registration error:', error)
        }
      } as RegisterSWOptions)

      // Store updateSW for later use
      ;(window as Window & { __updateSW?: () => Promise<void> }).__updateSW = updateSW
    }).catch(() => {
      // PWA module not available (dev mode without PWA plugin)
      console.log('PWA not available')
    })
  }, [])

  const updateServiceWorker = useCallback(() => {
    const updateSW = (window as Window & { __updateSW?: () => Promise<void> }).__updateSW
    if (updateSW) {
      updateSW()
    }
  }, [])

  const dismissUpdate = useCallback(() => {
    setNeedRefresh(false)
  }, [])

  const dismissOfflineReady = useCallback(() => {
    setOfflineReady(false)
  }, [])

  return {
    needRefresh,
    offlineReady,
    updateServiceWorker,
    dismissUpdate,
    dismissOfflineReady,
    registration
  }
}
