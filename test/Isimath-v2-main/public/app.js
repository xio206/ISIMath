document.addEventListener('DOMContentLoaded', () => {
            // --- Selectores de Elementos ---
            const body = document.body;
            const themeToggleButton = document.getElementById('app__theme-toggle');
            const iconSun = document.querySelector('.app__icon-sun');
            const iconMoon = document.querySelector('.app__icon-moon');
            const navLinks = document.querySelectorAll('.app__nav-link');
            const mainContent = document.getElementById('app__main-content');
            const initialView = document.getElementById('app__initial-view');
            const calculoCards = document.getElementById('app__calculo-cards');
            const matricesCards = document.getElementById('app__matrices-cards');
            const rotatingSvgContainer = document.getElementById('app__rotating-svg-container');
            const allContentSections = document.querySelectorAll('.app__content-section');
            const breadcrumbs = document.getElementById('app__breadcrumbs');
            const logo = document.getElementById('app__logo');
            const mobileMenuBtn = document.getElementById('app__mobile-menu-btn');
            const mobileNav = document.getElementById('app__nav-mobile');
            const mobileCloseBtn = document.getElementById('app__mobile-close-btn');

            let currentSection = '';
            let currentTool = '';

            // --- Lógica del Tema (Oscuro/Claro) ---
            const applyTheme = (theme) => {
                if (theme === 'dark') {
                    document.body.classList.add('dark');
                    iconSun.classList.add('app__hidden');
                    iconMoon.classList.remove('app__hidden');
                } else {
                    document.body.classList.remove('dark');
                    iconSun.classList.remove('app__hidden');
                    iconMoon.classList.add('app__hidden');
                }
            };
            
            themeToggleButton.addEventListener('click', () => {
                const newTheme = body.classList.contains('dark') ? 'dark' : 'light';
                localStorage.setItem('theme', newTheme);
                applyTheme(newTheme);
            });

            const savedTheme = localStorage.getItem('theme') || 'light';
            applyTheme(savedTheme);

            // --- Lógica de Navegación ---
            
            const resetView = () => {
                initialView.classList.remove('app__hidden');
                calculoCards.classList.add('app__hidden');
                matricesCards.classList.add('app__hidden');
                rotatingSvgContainer.classList.add('app__hidden');
                allContentSections.forEach(sec => sec.classList.add('app__hidden'));
                mainContent.classList.remove('app__hidden');
                navLinks.forEach(l => l.classList.remove('active'));
                currentSection = '';
                currentTool = '';
                updateBreadcrumbs();
            };

            const updateBreadcrumbs = () => {
                let path = '';
                if (currentSection) {
                    path += ` / ${currentSection}`;
                }
                if (currentTool) {
                    path += ` / ${currentTool}`;
                }
                breadcrumbs.textContent = path;
            };

            logo.addEventListener('click', () => {
                document.location.href = "/index.html";
                console.log(document.location.href);
            });

            navLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    const section = e.target.dataset.section;
                    
                    resetView();
                    initialView.classList.add('app__hidden');
                    
                    navLinks.forEach(l => l.classList.remove('active'));
                    document.querySelectorAll(`.app__nav-link[data-section="${section}"]`).forEach(l => l.classList.add('active'));

                    if (section === 'calculo') {
                        calculoCards.classList.remove('app__hidden');
                        currentSection = 'Cálculo';
                    } else if (section === 'matrices') {
                        matricesCards.classList.remove('app__hidden');
                        currentSection = 'Matrices';
                    }
                    
                    rotatingSvgContainer.classList.remove('app__hidden');
                    updateBreadcrumbs();

                    mobileNav.classList.remove('open');
                });
            });

            const showToolContent = (targetId, toolName) => {
                initialView.classList.add('app__hidden');
                calculoCards.classList.add('app__hidden');
                matricesCards.classList.add('app__hidden');
                rotatingSvgContainer.classList.add('app__hidden');

                currentTool = toolName;
                updateBreadcrumbs();
                
                // Ocultar todas las secciones de contenido
                allContentSections.forEach(sec => sec.classList.add('app__hidden'));
                
                // Mostrar la sección correcta
                const targetSection = document.getElementById(`app__${targetId}-container`);
                if(targetSection) {
                    targetSection.classList.remove('app__hidden');
                }
            };

            // Delegación de eventos para las tarjetas
            document.getElementById('app__calculo-cards').addEventListener('click', (e) => {
                const card = e.target.closest('.app__card');
                if (card) {
                    const targetId = card.dataset.target;
                    const toolName = card.dataset.name;
                    showToolContent(targetId, toolName);
                }
            });

            document.getElementById('app__matrices-cards').addEventListener('click', (e) => {
                const card = e.target.closest('.app__card');
                if (card) {
                    const targetId = card.dataset.target;
                    const toolName = card.dataset.name;
                    showToolContent(targetId, toolName);
                }
            });

            // --- Lógica del Menú Móvil ---
            mobileMenuBtn.addEventListener('click', () => {
                mobileNav.classList.add('open');
            });

            mobileCloseBtn.addEventListener('click', () => {
                mobileNav.classList.remove('open');
            });




        });