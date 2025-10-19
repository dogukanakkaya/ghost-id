# ghost-id

Ghost ID — tiny utility to attach deterministic, test-friendly "ghost" IDs to
components and export them for tests or automation.

## Installation

```bash
npm install ghost-id
```

## CLI Usage

The CLI can either read a JSON registry from stdin (piped) or run a static scan
against source files.

Usage:

```bash
# Show help
npx ghost-id --help

# Static scan a source tree and output JSON
npx ghost-id --scan "src/**/*.{ts,tsx}" --format json --output ./ghost-ids.json

# Generate TypeScript selectors
npx ghost-id --scan "src/**/*.{ts,tsx}" --format ts --output ./ghost-ids.ts

# Pipe a runtime registry JSON to the CLI to generate a TS file
cat runtime-ghost-registry.json | npx ghost-id --format ts --output ./ghost-ids.ts
```

Flags (from `src/cli/ghost-id.ts`):

- `-s, --scan <glob>` — run a static scan against file glob(s)
- `-f, --format <json|ts>` — output format (default: json)
- `-o, --output <path>` — output path (default: `ghost-ids.json` or
  `ghost-ids.ts`)
- `--no-pretty` — disable pretty printing for JSON

Notes:

- The static scan uses a best-effort AST pass to find `useGhost()` calls and
  will fall back to filename heuristics for component names.
- Static scan assumes components are declared with capitalized function/class
  names or `const Comp = () => {}` patterns.

## Example (React)

See `examples/vite-react/src/components/LoginForm.tsx` for a usage example:

```tsx
// root.tsx
import { GhostID } from "ghost-id";
import LoginForm from "./LoginForm";

function Root() {
    // Mount the registry in development only, if desired
    if (process.env.NODE_ENV === 'production') {
        return <LoginForm />;
    }

    return (
        <GhostID>
            <LoginForm />
        </GhostID>
    );
}

export default Root;

// LoginForm.tsx
import { useGhost } from "ghost-id";

export function LoginForm() {
    const ghostId = useGhost();
    const usernameInputGhost = useGhost("username");
    // ...
    return (
        <form data-gh={ghostId}>
            <input data-gh={usernameInputGhost} />
        </form>
    );
}
```

- `useGhost()` — hook that returns the component-level ghost id (or call with an
  alias `useGhost('username')` to get an alias id)
- `useGhostActions()` — helper to access export actions of registry
- `useGhostRegistry()` — access the raw registry instance (for debugging or
  advanced use)

Tip: Mount the provider conditionally in development/test environments so
production bundles don't include registry-only code if you want to avoid the
runtime overhead.

Run the static scan against the example project:

```bash
npx ghost-id --scan "examples/vite-react/src/**/*.{ts,tsx}" --format json --output examples/vite-react/ghost-ids.json
```

The CLI will generate keys in the form `Component` or `Component-alias` (for
aliased uses) with values like `gh-Component-alias-abc123`.

## Example (E2E / Playwright)

`examples/e2e` shows how exported IDs can be used inside tests. Typical flow:

1. Run your app (dev server).
2. Extract runtime registry in the browser console:

```js
// in browser console
copy(window.GhostID.json());
```

3. Save the JSON and pipe it into the CLI to generate TypeScript selectors:

```bash
pbpaste | npx ghost-id --format ts --output ./examples/e2e/ghost-ids.ts
```

4. Use the generated `ghost-ids.ts` in your Playwright tests for stable
   selectors:

```ts
import { getGhostSelector, GHOST_IDS } from "./ghost-ids";

await page.fill(getGhostSelector(GHOST_IDS["LoginForm-username"]), "alice");
```

## Troubleshooting

- Export using `--scan` is doing static analysis of your source files to find
  ghost ID usages. This will only work correctly for components that are mounted
  once or if you set `excludeRenderIndex: true` in GhostID.
  - `excludeRenderIndex` is not yet implemented.
