// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    // Features Bar Carousel functionality
    const featuresCarousel = document.querySelector('.features-carousel');
    if (featuresCarousel) {
        const slides = featuresCarousel.querySelectorAll('.features-slide');
        const indicators = featuresCarousel.querySelectorAll('.features-indicator');
        const prevBtn = featuresCarousel.querySelector('.features-control.prev');
        const nextBtn = featuresCarousel.querySelector('.features-control.next');
        let currentSlide = 0;
        let slideInterval;

        // Function to show a specific slide
        function showSlide(index) {
            // Ensure index is within bounds (0-3 for 4 slides)
            if (index >= slides.length) index = 0;
            if (index < 0) index = slides.length - 1;

            // Remove active class from all slides and indicators
            slides.forEach(slide => {
                slide.classList.remove('active');
            });
            indicators.forEach(indicator => {
                indicator.classList.remove('active');
            });

            // Add active class to current slide and indicator
            slides[index].classList.add('active');
            if (indicators[index]) {
                indicators[index].classList.add('active');
            }

            // Update current slide index
            currentSlide = index;
        }

        // Function to go to the next slide
        function nextSlide() {
            const newIndex = currentSlide + 1;
            showSlide(newIndex);
        }

        // Function to go to the previous slide
        function prevSlide() {
            const newIndex = currentSlide - 1;
            showSlide(newIndex);
        }

        // Start automatic slideshow
        function startSlideshow() {
            slideInterval = setInterval(nextSlide, 5000);
        }

        // Stop automatic slideshow
        function stopSlideshow() {
            clearInterval(slideInterval);
        }

        // Event listeners for controls
        prevBtn.addEventListener('click', function(e) {
            e.preventDefault();
            prevSlide();
            stopSlideshow();
            startSlideshow();
        });

        nextBtn.addEventListener('click', function(e) {
            e.preventDefault();
            nextSlide();
            stopSlideshow();
            startSlideshow();
        });

        // Event listeners for indicators
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', function(e) {
                e.preventDefault();
                showSlide(index);
                stopSlideshow();
                startSlideshow();
            });
        });

        // Pause slideshow when hovering over carousel
        featuresCarousel.addEventListener('mouseenter', stopSlideshow);
        featuresCarousel.addEventListener('mouseleave', startSlideshow);

        // Initialize carousel
        showSlide(0);
        startSlideshow();
    }

    // Entertainment Carousel functionality
    const entertainmentCarousel = document.querySelector('.entertainment-carousel');
    if (entertainmentCarousel) {
        const slides = entertainmentCarousel.querySelectorAll('.entertainment-slide');
        const prevBtn = entertainmentCarousel.querySelector('.entertainment-control.prev');
        const nextBtn = entertainmentCarousel.querySelector('.entertainment-control.next');
        let currentSlide = 0;
        let slideInterval;

        // Function to show a specific slide
        function showSlide(index) {
            // Ensure index is within bounds
            index = ((index % slides.length) + slides.length) % slides.length;

            // Remove active class from all slides
            slides.forEach(slide => {
                slide.classList.remove('active');
            });

            // Add active class to current slide
            slides[index].classList.add('active');

            // Update current slide index
            currentSlide = index;
        }

        // Function to go to the next slide
        function nextSlide() {
            const newIndex = currentSlide + 1;
            showSlide(newIndex);
        }

        // Function to go to the previous slide
        function prevSlide() {
            const newIndex = currentSlide - 1;
            showSlide(newIndex);
        }

        // Start automatic slideshow
        function startSlideshow() {
            slideInterval = setInterval(nextSlide, 5000);
        }

        // Stop automatic slideshow
        function stopSlideshow() {
            clearInterval(slideInterval);
        }

        // Event listeners for controls
        if (prevBtn) {
            prevBtn.addEventListener('click', function(e) {
                e.preventDefault();
                prevSlide();
                stopSlideshow();
                startSlideshow();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', function(e) {
                e.preventDefault();
                nextSlide();
                stopSlideshow();
                startSlideshow();
            });
        }

        // Pause slideshow when hovering over carousel
        entertainmentCarousel.addEventListener('mouseenter', stopSlideshow);
        entertainmentCarousel.addEventListener('mouseleave', startSlideshow);

        // Initialize carousel
        showSlide(0);
        startSlideshow();
    }

    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuIcon = mobileMenuBtn.querySelector('i');

    // Debug logs
    console.log('Mobile menu button:', mobileMenuBtn);
    console.log('Mobile menu:', mobileMenu);
    console.log('Button computed style:', window.getComputedStyle(mobileMenuBtn));

    mobileMenuBtn.addEventListener('click', function() {
        console.log('Menu button clicked - event fired');
        console.log('Menu button clicked');
        mobileMenu.classList.toggle('active');
        console.log('Menu classes:', mobileMenu.className);

        // Toggle icon
        if (mobileMenu.classList.contains('active')) {
            menuIcon.className = 'fas fa-times';
        } else {
            menuIcon.className = 'fas fa-bars';
        }
    });

    // Add touch event for mobile devices
    mobileMenuBtn.addEventListener('touchstart', function(e) {
        console.log('Touch event fired');
        e.preventDefault();
        mobileMenu.classList.toggle('active');

        // Toggle icon
        if (mobileMenu.classList.contains('active')) {
            menuIcon.className = 'fas fa-times';
        } else {
            menuIcon.className = 'fas fa-bars';
        }
    });

    // Close mobile menu when clicking on a link
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', function() {
            mobileMenu.classList.remove('active');
            menuIcon.className = 'fas fa-bars';
        });
    });

    // Smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add scroll effect to header
    window.addEventListener('scroll', function() {
        const nav = document.querySelector('.nav');
        if (window.scrollY > 100) {
            nav.style.background = 'rgba(37, 99, 235, 0.95)';
            nav.style.backdropFilter = 'blur(10px)';
        } else {
            nav.style.background = 'transparent';
            nav.style.backdropFilter = 'none';
        }
    });

    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.classList.contains('plan-card')) {
                    // Add animated class with a delay based on index for staggered effect
                    // Garantir que o índice está dentro dos limites
                    index = ((index % slides.length) + slides.length) % slides.length;
                    entry.target.classList.add('animated');
                } else if (entry.target.classList.contains('animate-fade-up') ||
                    entry.target.classList.contains('animate-fade-left') ||
                    entry.target.classList.contains('animate-fade-right') ||
                    entry.target.classList.contains('animate-scale')) {
                    // These elements already have animation classes, just add a class to trigger them
                } else {
                    // Fallback for elements without specific animation classes
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const advantageCards = document.querySelectorAll('.advantage-card, .value-card');
    advantageCards.forEach((el, index) => {
        el.classList.add('animate-scale');
        el.classList.add(`delay-${(index % 3 + 1) * 100}`);
        observer.observe(el);
    });
    // Observe plan cards separately (they have CSS animations)
    const planCards = document.querySelectorAll('.plan-card');
    planCards.forEach(el => {
        observer.observe(el);
    });

    // Add animations to section titles and text
    const sectionTitles = document.querySelectorAll('.section-title');
    sectionTitles.forEach(el => {
        el.classList.add('animate-fade-up');
        observer.observe(el);
    });

    // Add animations to business and entertainment text
    const businessText = document.querySelector('.business-text');
    if (businessText) {
        const subtitle = businessText.querySelector('.business-subtitle');
        const title = businessText.querySelector('.section-title');
        if (subtitle) {
            subtitle.classList.add('animate-fade-left');
            observer.observe(subtitle);
        }
        if (title) {
            title.classList.add('animate-fade-up');
            title.classList.add('delay-100');
            observer.observe(title);
        }
    }

    const entertainmentText = document.querySelector('.entertainment-text');
    if (entertainmentText) {
        const title = entertainmentText.querySelector('.section-title');
        if (title) {
            title.classList.add('animate-fade-right');
            observer.observe(title);
        }
    }

    // WhatsApp button is now a direct link in the social-links section

    // Plan buttons are now direct links to WhatsApp with pre-filled messages

    // Add loading animation to buttons (excluding plan buttons which are now direct links)
    const buttons = document.querySelectorAll('.btn:not(.btn-plan)');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Carregando...';
            this.disabled = true;

            setTimeout(() => {
                this.innerHTML = originalText;
                this.disabled = false;
            }, 2000);
        });
    });

    // Add parallax effect to hero background
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const headerBg = document.querySelector('.header-bg');
        if (headerBg) {
            headerBg.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    });

    // Add counter animation for plan speeds
    function animateCounter(element, target, duration = 2000) {
        let start = 0;
        const increment = target / (duration / 16);

        function updateCounter() {
            start += increment;
            if (start < target) {
                element.textContent = Math.floor(start);
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target;
            }
        }

        updateCounter();
    }

    // Trigger counter animation when plans section is visible
    const plansSection = document.querySelector('.plans');
    const planSpeedElements = document.querySelectorAll('.plan-speed');

    const plansObserver = new IntersectionObserver(function(entries) {
        function nextSlide() {
            showSlide(currentSlide + 1);
        }

        function prevSlide() {
            showSlide(currentSlide - 1);
        }

        function startAutoplay() {
            autoplayInterval = setInterval(nextSlide, 5000);
        }

        function stopAutoplay() {
            if (autoplayInterval) {
                clearInterval(autoplayInterval);
            }
        }

        entries.forEach(entry => {
            if (entry.isIntersecting) {
                planSpeedElements.forEach(el => {
                    stopAutoplay();
                    prevSlide();
                    startAutoplay();
                });
                plansObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    if (plansSection) {
        plansObserver.observe(plansSection);
    }

    // Initialize CEP consultation at the end
    initCepConsultation();
});

// CEP Consultation functionality - Moved to end of main DOMContentLoaded
function initCepConsultation() {
    console.log('Inicializando consulta de CEP...');

    // CEPs atendidos - embutidos no código para evitar problema de CORS
    const cepsAtendidos = [
        "01001-000",
        "01002-000",
        "01003-000",
        "01004-000",
        "01005-000",
        "01006-000",
        "01007-000",
        "01008-000",
        "01009-000",
        "01010-000"
    ];

    const cepForm = document.getElementById('cepForm');
    const cepInput = document.getElementById('cepInput');
    const cepResult = document.getElementById('cepResult');

    console.log('Elementos encontrados:', { cepForm, cepInput, cepResult });
    console.log('cepForm existe?', !!cepForm);
    console.log('cepInput existe?', !!cepInput);
    console.log('cepResult existe?', !!cepResult);

    if (!cepForm || !cepInput || !cepResult) {
        console.error('Elementos do formulário de CEP não encontrados!');
        console.log('Todos os elementos com ID no documento:',
            Array.from(document.querySelectorAll('[id]')).map(el => el.id));
        return;
    }

    // Função para mostrar resultado
    function showResult(type, message) {
        console.log('Mostrando resultado:', { type, message });
        cepResult.className = `cep-result ${type}`;
        cepResult.innerHTML = message;
        cepResult.style.display = 'block';
        console.log('Elemento após atualização:', cepResult);
    }

    // Format CEP input
    cepInput.addEventListener('input', function(e) {
        console.log('Input CEP alterado:', e.target.value);
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 5) {
            value = value.replace(/^(\d{5})(\d)/, '$1-$2');
        }
        e.target.value = value;
    });

    // Teste se o formulário existe e adiciona listener
    console.log('Adicionando event listener ao formulário...');
    console.log('Tipo do elemento cepForm:', typeof cepForm);
    console.log('Tag do elemento cepForm:', cepForm ? cepForm.tagName : 'undefined');

    // Handle form submission
    cepForm.addEventListener('submit', async function(e) {
        console.log('Event listener do formulário foi chamado!');
        e.preventDefault();
        console.log('Formulário de CEP submetido!');

        const cep = cepInput.value.replace(/\D/g, '');
        console.log('CEP digitado:', cep);

        if (cep.length !== 8) {
            console.log('CEP inválido, mostrando erro');
            showResult('error', 'Por favor, digite um CEP válido com 8 dígitos.');
            return;
        }

        console.log('Iniciando consulta...');
        showResult('loading', 'Consultando cobertura...');

        try {
            // 1. Consultar dados do endereço via ViaCEP
            console.log('Consultando ViaCEP para CEP:', cep);
            const viaCepResponse = await fetch(`https://viacep.com.br/ws/${cep}/json/`);

            if (!viaCepResponse.ok) {
                console.error('Erro na resposta do ViaCEP:', viaCepResponse.status);
                throw new Error('Erro ao consultar dados do CEP');
            }

            const enderecoData = await viaCepResponse.json();
            console.log('Dados do ViaCEP:', enderecoData);

            if (enderecoData.erro) {
                console.error('CEP não encontrado no ViaCEP');
                throw new Error('CEP não encontrado');
            }

            // 2. Verificar cobertura usando lista embutida
            console.log('Verificando cobertura com lista embutida...');
            console.log('CEPs atendidos:', cepsAtendidos);

            // 3. Verificar se o CEP está na lista de atendidos
            const cepFormatado = cep.substring(0, 5) + '-' + cep.substring(5);
            const temCobertura = cepsAtendidos.includes(cepFormatado);

            console.log('CEP formatado:', cepFormatado);
            console.log('Tem cobertura:', temCobertura);

            // 4. Montar endereço completo
            const enderecoCompleto = `${enderecoData.logradouro}, ${enderecoData.bairro}, ${enderecoData.localidade} - ${enderecoData.uf}`;
            console.log('Endereço completo:', enderecoCompleto);

            // 5. Exibir resultado
            if (temCobertura) {
                console.log('Exibindo resultado de sucesso');
                // Tem cobertura
                showResult('success',
                    `<div class="result-text">
                        <i class="fas fa-check-circle"></i>
                        <strong>Ótima notícia!</strong> Temos cobertura na sua região.
                    </div>
                    <div class="result-address">
                        <i class="fas fa-map-marker-alt"></i>
                        ${enderecoCompleto}
                    </div>
                    <div class="result-action">
                        <a href="https://wa.me/5511969013333?text=Olá! Consultei meu CEP ${cepInput.value} (${enderecoCompleto}) e vocês têm cobertura. Gostaria de contratar um plano." target="_blank" class="btn-contact">
                            <i class="fab fa-whatsapp"></i>
                            Contratar agora
                        </a>
                    </div>`
                );
            } else {
                console.log('Exibindo resultado de sem cobertura');
                // Não tem cobertura
                showResult('error',
                    `<div class="result-text">
                        <i class="fas fa-times-circle"></i>
                        <strong>Ainda não temos cobertura</strong> na sua região.
                    </div>
                    <div class="result-address">
                        <i class="fas fa-map-marker-alt"></i>
                        ${enderecoCompleto}
                    </div>
                    <div class="result-action">
                        <a href="https://wa.me/5511969013333?text=Olá! Consultei meu CEP ${cepInput.value} (${enderecoCompleto}) e vocês ainda não têm cobertura. Gostaria de deixar meu contato para quando chegarem na região." target="_blank" class="btn-contact">
                            <i class="fab fa-whatsapp"></i>
                            Deixar contato
                        </a>
                    </div>`
                );
            }

        } catch (error) {
            console.error('Erro ao consultar CEP:', error);
            console.log('Exibindo resultado de erro');
            showResult('error',
                `<div class="result-text">
                    <i class="fas fa-exclamation-triangle"></i>
                    <strong>Erro:</strong> ${error.message}
                </div>
                <div class="result-action">
                    <a href="https://wa.me/5511969013333?text=Olá! Gostaria de consultar a cobertura para o CEP ${cepInput.value}. Podem me ajudar?" target="_blank" class="btn-contact">
                        <i class="fab fa-whatsapp"></i>
                        Falar com atendente
                    </a>
                </div>`
            );
        }
    });

    // Teste adicional - tentar submeter o formulário programaticamente
    console.log('Testando se o event listener foi adicionado...');

    // Adicionar também um listener de click no botão
    const submitButton = cepForm.querySelector('button[type="submit"]');
    console.log('Botão de submit encontrado:', submitButton);

    if (submitButton) {
        submitButton.addEventListener('click', function(e) {
            console.log('Botão de submit clicado!');
            // Forçar o submit do formulário
            console.log('Tentando forçar submit do formulário...');

            // Prevenir o comportamento padrão do botão
            e.preventDefault();

            // Disparar manualmente o evento de submit
            const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
            cepForm.dispatchEvent(submitEvent);
        });
    }

    // Adicionar listener diretamente no botão como backup
    const allButtons = cepForm.querySelectorAll('button');
    console.log('Todos os botões encontrados no form:', allButtons);

    allButtons.forEach((btn, index) => {
        console.log(`Botão ${index}:`, btn.type, btn.textContent);
        btn.addEventListener('click', function(e) {
            console.log(`Botão ${index} clicado! Tipo:`, btn.type);

            if (btn.type === 'submit' || btn.classList.contains('btn-search')) {
                console.log('Executando consulta de CEP diretamente...');
                e.preventDefault();

                // Executar a consulta diretamente
                consultarCep();
            }
        });
    });

    // Função para executar a consulta de CEP
    async function consultarCep() {
        console.log('=== INICIANDO CONSULTA DE CEP ===');

        const cep = cepInput.value.replace(/\D/g, '');
        console.log('CEP digitado:', cep);

        if (cep.length !== 8) {
            console.log('CEP inválido, mostrando erro');
            showResult('error', 'Por favor, digite um CEP válido com 8 dígitos.');
            return;
        }

        console.log('Iniciando consulta...');
        showResult('loading', 'Consultando cobertura...');

        try {
            // 1. Consultar dados do endereço via ViaCEP
            console.log('Consultando ViaCEP para CEP:', cep);
            const viaCepResponse = await fetch(`https://viacep.com.br/ws/${cep}/json/`);

            if (!viaCepResponse.ok) {
                console.error('Erro na resposta do ViaCEP:', viaCepResponse.status);
                throw new Error('Erro ao consultar dados do CEP');
            }

            const enderecoData = await viaCepResponse.json();
            console.log('Dados do ViaCEP:', enderecoData);

            if (enderecoData.erro) {
                console.error('CEP não encontrado no ViaCEP');
                throw new Error('CEP não encontrado');
            }

            // 2. Verificar cobertura usando lista embutida
            console.log('Verificando cobertura com lista embutida...');
            console.log('CEPs atendidos:', cepsAtendidos);

            // 3. Verificar se o CEP está na lista de atendidos
            const cepFormatado = cep.substring(0, 5) + '-' + cep.substring(5);
            const temCobertura = cepsAtendidos.includes(cepFormatado);

            console.log('CEP formatado:', cepFormatado);
            console.log('Tem cobertura:', temCobertura);

            // 4. Montar endereço completo
            const enderecoCompleto = `${enderecoData.logradouro}, ${enderecoData.bairro}, ${enderecoData.localidade} - ${enderecoData.uf}`;
            console.log('Endereço completo:', enderecoCompleto);

            // 5. Exibir resultado
            if (temCobertura) {
                console.log('Exibindo resultado de sucesso');
                showResult('success',
                    `<div class="result-text">
                        <i class="fas fa-check-circle"></i>
                        <strong>Ótima notícia!</strong> Temos cobertura na sua região.
                    </div>
                    <div class="result-address">
                        <i class="fas fa-map-marker-alt"></i>
                        ${enderecoCompleto}
                    </div>
                    <div class="result-action">
                        <a href="https://wa.me/5511969013333?text=Olá! Consultei meu CEP ${cepInput.value} (${enderecoCompleto}) e vocês têm cobertura. Gostaria de contratar um plano." target="_blank" class="btn-contact">
                            <i class="fab fa-whatsapp"></i>
                            Contratar agora
                        </a>
                    </div>`
                );
            } else {
                console.log('Exibindo resultado de sem cobertura');
                showResult('error',
                    `<div class="result-text">
                        <i class="fas fa-times-circle"></i>
                        <strong>Ainda não temos cobertura</strong> na sua região.
                    </div>
                    <div class="result-address">
                        <i class="fas fa-map-marker-alt"></i>
                        ${enderecoCompleto}
                    </div>
                    <div class="result-action">
                        <a href="https://wa.me/5511969013333?text=Olá! Consultei meu CEP ${cepInput.value} (${enderecoCompleto}) e vocês ainda não têm cobertura. Gostaria de deixar meu contato para quando chegarem na região." target="_blank" class="btn-contact">
                            <i class="fab fa-whatsapp"></i>
                            Deixar contato
                        </a>
                    </div>`
                );
            }

        } catch (error) {
            console.error('Erro ao consultar CEP:', error);
            console.log('Exibindo resultado de erro');
            showResult('error',
                `<div class="result-text">
                    <i class="fas fa-exclamation-triangle"></i>
                    <strong>Erro:</strong> ${error.message}
                </div>
                <div class="result-action">
                    <a href="https://wa.me/5511969013333?text=Olá! Gostaria de consultar a cobertura para o CEP ${cepInput.value}. Podem me ajudar?" target="_blank" class="btn-contact">
                        <i class="fab fa-whatsapp"></i>
                        Falar com atendente
                    </a>
                </div>`
            );
        }
    }
}

// Add typing effect to hero title
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    type();
}

// Funções para modal de canais
function closeChannelsModal() {
    const modal = document.getElementById('channelsModal');
    modal.classList.remove('active');
}

function openChannelsModal(imageName) {
    const modal = document.getElementById('channelsModal');
    const image = document.getElementById('channelsImage');

    image.src = `assets/${imageName}`;
    image.alt = `Lista de Canais - ${imageName}`;

    modal.classList.add('active');
    // O carousel agora é puramente CSS com animação infinita
    // Pausa a animação ao hover (já definido no CSS)
    console.log('Carousel infinito inicializado com sucesso!');

    // Opcional: adicionar controles manuais se necessário
    const prevBtn = document.querySelector('.features-bar .carousel-control.prev');
    const nextBtn = document.querySelector('.features-bar .carousel-control.next');

    if (prevBtn) {
        prevBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // Pausa temporariamente a animação
            featuresCarousel.style.animationPlayState = 'paused';
            setTimeout(() => {
                featuresCarousel.style.animationPlayState = 'running';
            }, 2000);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // Acelera temporariamente a animação
            featuresCarousel.style.animationDuration = '5s';
            setTimeout(() => {
                featuresCarousel.style.animationDuration = '15s';
            }, 1000);
        });
    }
    showSlide(0);
}

// Initialize typing effect when page loads
window.addEventListener('load', function() {
    const heroTitles = document.querySelectorAll('.hero-title');
    heroTitles.forEach(heroTitle => {
        const originalText = heroTitle.textContent;
        typeWriter(heroTitle, originalText, 40);
    });
});