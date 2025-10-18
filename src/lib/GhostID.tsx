import React, { useEffect } from 'react';
import { exportAsJSON, exportAsTypeScript, downloadGhostIds } from '../utils/export';
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
            download: (fmt: 'json' | 'ts' = 'json') => downloadGhostIds(registry, fmt)
        } as const;

        (window as any)['GhostID'] = api;

        return () => {
            try { delete (window as any)['GhostID']; } catch (e) { /* ignore */ }
        };
    }, [registry]);

    return <>{children ?? null}</>;
};

export const GhostID: React.FC<Props> = ({ children }) => {
    return (
        <GhostRegistryProvider>
            <AttachAndRender>
                {children}
            </AttachAndRender>
        </GhostRegistryProvider>
    );
};

export default GhostID;
