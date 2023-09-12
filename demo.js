import { simulatedSlowDBQuery } from './db.js'
import './image-grid.js'
import './image-cell.js'
import './html-import.js'
import { wait } from './wait.js'

const grid = document.querySelector('image-grid')

const workLoop = (delay) => ({
  [Symbol.asyncIterator]() {
    // our work is never done
    const neverDone = { done: false, value: undefined }

    return {
      async next() {
        const records = await simulatedSlowDBQuery()
        grid.recordIds = records.map(i => i.id)
        await wait(delay)
        return neverDone
      }
    }
  }
})

for await (const _ of workLoop(10000)) { /* no op */ }
