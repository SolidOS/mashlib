# Solid-compatible data mashup library and Databrowser

[![NPM Package](https://img.shields.io/npm/v/mashlib.svg)](https://www.npmjs.com/package/mashlib)

The mashlib library (`mashlib.js`) is a solid-compatible code library of application-level functionality for the world of Solid. It compiles all of the following repositories into what we know as `mashlib.js`:
- [**solid-logic**](https://github.com/solidos/solid-logic) — core business logic of SolidOS
- [**pane-registry**](https://github.com/solidos/pane-registry) - an index to hold all loaded solid panes, whether statically or dynamically loaded
- [**solid-ui**](https://github.com/solidos/solid-ui) — User Interface widgets and utilities for Solid. Building blocks for solid-based apps
- [**solid-panes**](https://github.com/solidos/solid-panes) — a set of core solid-compatible panes based on solid-ui.

A colorful dependency tree can be seen [here](https://github.com/solidos/solidos/blob/main/documentation/solidos_dependencies.svg).

## Content of README
### Intro
- [Developing mashlib](#developing-mashlib)
- [Goals](#goals)
- [Typical uses](#typical-uses)

### Documentation

- [Solid-compatible data mashup library and Databrowser](#solid-compatible-data-mashup-library-and-databrowser)
  - [Content of README](#content-of-readme)
    - [Intro](#intro)
    - [Documentation](#documentation)
  - [Developing mashlib](#developing-mashlib)
  - [Goals](#goals)
  - [Typical uses](#typical-uses)
  - [Previous versions of this documentation](#previous-versions-of-this-documentation)
- [Documentation](#documentation-1)
  - [Different implementations](#different-implementations)
    - [SolidOS Databrowser Webapp](#solidos-databrowser-webapp)
    - [SolidOS Databrowser Frontend](#solidos-databrowser-frontend)
    - [SolidOS Data-Kitchen](#solidos-data-kitchen)
  - [Mashlib global variables and functions](#mashlib-global-variables-and-functions)
  - [Code changes due to moving authn from solid-ui to solid-logic](#code-changes-due-to-moving-authn-from-solid-ui-to-solid-logic)
    - [Solid-ui & Solid-logic related:](#solid-ui--solid-logic-related)
  - [The databrowser hack: upgrading your browser](#the-databrowser-hack-upgrading-your-browser)

## Developing mashlib

As part of the SolidOS stack, mashlib can be developed locally by setting up the SolidOS code. Read more about that on the [SolidOS Readme](https://github.com/solidos/solidos#-getting-started-with-the-solidos-code).

## Goals

The goals of mashlib overlap with the [SolidOS Goals](https://solidos.solidcommunity.net/Team/docs/SolidOSNorthStar.html).

## Typical uses

One major use of mashlib is as a "databrowser" for a personal data store.

Mashlib is used in SolidOS and contributes to:

- SolidOS Databrowser Frontend - a frontend for Solid Servers like <solidcommunity.net>
- SolidOS Data-Kitchen - a stand-alone desktop app: <https://github.com/solidos/data-kitchen>

mashlib is also used stand-alone as the SolidOS Databrowser Webapp and can be tried out at <https://solidos.github.io/mashlib/dist/browse.html>.

mashlib is also used as a library by adding `mashlib.js` (or minified version) directly to your applications. For example:

`<script src="https://solidcommunity.net/mashlib.js"></script>`.

## Previous versions of this documentation

Check out [SolidOS Pod](https://solidos.solidcommunity.net/Team/docs/solidos.html) for an earlier version of this documentation.

# Documentation

## Different implementations

### SolidOS Databrowser Webapp

The `static/browse.html` page is compiled one to one into the `dist` (output) folder of mashlib and makes mashlib available stand-alone as the SolidOS Databrowser Webapp.

You can see and try out a SolidOS Databrowser Webapp deployment at <https://solidos.github.io/mashlib/dist/browse.html>.

`browse.html`serves as a perfect example for Solid WebID authentication and for making use of mashlib functions and variables.

To run/test locally we created a script `npm run start`.

### SolidOS Databrowser Frontend

The `src/databrowser.html`page is compiled into the SolidOS Databrowser Frontend which is displayed for each WebID on [solidcommunity.net](https://solidcommunity.net/). This is the case because the [solidcommunity.net](https://solidcommunity.net/) Solid Server is configured with SolidOS as its front-end.

More information about the SolidOS Front-end and how to use it visit the [User Guide](https://github.com/solidos/userguide).

### SolidOS Data-Kitchen

SolidOS Data-Kitchen uses `mashlib.js`as a direct import in its source code. Visit the code at [SolidOS Data-Kitchen GitHub](https://github.com/solidos/data-kitchen).

## Mashlib global variables and functions

If one wants to use mashlib as a direct import (as a package dependency or script import), one needs to know which global variables and functions are available.

The availability of these global variables depends on how the sub-modules are imported and exported and on where the variables are instantiated. For a basic theoretical read, please see [this resource](https://www.javatpoint.com/javascript-global-variable).

What does `global` mean in mashlib? We mean the `global object` which depends on different environments. In mashlib, for now, we use the `window` context which means these variables will not work if directly used in non-window contexts such as `Node.js` environments. (This does not mean you cannot use mashlib in `Node.js` environments; just import it through `npm`). At some point, we will switch this to the [`globalThis`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/globalThis).

These are the most important window context/global variables and the sub-repos from which they are exported:

- [**solid-logic**](https://github.com/solidos/solid-logic/blob/f606b31382a416ee6188930c3ca05cb4ae73cbda/src/index.ts#L29) exports among others: `SolidLogic`
- [**pane-registry**](https://github.com/solidos/pane-registry) is exported entirely through the pane-registry variable
- [**solid-ui**](https://github.com/solidos/solid-ui/blob/c5a8888d6cb61363bc0445be007e3c96de593338/src/index.ts#L79) exports among others: authn, store, rdf, dom under the `UI` variable
- [**solid-panes**](https://github.com/solidos/solid-panes/blob/033f48f8987364cb131455b13e8b0637da95a5ab/src/index.ts#L53) exports getOutliner and the entire solid-ui through the `UI` variable, and solid-panes itself can be used through the `panes` variable

For backward compatibility reasons, there are now different ways to make use of the same variables from mashlib. For example:

- to make use of the UI (solid-ui) one can use `UI` BUT NOT `panes.UI` anymore
- authentication session, part of solid-logic, can be called as `SolidLogic.authSession` BUT NOT `UI.authn.authSession` nor `panes.UI.authn.authSession` anymore
- the store (from solid-logic) can be used as `SolidLogic.store` BUT NOT `UI.store` nor `panes.UI.store` anymore
- rdflib NOT entirely acessible as `UI.rdf` or `panes.UI.rdf` anymore but as `$rdf`
- the currentUser function is called as `SolidLogic.authn.currentUser()` BUT NOT `UI.auth.currentUser()` nor `panes.UI.authn.currentUser()` anymore

You can see example usage in the [SolidOS Databrowser Webapp code](https://github.com/solidos/mashlib/blob/main/static/browse.html#L11).

## Code changes due to moving authn from solid-ui to solid-logic

One function has been renamed and does not have a backwards-compatible fallback.  To make use of the login pop-up, one needs to call the `UI.login.loginStatusBox` function. The old `UI.authn.loginStatusBox` function will no longer work from v1.8.0 onwards.

Some packages have been moved and with them some functions too. Here we report on these changes:

### Solid-ui & Solid-logic related:

* There is no more `authn` as you might have known it in solid-ui pre mashlib version 1.7.18 (solid-ui 2.4.16).
* Some functions in solid-ui which initially were found under `solid-ui/authn` are now under `solid-ui/login`.
* Three functions were renamed:
    * logInLoadPreferences -> ensureLoadedPreferences 
    * logInLoadProfile -> ensureLoadedProfile
    * logIn -> ensureLoggedIn

Functions that moved: 

* `currentUser`, `checkUser`, `saveUser`, `offlineTestID` are now part of `solid-logic/authn/SolidAuthnLogic.ts`-> this is because `authn` itself moved to solid-logic. 
* `setACLUserPublic`, `fetchACLRel` are now part of `solid-logic/src/acl/aclLogic.ts/` and are exported in [index.ts](https://github.com/solidos/solid-logic/blob/f606b31382a416ee6188930c3ca05cb4ae73cbda/src/index.ts#L12).
* `loadIndex`, `loadTypeIndexes`, `ensureTypeIndexes`, `registerInTypeIndex` and are exported in [index.ts](https://github.com/solidos/solid-logic/blob/f606b31382a416ee6188930c3ca05cb4ae73cbda/src/index.ts#L16).

## The databrowser hack: upgrading your browser

This refers to a specific way in which the mashlib is deployed for users who at first only have a conventional web browser - a hypertext browser not a data browser.  It is a hack -- in the original computing sense of a crafty, though not beautiful, little thing which gets the job done.

How does the data browser work?

1. The user goes with a normal web browser to access some data object (like a to-do list).
1. The server sees the browser doesn't understand the data natively.
1. The server sends back a little placeholder HTML file, `databrowser.html`, instead of the data.
1. The `databrowser.html` file loads the `mashlib.js` Javascript library, which can now understand the data.
1. The `mashlib.js` then re-requests the original data, but accepting data formats.
1. The server supplies the actual data of the to-do list or whatever it was.
1. The `mashlib.js` code provides an editable visualization on the data.

The mashlib part of SolidOS Databrowser Frontend is *read-write;* that is, the user is allowed to edit data and create new things. It is *live,* in that often the databrowser subscribed (using a websocket) for any changes which other users make, so users' screens are synchronized.

A major limitation of this data browser hack is that current web browsers are made to distrust any code loaded from one domain that uses data from another domain. This makes it hard, strangely complicated, and sometimes impossible to do some things.

