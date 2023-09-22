import { deferred } from 'https://deno.land/std@0.201.0/async/deferred.ts'
import {
  basename,
  dirname,
  extname,
  fromFileUrl,
  join,
  toFileUrl
} from 'https://deno.land/std@0.201.0/path/mod.ts'
import { type Output, type SerializeRequest } from './types.ts'

const decoder = new TextDecoder()
const encoder = new TextEncoder()

if (Deno.args.length !== 1) {
  console.error('Please provide the .html file you want to ssr as the only arg')
  Deno.exit(1)
}

const [originalFilePathArg] = Deno.args
const originalFileURL = new URL(originalFilePathArg, import.meta.url)

const originalHTML = decoder.decode(await Deno.readFile(originalFileURL))
const done = deferred<void>()
const req: SerializeRequest = { page: originalHTML }
const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })
const buffer: string[] = []

worker.onmessage = e => {
  const data = e.data as Output

  if (data.isComplete) {
    worker.terminate()
    done.resolve()
  } else {
    buffer.push(data.string)
  }
}

worker.postMessage(req)
await done

const originalFileName = basename(fromFileUrl(originalFileURL))
const originalFileExt = extname(originalFileName)

const originalPrefix = originalFileName.substring(
  0,
  originalFileName.length - originalFileExt.length
)

const serializedFileName = originalPrefix + '.serialized' + originalFileExt

const serializedFileURL = toFileUrl(
  join(dirname(fromFileUrl(originalFileURL)), serializedFileName)
)

await Deno.writeFile(serializedFileURL, encoder.encode(buffer.join('')))

console.log('- - -')
console.log(buffer.join(''))
