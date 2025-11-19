import * as $rdf from 'rdflib'
import * as panes from 'solid-panes'
import { authn, solidLogicSingleton, authSession, store } from 'solid-logic'
import versionInfo from './versionInfo'
import { mashStyle } from './styles/mashlib-style'
import './styles/mash.css'

const global: any = window

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
