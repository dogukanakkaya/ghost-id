export interface GhostEntry {
  componentName: string;
  alias?: string;
  ghostId: string;
  renderIndex: number;
}

export type GhostId = string;

export interface GhostRegistryInterface {
  getOrCreate(componentName: string, alias?: string): string;
  list(): Record<string, string>;
  clear(): void;
  getDetails(): GhostEntry[];
  isDevMode(): boolean;
}

export interface UseGhostOptions {
  alias?: string;
}

export type UseGhostHook = (alias?: string) => string;
