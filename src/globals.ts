// AI generated as a solution to cannot find SolidLogic 
// Must be imported BEFORE solid-ui / solid-panes.
// Their prebuilt bundles treat `solid-logic` (and `rdflib`) as UMD externals
// with `root: "SolidLogic"` / `root: "$rdf"`, so the globals must exist on
// `window` at module-evaluation time, not after all imports have run.
import * as $rdf from 'rdflib'
import * as SolidLogic from 'solid-logic'

const w: any = window
w.$rdf = $rdf
w.SolidLogic = SolidLogic
