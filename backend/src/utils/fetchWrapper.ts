export async function safeFetch(url: string, opts: RequestInit = {}) {
    try {
        const res = await fetch(url, opts);
        if (!res.ok) throw new Error(`Upstream error: ${res.status} ${res.statusText}`);
        const data = await res.json();
        return data;
        } catch (err) {
        throw err;
    }
}