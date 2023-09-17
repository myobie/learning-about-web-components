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

  static define() {
    customElements.define('image-grid', this)
  }

  #recordIds = []
  #internals = null

  constructor() {
    super()
    this.#internals = this.attachInternals()

    // Hydrating this element is complex because we want manual slot
    // assignment, but that cannot be expressed declarativly yet. We also
    // cannot remove a shadowRoot from an element, so we completely start
    // over and replace this element. To do this replacement in the least
    // disruptive way, we move all the current light dom and shadow dom
    // elements over to a new element with the correct slotAssignment of
    // manual.

    if (this.#internals.shadowRoot) {
      if (this.#internals.shadowRoot.slotAssignment !== 'manual') {
        requestAnimationFrame(() => {
          // cannot make another ImageGrid when the first ImageGrid hasn't finished it's constructor()
          const upgradeGrid = document.createElement('image-grid')
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
      this.attachShadow({ mode: 'open', slotAssignment: 'manual' })
      this.#internals.shadowRoot.append(this.constructor.template.cloneNode())
    }
  }

  connectedCallback() {
    const slot = this.#internals.shadowRoot.querySelector('slot')
    const currentNodes = Array.from(slot.assignedNodes())

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

    const slot = this.#internals.shadowRoot.querySelector('slot')
    const currentNodes = Array.from(slot.assignedNodes())
    const newNodes = []

    for (const recordId of this.#recordIds) {
      const currentNode = currentNodes.find(n => n.recordId === recordId)

      if (currentNode) {
        newNodes.push(currentNode)
      } else {
        const newNode = document.createElement('image-cell')
        newNode.recordId = recordId
        this.append(newNode) // can only slot elements that are in the shadowRoot's host node
        newNodes.push(newNode)
      }
    }

    // should probably cleanup old images that aren't visible anymore for the filtering use case

    slot.assign(...newNodes)
  }

  get recordIds() {
    return Array.from(this.#recordIds)
  }

  set recordIds(newImageIds) {
    this.#recordIds = Array.from(newImageIds)
    this.updateTemplate()
  }
}
