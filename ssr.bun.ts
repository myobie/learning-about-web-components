import { basename, dirname, extname, join } from 'node:path'
import { serializeWithWorker } from './client.ts'

// I don't like this being at index 2 🤔
const originalFilePath = process.argv[2]
const originalFileURL = new URL(originalFilePath, import.meta.url)
const originalHTML = await Bun.file(originalFileURL).text()
const serializedHTML = await serializeWithWorker(originalHTML)
const originalFileName = basename(Bun.fileURLToPath(originalFileURL))
const originalFileExt = extname(originalFileName)

const originalPrefix = originalFileName.substring(
  0,
  originalFileName.length - originalFileExt.length
)

const serializedFileName = originalPrefix + '.serialized' + originalFileExt

const serializedFileURL = Bun.pathToFileURL(
  join(dirname(Bun.fileURLToPath(originalFileURL)), serializedFileName)
)

await Bun.write(serializedFileURL, serializedHTML)
