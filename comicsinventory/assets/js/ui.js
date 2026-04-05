(function () {
    const toastBox = document.getElementById("toasts");
    window.UI = {
        toast(msg, type = "ok", timeout = 3000) {
            const el = document.createElement("div");
            el.className = "toast" + (type === "err" ? " err" : "");
            el.textContent = msg;
            toastBox.appendChild(el);
            setTimeout(() => (el.style.opacity = "0"), timeout - 300);
            setTimeout(() => toastBox.removeChild(el), timeout);
        },
        setAuthPill(active) {
            const pill = document.getElementById("pill-status");
            pill.textContent = active ? "Token ativo" : "Sem token";
            pill.style.background = active ? "#0c1a12" : "#1a1010";
            pill.style.borderColor = active ? "#1f3b2a" : "#402424";
            pill.style.color = active ? "#a7f3d0" : "#fbcaca";
        },
        modal: (function () {
            const modal = document.getElementById("modal");
            return {
                open() { modal.classList.add("show"); },
                close() { modal.classList.remove("show"); },
            };
        })(),
        badgeStatus(s) {
            if (!s) return '<span class="badge">—</span>';
            return `<span class="badge status-${s}">${String(s).replace("_", " ")}</span>`;
        },
    };
})();
