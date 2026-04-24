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
  await panes.refreshUI(outliner)
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

  // Authenticate the user
  SolidLogic.authn.checkUser()
    .then(() => panes.initMainPage(SolidLogic.solidLogicSingleton.store, uri))
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
}
