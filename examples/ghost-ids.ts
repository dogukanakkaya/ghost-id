/**
 * Auto-generated Ghost IDs
 * Generated at: 2025-10-16T17:14:30.149Z
 * DO NOT EDIT MANUALLY
 */

// Ghost ID Registry
export const GHOST_IDS = {
  'LoginButton': 'gh-LoginButton-5608gm',
  'LoginForm': 'gh-LoginForm-dkbpz0',
  'LoginForm-username': 'gh-LoginForm-username-hoyq5h',
  'LoginForm-password': 'gh-LoginForm-password-z57gin',
  'LoginForm-submit': 'gh-LoginForm-submit-vu3jz3',
  'LoginForm-cancel': 'gh-LoginForm-cancel-71qcse',
} as const;

// Type-safe selectors
export type GhostKey = keyof typeof GHOST_IDS;

/**
 * Get a ghost selector by key
 * @param key - The component key
 * @returns CSS selector string
 */
export function getGhostSelector(key: GhostKey): string {
  return `[data-gh="${GHOST_IDS[key]}"]`;
}

/**
 * Get a partial ghost selector by key (recommended)
 * Uses a partial match on the ghost ID to be resilient against hash changes
 * @param key - The component key
 * @returns CSS selector string
 */
export function getGhostSelectorPartial(key: GhostKey): string {
  // Extract the base component and alias parts (everything except the hash)
  const parts = key.split('-');
  const searchString = parts.join('-'); // Use the full key without hash
  return `[data-gh^="gh-${searchString}-"]`;
}