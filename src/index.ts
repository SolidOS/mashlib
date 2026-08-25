// IMPORTANT: must be the first import so window.SolidLogic / window.$rdf are
// defined before solid-ui / solid-panes prebuilt bundles are evaluated
// (they declare `solid-logic` and `rdflib` as UMD externals with
// root: "SolidLogic" / "$rdf").
import './globals'

import * as $rdf from 'rdflib'
import * as SolidLogic from 'solid-logic'
import type { RenderEnvironment } from 'pane-registry'
import'solid-ui/components/header'
import * as panes from 'solid-panes'
import { layout } from './layout'
import { theme } from './theme'
import versionInfo from './versionInfo'
import './styles/mash.css'

const global: any = window
global.panes = panes
global.mashlib = { versionInfo }

layout.init()
theme.init()

// Build a snapshot of the current render environment
const buildRenderEnvironment = (): RenderEnvironment => ({
  layout: layout.get(),
  layoutPreference: layout.getPreference(),
  inputMode: layout.getInputMode(),
  theme: theme.get(),
  viewport: layout.getViewport()
})

// Set once the authenticated initial render (initMainPage) has started, so
// the window 'load' environment sync cannot trigger a subject fetch / UI
// refresh before the auth session is active (SolidOS/solid-logic#324).
// Layout/theme events arriving after initMainPage still refresh normally.
let initialRenderStarted = false

// Inject or update the environment on the pane context
const syncEnvironmentToContext = async (_trigger?: Event | string) => {
  const outliner = panes.getOutliner(document) as any

  if (!outliner) {
    return
  }

  if (!outliner.context) {
    outliner.context = {}
  }

  panes.updateEnvironment(outliner, buildRenderEnvironment())
  if (initialRenderStarted) {
    await panes.refreshUI(outliner)
  }
}

// Keep environment in sync on layout/theme changes
window.addEventListener('mashlib:layoutchange', syncEnvironmentToContext)
window.addEventListener('mashlib:themechange', syncEnvironmentToContext)

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

  // Render the page after authentication has settled (success or failure).
  // Rendering is gated behind checkUser so no resource is fetched before the
  // auth session is ready — on a private container an early unauthenticated
  // fetch 401s and leaves the pane stuck on a login/error state even after
  // the session restores (SolidOS/solid-logic#324). If restoring the session
  // fails, we still render logged-out so the login UI is usable instead of a
  // blank shell.
  const initMainPage = () => panes.initMainPage(
    SolidLogic.solidLogicSingleton.store,
    uri,
    buildRenderEnvironment()
  )

  SolidLogic.authn.checkUser()
    .then(initMainPage)
    .catch(initMainPage)
    .then(() => {
      // Allow environment-sync driven refreshes only once the initial
      // render is about to start.
      initialRenderStarted = true
      syncEnvironmentToContext('initMainPage')
    })

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
}
