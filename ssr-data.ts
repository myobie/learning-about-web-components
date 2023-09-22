/// <reference lib="dom" />

import { type ImageGrid } from './image-grid.js'

const grid = document.querySelector('image-grid') as ImageGrid | undefined

if (grid) {
  grid.recordIds = [1, 2, 3, 4, 5, 6]
}
