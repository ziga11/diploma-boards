class CacheService {
        private dbName = "sb_monday_clone_db";
        private dbVersion = 1;
        private db: IDBDatabase | null = null;

        private getDB(): Promise<IDBDatabase> {
                if (this.db) return Promise.resolve(this.db);

                return new Promise((resolve, reject) => {
                        const request = indexedDB.open(this.dbName, this.dbVersion);

                        request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
                                const db = (event.target as IDBOpenDBRequest).result;

                                if (!db.objectStoreNames.contains('mutated_cache')) {
                                        db.createObjectStore('mutated_cache');
                                }
                                if (!db.objectStoreNames.contains('offline_queue')) {
                                        db.createObjectStore('offline_queue', { keyPath: 'id' });
                                }
                        };

                        request.onsuccess = (event) => {
                                this.db = (event.target as IDBOpenDBRequest).result;
                                resolve(this.db);
                        };

                        request.onerror = () => {
                                console.error("IndexedDB open error:", request.error);
                                reject(request.error);
                        };
                });
        }

        async get<T>(key: string): Promise<T | null> {
                const db = await this.getDB();

                return new Promise((resolve, reject) => {
                        const transaction = db.transaction('mutated_cache', 'readonly');
                        const store = transaction.objectStore('mutated_cache');
                        const request = store.get(key);

                        request.onsuccess = () => {
                                resolve(request.result ? (request.result as T) : null);
                        };

                        request.onerror = () => reject(request.error);
                });
        }

        async set(key: string, data: any): Promise<void> {
                const db = await this.getDB();

                return new Promise((resolve, reject) => {
                        const transaction = db.transaction('mutated_cache', 'readwrite');
                        const store = transaction.objectStore('mutated_cache');

                        const request = store.put(data, key);

                        request.onsuccess = () => resolve();
                        request.onerror = () => reject(request.error);
                });
        }

        async clear(key: string): Promise<void> {
                const db = await this.getDB();

                return new Promise((resolve, reject) => {
                        const transaction = db.transaction('mutated_cache', 'readwrite');
                        const store = transaction.objectStore('mutated_cache');
                        const request = store.delete(key);

                        request.onsuccess = () => resolve();
                        request.onerror = () => reject(request.error);
                });
        }

        async clearAll(): Promise<void> {
                const db = await this.getDB();

                return new Promise((resolve, reject) => {
                        const transaction = db.transaction(['mutated_cache', 'offline_queue'], 'readwrite');

                        transaction.objectStore('mutated_cache').clear();
                        transaction.objectStore('offline_queue').clear();

                        transaction.oncomplete = () => resolve();
                        transaction.onerror = () => reject(transaction.error);
                });
        }

        async enqueueAction(actionType: string, payload: any): Promise<void> {
                const db = await this.getDB();

                return new Promise((resolve, reject) => {
                        const transaction = db.transaction('offline_queue', 'readwrite');
                        const store = transaction.objectStore('offline_queue');

                        const queueItem = {
                                id: crypto.randomUUID(),
                                timestamp: Date.now(),
                                action: actionType,
                                payload: payload
                        };

                        const request = store.put(queueItem);

                        request.onsuccess = () => resolve();
                        request.onerror = () => reject(request.error);
                });
        }

        async getQueue(): Promise<any[]> {
                const db = await this.getDB();

                return new Promise((resolve, reject) => {
                        const transaction = db.transaction('offline_queue', 'readonly');
                        const store = transaction.objectStore('offline_queue');
                        const request = store.getAll();

                        request.onsuccess = () => resolve(request.result || []);
                        request.onerror = () => reject(request.error);
                });
        }

        async dequeueAction(id: string): Promise<void> {
                const db = await this.getDB();

                return new Promise((resolve, reject) => {
                        const transaction = db.transaction('offline_queue', 'readwrite');
                        const store = transaction.objectStore('offline_queue');
                        const request = store.delete(id);

                        request.onsuccess = () => resolve();
                        request.onerror = () => reject(request.error);
                });
        }
}

export const cache = new CacheService();

/*! Unused cause keeping up to date data is more computationally expensive than just refetching it!*/
