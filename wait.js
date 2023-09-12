export async function wait(amount) {
  await new Promise(res => setTimeout(res, amount))
}
