import React, { createContext, useContext, useMemo } from 'react';
import { GhostRegistry } from './GhostRegistry';

const GhostRegistryContext = createContext<GhostRegistry | null>(null);

export function useGhostRegistry(): GhostRegistry | null {
    return useContext(GhostRegistryContext);
}

export const GhostRegistryProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    const registry = useMemo(() => new GhostRegistry(), []);
    return <GhostRegistryContext.Provider value={registry}>{children}</GhostRegistryContext.Provider>;
};

export default GhostRegistryContext;
