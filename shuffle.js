// see https://blog.codinghorror.com/the-danger-of-naivete/
export function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = ~~(Math.random() * (i + 1)) // next
    ;[array[i], array[j]] = [array[j], array[i]] // swap
  }
  return array // return the array that was passed in for chaining
}
