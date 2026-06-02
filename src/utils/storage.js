/**
 * Returns a user-scoped localStorage key if a user ID is provided,
 * otherwise falls back to the base key.
 * 
 * @param {string} baseKey - The base storage key
 * @param {string} [uid] - The authenticated user's unique ID
 * @returns {string} The scoped or base storage key
 */
export function getStorageKey(baseKey, uid) {
  if (!uid) return baseKey;
  return `${baseKey}_${uid}`;
}
