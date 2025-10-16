#!/usr/bin/env tsx

/**
 * Ghost CLI - Export Tool
 * 
 * Exports all registered ghost IDs from the browser to JSON or TypeScript files
 * for use in tests.
 * 
 * Usage:
 *   ghost-export --format json --output ./ghost-ids.json
 *   ghost-export --format ts --output ./ghost-ids.ts
 *   ghost-export --url http://localhost:3000 --format json
 */

import { writeFileSync } from 'fs';
import { resolve } from 'path';

interface ExportOptions {
    format: 'json' | 'ts' | 'typescript';
    output?: string;
    url?: string;
    port?: number;
    pretty?: boolean;
}

function generateJSON(entries: Record<string, string>, pretty: boolean = true): string {
    return JSON.stringify(entries, null, pretty ? 2 : 0);
}

function generateTypeScript(entries: Record<string, string>): string {
    const lines = [
        '/**',
        ' * Auto-generated Ghost IDs',
        ' * Generated at: ' + new Date().toISOString(),
        ' * DO NOT EDIT MANUALLY',
        ' */',
        '',
        '// Ghost ID Registry',
        'export const GHOST_IDS = {',
    ];

    Object.entries(entries).forEach(([key, value]) => {
        lines.push(`  '${key}': '${value}',`);
    });

    lines.push('} as const;');
    lines.push('');
    lines.push('// Type-safe selectors');
    lines.push('export type GhostKey = keyof typeof GHOST_IDS;');
    lines.push('');
    lines.push('/**');
    lines.push(' * Get a ghost selector by key');
    lines.push(' * @param key - The component key');
    lines.push(' * @returns CSS selector string');
    lines.push(' */');
    lines.push('export function getGhostSelector(key: GhostKey): string {');
    lines.push('  return `[data-gh="${GHOST_IDS[key]}"]`;');
    lines.push('}');
    lines.push('');
    lines.push('/**');
    lines.push(' * Get a partial ghost selector by key (recommended)');
    lines.push(' * Uses a partial match on the ghost ID to be resilient against hash changes');
    lines.push(' * @param key - The component key');
    lines.push(' * @returns CSS selector string');
    lines.push(' */');
    lines.push('export function getGhostSelectorPartial(key: GhostKey): string {');
    lines.push('  // Extract the base component and alias parts (everything except the hash)');
    lines.push('  const parts = key.split(\'-\');');
    lines.push('  const searchString = parts.join(\'-\'); // Use the full key without hash');
    lines.push('  return `[data-gh^="gh-${searchString}-"]`;');
    lines.push('}');

    return lines.join('\n');
}

export function exportGhostIds(
    registryData: Record<string, string>,
    options: ExportOptions
): void {
    const { format, output, pretty = true } = options;

    let content: string;
    let defaultFileName: string;

    if (format === 'json') {
        content = generateJSON(registryData, pretty);
        defaultFileName = 'ghost-ids.json';
    } else {
        content = generateTypeScript(registryData);
        defaultFileName = 'ghost-ids.ts';
    }

    const outputPath = resolve(process.cwd(), output || defaultFileName);

    try {
        writeFileSync(outputPath, content, 'utf-8');
        console.log(`✅ Ghost IDs exported to: ${outputPath}`);
        console.log(`📊 Total components: ${Object.keys(registryData).length}`);
    } catch (error) {
        console.error('❌ Failed to write file:', error);
        process.exit(1);
    }
}

function parseArgs(): ExportOptions {
    const args = process.argv.slice(2);
    const options: ExportOptions = {
        format: 'json',
        pretty: true,
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        const next = args[i + 1];

        switch (arg) {
            case '--format':
            case '-f':
                if (next && (next === 'json' || next === 'ts' || next === 'typescript')) {
                    options.format = next as 'json' | 'ts' | 'typescript';
                    i++;
                }
                break;
            case '--output':
            case '-o':
                if (next) {
                    options.output = next;
                    i++;
                }
                break;
            case '--url':
            case '-u':
                if (next) {
                    options.url = next;
                    i++;
                }
                break;
            case '--port':
            case '-p':
                if (next) {
                    options.port = parseInt(next, 10);
                    i++;
                }
                break;
            case '--no-pretty':
                options.pretty = false;
                break;
            case '--help':
            case '-h':
                printHelp();
                process.exit(0);
                break;
        }
    }

    return options;
}

function printHelp(): void {
    console.log(`
👻 Ghost Export CLI

Export all registered ghost IDs to JSON or TypeScript files.

USAGE:
  ghost-export [options]

OPTIONS:
  -f, --format <format>    Output format: json, ts, typescript (default: json)
  -o, --output <path>      Output file path (default: ghost-ids.json or ghost-ids.ts)
  -u, --url <url>          URL to fetch ghost IDs from (for automation)
  -p, --port <port>        Port number (default: 3000)
  --no-pretty              Disable pretty printing for JSON
  -h, --help               Show this help message

EXAMPLES:
  # Export to JSON (default)
  ghost-export

  # Export to TypeScript
  ghost-export --format ts --output ./test/ghost-ids.ts

  # Export to JSON with custom path
  ghost-export --format json --output ./e2e/selectors.json

  # Compact JSON
  ghost-export --format json --no-pretty

MANUAL USAGE:
  1. Run your React app in development mode
  2. Open browser console
  3. Copy registry data:
     copy(JSON.stringify(window.GhostRegistry?.list()))
  4. Save to a file and use this CLI to format it

For automated extraction from a running app, use the --url option.
  `);
}

export function main(): void {
    const options = parseArgs();

    console.log('👻 Ghost Export CLI\n');

    // If URL is provided, we would fetch from there
    // For now, we provide instructions for manual export
    if (options.url) {
        console.log('⚠️  Automated fetching from URL is not yet implemented.');
        console.log('    Use manual export for now:\n');
        printManualInstructions();
        process.exit(0);
    }

    // Check if data is piped in
    if (process.stdin.isTTY) {
        // No piped data, show instructions
        printManualInstructions();
        process.exit(0);
    }

    // Read from stdin
    let data = '';
    process.stdin.on('data', (chunk) => {
        data += chunk;
    });

    process.stdin.on('end', () => {
        try {
            const registryData = JSON.parse(data);
            exportGhostIds(registryData, options);
        } catch (error) {
            console.error('❌ Failed to parse input data:', error);
            console.log('\n💡 Expected JSON input with ghost registry data');
            process.exit(1);
        }
    });
}

function printManualInstructions(): void {
    console.log(`
📋 Manual Export Instructions:

1. Run your React app in development mode:
   npm run dev

2. Open your browser and navigate to your app
   (e.g., http://localhost:3000)

3. Open the browser console (F12 or Cmd+Opt+I)

4. Copy the ghost registry:
   copy(JSON.stringify(GhostRegistry.list()))

5. Save the copied data to a file:
   pbpaste > ghost-data.json

6. Pipe it to this CLI:
   cat ghost-data.json | npm run ghost-export -- --format ts --output ./ghost-ids.ts

ALTERNATIVE - Direct from Console:
   In your app's useEffect or component, add:
   
   useEffect(() => {
     const data = JSON.stringify(GhostRegistry.list());
     console.log('GHOST_EXPORT_START');
     console.log(data);
     console.log('GHOST_EXPORT_END');
   }, []);

Then copy the JSON between the markers.
  `);
}

const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
    main();
}