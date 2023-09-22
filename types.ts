export type SerializeRequest =
  | { page: string }
  | { element: string }

export type Output = {
  string: string
  isComplete: false
} | {
  isComplete: true
}
