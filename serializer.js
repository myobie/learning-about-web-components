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

// TODO: async generator that somehow knows when and how to give custom
// elements enough time to fully setup

// generator function to support streaming responses
export function* serializer(node, opts = {}) {
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

  // This is very naive
  const attributesArray = Array.from(attributes.entries()).map(([k, v]) => `${k}="${v}"`)
  const attributesString = attributesArray.length > 0 ? ` ${attributesArray.join(' ')}` : ''

  // yield this node's tag name + attributes
  // This probably only works for simple HTML5 and I'm OK with that for now
  yield `<${tagName}${attributesString}>`

  function* serializeChildrenOfNode(parent) {
    // find it's first child
    let child = parent.firstChild

    // serialize each of the children one after the other
    while (child) {
      yield* serializeChild(child)
      child = child.nextSibling
    }
  }

  function* serializeAssignedNodesOfSlot(slot) {
    for (const child of slot.assignedNodes()) {
      yield* serializeChild(child)
    }
  }

  function* serializeChild(child) {
    if (child.nodeType === 1) {
      yield* serializer(child, closedRootsMap)
    } else if (child.nodeType === 3) {
      yield child.nodeValue
    } else {
      throw new Error(`Don't support node type ${child.nodeType} yet`)
    }
  }

  // Does this node have a shadow root or is a closed root we want to serailize
  // down through?
  const shadow = node.shadowRoot || closedRootsMap.get(node)

  if (shadow) {
    // There is a complex scenario where the slot assignment is manual. We
    // can't express that declaratively today. So to approximate the current
    // dom, we must only serialize what is currently slotted out as the light
    // dom, which might be a subset of the actual light dom.

    // yield the light dom elements before the shadow root's template
    if (shadow.slotAssignment === 'manual') {
      // Only yield the slotted light dom elements
      for (const slot of shadow.querySelectorAll('slot')) {
        yield* serializeAssignedNodesOfSlot(slot)
      }
    } else {
      // yeild everything in the light dom
      yield* serializeChildrenOfNode(node)
    }

    // yield everything currently inside the shadow root inside a declarative shadow root template
    yield `<template shadowrootmode="${shadow.mode}">\n`
    yield* serializeChildrenOfNode(shadow)
    yield `</template>\n`
  } else {
    // else just serialize the node without a template
    yield* serializeChildrenOfNode(node)
  }

  // html5!
  if (!(voidElementNames.includes(tagName))) {
    yield `</${tagName}>`
  }
}

export function serialize(node) {
  return Array.from(serializer(node)).join('')
}

window.serializer = serializer
window.serialize = serialize
