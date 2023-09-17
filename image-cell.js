import { db } from './db.js'
import { createHTML } from './template.js'

export class ImageCell extends HTMLElement {
  static template = null

  static define(registry = customElements, body = document.body) {
    const html = createHTML(body.getRootNode())

    this.template = html`
      <style>
        :host {
          align-items: center;
          display: flex;
          flex-direction: column;
          height: 100%;
          justify-content: center;
          width: 100%;
        }

        img {
          max-width: 100%;
          width: auto;
          height: auto;
          object-fit: contain;
          overflow: hidden;
        }

        .name {
          display: block;
          min-height: min-content;
          text-align: center;
        }
      </style>

      <img>
      <p class="name"></p>
    `

    registry.define('image-cell', this)
  }

  #recordId = null
  #lastRenderedRecordId = null
  #internals = null

  static get observedAttributes() {
    return ['record-id']
  }

  constructor() {
    super()
    this.#internals = this.attachInternals()

    if (!this.#internals.shadowRoot) {
      this.attachShadow({ mode: 'open' })
    }
  }

  connectedCallback() {
    this.#parseRecordId()
    this.updateTemplate()
  }

  disconnectedCallback() {
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
      this.#internals.shadowRoot.replaceChildren() // clear

      if (record) {
        // we will only ever see this log once, since we don't update these
        // image-cells, we re-use the existing nodes and reorder them inside
        // the slot in image-grid
        console.debug(`rendering image-cell for image ${record.id}`)

        this.#internals.shadowRoot.append(this.constructor.template.cloneNode())

        const img = this.#internals.shadowRoot.querySelector('img')
        const pName = this.#internals.shadowRoot.querySelector('p.name')

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
