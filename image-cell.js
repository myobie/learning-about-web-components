import { db } from './db.js'

export class ImageCell extends HTMLElement {
  static {
    customElements.define('image-cell', this)
  }

  #recordId = null
  #lastRenderedRecordId = null

  static get observedAttributes() {
    return ['record-id']
  }

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }

  connectedCallback() {
    this.#parseRecordId()
    this.updateTemplate()
  }

  disconnectedCallback() {
    console.debug(`unmounted image-cell for recordId ${this.#recordId}`)
  }

  attributeChangedCallback(name, _oldValue, newValue) {
    if (name !== 'record-id') { return }
    if (newValue === String(this.#recordId)) { return }

    this.#parseRecordId()
    this.updateTemplate()
  }

  #parseRecordId() {
    const stringId = this.getAttribute('record-id')

    if (stringId) {
      const integerId = parseInt(stringId)
      if (isNaN(integerId)) { return }
      this.#recordId = integerId
    }
  }

  updateTemplate() {
    // “query” for the record
    const record = this.#recordId && db.find(r => r.id == this.#recordId)

    // only update if it’s a different recordId
    if (record?.id !== this.#lastRenderedRecordId) {
      this.shadowRoot.replaceChildren() // clear

      if (record) {
        // we will only ever see this log once, since we don't update these
        // image-cells, we re-use the existing nodes and reorder them inside
        // the slot in image-grid
        console.debug(`rendering image-cell for image ${record.id}`)

        const template = document.querySelector('template[data-name="image-cell"]')
        this.shadowRoot.append(template.content.cloneNode(true))

        const img = this.shadowRoot.querySelector('img')
        const pName = this.shadowRoot.querySelector('p.name')

        img.alt = record.description
        img.src = record.src
        img.width = record.width
        img.height = record.height

        const nameParts = record.src.split('/')
        pName.innerText = nameParts.at(-1)
      }
    }

    this.#lastRenderedRecordId = record?.id
  }

  get recordId() {
    return this.#recordId
  }

  set recordId(newRecordId) {
    if (this.#recordId !== newRecordId) {
      this.#recordId = newRecordId
      this.setAttribute('record-id', String(this.#recordId))
      this.updateTemplate()
    }
  }
}
