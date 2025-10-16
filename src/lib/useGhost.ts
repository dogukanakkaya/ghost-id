import { useRef, useEffect } from 'react';
import { ghostRegistry } from './GhostRegistry';

/**
 * Infer component name from stack trace (development only)
 */
function inferComponentName(): string {
  try {
    const error = new Error();
    const stack = error.stack || '';
    const lines = stack.split('\n');

    // Look for the component name in the stack trace
    // Typically it appears after "at" or in the function name
    for (let i = 2; i < Math.min(lines.length, 10); i++) {
      const line = lines[i];

      // Match patterns like "at ComponentName" or "ComponentName@"
      const match = line.match(/at\s+([A-Z][a-zA-Z0-9]*)\s+/) ||
        line.match(/([A-Z][a-zA-Z0-9]*)@/);

      if (match && match[1]) {
        const name = match[1];
        // Filter out React internal names
        if (!name.startsWith('use') &&
          name !== 'Object' &&
          name !== 'Function' &&
          !name.includes('Fragment')) {
          return name;
        }
      }
    }
  } catch (e) {
    console.warn('Ghost: Failed to infer component name', e);
  }

  return 'Unknown';
}

/**
 * useGhost Hook
 * Generates a stable, deterministic ghost ID for a component
 * 
 * @param alias - Optional alias for multiple instances in the same component
 * @returns The ghost ID string (empty in production)
 * 
 * @example
 * ```tsx
 * function LoginButton() {
 *   const ghostId = useGhost();
 *   return <button data-gh={ghostId}>Login</button>;
 * }
 * 
 * function LoginForm() {
 *   const submitGhostId = useGhost('submit');
 *   const cancelGhostId = useGhost('cancel');
 *   return (
 *     <form>
 *       <button data-gh={submitGhostId}>Submit</button>
 *       <button data-gh={cancelGhostId}>Cancel</button>
 *     </form>
 *   );
 * }
 * ```
 */
export function useGhost(alias?: string): string {
  const ghostIdRef = useRef<string | null>(null);
  const componentNameRef = useRef<string | null>(null);

  // Initialize ghost ID once
  if (ghostIdRef.current === null) {
    // Infer component name from stack trace
    const componentName = inferComponentName();
    componentNameRef.current = componentName;

    // Generate or retrieve ghost ID
    const ghostId = ghostRegistry.getOrCreate(componentName, alias);
    ghostIdRef.current = ghostId;
  }

  // Log registration in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && ghostIdRef.current) {
      console.log(
        `👻 Ghost registered: ${componentNameRef.current}${alias ? ` (${alias})` : ''} → ${ghostIdRef.current}`
      );
    }
  }, [alias]);

  return ghostIdRef.current || '';
}

/**
 * Hook to get all registered ghost IDs
 * Useful for debugging or displaying the registry
 */
export function useGhostRegistry(): Record<string, string> {
  return ghostRegistry.list();
}
