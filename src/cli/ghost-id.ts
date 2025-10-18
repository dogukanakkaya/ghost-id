import { writeFileSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { parse } from '@babel/parser';
import { traverse } from '@babel/core';
import fg from 'fast-glob';

interface ExportOptions {
    format: 'json' | 'ts';
    output?: string;
    pretty?: boolean;
    // path or glob to scan for static analysis (e.g. "src/**/*.{ts,tsx}")
    scan?: string;
}

function generateJSON(entries: Record<string, string>, pretty = true) {
    return JSON.stringify(entries, null, pretty ? 2 : 0);
}

function generateTypeScript(entries: Record<string, string>) {
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
) {
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
                if (next && (next === 'json' || next === 'ts')) {
                    options.format = next as 'json' | 'ts';
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
            case '--scan':
            case '-s':
                if (next) {
                    options.scan = next;
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

function hashString(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36).slice(0, 6);
}

async function runStaticScan(scanGlob: string) {
    const pattern = scanGlob || '**/*.{ts,tsx,js,jsx}';
    const files = await fg(pattern, {
        dot: true,
        ignore: [
            '**/node_modules/**',
            '**/tests/**',
            '**/__tests__/**',
        ],
    });
    const ids: Record<string, string> = {};

    for (const file of files) {
        const code = readFileSync(file, 'utf8');
        const ast = parse(code, { sourceType: 'module', plugins: ['typescript', 'jsx', 'classProperties', 'decorators-legacy'] });

        // keep track of the current component name as we traverse
        const componentStack: string[] = [];

        traverse(ast, {
            enter(path: any) {
                // detect component functions (capitalized)
                if (
                    (path.isFunctionDeclaration() && /^[A-Z]/.test(path.node.id?.name || "")) ||
                    (path.isVariableDeclarator() &&
                        /^[A-Z]/.test(path.node.id?.name || "") &&
                        (path.node.init?.type === "ArrowFunctionExpression" ||
                            path.node.init?.type === "FunctionExpression"))
                ) {
                    const name = path.node.id?.name;
                    if (name) componentStack.push(name);
                }
            },
            exit(path: any) {
                if (
                    (path.isFunctionDeclaration() && /^[A-Z]/.test(path.node.id?.name || "")) ||
                    (path.isVariableDeclarator() &&
                        /^[A-Z]/.test(path.node.id?.name || ""))
                ) {
                    componentStack.pop();
                }
            },
            CallExpression(path: any) {
                if (path.node.callee.name === "useGhost") {
                    const arg = path.node.arguments[0];
                    const componentName = componentStack[componentStack.length - 1] || "Unknown";
                    const renderIndex = 1;

                    const alias = arg?.value;
                    const key = alias ? `${componentName}-${alias}` : componentName;
                    const idString = alias ? `${componentName}-${alias}-${renderIndex}` : `${componentName}--${renderIndex}`;
                    const hash = hashString(idString);
                    ids[key] = `gh-${key}-${hash}`;
                }
            },
        });
    }

    return ids;
}

function printHelp() {
    console.log(`
👻 Ghost ID CLI

Export all registered ghost IDs to JSON or TypeScript files.

USAGE:
  ghost-id [options]

OPTIONS:
  -f, --format <format>    Output format: json, ts, typescript (default: json)
  -o, --output <path>      Output file path (default: ghost-ids.json or ghost-ids.ts)
  -s, --scan <path>        Path or glob pattern to scan for static analysis
  --no-pretty              Disable pretty printing for JSON
  -h, --help               Show this help message

EXAMPLES:
  # Export to TypeScript
  echo '{"Test":"gh-Test-abc123"}' | ghost-id --format ts --output ./ghost-ids.ts

  # Export to JSON with custom path
  echo '{"Test":"gh-Test-abc123"}' | ghost-id --format json --output ./selectors.json

  # Compact JSON
  echo '{"Test":"gh-Test-abc123"}' | ghost-id --format json --no-pretty

MANUAL USAGE:
  1. Run your React app in development mode
  2. Open browser console
  3. Copy registry data:
    copy(window.GhostID.json())
  4. Save to a file or pipe it to this CLI for TS generation
  5. pbpaste | npx ghost-id -- --format ts --output ghost-ids.ts

For automated extraction from a running app, use the --scan option with a path.
--scan is doing static analysis of your source files to find ghost ID usages.
This will only work correctly for components that are mounted once or if you set 'excludeRenderIndex: true' in GhostID.
  `);
}

export function main(): void {
    const options = parseArgs();

    console.log('👻 Ghost Export CLI\n');

    // If a scan path is provided, run static analysis
    if (options.scan) {
        console.log(`🔎 Running static scan: ${options.scan}`);
        runStaticScan(options.scan)
            .then((ids) => {
                if (!ids || Object.keys(ids).length === 0) {
                    console.warn('No ghost ids found during static scan.');
                    process.exit(0);
                }
                exportGhostIds(ids, options);
            })
            .catch((err) => {
                console.error('Static scan failed:', err && err.stack ? err.stack : err);
                process.exit(1);
            });
        return;
    }

    if (process.stdin.isTTY) {
        // No piped data, show help
        printHelp();
        process.exit(0);
    }

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