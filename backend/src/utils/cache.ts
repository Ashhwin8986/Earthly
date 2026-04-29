type CacheEntry<T> = { value: T; expiresAt: number };


class SimpleCache {
private map = new Map<string, CacheEntry<any>>();


set<T>(key: string, value: T, ttlSeconds = 300) {
const expiresAt = Date.now() + ttlSeconds * 1000;
this.map.set(key, { value, expiresAt });
}


get<T>(key: string): T | null {
const item = this.map.get(key);
if (!item) return null;
if (Date.now() > item.expiresAt) {
this.map.delete(key);
return null;
}
return item.value as T;
}


clear() {
this.map.clear();
}
}


export default new SimpleCache();