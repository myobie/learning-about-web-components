/// <reference lib="webworker" />

import { parseHTML } from 'linkedom'
import { serializer } from './serializer.js'
import { type Output, type SerializeRequest } from './types.ts'

onmessage = e => {
  const data = e.data as SerializeRequest
  perform(data)
}

function wrapElement(markup: string): string {
  return `<!doctype html>
          <html>
            <head><title>Blank</title>
            <body>
              ${markup}
            </body>
          </html>`
}

async function perform(req: SerializeRequest) {
  // SEE: https://github.com/thepassle/custom-elements-ssr/blob/master/server-shim.js

  let markup = ''
  let isElement = false

  if ('page' in req) {
    markup = req.page
  } else {
    isElement = true
    markup = wrapElement(req.element)
  }

  const {
    window,
    document,
    customElements,
    HTMLElement
  } = parseHTML(markup)

  globalThis.window = window

  // @ts-ignore let's do this
  globalThis.document = document
  // @ts-ignore let's do this
  globalThis.customElements = customElements
  // @ts-ignore let's do this
  globalThis.HTMLElement = HTMLElement

  customElements.define.bind(customElements)

  const ssrScripts = Array.from(document.querySelectorAll('script[data-ssr]'))
  const importPaths = ssrScripts.map(s => (s as HTMLScriptElement).src)

  for (const path of importPaths) {
    await import(path)
  }

  document.body.setAttribute('data-ssr', '')

  let outputNode = document.documentElement

  if (isElement) {
    outputNode = document.body.firstElementChild
  } else {
    push({ string: '<!DOCTYPE html>\n', isComplete: false })
  }

  for (const string of serializer(outputNode)) {
    push({ string, isComplete: false })
  }

  push({ isComplete: true })
}

function push(out: Output): void {
  postMessage(out)
}
