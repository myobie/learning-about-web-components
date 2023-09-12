export class HTMLImport extends HTMLElement {
  static {
    customElements.define('html-import', this)
  }

  static get observedAttributes() {
    return ['href']
  }

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }

  attributeChangedCallback(name, _oldValue, newValue) {
    if (name !== 'href') { return }
    this.#doFetch(newValue)
  }

  #clear() {
    while(this.firstChild) this.removeChild(this.lastChild)
    while(this.shadowRootfirstChild) this.removeChild(this.shadowRoot.lastChild)
  }

  #doFetch(href) {
    if (!href) {
      this.#clear()
      return
    }

    const parser = new DOMParser()

    // NOTE: doing a synchronous request for testing 🤔
    const request = new XMLHttpRequest()
    request.open("GET", href, false)
    request.send(null)

    const text = request.responseText
    const doc = parser.parseFromString(text, 'text/html')

    const template = document.createElement('template')
    template.innerHTML = doc.body.innerHTML

    const hrefNow = this.getAttribute('href')

    if (hrefNow === href) {
      this.#clear()
      this.shadowRoot.append(template)
      this.append(template.content.cloneNode(true))

      const runScripts = this.getAttribute('runscripts') !== null

      if (runScripts) {
        for (const el of doc.body.children) {
          if (el.tagName === 'SCRIPT') {
            const script = document.createElement('script')
            script.innerHTML = el.textContent
            if (el.src) { script.src = el.src }
            if (el.type) { script.type = el.type }
            this.append(script)
          }
        }
      }
    }
  }
}
