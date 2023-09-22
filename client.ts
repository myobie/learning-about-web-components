import { deferred } from './deferred.ts'
import { type Output, type SerializeRequest } from './types.ts'

export async function serializeWithWorker(originalHTML: string): Promise<string> {
  const done = deferred<void>()
  const req: SerializeRequest = { page: originalHTML }
  const url = new URL('./worker.ts', import.meta.url)
  const worker = new Worker(url, { type: 'module' })
  const buffer: string[] = []

  worker.onerror = e => {
    console.error('worker error', e)
  }

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

  return buffer.join('')
}
