import { simulatedSlowDBQuery } from './db.js'
import { wait } from './wait.js'

const isSSR = !!document.body.hasAttribute('data-ssr')

const workLoop = (delay) => ({
  [Symbol.asyncIterator]() {
    // our work is never done
    const neverDone = { done: false, value: undefined }
    let iteration = 0

    return {
      async next() {
        if (isSSR && iteration === 0) {
          // don't resort right after hydration
          await wait(delay)
        }

        const records = await simulatedSlowDBQuery()
        const grid = document.querySelector('image-grid')
        grid.recordIds = records.map(i => i.id)
        await wait(delay)
        iteration += 1
        return neverDone
      }
    }
  }
})

// see: https://developer.mozilla.org/en-US/docs/Glossary/Void_element
const voidElementNames = [
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr'
]

function *serializer (node, opts = {}) {
  const closedRoots = opts.closedRoots || []
  let closedRootsMap = new WeakMap()

  if (closedRoots instanceof WeakMap) {
    closedRootsMap = closedRoots
  } else {
    for (const root of closedRoots) {
      closedRootsMap.set(root.host, root)
    }
  }

  const tagName = node.tagName.toLowerCase()
  const attributes = new Map()

  if (node.hasAttributes()) {
    for (const attr of node.attributes) {
      attributes.set(attr.name, attr.value)
    }
  }

  const attributesArray = Array.from(attributes.entries()).map(([k,v]) => `${k}="${v}"`)
  const attributesString = attributesArray.length > 0 ? ` ${attributesArray.join(' ')}` : ''

  yield `<${tagName}${attributesString}>`

  function *serializeChildren(parent) {

    // find it's first child
    let child = parent.firstChild

    // serialize each of the children one after the other
    while (child) {
      if (child.nodeType === 1) {
        yield* serializer(child, closedRootsMap)
      } else if (child.nodeType === 3) {
        yield child.nodeValue
      } else {
        throw new Error(`Don't support node type ${child.nodeType} yet`)
      }

      child = child.nextSibling
    }
  }

  yield* serializeChildren(node)

  // serialize this node's shadow root in a declarative way if it has one
  const shadow = node.shadowRoot || closedRootsMap.get(node)

  if (shadow) {
    yield `<template shadowrootmode="${shadow.mode}">\n`
    yield* serializeChildren(shadow)
    yield `</template>\n`
  }

  if (!(voidElementNames.includes(tagName))) {
    yield `</${tagName}>`
  }
}

function serialize(node) {
  return Array.from(serializer(node)).join('')
}

window.serializer = serializer
window.serialize = serialize

for await (const _ of workLoop(10000)) { /* no op */ }
