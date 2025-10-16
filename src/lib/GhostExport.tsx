import React, { useEffect } from 'react';
import {
    exportAsJSON,
    exportAsTypeScript,
    downloadGhostIds,
    copyGhostIdsToClipboard,
    printGhostIds,
} from './export-utils';
import { GhostRegistryProvider, useGhostRegistry } from './GhostRegistryContext';

export interface Props {
    children?: React.ReactNode;
}

const AttachAndRender: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    const registry = useGhostRegistry();

    useEffect(() => {
        if (typeof window === 'undefined' || !registry) return;

        const api = {
            json: () => exportAsJSON(registry),
            typescript: () => exportAsTypeScript(registry),
            download: (fmt: 'json' | 'ts' = 'json') => downloadGhostIds(registry, fmt),
            copy: (fmt: 'json' | 'ts' = 'json') => copyGhostIdsToClipboard(registry, fmt),
            print: () => printGhostIds(registry),
        } as const;

        (window as any)['GhostExport'] = api;

        return () => {
            try { delete (window as any)['GhostExport']; } catch (e) { /* ignore */ }
        };
    }, [registry]);

    return <>{children ?? null}</>;
};

export const GhostExport: React.FC<Props> = ({ children }) => {
    return (
        <GhostRegistryProvider>
            <AttachAndRender>
                {children}
            </AttachAndRender>
        </GhostRegistryProvider>
    );
};

export default GhostExport;
