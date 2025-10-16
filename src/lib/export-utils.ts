import { GhostRegistry } from './GhostRegistry';

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

export async function copyGhostIdsToClipboard(registry: GhostRegistry, format: 'json' | 'ts' = 'json'): Promise<void> {
    if (typeof window === 'undefined' || !navigator.clipboard) {
        console.error('Clipboard API not available');
        return;
    }

    const content = format === 'json' ? exportAsJSON(registry) : exportAsTypeScript(registry);

    try {
        await navigator.clipboard.writeText(content);
        console.log(`✅ Ghost IDs copied to clipboard (${format} format)`);
    } catch (error) {
        console.error('Failed to copy to clipboard:', error);
    }
}

export function printGhostIds(registry: GhostRegistry): void {
    console.log('👻 Ghost Registry Export');
    console.log('========================\n');
    const entries = registry.getDetails();

    console.table(entries);

    console.log('\n📋 Copy-paste ready formats:\n');
    console.log('JSON:');
    console.log(exportAsJSON(registry));

    console.log('\n\nTypeScript:');
    console.log(exportAsTypeScript(registry));
}