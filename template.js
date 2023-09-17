export function parseTemplate(source) {
  const el = document.createElement('template')
  el.innerHTML = source

  return {
    source,
    cloneNode() {
      return el.content.cloneNode(true)
    }
  }
}

// These are here to try to get editors to highlight strings correctly 😔
export const html = (strings, ...values) => parseTemplate(String.raw({ raw: strings }, ...values))
export const css = (strings, ...values) => String.raw({ raw: strings }, ...values)
