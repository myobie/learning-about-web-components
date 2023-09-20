/// <reference lib="webworker" />

import { parseHTML } from 'https://esm.sh/linkedom@0.15.3/worker'
import { serializer } from './serializer.js'
import { type Output, type SerializeRequest } from './types.ts'

onmessage = e => {
  const data = e.data as SerializeRequest
  perform(data)
}

async function perform(req: SerializeRequest) {
  // SEE: https://github.com/thepassle/custom-elements-ssr/blob/master/server-shim.js

  const {
    window,
    document,
    customElements,
    HTMLElement
  } = parseHTML(`<!doctype html>
              <html>
                <head><title>Blank</title>
                ${req.body}
              </html>`)

  globalThis.window = window

  // @ts-ignore let's do this
  globalThis.document = document
  // @ts-ignore let's do this
  globalThis.customElements = customElements
  // @ts-ignore let's do this
  globalThis.HTMLElement = HTMLElement

  customElements.define.bind(customElements)
  document.body.setAttribute('data-ssr', '')

  for (const path of req.importPaths) {
    await import(path)
  }

  for (const string of serializer(document.body)) {
    const out: Output = { string, isComplete: false }
    postMessage(out)
  }

  const out: Output = { isComplete: true }
  postMessage(out)
}
