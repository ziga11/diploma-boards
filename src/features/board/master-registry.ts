export interface Token<T> {
        readonly key: symbol;
        readonly __type?: T;
}

export function createToken<T>(description: string): Token<T> {
        return { key: Symbol(description) };
}

const registry = new Map<symbol, unknown>();

export const MasterRegistry = {
        register<T>(token: Token<T>, instance: T): void {
                registry.set(token.key, instance);
        },

        get<T>(token: Token<T>): T {
                const instance = registry.get(token.key);
                if (!instance) {
                        throw new Error(`[MasterRegistry] Module for symbol "${token.key.description}" is not registered.`);
                }
                return instance as T;
        }
};
