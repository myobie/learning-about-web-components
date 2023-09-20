export type SerializeRequest = {
  body: string
  importPaths: string[]
}

export type Output = {
  string: string
  isComplete: false
} | {
  isComplete: true
}
