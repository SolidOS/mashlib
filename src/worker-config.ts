// Configure solid-logic worker URL before solid-logic module initialization.
// Consumers can still override this by defining __SOLID_LOGIC_WORKER_URL__ earlier.
declare global {
  interface Window {
    __SOLID_LOGIC_WORKER_URL__?: string | URL
  }
}

if (typeof window !== 'undefined' && !window.__SOLID_LOGIC_WORKER_URL__) {
  window.__SOLID_LOGIC_WORKER_URL__ = new URL('./RefreshWorker.js', window.location.href).toString()
}

export {}
