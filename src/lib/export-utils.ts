import { ghostRegistry } from './GhostRegistry';

export function exportAsJSON(pretty: boolean = true): string {
    const data = ghostRegistry.list();
    return JSON.stringify(data, null, pretty ? 2 : 0);
}

export function exportAsTypeScript(): string {
    const entries = ghostRegistry.list();
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

export function downloadGhostIds(format: 'json' | 'ts' = 'json'): void {
    if (typeof window === 'undefined') {
        console.error('downloadGhostIds can only be used in browser');
        return;
    }

    const content = format === 'json' ? exportAsJSON() : exportAsTypeScript();
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

export async function copyGhostIdsToClipboard(format: 'json' | 'ts' = 'json'): Promise<void> {
    if (typeof window === 'undefined' || !navigator.clipboard) {
        console.error('Clipboard API not available');
        return;
    }

    const content = format === 'json' ? exportAsJSON() : exportAsTypeScript();

    try {
        await navigator.clipboard.writeText(content);
        console.log(`✅ Ghost IDs copied to clipboard (${format} format)`);
    } catch (error) {
        console.error('Failed to copy to clipboard:', error);
    }
}

export function printGhostIds(): void {
    console.log('👻 Ghost Registry Export');
    console.log('========================\n');

    const entries = ghostRegistry.getDetails();

    console.table(entries);

    console.log('\n📋 Copy-paste ready formats:\n');
    console.log('JSON:');
    console.log(exportAsJSON());

    console.log('\n\nTypeScript:');
    console.log(exportAsTypeScript());
}