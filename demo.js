import './serializer.js'
import { simulatedSlowDBQuery } from './db.js'
import './image-cell.js'
import './image-grid.js'
import { wait } from './wait.js'

async function boot() {
  // We test for the shadowRootMode property becuase Firefox doesn't support
  // declarative shadow dom yet, so we must act like all that SSR'ed stuff isn't
  // there with Firefox
  const isSSR = !!document.body.hasAttribute('data-ssr')
    && HTMLTemplateElement.prototype.hasOwnProperty('shadowRootMode')

  const workLoop = delay => ({
    [Symbol.asyncIterator]() {
      // our work is never done
      const neverDone = { done: false, value: undefined }
      let iteration = 0

      return {
        async next() {
          if (isSSR && iteration === 0) {
            // don't resort right after hydration
            await wait(delay)
          }

          const records = await simulatedSlowDBQuery()
          const grid = document.querySelector('image-grid')
          grid.recordIds = records.map(i => i.id)
          await wait(delay)
          iteration += 1
          return neverDone
        }
      }
    }
  })

  for await (const _ of workLoop(10000)) { /* no op */ }
}

if (self.Deno) {
  await import('./worker-data.ts')
} else {
  boot()
}
