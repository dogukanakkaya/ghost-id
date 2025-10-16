import React, { useEffect } from 'react';
import {
    exportAsJSON,
    exportAsTypeScript,
    downloadGhostIds,
    copyGhostIdsToClipboard,
    printGhostIds,
} from './export-utils';

export interface Props {
    children?: React.ReactNode;
}

export const GhostExport: React.FC<Props> = ({ children }) => {
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const api = {
            json: exportAsJSON,
            typescript: exportAsTypeScript,
            download: downloadGhostIds,
            copy: copyGhostIdsToClipboard,
            print: printGhostIds,
        } as const;

        (window as any)['GhostExport'] = api;

        return () => {
            delete (window as any)['GhostExport'];
        };
    }, []);

    return <>{children ?? null}</>;
};

export default GhostExport;
