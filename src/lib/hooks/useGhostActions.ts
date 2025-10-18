import { useCallback } from 'react';
import { useGhostRegistry } from '../GhostRegistryContext';
import { exportAsJSON, exportAsTypeScript, downloadGhostIds } from '../../utils/export';

export function useGhostActions() {
    const registry = useGhostRegistry();
    if (!registry) throw new Error('useGhostActions must be used inside GhostRegistryProvider');

    return {
        json: useCallback((pretty = true) => exportAsJSON(registry, pretty), [registry]),
        typescript: useCallback(() => exportAsTypeScript(registry), [registry]),
        download: useCallback((fmt: 'json' | 'ts' = 'json') => downloadGhostIds(registry, fmt), [registry]),
    };
}

export default useGhostActions;
