(function () {
    const S = {
        API_KEY: "comics.apiKey",
        TOKEN: "comics.token",
        PER_PAGE: "comics.perPage",
    };
    const store = {
        get(k, def = null) {
            try { const v = localStorage.getItem(k); return v === null ? def : v; } catch { return def; }
        },
        set(k, v) { try { localStorage.setItem(k, v); } catch {} },
        rm(k) { try { localStorage.removeItem(k); } catch {} },
    };

    async function apiFetch(path, options = {}) {
        const base = (window.CONFIG && window.CONFIG.API_BASE) || "";
        if (!base) throw new Error("API_BASE não configurado em config.js");
        const url = base.replace(/\/$/, "") + path;
        const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
        const tok = store.get(S.TOKEN, "");
        if (tok) headers["Authorization"] = "Bearer " + tok;

        const res = await fetch(url, { ...options, headers });
        const text = await res.text();
        let body = null;
        try { body = text ? JSON.parse(text) : null; } catch { body = text; }
        if (!res.ok) {
            const msg = body && body.error ? body.error : `HTTP ${res.status}`;
            throw new Error(msg);
        }
        return body;
    }

    async function loginWithApiKey(apiKey) {
        const data = await apiFetch("/auth/token", { method: "POST", body: JSON.stringify({ api_key: apiKey }) });
        store.set(S.TOKEN, data.access_token);
        return data.access_token;
    }

    function logout() { store.rm(S.TOKEN); }

    async function listItems(page = 1, perPage = 15) {
        const qs = new URLSearchParams({ page: String(page), per_page: String(perPage) });
        return await apiFetch("/items?" + qs.toString(), { method: "GET" });
    }
    async function createItem(payload) { return await apiFetch("/items", { method: "POST", body: JSON.stringify(payload) }); }
    async function updateItem(id, payload) { return await apiFetch("/items/" + id, { method: "PUT", body: JSON.stringify(payload) }); }
    async function deleteItem(id) { return await apiFetch("/items/" + id, { method: "DELETE" }); }

    window.API = {
        store, S, loginWithApiKey, logout, listItems, createItem, updateItem, deleteItem,
    };
})();
