import {
  basename,
  dirname,
  extname,
  fromFileUrl,
  join,
  toFileUrl
} from 'https://deno.land/std@0.201.0/path/mod.ts'
import { serializeWithWorker } from './client.ts'

const decoder = new TextDecoder()
const encoder = new TextEncoder()

if (Deno.args.length !== 1) {
  console.error('Please provide the .html file you want to ssr as the only arg')
  Deno.exit(1)
}

const [originalFilePathArg] = Deno.args
const originalFileURL = new URL(originalFilePathArg, import.meta.url)

const originalHTML = decoder.decode(await Deno.readFile(originalFileURL))
const serializedHTML = await serializeWithWorker(originalHTML)

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

await Deno.writeFile(serializedFileURL, encoder.encode(serializedHTML))
