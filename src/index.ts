import * as $rdf from 'rdflib'
import * as panes from 'solid-panes'
import { authn, solidLogicSingleton, authSession, store } from 'solid-logic'
import versionInfo from './versionInfo'
import { mashStyle } from './styles/mashlib-style'
import './styles/mash.css'
import * as UI from 'solid-ui'

const global: any = window

// Make UI available globally for solid-ui header theme selector
global.UI = UI

// Auto-detect and set base path for theme loading
if (!global.solid) global.solid = {}
// Find mashlib script tag to determine base path for shared themes
const scripts = Array.from(document.getElementsByTagName('script'))
for (const script of scripts) {
  if (script.src && script.src.includes('mashlib')) {
    global.solid.basePath = script.src.substring(0, script.src.lastIndexOf('/') + 1)
    // eslint-disable-next-line no-console
    console.log('🎨 Theme basePath set from mashlib script:', global.solid.basePath)
    break
  }
}
// Fallback to current location if mashlib script not found
if (!global.solid.basePath) {
  const pathname = window.location.pathname
  const basePath = pathname.endsWith('/') ? pathname : pathname.substring(0, pathname.lastIndexOf('/') + 1)
  global.solid.basePath = window.location.origin + basePath
  // eslint-disable-next-line no-console
  console.log('🎨 Theme basePath set from current location (fallback):', global.solid.basePath)
}

// Initialize theme system now that basePath is set
const themeLoader = (UI as any).themeLoader
if (themeLoader && typeof themeLoader.init === 'function') {
  // eslint-disable-next-line no-console
  console.log('🎨 Initializing themeLoader with basePath:', global.solid.basePath)
  themeLoader.init().catch((err: Error) => {
    // eslint-disable-next-line no-console
    console.error('Theme loader init failed:', err)
  })
}

global.$rdf = $rdf
global.panes = panes
global.SolidLogic = {
  authn,
  authSession, 
  store,
  solidLogicSingleton
}
global.mashlib = {
  versionInfo
}

global.panes.runDataBrowser = function (uri?:string|$rdf.NamedNode|null) {
  console.log('🚀 runDataBrowser called', { uri })
  
  document.getElementById('PageBody')?.setAttribute('style', mashStyle.dbLayout)
  document.getElementById('PageHeader')?.setAttribute('style', mashStyle.dbLayoutHeader)
  document.getElementById('PageFooter')?.setAttribute('style', mashStyle.dbLayoutFooter)
  document.getElementById('DummyUUID')?.setAttribute('style', mashStyle.dbLayoutContent)

  // Set up cross-site proxy
  const fetcher: any = $rdf.Fetcher
  fetcher.crossSiteProxyTemplate = window.origin + '/xss/?uri={uri}'

  // Add web monetization tag to page header
  try {
    const webMonetizationTag: HTMLElement = document.createElement('meta')
    webMonetizationTag.setAttribute('name', 'monetization')
    webMonetizationTag.setAttribute('content', `$${window.location.host}`)
    document.head.appendChild(webMonetizationTag)
  } catch (e) {
    console.error('Failed to add web monetization tag to page header')
  }

  // Authenticate the user
  authn.checkUser().then(function (_profile: any) {
    const mainPage = panes.initMainPage(solidLogicSingleton.store, uri)
    
    return mainPage
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

// It's not clear where this function is used, so unfortunately we cannot remove it:
function dump (msg: string[]) {
  console.log(msg.slice(0, -1))
}

global.dump = dump

export {
  versionInfo
}
