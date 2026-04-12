import * as $rdf from 'rdflib'
import * as panes from 'solid-panes'
import { authn, solidLogicSingleton, authSession, store } from 'solid-logic'
import { layout } from './layout'
import { theme } from './theme'
import type { RenderEnvironment } from 'pane-registry'
import versionInfo from './versionInfo'
import './styles/mash.css'

layout.init()
theme.init()

const global: any = window

// Build a snapshot of the current render environment
const buildRenderEnvironment = (): RenderEnvironment => ({
  layout: layout.get(),
  layoutPreference: layout.getPreference(),
  inputMode: layout.getInputMode(),
  theme: theme.get(),
  viewport: layout.getViewport()
})

// Inject or update the environment on the pane context
const syncEnvironmentToContext = (_trigger?: Event | string) => {
  const outliner = panes.getOutliner(document) as any

  if (!outliner) {
    return
  }

  if (!outliner.context) {
    outliner.context = {}
  }

  outliner.context.environment = buildRenderEnvironment()
}

// Keep environment in sync on layout/theme changes
window.addEventListener('mashlib:layoutchange', syncEnvironmentToContext)
window.addEventListener('mashlib:themechange', syncEnvironmentToContext)

global.$rdf = $rdf
global.panes = panes
global.SolidLogic = {
  authn,
  authSession, 
  store,
  solidLogicSingleton
}
global.mashlib = { versionInfo }

global.panes.runDataBrowser = function (uri?:string|$rdf.NamedNode|null) {
  // Set up cross-site proxy
  const fetcher: any = $rdf.Fetcher
  fetcher.crossSiteProxyTemplate = window.origin + '/xss/?uri={uri}'

  // Add web monetization tag to page header
  try {
    const webMonetizationTag: HTMLElement = document.createElement('meta')
    webMonetizationTag.setAttribute('name', 'monetization')
    webMonetizationTag.setAttribute('content', `$${window.location.host}`)
    document.head.appendChild(webMonetizationTag)
  } catch {}

  window.addEventListener('load', syncEnvironmentToContext)

  // Authenticate the user
  authn.checkUser()
    .then(() => panes.initMainPage(solidLogicSingleton.store, uri))
    .then(() => {
      // Inject render environment into pane context after outliner exists
      syncEnvironmentToContext('initMainPage')
      
    })
    .catch(() => undefined)

}

window.onpopstate = function (_event: any) {
  global.document.outline.GotoSubject(
    $rdf.sym(window.document.location.href),
    true,
    undefined,
    true,
    undefined
  )
}

export {
  versionInfo,
  buildRenderEnvironment
}
