type GhostEntry = {
  componentName: string;
  alias?: string;
  ghostId: string;
  renderIndex: number;
};

class GhostRegistryClass {
  private registry: Map<string, GhostEntry> = new Map();
  private componentCounters: Map<string, number> = new Map();
  private isDev: boolean;

  constructor() {
    this.isDev = process.env.NODE_ENV !== 'production';
  }

  /**
   * Simple hash function to generate short deterministic IDs
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36).slice(0, 6);
  }

  /**
   * Get or create a ghost ID for a component
   * @param componentName - The name of the component
   * @param alias - Optional alias for multiple instances
   * @returns The ghost ID string
   */
  getOrCreate(componentName: string, alias?: string) {
    if (!this.isDev) {
      return '';
    }

    const key = alias ? `${componentName}-${alias}` : componentName;

    if (this.registry.has(key)) {
      return this.registry.get(key)!.ghostId;
    }

    // Get render index for this component type
    const currentCount = this.componentCounters.get(componentName) || 0;
    const renderIndex = currentCount + 1;
    this.componentCounters.set(componentName, renderIndex);

    // Generate deterministic ghost ID
    const idString = `${componentName}-${alias || ''}-${renderIndex}`;
    const hash = this.hashString(idString);
    const ghostId = alias
      ? `gh-${componentName}-${alias}-${hash}`
      : `gh-${componentName}-${hash}`;

    this.registry.set(key, {
      componentName,
      alias,
      ghostId,
      renderIndex
    });

    return ghostId;
  }

  /**
   * List all registered ghost IDs
   * @returns Map of component keys to ghost IDs
   */
  list() {
    const result: Record<string, string> = {};
    this.registry.forEach((entry, key) => {
      result[key] = entry.ghostId;
    });
    return result;
  }

  /**
   * Clear the registry (useful for testing)
   */
  clear() {
    this.registry.clear();
    this.componentCounters.clear();
  }

  getDetails() {
    return Array.from(this.registry.values());
  }

  isDevMode() {
    return this.isDev;
  }
}

// Export singleton instance
export const GhostRegistry = new GhostRegistryClass();
