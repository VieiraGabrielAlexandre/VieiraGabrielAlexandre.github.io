(function () {
    const { store, S, loginWithApiKey, listItems, createItem, updateItem, deleteItem } = window.API;
    const { toast, setAuthPill, modal, badgeStatus } = window.UI;

    let state = {
        page: 1,
        perPage: parseInt(store.get(S.PER_PAGE, "15"), 10),
        totalPages: 1,
        total: 0,
        filters: { nome: "", editora: "", tipo: "" },
        cache: [],
        editingId: null,
    };

    // --- DOM refs
    const els = {
        filtroNome: document.getElementById("filtro-nome"),
        filtroEditora: document.getElementById("filtro-editora"),
        filtroTipo: document.getElementById("filtro-tipo"),
        btnFiltros: document.getElementById("btn-aplicar-filtros"),
        btnNovo: document.getElementById("btn-novo"),
        btnSalvar: document.getElementById("btn-salvar"),
        btnLimpar: document.getElementById("btn-limpar"),
        tableBody: document.querySelector("#tab-itens tbody"),
        pageInfo: document.getElementById("page-info"),
        perPage: document.getElementById("per-page"),
        // form rápido
        tipo: document.getElementById("tipo"),
        nome: document.getElementById("nome"),
        volume: document.getElementById("volume"),
        editora: document.getElementById("editora"),
        valor: document.getElementById("valor"),
        status: document.getElementById("status"),
        formState: document.getElementById("form-state"),
        // modal edição
        m: {
            tipo: document.getElementById("m-tipo"),
            nome: document.getElementById("m-nome"),
            volume: document.getElementById("m-volume"),
            editora: document.getElementById("m-editora"),
            valor: document.getElementById("m-valor"),
            status: document.getElementById("m-status"),
            salvar: document.getElementById("m-salvar"),
            cancelar: document.getElementById("m-cancelar"),
        },
        // auth/config
        btnConfig: document.getElementById("btn-config"),
        btnLogin: document.getElementById("btn-login"),
        // paginação
        first: document.getElementById("first"),
        prev: document.getElementById("prev"),
        next: document.getElementById("next"),
        last: document.getElementById("last"),
    };

    // --- Helpers
    function currentToken() {
        return !!store.get(S.TOKEN, "");
    }
    function renderPagination() {
        els.pageInfo.textContent = `página ${state.page}/${state.totalPages}`;
        els.perPage.value = String(state.perPage);
    }
    function applyFiltersClient(rows) {
        const nomeF = state.filters.nome.toLowerCase();
        const edF = state.filters.editora.toLowerCase();
        const tipoF = state.filters.tipo;
        return rows.filter(r => {
            const okNome = nomeF ? String(r.nome || "").toLowerCase().includes(nomeF) : true;
            const okEd = edF ? String(r.editora || "").toLowerCase().includes(edF) : true;
            const okTipo = tipoF ? String(r.tipo || "") === tipoF : true;
            return okNome && okEd && okTipo;
        });
    }
    function renderTable() {
        els.tableBody.innerHTML = "";
        const rows = applyFiltersClient(state.cache);
        if (!rows.length) {
            const tr = document.createElement("tr");
            const td = document.createElement("td");
            td.colSpan = 8; td.className = "muted"; td.textContent = "Nenhum item encontrado.";
            tr.appendChild(td); els.tableBody.appendChild(tr); return;
        }
        for (const r of rows) {
            const tr = document.createElement("tr");
            tr.innerHTML = `
        <td>${r.id ?? ""}</td>
        <td>${r.tipo ?? ""}</td>
        <td>${r.nome ?? ""}</td>
        <td>${r.volume ?? ""}</td>
        <td>${r.editora ?? ""}</td>
        <td>${r.valor != null ? Number(r.valor).toFixed(2) : ""}</td>
        <td>${badgeStatus(r.status)}</td>
        <td>
          <div class="table-actions">
            <button class="btn small" data-edit="${r.id}">✏️ Editar</button>
            <button class="btn small danger" data-del="${r.id}">🗑️ Excluir</button>
          </div>
        </td>
      `;
            els.tableBody.appendChild(tr);
        }
        els.tableBody.querySelectorAll("[data-edit]").forEach(b => b.addEventListener("click", () => openEdit(parseInt(b.dataset.edit, 10))));
        els.tableBody.querySelectorAll("[data-del]").forEach(b => b.addEventListener("click", () => onDelete(parseInt(b.dataset.del, 10))));
    }

    // --- API calls
    async function refreshList() {
        const body = await listItems(state.page, state.perPage);
        const rows = body.data || body;
        state.cache = rows;
        if (body.meta) {
            state.total = body.meta.total;
            state.totalPages = body.meta.total_pages;
        } else {
            state.total = rows.length; state.totalPages = 1;
        }
        renderTable();
        renderPagination();
    }

    // --- Events
    els.btnConfig.addEventListener("click", () => {
        const currentBase = (window.CONFIG && window.CONFIG.API_BASE) || "";
        const base = prompt("API Base (ex.: http://localhost:8000 ou http://localhost:8000/comicsinventory/api)", currentBase);
        if (base !== null) window.CONFIG.API_BASE = base;
        const existingKey = store.get(S.API_KEY, "");
        const apiKey = prompt("API Key (para /auth/token)", existingKey);
        if (apiKey !== null) store.set(S.API_KEY, apiKey);
        toast("Configurações salvas.");
    });

    els.btnLogin.addEventListener("click", async () => {
        try {
            const apiKey = store.get(S.API_KEY, "");
            if (!apiKey) { toast("Defina sua API Key em Configurar.", "err"); return; }
            await loginWithApiKey(apiKey);
            setAuthPill(true);
            await refreshList();
            toast("Token obtido com sucesso ✅");
        } catch (e) { toast(String(e.message || e), "err"); }
    });

    els.btnFiltros.addEventListener("click", () => {
        state.filters.nome = els.filtroNome.value.trim();
        state.filters.editora = els.filtroEditora.value.trim();
        state.filters.tipo = els.filtroTipo.value;
        renderTable();
    });

    els.btnNovo.addEventListener("click", () => {
        clearForm(); els.nome.focus();
    });
    els.btnLimpar.addEventListener("click", clearForm);

    els.btnSalvar.addEventListener("click", async () => {
        try {
            const payload = readForm();
            if (!payload.nome) { toast("Informe o nome.", "err"); return; }
            await createItem(payload);
            toast("Item criado!");
            clearForm();
            await refreshList();
        } catch (e) { toast(String(e.message || e), "err"); }
    });

    // paginação
    document.getElementById("first").addEventListener("click", async () => { state.page = 1; await refreshList(); });
    document.getElementById("prev").addEventListener("click", async () => { state.page = Math.max(1, state.page - 1); await refreshList(); });
    document.getElementById("next").addEventListener("click", async () => { state.page = Math.min(state.totalPages, state.page + 1); await refreshList(); });
    document.getElementById("last").addEventListener("click", async () => { state.page = state.totalPages; await refreshList(); });
    els.perPage.addEventListener("change", async (e) => {
        state.perPage = parseInt(e.target.value, 10);
        store.set(S.PER_PAGE, String(state.perPage));
        state.page = 1;
        await refreshList();
    });

    // modal edição
    els.m.cancelar.addEventListener("click", () => modal.close());
    els.m.salvar.addEventListener("click", async () => {
        try {
            if (!state.editingId) return;
            const payload = {
                tipo: els.m.tipo.value || "hq",
                nome: els.m.nome.value || "",
                volume: els.m.volume.value || "",
                editora: els.m.editora.value || "",
                valor: els.m.valor.value ? parseFloat(els.m.valor.value) : null,
                status: els.m.status.value || "",
            };
            if (!payload.nome) { toast("Informe o nome.", "err"); return; }
            await updateItem(state.editingId, payload);
            toast("Item atualizado!");
            modal.close();
            await refreshList();
        } catch (e) { toast(String(e.message || e), "err"); }
    });

    // --- CRUD helpers
    function readForm() {
        return {
            tipo: els.tipo.value || "hq",
            nome: els.nome.value || "",
            volume: els.volume.value || "",
            editora: els.editora.value || "",
            valor: els.valor.value ? parseFloat(els.valor.value) : null,
            status: els.status.value || "",
        };
    }
    function clearForm() {
        els.tipo.value = "hq";
        els.nome.value = "";
        els.volume.value = "";
        els.editora.value = "";
        els.valor.value = "";
        els.status.value = "";
        els.formState.textContent = "Novo item";
    }
    function openEdit(id) {
        const r = state.cache.find(x => x.id === id);
        if (!r) return;
        state.editingId = id;
        els.m.tipo.value = r.tipo || "hq";
        els.m.nome.value = r.nome || "";
        els.m.volume.value = r.volume || "";
        els.m.editora.value = r.editora || "";
        els.m.valor.value = r.valor || "";
        els.m.status.value = r.status || "";
        modal.open();
    }
    async function onDelete(id) {
        if (!confirm("Tem certeza que deseja excluir este item?")) return;
        await deleteItem(id);
        toast("Item excluído.");
        await refreshList();
    }

    // --- init
    (async function init() {
        setAuthPill(!!currentToken());
        // tenta listar se já tiver token e API_BASE
        const hasBase = window.CONFIG && !!window.CONFIG.API_BASE;
        if (currentToken() && hasBase) {
            try { await refreshList(); } catch {}
        }
    })();
})();
