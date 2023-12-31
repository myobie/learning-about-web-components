import { html } from './template.js'

export class ImageGrid extends HTMLElement {
  static template = html`
    <style>
      :host {
        box-sizing: border-box;
        display: grid;
        gap: 16px;
        grid-template-columns: 1fr 1fr;
        margin: 0 auto;
        max-width: 600px;
        padding: 20px;
      }
    </style>
    <slot></slot>
  `

  static reg = customElements.define('image-grid', this)

  #recordIds = []
  #internals = null
  #shadowRoot = null
  #canAssign = false

  constructor() {
    super()

    if ('attachInternals' in this) {
      this.#internals = this.attachInternals()
      this.#shadowRoot = this.#internals.shadowRoot
    }

    // Hydrating this element is complex because we want manual slot
    // assignment, but that cannot be expressed declarativly yet. We also
    // cannot remove a shadowRoot from an element, so we completely start
    // over and replace this element. To do this replacement in the least
    // disruptive way, we move all the current light dom and shadow dom
    // elements over to a new element with the correct slotAssignment of
    // manual.

    if (this.#shadowRoot) {
      if (this.#shadowRoot.slotAssignment !== 'manual') {
        requestAnimationFrame(() => {
          // cannot make another ImageGrid when the first ImageGrid hasn't finished it's constructor()
          const upgradeGrid = this.getRootNode().createElement('image-grid')
          const nodesToAssign = []

          while (this.firstElementChild) {
            const el = this.firstElementChild
            upgradeGrid.appendChild(el)
            nodesToAssign.push(el)
          }

          const slot = upgradeGrid.shadowRoot.querySelector('slot')
          slot.assign(...nodesToAssign)
          this.replaceWith(upgradeGrid)
        })
      }
    } else {
      this.#shadowRoot = this.attachShadow({ mode: 'open', slotAssignment: 'manual' })
      this.#shadowRoot.append(this.constructor.template.cloneNode())
    }
  }

  connectedCallback() {
    const slot = this.#shadowRoot.querySelector('slot')
    this.#canAssign = 'assignedNodes' in slot && this.#shadowRoot.slotAssignment === 'manual'

    let currentNodes = []

    if (this.#canAssign) {
      currentNodes = slot.assignedNodes()
    }

    // If we don't have recordIds but we do have slotted nodes, then let
    // the order of those nodes be our recordIds
    if (currentNodes.length > 0 && this.#recordIds.length === 0) {
      this.#recordIds = currentNodes.map(n => n.recordId)
    } else {
      this.updateTemplate()
    }
  }

  updateTemplate() {
    if (this.#recordIds.length === 0) {
      // still waiting on the first db query
      return
    }

    const slot = this.#shadowRoot.querySelector('slot')

    let currentNodes = []

    if (this.#canAssign) {
      currentNodes = Array.from(slot.assignedNodes())
    } else {
      currentNodes = Array.from(this.children)
    }

    const newNodes = []

    for (const recordId of this.#recordIds) {
      const currentNode = currentNodes.find(n => n.recordId === recordId)

      if (currentNode) {
        newNodes.push(currentNode)
      } else {
        const newNode = this.getRootNode().createElement('image-cell')
        newNode.recordId = recordId
        this.append(newNode) // can only slot elements that are in the shadowRoot's host node
        newNodes.push(newNode)
      }
    }

    // should probably cleanup old images that aren't visible anymore for the filtering use case

    if (this.#canAssign) {
      slot.assign(...newNodes)
    } else {
      while (this.firstElementChild) {
        this.removeChild(this.firstElementChild)
      }

      for (const node of newNodes) {
        this.append(node)
      }
    }
  }

  get recordIds() {
    return Array.from(this.#recordIds)
  }

  set recordIds(newImageIds) {
    this.#recordIds = Array.from(newImageIds)
    this.updateTemplate()
  }
}
