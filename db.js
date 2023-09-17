import { shuffle } from './shuffle.js'

// ☃️
export const db = Object.freeze([
  {
    id: 1,
    src: './one.jpg',
    width: '1000',
    height: '838',
    description: 'Photo of a building on a sunny day'
  },
  {
    id: 2,
    src: './two.jpg',
    width: '751',
    height: '1000',
    description: 'Photo of a building on a street on a sunny day'
  },
  {
    id: 3,
    src: './three.jpg',
    width: '1000',
    height: '751',
    description: 'Photo of a building on a street on a sunny day'
  },
  {
    id: 4,
    src: './four.jpg',
    width: '662',
    height: '1000',
    description: 'Photo through a hexagonal window into a tea room on a sunny day'
  },
  {
    id: 5,
    src: './five.jpg',
    width: '1000',
    height: '662',
    description: 'Photo of a lot of differently colored tulips'
  },
  {
    id: 6,
    src: './six.jpg',
    width: '1000',
    height: '662',
    description:
      'Photo of a street with two motorcycle riders just starting out, making a left turn'
  }
].map(i => Object.freeze(i)))

export async function simulatedSlowDBQuery() {
  await new Promise(res => setTimeout(res, 200))
  return shuffle(Array.from(db))
}
