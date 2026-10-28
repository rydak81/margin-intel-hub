/** IndexNow key rules: 8 to 128 characters, letters, digits and dashes only. */
export function validIndexNowKey(key: string | undefined | null): key is string {
  return typeof key === 'string' && /^[A-Za-z0-9-]{8,128}$/.test(key)
}
