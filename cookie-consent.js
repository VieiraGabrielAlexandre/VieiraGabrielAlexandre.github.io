class CookieConsent {
    constructor() {
        this.cookieName = 'cookie_consent_preferences';
        this.cookieExpireDays = 365;
        this.preferences = this.loadPreferences();
        this.init();
    }

    init() {
        this.createBanner();
        this.createPreferencesModal();
        this.checkConsent();
        this.setupEventListeners();
    }

    loadPreferences() {
        const saved = localStorage.getItem(this.cookieName);
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            necessary: true,
            analytics: false,
            marketing: false,
            preferences: false,
            consented: false,
            timestamp: null
        };
    }

    savePreferences(prefs) {
        this.preferences = {
            ...prefs,
            consented: true,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem(this.cookieName, JSON.stringify(this.preferences));
        this.applyCookiePreferences();
    }

    checkConsent() {
        if (!this.preferences.consented) {
            this.showBanner();
        } else {
            this.applyCookiePreferences();
        }
    }

    createBanner() {
        const banner = document.createElement('div');
        banner.id = 'cookie-consent-banner';
        banner.className = 'cookie-banner';
        banner.innerHTML = `
            <div class="cookie-banner-content">
                <div class="cookie-banner-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                        <circle cx="9" cy="10" r="1.5" fill="currentColor"/>
                        <circle cx="15" cy="10" r="1.5" fill="currentColor"/>
                        <path d="M9 14.5C9.5 15.5 10.5 16 12 16C13.5 16 14.5 15.5 15 14.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    </svg>
                </div>
                <div class="cookie-banner-text">
                    <h3>Seu conforto importa</h3>
                    <p>
                        Usamos cookies para melhorar sua experiência, analisar o tráfego e personalizar o conteúdo.
                        Você pode escolher quais cookies aceitar.
                    </p>
                </div>
                <div class="cookie-banner-actions">
                    <button class="btn-cookie btn-customize" id="btn-customize-cookies">
                        <i data-lucide="settings"></i>
                        Personalizar
                    </button>
                    <button class="btn-cookie btn-accept-all" id="btn-accept-all-cookies">
                        <i data-lucide="check"></i>
                        Aceitar Todos
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(banner);
    }

    createPreferencesModal() {
        const modal = document.createElement('div');
        modal.id = 'cookie-preferences-modal';
        modal.className = 'cookie-modal';
        modal.innerHTML = `
            <div class="cookie-modal-overlay"></div>
            <div class="cookie-modal-content">
                <div class="cookie-modal-header">
                    <h2>Central de Preferências de Cookies</h2>
                    <button class="btn-close-modal" id="btn-close-modal" aria-label="Fechar">
                        <i data-lucide="x"></i>
                    </button>
                </div>

                <div class="cookie-modal-body">
                    <div class="cookie-intro">
                        <p>
                            Quando você visita nosso site, podemos armazenar ou recuperar informações em seu navegador,
                            principalmente na forma de cookies. Essas informações podem ser sobre você, suas preferências
                            ou seu dispositivo e são usadas principalmente para fazer o site funcionar como você espera.
                        </p>
                        <p>
                            As informações geralmente não identificam você diretamente, mas podem fornecer uma
                            experiência web mais personalizada. Você pode optar por não permitir alguns tipos de cookies.
                        </p>
                    </div>

                    <div class="cookie-categories">
                        <div class="cookie-category">
                            <div class="cookie-category-header">
                                <div class="cookie-category-info">
                                    <div class="cookie-category-icon necessary">
                                        <i data-lucide="shield-check"></i>
                                    </div>
                                    <div>
                                        <h3>Cookies Necessários</h3>
                                        <span class="cookie-status always-active">Sempre Ativo</span>
                                    </div>
                                </div>
                                <label class="cookie-toggle disabled">
                                    <input type="checkbox" checked disabled data-category="necessary">
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                            <div class="cookie-category-description">
                                <p>
                                    Esses cookies são essenciais para o funcionamento do site e não podem ser desativados.
                                    Eles geralmente são definidos em resposta a ações feitas por você, como definir suas
                                    preferências de privacidade, fazer login ou preencher formulários.
                                </p>
                                <div class="cookie-benefits">
                                    <h4>O que você ganha:</h4>
                                    <ul>
                                        <li>Navegação segura e funcional</li>
                                        <li>Acesso a áreas protegidas do site</li>
                                        <li>Lembrança de suas preferências de privacidade</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div class="cookie-category">
                            <div class="cookie-category-header">
                                <div class="cookie-category-info">
                                    <div class="cookie-category-icon analytics">
                                        <i data-lucide="bar-chart-2"></i>
                                    </div>
                                    <div>
                                        <h3>Cookies de Análise</h3>
                                        <span class="cookie-count">Google Analytics</span>
                                    </div>
                                </div>
                                <label class="cookie-toggle">
                                    <input type="checkbox" data-category="analytics">
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                            <div class="cookie-category-description">
                                <p>
                                    Esses cookies nos permitem contar visitas e fontes de tráfego para que possamos medir
                                    e melhorar o desempenho do nosso site. Eles nos ajudam a saber quais páginas são mais
                                    e menos populares e ver como os visitantes se movem pelo site.
                                </p>
                                <div class="cookie-benefits">
                                    <h4>O que você ganha:</h4>
                                    <ul>
                                        <li>Experiência otimizada baseada em dados reais de uso</li>
                                        <li>Conteúdo mais relevante e útil</li>
                                        <li>Melhorias contínuas no site</li>
                                        <li>Melhor performance e velocidade</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div class="cookie-category">
                            <div class="cookie-category-header">
                                <div class="cookie-category-info">
                                    <div class="cookie-category-icon marketing">
                                        <i data-lucide="target"></i>
                                    </div>
                                    <div>
                                        <h3>Cookies de Marketing</h3>
                                        <span class="cookie-count">Publicidade Personalizada</span>
                                    </div>
                                </div>
                                <label class="cookie-toggle">
                                    <input type="checkbox" data-category="marketing">
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                            <div class="cookie-category-description">
                                <p>
                                    Esses cookies podem ser definidos através do nosso site por parceiros de publicidade.
                                    Eles podem ser usados por essas empresas para construir um perfil sobre seus interesses
                                    e mostrar anúncios relevantes em outros sites.
                                </p>
                                <div class="cookie-benefits">
                                    <h4>O que você ganha:</h4>
                                    <ul>
                                        <li>Anúncios mais relevantes aos seus interesses</li>
                                        <li>Menos anúncios irrelevantes</li>
                                        <li>Descoberta de produtos e serviços úteis</li>
                                        <li>Ofertas personalizadas</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div class="cookie-category">
                            <div class="cookie-category-header">
                                <div class="cookie-category-info">
                                    <div class="cookie-category-icon preferences">
                                        <i data-lucide="sliders"></i>
                                    </div>
                                    <div>
                                        <h3>Cookies de Preferências</h3>
                                        <span class="cookie-count">Personalização</span>
                                    </div>
                                </div>
                                <label class="cookie-toggle">
                                    <input type="checkbox" data-category="preferences">
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                            <div class="cookie-category-description">
                                <p>
                                    Esses cookies permitem que o site forneça funcionalidade e personalização aprimoradas.
                                    Eles podem ser definidos por nós ou por provedores terceiros cujos serviços adicionamos
                                    às nossas páginas.
                                </p>
                                <div class="cookie-benefits">
                                    <h4>O que você ganha:</h4>
                                    <ul>
                                        <li>Lembrança de suas configurações de idioma</li>
                                        <li>Experiência personalizada do site</li>
                                        <li>Recursos aprimorados de interação</li>
                                        <li>Interface adaptada às suas preferências</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="cookie-modal-footer">
                    <button class="btn-cookie btn-reject-all" id="btn-reject-all">
                        <i data-lucide="x-circle"></i>
                        Rejeitar Todos
                    </button>
                    <button class="btn-cookie btn-save-preferences" id="btn-save-preferences">
                        <i data-lucide="save"></i>
                        Salvar Preferências
                    </button>
                    <button class="btn-cookie btn-accept-all-modal" id="btn-accept-all-modal">
                        <i data-lucide="check-circle"></i>
                        Aceitar Todos
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    setupEventListeners() {
        document.getElementById('btn-accept-all-cookies')?.addEventListener('click', () => {
            this.acceptAll();
        });

        document.getElementById('btn-customize-cookies')?.addEventListener('click', () => {
            this.showPreferencesModal();
        });

        document.getElementById('btn-close-modal')?.addEventListener('click', () => {
            this.hidePreferencesModal();
        });

        document.getElementById('btn-accept-all-modal')?.addEventListener('click', () => {
            this.acceptAll();
            this.hidePreferencesModal();
        });

        document.getElementById('btn-reject-all')?.addEventListener('click', () => {
            this.rejectAll();
            this.hidePreferencesModal();
        });

        document.getElementById('btn-save-preferences')?.addEventListener('click', () => {
            this.saveCustomPreferences();
            this.hidePreferencesModal();
        });

        document.querySelector('.cookie-modal-overlay')?.addEventListener('click', () => {
            this.hidePreferencesModal();
        });

        this.loadCheckboxStates();

        document.getElementById('cookie-settings-btn')?.addEventListener('click', () => {
            this.showPreferencesModal();
        });
    }

    loadCheckboxStates() {
        const checkboxes = document.querySelectorAll('.cookie-toggle input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            const category = checkbox.dataset.category;
            if (category && this.preferences[category] !== undefined) {
                checkbox.checked = this.preferences[category];
            }
        });
    }

    showBanner() {
        const banner = document.getElementById('cookie-consent-banner');
        if (banner) {
            setTimeout(() => {
                banner.classList.add('show');
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            }, 1000);
        }
    }

    hideBanner() {
        const banner = document.getElementById('cookie-consent-banner');
        if (banner) {
            banner.classList.remove('show');
            setTimeout(() => {
                banner.style.display = 'none';
            }, 300);
        }
    }

    showPreferencesModal() {
        const modal = document.getElementById('cookie-preferences-modal');
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
            this.loadCheckboxStates();
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }
    }

    hidePreferencesModal() {
        const modal = document.getElementById('cookie-preferences-modal');
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }
    }

    acceptAll() {
        this.savePreferences({
            necessary: true,
            analytics: true,
            marketing: true,
            preferences: true
        });
        this.hideBanner();
        this.showToast('Todas as preferências de cookies foram aceitas!');
    }

    rejectAll() {
        this.savePreferences({
            necessary: true,
            analytics: false,
            marketing: false,
            preferences: false
        });
        this.hideBanner();
        this.showToast('Apenas cookies necessários foram mantidos.');
    }

    saveCustomPreferences() {
        const checkboxes = document.querySelectorAll('.cookie-toggle input[type="checkbox"]:not([disabled])');
        const prefs = {
            necessary: true
        };

        checkboxes.forEach(checkbox => {
            const category = checkbox.dataset.category;
            if (category) {
                prefs[category] = checkbox.checked;
            }
        });

        this.savePreferences(prefs);
        this.hideBanner();
        this.showToast('Suas preferências de cookies foram salvas!');
    }

    applyCookiePreferences() {
        if (this.preferences.analytics) {
            this.enableAnalytics();
        }

        if (this.preferences.marketing) {
            this.enableMarketing();
        }

        if (this.preferences.preferences) {
            this.enablePreferences();
        }
    }

    enableAnalytics() {
        console.log('Analytics cookies enabled');
    }

    enableMarketing() {
        console.log('Marketing cookies enabled');
    }

    enablePreferences() {
        console.log('Preferences cookies enabled');
    }

    showToast(message) {
        const existingToast = document.querySelector('.cookie-toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = 'cookie-toast';
        toast.innerHTML = `
            <div class="toast-icon">
                <i data-lucide="check-circle"></i>
            </div>
            <span>${message}</span>
        `;
        document.body.appendChild(toast);

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }

    openPreferences() {
        this.showPreferencesModal();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.cookieConsent = new CookieConsent();
});
