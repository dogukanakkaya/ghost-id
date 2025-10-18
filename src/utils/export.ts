import { GhostRegistry } from '../lib/GhostRegistry';

export function exportAsJSON(registry: GhostRegistry, pretty: boolean = true): string {
    const data = registry.list();
    return JSON.stringify(data, null, pretty ? 2 : 0);
}

export function exportAsTypeScript(registry: GhostRegistry): string {
    const entries = registry.list();
    const lines = [
        '/**',
        ' * Auto-generated Ghost IDs',
        ' * Generated at: ' + new Date().toISOString(),
        ' * DO NOT EDIT MANUALLY',
        ' */',
        '',
        'export const GHOST_IDS = {',
    ];

    Object.entries(entries).forEach(([key, value]) => {
        lines.push(`  '${key}': '${value}',`);
    });

    lines.push('} as const;');
    lines.push('');
    lines.push('export type GhostKey = keyof typeof GHOST_IDS;');

    return lines.join('\n');
}

export function downloadGhostIds(registry: GhostRegistry, format: 'json' | 'ts' = 'json'): void {
    if (typeof window === 'undefined') {
        console.error('downloadGhostIds can only be used in browser');
        return;
    }

    const content = format === 'json' ? exportAsJSON(registry) : exportAsTypeScript(registry);
    const filename = `ghost-ids.${format === 'json' ? 'json' : 'ts'}`;
    const mimeType = format === 'json' ? 'application/json' : 'text/typescript';

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log(`✅ Downloaded ${filename}`);
}