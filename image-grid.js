export class ImageGrid extends HTMLElement {
  static {
    customElements.define('image-grid', this)
  }

  #recordIds = []

  constructor() {
    super()
    this.attachShadow({ mode: 'open', slotAssignment: 'manual' })
  }

  connectedCallback() {
    const template = document.querySelector('template[data-name="image-grid"]')
    this.shadowRoot.append(template.content.cloneNode(true))
    this.updateTemplate()
  }

  updateTemplate() {
    const slot = this.shadowRoot.querySelector('slot')
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

    // should probably cleanup old images that aren't visible anymore

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
