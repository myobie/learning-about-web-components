/// <reference lib="webworker" />
import { parseHTML } from 'https://esm.sh/linkedom@0.15.3/worker'
import { serialize } from './serializer.js'

// SEE: https://github.com/thepassle/custom-elements-ssr/blob/master/server-shim.js

const {
  window,
  document,
  customElements,
  HTMLElement
} = parseHTML(`<!doctype html>
              <html>
                <head><title>Blank</title>
                <body>
                  <image-grid aria-live="polite" role="region" aria-label="Image grid">
                    <p>This is in the source light dom and won't ever show up becuase the slot assignment mode is manual.</p>
                  </image-grid>
                </body>
              </html>`)

globalThis.window = window

// @ts-ignore let's do this
globalThis.document = document
// @ts-ignore let's do this
globalThis.customElements = customElements
// @ts-ignore let's do this
globalThis.HTMLElement = HTMLElement

customElements.define.bind(customElements)

const { ImageGrid } = await import('./image-grid.js')

ImageGrid.define(customElements, document.body)

const gridInDOM = document.querySelector('image-grid')
// gridInDOM.recordIds = [1, 2, 3, 4, 5, 6]

const grid = document.createElement('image-grid')
grid.setAttribute('aria-live', 'polite')
grid.setAttribute('role', 'region')
grid.setAttribute('aria-label', 'Image grid')

console.log('- - -')
console.log(serialize(document.body))
console.log('- - -')
console.log(serialize(grid))
console.log('- - -')
