// --- DRAG & DROP FOR PRICE SUMMARY CARD (HORIZONTAL ONLY) ---
    document.addEventListener('DOMContentLoaded', function () {
        const card = document.getElementById('price-summary-card');
        if (!card) return;
        let isDragging = false;
        let startX = 0;
        let startLeft = 0;
        let cardWidth = 0;
        let viewportWidth = 0;
        let snapMargin = 24; // px from edge to snap

        // Make card visible for drag
        card.style.transition = 'none';
        card.style.opacity = '1';
        card.style.visibility = 'visible';
        card.style.display = 'flex';

        // Initial position: bottom right
        function setInitialPosition() {
            viewportWidth = window.innerWidth;
            cardWidth = card.offsetWidth;
            card.style.left = '';
            card.style.right = '0px';
            card.style.bottom = '0px';
            card.style.top = '';
            // If snapped right, remove top-right radius
            card.style.borderTopLeftRadius = '0.75rem';
            card.style.borderTopRightRadius = '0';
        }
        setInitialPosition();

        // Drag logic
        card.addEventListener('mousedown', function (e) {
            if (e.button !== 0) return;
            isDragging = true;
            startX = e.clientX;
            startLeft = card.getBoundingClientRect().left;
            cardWidth = card.offsetWidth;
            viewportWidth = window.innerWidth;
            document.body.style.userSelect = 'none';
        });

        document.addEventListener('mousemove', function (e) {
            if (!isDragging) return;
            let deltaX = e.clientX - startX;
            let newLeft = startLeft + deltaX;
            // Clamp within viewport
            newLeft = Math.max(0, Math.min(newLeft, viewportWidth - cardWidth));
            card.style.left = newLeft + 'px';
            card.style.right = '';
            card.style.bottom = '0px';
            card.style.top = '';
            // Border radius: both top corners same unless snapped left/right
            if (newLeft < snapMargin) {
                card.style.borderTopLeftRadius = '0';
                card.style.borderTopRightRadius = '0.75rem';
            } else if (viewportWidth - (newLeft + cardWidth) < snapMargin) {
                card.style.borderTopLeftRadius = '0.75rem';
                card.style.borderTopRightRadius = '0';
            } else {
                card.style.borderTopLeftRadius = '0.75rem';
                card.style.borderTopRightRadius = '0.75rem';
            }
        });

        document.addEventListener('mouseup', function (e) {
            if (!isDragging) return;
            isDragging = false;
            document.body.style.userSelect = '';
            // Snap to left or right if close
            let left = card.getBoundingClientRect().left;
            if (left < snapMargin) {
                card.style.left = '0px';
                card.style.right = '';
                card.style.borderTopLeftRadius = '0';
                card.style.borderTopRightRadius = '0.75rem';
            } else if (left > viewportWidth - cardWidth - snapMargin) {
                card.style.left = '';
                card.style.right = '0px';
                card.style.borderTopLeftRadius = '0.75rem';
                card.style.borderTopRightRadius = '0';
            } else {
                card.style.borderTopLeftRadius = '0.75rem';
                card.style.borderTopRightRadius = '0.75rem';
            }
            // Always bottom
            card.style.bottom = '0px';
            card.style.top = '';
        });

        window.addEventListener('resize', setInitialPosition);
    });
        document.addEventListener('DOMContentLoaded', function () {
            // --- DATA ---
            const gameNames = ['GTA V', 'LoL', 'Dota 2', 'Overwatch 2', 'Minecraft', 'Rocket League', 'Need for Speed: Hot Pursuit Remastered', 'Need for Speed: Underground HD', 'Half Life: Black Mesa', 'Half Life 2 HD', 'Abe´s Oddysey Remake', 'WoW Classic: en TurtleWoW', 'Dishonored 2', 'Borderlands 2', 'Portal 1 y 2', 'Left 4 Dead 2', 'BioShock Remaster', 'BioShock 2 Remaster', 'BioShock Infinite', 'Fallout 3', 'Fallout: New Vegas', 'Batman: Arkham Asylum', 'Batman: Arkham City', 'Sleeping Dogs: Definitive Edition', 'Tomb Raider (2013)', 'Mass Effect Legendary Edition', 'Far Cry 3', 'Deus Ex: Human Revolution', 'Serious Sam Classics: Revolution', 'Burnout Paradise', 'DiRT 3 Complete Edition', 'Need for Speed: Underground 2 HD', 'Need for Speed: Most Wanted HD', 'Blur', 'GRID 2', 'GRID Autosport', 'F1 2014', 'FIFA 17', 'PES 2017', 'NBA 2K17', 'FallGuys', 'Sims 4 + Expansiones', 'Spore: Aventuras Galacticas', 'Roblox', 'Call of Duty: Black Ops', 'Call of Duty: Black Ops 2', 'Metro 2033', 'Crysis 2', 'Bulletstorm', 'Dishonored', 'Max Payne 3', 'Singularity', 'F.E.A.R.', 'Mortal Kombat 11 Komplete Edition', 'Ultra Street Fighter IV', 'Ultimate Marvel vs. Capcom 3', 'The King of Fighters XIII', 'Injustice Gods Among Us', 'Heroes of Might & Magic HD V', 'Reckoning: Kingdoms of Amalur', 'Divinity Original Sin', 'Age of Empires II Definitive Edition', 'The Elder Scrolls V: Skyrim', 'The Elder Scrolls IV: Oblivion & AddOns HD'];
            const softwareData = [
                // SISTEMA
                // { name: 'AVG AntiVirus', slug: 'avg_antivirus', checked: true, disabled: false, category: 'Sistema', descripcion: 'Antivirus gratuito y eficaz.' },
                // { name: 'Avast AntiVirus', slug: 'avast_antivirus', checked: false, disabled: false, category: 'Sistema', descripcion: 'Igual que AVG pero más molesto.' },
                // { name: 'BitDefender', slug: 'bitdefender', checked: false, disabled: false, category: 'Sistema', descripcion: 'Excelente antivirus. Requiere cuenta gratuita.' },
                { name: 'PeaZip', slug: 'pea', checked: true, disabled: false, category: 'Sistema', descripcion: 'El mejor des/compresor de archivos.' },
                { name: 'MalwareBytes', slug: 'malwarebytes', checked: true, disabled: false, category: 'Sistema', descripcion: 'Elimina malware y spyware. Complementa antivirus.' },
                { name: 'Firewall App Blocker', slug: 'firewall_app_blcoker', checked: false, disabled: false, category: 'Sistema', descripcion: 'Bloquea el acceso a internet de las aplicaciones elegidas.' },
                { name: 'Fraps', slug: 'fraps', checked: false, disabled: false, category: 'Juegos', descripcion: 'Captura pantalla y FPS. Para tunear juegos es fundamental.' },
                { name: 'AnyDesk', slug: 'anydesk', checked: true, disabled: false, category: 'Sistema', descripcion: 'Para manejar la PC remotamente - así soluciono problemas a distancia ;)' },
                // { name: 'Macrium Reflect', slug: 'macrium_reflect', checked: false, disabled: false, category: 'Sistema', descripcion: 'Clona y respalda discos.' },
                { name: 'Lightshot', slug: 'lightshot', checked: false, disabled: false, category: 'Sistema', descripcion: 'Toma capturas de pantalla prolijas. Fundamental si sos creador.' },
                { name: 'WinDirStat', slug: 'windirstat', checked: true, disabled: false, category: 'Sistema', descripcion: 'Visualiza qué te está ocupando lugar en disco.' },
                { name: 'Uninstall Tool', slug: 'uninstall_tool', checked: false, disabled: false, category: 'Sistema', descripcion: 'Desinstala programas a fondo.' },
                { name: 'Wise Memory Optimizer', slug: 'wise_memory_optimizer', checked: false, disabled: false, category: 'Sistema', descripcion: 'Libera y optimiza la RAM.' },
                // MULTIMEDIA
                { name: 'Hear', slug: 'hear', checked: false, disabled: false, category: 'Multimedia', descripcion: 'Mejora el audio del sistema. Alta configuración.' },
                { name: 'VLC Player', slug: 'vlc_player', checked: true, disabled: false, category: 'Multimedia', descripcion: 'Reproduce cualquier formato de video.' },
                { name: 'WinAmp', slug: 'winamp', checked: false, disabled: false, category: 'Multimedia', descripcion: 'Clásico reproductor de música, renovado por la comunidad.' },
                { name: 'YouTube', slug: 'youtube', checked: true, disabled: false, category: 'Multimedia', descripcion: 'YouTube *sin publicidad*.' },
                { name: 'Spotify', slug: 'spotify', checked: false, disabled: false, category: 'Multimedia', descripcion: 'Música en streaming.' },
                { name: 'Stremio', slug: 'stremio', checked: false, disabled: false, category: 'Multimedia', descripcion: 'Películas y series (p1r4tas) online.' },
                // WEB
                { name: 'Brave', slug: 'brave', checked: true, disabled: false, category: 'Web', descripcion: 'Navegador rápido y seguro basado en Chrome. Bloquea publicidad.' },
                { name: 'Opera GX', slug: 'opera_gx', checked: false, disabled: false, category: 'Web', descripcion: 'Navegador gamer personalizable. Bloquea publicidad.' },
                { name: 'Google Chrome', slug: 'google_chrome', checked: true, disabled: false, category: 'Web', descripcion: 'Navegador web popular.' },
                { name: 'WhatsApp', slug: 'whatsapp', checked: true, disabled: false, category: 'Web', descripcion: 'Mensajería instantánea.' },
                { name: 'Discord', slug: 'discord', checked: false, disabled: false, category: 'Web', descripcion: 'Chat de voz y texto para comunidades.' },
                { name: 'Zoom', slug: 'zoom', checked: false, disabled: false, category: 'Web', descripcion: 'Videollamadas y reuniones online.' },
                { name: 'Free Download Manager', slug: 'freedownloadmanager', checked: false, disabled: false, category: 'Web', descripcion: 'Gestor de descargas y torrents eficiente.' },
                { name: 'JDownloader', slug: 'jdownloader_2', checked: false, disabled: false, category: 'Web', descripcion: 'Descarga archivos de internet.' },
                { name: 'qBitTorrent', slug: 'qbittorrent', checked: false, disabled: false, category: 'Web', descripcion: 'Descarga archivos de internet.' },
                // CREACIÓN
                { name: 'Inkscape', slug: 'inkscape', checked: false, disabled: false, category: 'Creación', descripcion: 'Gráficos vectoriales. Ideal para diseñar logos profesionales.' },
                { name: 'Krita', slug: 'krita', checked: false, disabled: false, category: 'Creación', descripcion: 'Pintura y arte digital.' },
                { name: 'Photopea', slug: 'photopea', checked: false, disabled: false, category: 'Creación', descripcion: 'Clon de Photoshop online.' },
                { name: 'Canva', slug: 'canva', checked: true, disabled: false, category: 'Creación', descripcion: 'Diseño gráfico fácil.' },
                { name: 'XnConvert', slug: 'xnconvert', checked: false, disabled: false, category: 'Creación', descripcion: 'Conversión y mejora de imágenes por lotes.' },
                { name: 'Fast Stone Image', slug: 'faststone_image', checked: false, disabled: false, category: 'Creación', descripcion: 'Completísimo visualizador y retocador de imágenes.' },
                { name: 'CapCut', slug: 'capcut', checked: false, disabled: false, category: 'Creación', descripcion: 'Edición de video sencilla. OJO! Sin premium es muy limitado.' },
                { name: 'DaVinci Resolve', slug: 'davinci_resolve', checked: false, disabled: false, category: 'Creación', descripcion: 'Edición de video profesional.' },
                { name: 'OBS Studio', slug: 'obs_studio', checked: false, disabled: false, category: 'Creación', descripcion: 'Grabación y streaming.' },
                { name: 'StreamLabs', slug: 'slabs', checked: false, disabled: false, category: 'Creación', descripcion: 'Basado en OBS con facilidad de uso para streamear.' },
                { name: 'GitHub Desktop', slug: 'github_desktop', checked: false, disabled: false, category: 'Desarrollo', descripcion: 'Cliente visual para Git.' },
                { name: 'Visual Studio Code', slug: 'visual_studio_code', checked: false, disabled: false, category: 'Desarrollo', descripcion: 'Editor de código moderno.' },
                { name: 'n8n', slug: 'n8n', checked: false, disabled: false, category: 'Desarrollo', descripcion: 'Agentes de IA en local para automatizar lo-que-sea.' },
                // JUEGOS
                { name: 'Steam', slug: 'steam', checked: true, disabled: false, category: 'Juegos', descripcion: 'La plataforma de juegos de PC más grande.' },
                { name: 'Epic Games', slug: 'epic_games', checked: false, disabled: false, category: 'Juegos', descripcion: 'Ofrece juegos gratis cada semana.' },
                { name: 'EA App', slug: 'ea_app', checked: false, disabled: false, category: 'Juegos', descripcion: 'Lanzador para juegos de Electronic Arts.' },
                { name: 'Battle.net', slug: 'battlenet', checked: false, disabled: false, category: 'Juegos', descripcion: 'Plataforma para juegos de Blizzard.' },
                { name: 'GOG Galaxy', slug: 'gog_galaxy', checked: false, disabled: false, category: 'Juegos', descripcion: 'Lanzador para juegos sin DRM.' },
            ];
            const toSlug = (str) => str.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/[ ​‌‍‎‏﻿  ​‌‍‎‏﻿]+/g, '-').replace(/^-+|-+$/g, '');
            const games = gameNames.map(name => ({ name: name, slug: toSlug(name) }));

            // --- GLOBAL APP STATE ---
            const GAIN_PRICE = 110000;
            let BASE_PRICE = 0;
            let allDolarRates = [];
            let currentTowerIndex = 0;
            let currentBaseLevel = 1; // Default to Nivel II

            // --- NEW: Centralized state for selected component indices ---
            let selectedComponentIndices = {
                gpu: 0,
                ssd: 0,
                psu: 0
            };

            // Component Options
            let baseOptions = [], cpuOptions = [], ramOptions = [], motherboardOptions = [],
                towersOptions = [], ssdOptions = [], gpuOptions = [], psuOptions = [],
                comboMouseTecladoOptions = [], keyboardOptions = [], mouseOptions = [],
                monitorOptions = [], auricularesOptions = [], parlantesOptions = [],
                microfonosOptions = [], webcamOptions = [], arosDeLuzOptions = [], wifiOptions = [],
                joystickOptions = [];

            // NEW: State for optional peripherals
            const selectedPeripherals = {
                monitor: -1, keyboard: -1, mouse: -1, joystick: -1, auriculares: -1,
                parlantes: -1, microfono: -1, webcam: -1, wifi: -1
            };

            const selectedAccessories = {
                arodeluz: -1
            };

            // --- INITIALIZE ---
            function initializeApp(data) {
                baseOptions = (data.baseOptions || []).filter(opt => opt.visible !== 0);
                cpuOptions = data.cpuOptions || [];
                ramOptions = data.ramOptions || [];
                motherboardOptions = data.motherboardOptions || [];
                towersOptions = (data.towersOptions || []).filter(opt => opt.visible !== 0);
                ssdOptions = (data.ssdOptions || []).filter(opt => opt.visible !== 0);
                gpuOptions = (data.gpuOptions || []).filter(opt => opt.visible !== 0);
                psuOptions = (data.psuOptions || []).filter(opt => opt.visible !== 0);
                keyboardOptions = (data.keyboardOptions || []).filter(opt => opt.visible !== 0);
                mouseOptions = (data.mouseOptions || []).filter(opt => opt.visible !== 0);
                joystickOptions = (data.joystickOptions || []).filter(opt => opt.visible !== 0);
                monitorOptions = (data.monitorOptions || []).filter(opt => opt.visible !== 0);
                auricularesOptions = (data.auricularesOptions || []).filter(opt => opt.visible !== 0);
                parlantesOptions = (data.parlantesOptions || []).filter(opt => opt.visible !== 0);
                microfonosOptions = (data.microfonosOptions || []).filter(opt => opt.visible !== 0);
                webcamOptions = (data.webcamOptions || []).filter(opt => opt.visible !== 0);
                arosDeLuzOptions = (data.arosDeLuzOptions || []).filter(opt => opt.visible !== 0);
                wifiOptions = (data.wifiOptions || []).filter(opt => opt.visible !== 0);

                updateBasePrice();
                fetchDolarRate();
                populateUI();
                setupEventListeners();
                updateAllDisplays();
            }

            fetch('products.json')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    initializeApp(data);
                })
                .catch(error => {
                    console.error('Failed to load products.json, using fallback data:', error);

                    initializeApp(fallbackData);
                });


            function populateUI() {
                // Populate game list
                const gameListContainer = document.getElementById('game-list');
                games.forEach(game => {
                    const imageSrc = `cover/${game.slug}.webp`;
                    const cardEl = document.createElement('div');
                    cardEl.className = 'card-game';
                    cardEl.id = `card-game-${game.slug}`;
                    cardEl.innerHTML = `
                        <input type="checkbox" id="game-${game.slug}" name="game" value="${game.name}" data-img-src="${imageSrc}" class="hidden">
                        <label for="game-${game.slug}" class="rounded-xl cursor-pointer transition">
                            <img src="${imageSrc}" alt="Carátula de ${game.name}" class="rounded-xl w-full h-full object-cover" onerror="this.onerror=null;this.src='https://placehold.co/300x400/111827/4f46e5?text=${game.name.replace(/\s/g, '+')}';">
                            <div class="game-title-sticker hidden">${game.name}</div>
                        </label>`;
                    gameListContainer.appendChild(cardEl);
                });

                // Populate software list
                const softwareCategories = [
                    { name: 'Juegos', description: 'Plataformas y lanzadores para acceder a tu biblioteca de juegos.', icon: 'fa-gamepad' },
                    { name: 'Sistema', description: 'Herramientas para mantener, optimizar y proteger tu PC.', icon: 'fa-shield-alt' },
                    { name: 'Multimedia', description: 'Reproductores, audio y apps para disfrutar de música y video.', icon: 'fa-photo-film' },
                    { name: 'Web', description: 'Navegadores, mensajería y gestores de descargas.', icon: 'fa-globe' },
                    { name: 'Creación', description: 'Edición de imágenes, video, diseño y herramientas para creadores.', icon: 'fa-paint-brush' },
                    { name: 'Desarrollo', description: 'Herramientas para programar, editar código y gestionar proyectos.', icon: 'fa-code' },
                ];
                const softwareListContainer = document.getElementById('software-list');
                softwareListContainer.innerHTML = '';
                softwareCategories.forEach((category, idx) => {
                    const categoryWrapper = document.createElement('div');
                    categoryWrapper.className = 'mb-4 border border-violet-700 rounded-lg overflow-hidden';
                    // Header clickable
                    const header = document.createElement('button');
                    header.type = 'button';
                    header.className = 'w-full flex items-center justify-between px-4 py-3 bg-violet-950 hover:bg-violet-900 transition font-bold text-lg text-violet-400 focus:outline-none';
                    header.innerHTML = `<span class="flex items-center gap-2"><i class="fas ${category.icon} text-violet-300 text-xl"></i> ${category.name}</span><span class="accordion-arrow text-violet-300 transition-transform"><i class="fas fa-chevron-down"></i></span>`;
                    categoryWrapper.appendChild(header);
                    // Descripción
                    const descDiv = document.createElement('div');
                    descDiv.className = 'software-cat-desc px-4 py-2 text-base text-violet-100 bg-[#1a1332]';
                    descDiv.textContent = category.description;
                    categoryWrapper.appendChild(descDiv);
                    // Items (ocultos por defecto)
                    const itemsWrapper = document.createElement('div');
                    itemsWrapper.className = 'grid grid-cols-2 mt-3 md:grid-cols-3 gap-4 px-4 pb-4 hidden';
                    const programs = softwareData.filter(item => item.category === category.name);
                    programs.forEach(item => {
                        const essentialClass = item.disabled ? 'essential-software' : '';
                        const disabledClass = item.disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer';
                        const labelColorClass = item.disabled ? 'green-333' : 'text-white';
                        const softwareItemHTML = document.createElement('div');
                        softwareItemHTML.className = `relative bg-gray-800 p-3 rounded-lg flex items-center ${disabledClass} ${essentialClass}`;
                        const customCheckbox = document.createElement('div');
                        customCheckbox.className = 'custom-software-checkbox';
                        customCheckbox.dataset.slug = item.slug;
                        if (item.checked) {
                            customCheckbox.classList.add('checked');
                        }
                        const span = document.createElement('span');
                        span.className = `ml-3 text-sm font-medium ${labelColorClass}`;
                        span.textContent = item.name;
                        softwareItemHTML.appendChild(customCheckbox);
                        softwareItemHTML.appendChild(span);
                        softwareItemHTML.addEventListener('mouseenter', () => { descDiv.textContent = `${item.name}: ${item.descripcion}`; });
                        softwareItemHTML.addEventListener('mouseleave', () => { descDiv.textContent = category.description; });
                        softwareItemHTML.addEventListener('click', () => {
                            if (!item.disabled) {
                                customCheckbox.classList.toggle('checked');
                            }
                        });
                        itemsWrapper.appendChild(softwareItemHTML);
                    });
                    categoryWrapper.appendChild(itemsWrapper);

                    const toggleAccordion = () => {
                        const isOpen = !itemsWrapper.classList.contains('hidden');

                        // Close all other accordions first
                        document.querySelectorAll('#software-list .mb-4').forEach(wrapper => {
                            const otherItems = wrapper.querySelector('.grid');
                            if (otherItems && otherItems !== itemsWrapper) {
                                otherItems.classList.add('hidden');
                                const otherHeader = wrapper.querySelector('button');
                                if (otherHeader && otherHeader.querySelector('.accordion-arrow')) {
                                    otherHeader.querySelector('.accordion-arrow').style.transform = '';
                                }
                            }
                        });

                        // Then toggle the current one
                        if (isOpen) {
                            itemsWrapper.classList.add('hidden');
                            header.querySelector('.accordion-arrow').style.transform = '';
                        } else {
                            itemsWrapper.classList.remove('hidden');
                            header.querySelector('.accordion-arrow').style.transform = 'rotate(180deg)';
                        }
                    };

                    header.addEventListener('click', toggleAccordion);
                    descDiv.addEventListener('click', toggleAccordion);

                    softwareListContainer.appendChild(categoryWrapper);
                });

                // --- REFACTORED: Populate component selects using index as value ---
                const ssdSelect = document.getElementById('ssd-select');
                if (ssdSelect) ssdSelect.innerHTML = ssdOptions.map((o, i) => `<option value="${i}">${o.name}</option>`).join('');

                const gpuSelect = document.getElementById('gpu-select');
                if (gpuSelect) gpuSelect.innerHTML = gpuOptions.map((o, i) => `<option value="${i}">${o.name}</option>`).join('');
                
                const psuSelect = document.getElementById('psu-select');
                if (psuSelect) psuSelect.innerHTML = psuOptions.map((o, i) => `<option value="${i}">${o.name}</option>`).join('');

                populateOptionalPeripherals();
                populateOptionalAccessories();
            }

            function setupEventListeners() {
                // Base Level Selector
                document.querySelectorAll('.base-level-tab').forEach(tab => {
                    tab.addEventListener('click', () => {
                        document.querySelectorAll('.base-level-tab').forEach(t => t.classList.remove('active'));
                        tab.classList.add('active');
                        currentBaseLevel = parseInt(tab.dataset.level);
                        updateBaseDisplay();
                        updateBasePrice();
                        updatePrices();
                        updateSliderPosition();
                    });
                });

                // --- REFACTORED: Component Selects event listeners ---
                document.getElementById('gpu-select')?.addEventListener('change', (e) => {
                    const newIndex = parseInt(e.target.value);
                    selectedComponentIndices.gpu = newIndex;
                    updateComponentDisplay('gpu');
                    
                    // NEW: Sync range slider
                    const gpuRangeSlider = document.getElementById('gpu-range-slider');
                    if (gpuRangeSlider) {
                        gpuRangeSlider.value = newIndex;
                        updateGpuSliderFill(gpuRangeSlider);
                    }
                });
                document.getElementById('ssd-select')?.addEventListener('change', (e) => {
                    selectedComponentIndices.ssd = parseInt(e.target.value);
                    updateComponentDisplay('ssd');
                });
                document.getElementById('psu-select')?.addEventListener('change', (e) => {
                    selectedComponentIndices.psu = parseInt(e.target.value);
                    updateComponentDisplay('psu');
                });

                // NEW: GPU Slider event listener
                document.getElementById('gpu-range-slider')?.addEventListener('input', (e) => {
                    const newIndex = parseInt(e.target.value);
                    const gpuSelect = document.getElementById('gpu-select');
                    // Update select only if value is different to avoid redundant event triggers
                    if (gpuSelect.value != newIndex) {
                        gpuSelect.value = newIndex;
                        // Manually trigger the 'change' event on the select dropdown
                        gpuSelect.dispatchEvent(new Event('change'));
                    }
                    updateGpuSliderFill(e.target);
                });

                // Tower navigation
                document.getElementById('prev-tower').addEventListener('click', prevTower);
                document.getElementById('next-tower').addEventListener('click', nextTower);

                // Peripherals and Accessories Grid Listeners
                document.getElementById('peripherals-grid').addEventListener('click', handlePeripheralClick);
                document.getElementById('accessories-grid').addEventListener('click', handleAccessoryClick);


                // Summary Section Listener
                document.getElementById('selected-components-preview').addEventListener('click', handleSummaryCardClick);


                // Games
                document.querySelectorAll('input[name="game"]').forEach(checkbox => {
                    checkbox.addEventListener('change', handleGameSelectionChange);
                });
                document.getElementById('load-more-games').addEventListener('click', expandGameGrid);
                document.getElementById('reset-selection-btn').addEventListener('click', resetGameSelection);

                // Form submission
                document.getElementById('orderForm').addEventListener('submit', handleFormSubmit);

                // Dolar Popup
                const dolarTriggers = ['usd-link-top', 'usd-price-display-top', 'usd-link-bottom', 'total-price-usd', 'usd-link-summary', 'total-price-summary-usd'];
                dolarTriggers.forEach(id => document.getElementById(id)?.addEventListener('click', (e) => { e.preventDefault(); showDolarPopup(); }));
                const dolarPopup = document.getElementById('dolar-popup');
                dolarPopup.addEventListener('click', (e) => { if (e.target === dolarPopup) dolarPopup.style.display = 'none'; });

                // NEW: Image click to open link
                const imageLinkMap = {
                    'base-image': () => {
                        const base = baseOptions[currentBaseLevel];
                        const cpu = cpuOptions.find(c => String(c.id) === String(base.cpu));
                        return cpu?.link;
                    },
                    'current-tower-image': () => towersOptions[currentTowerIndex]?.link,
                    'gpu-image': () => gpuOptions[selectedComponentIndices.gpu]?.link,
                    'ssd-image': () => ssdOptions[selectedComponentIndices.ssd]?.link,
                    'psu-image': () => psuOptions[selectedComponentIndices.psu]?.link,
                };

                Object.keys(imageLinkMap).forEach(id => {
                    const imgEl = document.getElementById(id);
                    imgEl?.addEventListener('click', (e) => {
                        // Prevent click if user is clicking a link inside the component description
                        if (e.target.closest('a')) return;
                        
                        const link = imageLinkMap[id]();
                        if (link) {
                            window.open(link, '_blank');
                        }
                    });
                });


                

                                // Price card & WhatsApp: robust scroll-based visibility
                                // Requirement: visible when the viewport is between #section-bases and #section-software
                                // (i.e., show starting when section-bases enters, keep visible until section-software is reached).
                                // Use a mid-point check and rAF throttle so visibility reliably reappears when scrolling back up.
                                const basesSection = document.getElementById('section-bases');
                                const softwareSection = document.getElementById('section-software');
                                const resumenSection = document.getElementById('resumen');
                                const whatsappFloatEl = document.getElementById('whatsapp-float');
                                const priceCardEl = document.getElementById('price-summary-card');

                                function setVisible(state) {
                                    if (!priceCardEl) return;
                                    priceCardEl.classList.toggle('visible', state);
                                    if (whatsappFloatEl) whatsappFloatEl.classList.toggle('visible', state);
                                }

                                // If any of the required sections are missing, bail
                                if (basesSection && softwareSection) {
                                    let ticking = false;

                                    function checkVisibility() {
                                        ticking = false;
                                        const vh = window.innerHeight || document.documentElement.clientHeight;
                                        // Use viewport midpoint as a stable reference
                                        const midY = window.scrollY + (vh / 2);

                                        const basesRect = basesSection.getBoundingClientRect();
                                        const basesTop = window.scrollY + basesRect.top;
                                        const basesBottom = basesTop + basesRect.height;

                                        const softwareRect = softwareSection.getBoundingClientRect();
                                        const softwareTop = window.scrollY + softwareRect.top;
                                        // Show when midY is >= basesTop and < softwareTop
                                        const shouldShow = (midY >= basesTop) && (midY < softwareTop);
                                        setVisible(shouldShow);
                                    }

                                    function onScrollOrResize() {
                                        if (!ticking) {
                                            ticking = true;
                                            requestAnimationFrame(checkVisibility);
                                        }
                                    }

                                    window.addEventListener('scroll', onScrollOrResize, { passive: true });
                                    window.addEventListener('resize', onScrollOrResize);

                                    // Run once to initialize state
                                    checkVisibility();
                                } else {
                                    // Fallback: if sections don't exist, ensure price card is visible by default
                                    setVisible(true);
                                }

                // Window resize
                window.addEventListener('resize', () => {
                    setInitialGridHeight();
                    updateSliderPosition();
                });
                // AI Section Listener
                document.getElementById('ai-button').addEventListener('click', checkGameCompatibility);
                // Permitir Enter en el input para analizar
                document.getElementById('ai-input').addEventListener('keydown', function (e) {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        document.getElementById('ai-button').click();
                    }
                });
            }

            function updateAllDisplays() {
                updateBaseDisplay();
                updateTowerDisplay();
                updateComponentDisplay('gpu');
                updateComponentDisplay('ssd');
                updateComponentDisplay('psu');
                
                // NEW: Update slider on init
                const gpuRangeSlider = document.getElementById('gpu-range-slider');
                if (gpuRangeSlider) {
                    gpuRangeSlider.max = gpuOptions.length > 0 ? gpuOptions.length - 1 : 0;
                    gpuRangeSlider.value = selectedComponentIndices.gpu;
                    updateGpuSliderFill(gpuRangeSlider);
                }

                updateSelectedGamesList();
                setInitialGridHeight();
                updatePrices();
                updateSliderPosition();
            }

            function updateBasePrice() {
                if (baseOptions.length > currentBaseLevel) {
                    BASE_PRICE = baseOptions[currentBaseLevel].total + GAIN_PRICE;
                } else {
                    console.error("Selected base level is out of bounds.");
                    BASE_PRICE = GAIN_PRICE; // Fallback
                }
            }

            // --- PRICE CALCULATION ---
            function updatePrices() {
                let total = BASE_PRICE;

                // --- REFACTORED: Get prices from selected indices ---
                total += gpuOptions[selectedComponentIndices.gpu]?.price || 0;
                total += ssdOptions[selectedComponentIndices.ssd]?.price || 0;
                total += psuOptions[selectedComponentIndices.psu]?.price || 0;
                if (towersOptions.length > 0) total += towersOptions[currentTowerIndex].price;

                // Add prices from selected peripherals
                const peripheralCollections = {
                    monitor: monitorOptions, keyboard: keyboardOptions, mouse: mouseOptions, joystick: joystickOptions,
                    auriculares: auricularesOptions, parlantes: parlantesOptions, microfono: microfonosOptions,
                    webcam: webcamOptions, wifi: wifiOptions
                };

                for (const key in selectedPeripherals) {
                    if (selectedPeripherals[key] > -1) {
                        total += peripheralCollections[key][selectedPeripherals[key]].price;
                    }
                }

                const accessoryCollections = {
                    arodeluz: arosDeLuzOptions
                };

                for (const key in selectedAccessories) {
                    if (selectedAccessories[key] > -1) {
                        total += accessoryCollections[key][selectedAccessories[key]].price;
                    }
                }

                const formattedArs = '$' + total.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
                document.getElementById('total-price').textContent = formattedArs;
                document.getElementById('top-total-price').textContent = formattedArs;
                document.getElementById('total-price-summary-ars').textContent = formattedArs;

                updateSelectedComponentsDisplay();
            }

            async function fetchDolarRate() {
                try {
                    const response = await fetch('https://dolarapi.com/v1/dolares');
                    if (!response.ok) throw new Error('Network response was not ok for Dolar rates');
                    allDolarRates = await response.json();
                } catch (error) {
                    console.error("Could not fetch exchange rate:", error);
                    allDolarRates = [];
                }
            }

            // --- UI UPDATE FUNCTIONS ---
            function updateBaseDisplay() {
                if (typeof baseOptions === 'undefined' || baseOptions.length <= currentBaseLevel) return;
                const base = baseOptions[currentBaseLevel];
                const cpu = cpuOptions && cpuOptions.find(c => String(c.id) === String(base.cpu));
                const ram = ramOptions && ramOptions.find(c => String(c.id) === String(base.ram));
                const motherboard = motherboardOptions && motherboardOptions.find(c => String(c.id) === String(base.mother));

                if (cpu && ram && motherboard) {
                    // CPU
                    const cpuNameParts = cpu.name.split(' ');
                    document.getElementById('base-cpu-text').innerHTML = `<b>${cpuNameParts.slice(0, 2).join(' ')}</b> ${cpuNameParts.slice(2).join(' ')} <a href="${cpu.link}" target="_blank" style="color: var(--color-link); margin-left:8px;"><i class="fas text-sm fa-external-link-alt"></i></a>`;
                    // RAM: solo muestra la cantidad total de RAM de la base seleccionada
                    document.getElementById('base-ram-text').innerHTML = `<span class="text-green-333"><strong>${base.totalram} GB</strong> de RAM</span> <a href="${ram.link}" target="_blank" style="color: var(--color-link); margin-left:8px;"><i class="fas text-sm fa-external-link-alt"></i></a>`;
                    // Motherboard
                    document.getElementById('base-motherboard-text').innerHTML = `Mother <small>${motherboard.name}</small> <a href="${motherboard.link}" target="_blank" style="color: var(--color-link); margin-left:8px;"><i class="fas text-sm fa-external-link-alt"></i></a>`;
                    // Descripción desde el JSON
                    document.getElementById('base-description-text').innerHTML = base.description || '';
                    // Imagen
                    loadComponentImage(document.getElementById('base-image'), `comps/${base.id}.webp`);
                    updateBaseSummaryText(cpu, ram, base);
                }
            }


            function updateTowerDisplay() {
                if (towersOptions.length === 0) return;
                const selectedTower = towersOptions[currentTowerIndex];
                const towerImgPath = selectedTower.id ? `comps/${selectedTower.id}.webp` : 'comps/63462.webp';
                loadComponentImage(document.getElementById('current-tower-image'), towerImgPath);
                
                document.getElementById('current-tower-name').textContent = selectedTower.name;
                let towerPriceHTML = '';
                if (selectedTower.price === 0) {
                    // Sin link, solo precio $0
                    towerPriceHTML = `<span class="component-link" style="color: var(--color-link);">$0</span>`;
                } else if (selectedTower.link) {
                    const priceFull = selectedTower.price > 0 ? `$${selectedTower.price.toLocaleString('es-AR')} ` : '';
                    towerPriceHTML = `<a href="${selectedTower.link}" target="_blank" class="component-link">${priceFull} <i class="fas fa-external-link-alt"></i></a>`;
                }
                document.getElementById('current-tower-price-display').innerHTML = towerPriceHTML;
                updatePrices();
            }

            // --- REFACTORED: Single function to update component display ---
           function updateComponentDisplay(componentKey) {
                const config = {
                    gpu: { descEl: document.getElementById('gpu-description'), imageEl: document.getElementById('gpu-image'), options: gpuOptions },
                    ssd: { descEl: document.getElementById('ssd-description'), imageEl: document.getElementById('ssd-image'), options: ssdOptions },
                    psu: { descEl: document.getElementById('psu-description'), imageEl: document.getElementById('psu-image'), options: psuOptions }
                };

                const { descEl, imageEl, options } = config[componentKey];
                const selectedIndex = selectedComponentIndices[componentKey];
                const selectedOption = options[selectedIndex];

                if (selectedOption) {
                    if (descEl) {
                        let linkHTML = '';
                        if (selectedOption.link) {
                            const priceFull = selectedOption.price > 0 ? `$${selectedOption.price.toLocaleString('es-AR')} ` : '';
                            linkHTML = `<a href="${selectedOption.link}" target="_blank" class="component-link block">${priceFull}<i class="fas fa-external-link-alt"></i></a>`;
                        }
                        descEl.innerHTML = selectedOption.description + linkHTML;
                    }
                    if (imageEl) {
                         loadComponentImage(imageEl, `comps/${selectedOption.id}.webp`);
                    }

                    if (componentKey === 'gpu') {
                        const gpuLi = document.getElementById('gpu-li');
                        if (selectedIndex === 0) { // Assuming "Integrada" is always the first option
                            imageEl.classList.add('md:block', 'hidden');
                            gpuLi.classList.add('gpu-integrated-mobile');
                        } else {
                            imageEl.classList.remove('md:block', 'hidden');
                            gpuLi.classList.remove('gpu-integrated-mobile');
                        }
                    }
                }
                updatePrices();
            }


            function updateSelectedComponentsDisplay() {
                const container = document.getElementById('selected-components-preview');
                if (!container) return;
                container.innerHTML = ''; // Clear previous content

                // Create main grid for cabinet and table
                const summaryGrid = document.createElement('div');
                summaryGrid.className = 'flex flex-col md:flex-row gap-8 items-start';

                // Left side: Cabinet
                const cabinetContainer = document.createElement('div');
                cabinetContainer.className = 'w-full md:w-1/3 flex-shrink-0 flex flex-col items-center -mt-8';
                // Responsive negative top margin for md and up
                cabinetContainer.style.marginTop = '-2rem'; // default for mobile
                cabinetContainer.classList.add('cabinet-summary-responsive');
                // Will be overridden by media query for md screens
                // Add this style block for responsive negative margin
                const style = document.createElement('style');
                style.innerHTML = `@media (min-width: 768px) { .cabinet-summary-responsive { margin-top: -8.5rem !important; } }`;
                document.head.appendChild(style);
                const selectedTower = towersOptions[currentTowerIndex];
                if (selectedTower) {
                    const towerImgPath = selectedTower.id ? `comps/${selectedTower.id}.webp` : 'comps/reciclada.webp';
                    cabinetContainer.innerHTML = `
                        <a href="#main-components-container" class="block">
                            <img src="${towerImgPath}" alt="${selectedTower.name}" style="width: 313px; height: 430px; object-fit: contain;position:relative;top:20px" class="rounded-lg mb-2" onerror="this.onerror=null;this.src='comps/63462.webp'">
                        </a>
                        <p class="font-bold text-lg text-white">${selectedTower.name}</p>
                        <a href="${selectedTower.link}" target="_blank" class="component-link">$${selectedTower.price.toLocaleString('es-AR')} <i class="fas fa-external-link-alt"></i></a>
                    `;
                }
                summaryGrid.appendChild(cabinetContainer);

                // Right side: Table
                const tableContainer = document.createElement('div');
                tableContainer.className = 'w-full md:w-2/3';
                // Nuevo: contenedores tipo card-row
                const cardRowsContainer = document.createElement('div');
                cardRowsContainer.className = 'flex flex-col gap-2 w-full';

                // Add base as the first item in the summary
                const base = baseOptions[currentBaseLevel];
                const baseSummary = { type: 'Base', selected: base };

                const components = [baseSummary,
                    { type: 'Gráfica', selected: gpuOptions[selectedComponentIndices.gpu] },
                    { type: 'Almacenamiento', selected: ssdOptions[selectedComponentIndices.ssd] },
                    { type: 'Fuente', selected: psuOptions[selectedComponentIndices.psu] }
                ];

                const peripheralMap = {
                    monitor: { options: monitorOptions, name: 'Monitor' }, keyboard: { options: keyboardOptions, name: 'Teclado' },
                    mouse: { options: mouseOptions, name: 'Mouse' }, joystick: { options: joystickOptions, name: 'Joystick' },
                    auriculares: { options: auricularesOptions, name: 'Auriculares' },
                    parlantes: { options: parlantesOptions, name: 'Parlantes' }, microfono: { options: microfonosOptions, name: 'Micrófono' },
                    webcam: { options: webcamOptions, name: 'Webcam' }, wifi: { options: wifiOptions, name: 'WiFi' }
                };

                for (const key in selectedPeripherals) {
                    if (selectedPeripherals[key] > -1) {
                        const item = peripheralMap[key].options[selectedPeripherals[key]];
                        components.push({ type: peripheralMap[key].name, selected: item });
                    }
                }

                const accessoryMap = {
                    arodeluz: { options: arosDeLuzOptions, name: 'Aro de Luz' }
                };

                for (const key in selectedAccessories) {
                    if (selectedAccessories[key] > -1) {
                        const item = accessoryMap[key].options[selectedAccessories[key]];
                        components.push({ type: accessoryMap[key].name, selected: item });
                    }
                }


                function createCardRow(type, selected, isService = false) {
                    const row = document.createElement('div');
                    row.className = 'card-row flex flex-col gap-1 p-2 rounded-lg bg-gray-800 border-b border-gray-700';
                    // Título arriba
                    const title = document.createElement('span');
                    title.className = 'font-bold text-green-400 px-2 py-1 rounded mb-1';
                    title.style.background = '#18122b';
                    title.style.display = 'block';
                    title.style.textAlign = 'left';
                    title.style.marginLeft = '-18px';
                    title.style.fontFamily = 'Inter, sans-serif';
                    title.textContent = type;
                    row.appendChild(title);
                    // Contenido: nombre y precio alineados horizontalmente
                    const contentRow = document.createElement('div');
                    contentRow.className = 'flex flex-row items-center justify-between w-full';
                    contentRow.style.fontFamily = 'Inter, sans-serif';
                    const nameEl = document.createElement('span');
                    nameEl.className = '';
                    if (!isService && selected?.name) {
                        // Map type to section id
                        let sectionId = null;
                        if (type === 'Base') sectionId = 'section-bases';
                        else if (type === 'Gráfica') sectionId = 'gpu-select';
                        else if (type === 'Almacenamiento') sectionId = 'ssd-select';
                        else if (type === 'Fuente') sectionId = 'psu-select';
                        else if (Object.values(peripheralMap).some(p => p.name === type)) sectionId = 'section-peripherals';
                        else if (Object.values(accessoryMap).some(a => a.name === type)) sectionId = 'section-accessories';

                        if (sectionId) {
                            nameEl.innerHTML = `<a href="#${sectionId}" class="component-link" style="font-size:1rem;color:white !important;font-family:Inter,sans-serif !important;" onclick="event.preventDefault();document.getElementById('${sectionId}').scrollIntoView({behavior:'smooth'});">${selected.name}</a>`;
                        } else {
                            nameEl.style.color = 'white';
                            nameEl.style.fontFamily = 'Inter, sans-serif';
                            nameEl.textContent = selected.name;
                        }
                    } else {
                        nameEl.textContent = isService ? 'Instalación y Soporte Técnico' : (selected?.name || '');
                        nameEl.style.fontFamily = 'Inter, sans-serif';
                    }
                    const priceEl = document.createElement('span');
                    // All prices use --color-link and Inter font
                    priceEl.style.color = 'var(--color-link)';
                    priceEl.style.fontFamily = 'Inter, sans-serif';
                    priceEl.style.fontWeight = 'bold';
                    if (isService) {
                        priceEl.textContent = `$${GAIN_PRICE.toLocaleString('es-AR')}`;
                    } else {
                        // For base, always show price and make it clickable to scroll to #section-bases
                        if (type === 'Base' && selected?.total > 0) {
                            priceEl.innerHTML = `<a href="#section-bases" class="component-link" style="color:var(--color-link);font-family:Inter,sans-serif;font-weight:bold;" onclick="event.preventDefault();document.getElementById('section-bases').scrollIntoView({behavior:'smooth'});">$${selected.total.toLocaleString('es-AR')}</a>`;
                        } else if (selected?.price > 0) {
                            if (selected?.link) {
                                priceEl.innerHTML = `<a href="${selected.link}" target="_blank" class="component-link" style="color:var(--color-link);font-family:Inter,sans-serif;font-weight:bold;">$${selected.price.toLocaleString('es-AR')} <i class="fas fa-external-link-alt"></i></a>`;
                            } else {
                                priceEl.innerHTML = `<span style="color:var(--color-link);font-family:Inter,sans-serif;font-weight:bold;">$${selected.price.toLocaleString('es-AR')}</span>`;
                            }
                        } else {
                            priceEl.textContent = 'Incluida';
                        }
                    }
                    contentRow.appendChild(nameEl);
                    contentRow.appendChild(priceEl);
                    row.appendChild(contentRow);
                    return row;
                }

                components.forEach(comp => {
                    if (comp.selected) {
                        cardRowsContainer.appendChild(createCardRow(comp.type, comp.selected));
                    }
                });
                // Armado y Servicio
                cardRowsContainer.appendChild(createCardRow('Mi Servicio', null, true));

                tableContainer.appendChild(cardRowsContainer);
                summaryGrid.appendChild(tableContainer);
                container.appendChild(summaryGrid);
                // Agregar span de licencia Windows 11 Original
                const licenciaSpan = document.createElement('span');
                licenciaSpan.className = 'flex items-center justify-end w-full mt-2 text-blue-400 text-sm font-semibold';
                licenciaSpan.innerHTML = `<svg xmlns='http://www.w3.org/2000/svg' class='inline-block mr-2' width='20' height='20' fill='currentColor' viewBox='0 0 24 24'><rect x='3' y='3' width='7' height='7' rx='1.5'/><rect x='14' y='3' width='7' height='7' rx='1.5'/><rect x='14' y='14' width='7' height='7' rx='1.5'/><rect x='3' y='14' width='7' height='7' rx='1.5'/></svg>Incluye Licencia Windows 11`;
                container.appendChild(licenciaSpan);
            }

            // --- NEW PERIPHERAL FUNCTIONS ---
            function populateOptionalPeripherals() {
                const grid = document.getElementById('peripherals-grid');
                grid.innerHTML = '';
                const peripheralCategories = [
                    { key: 'monitor', name: 'Monitor', options: monitorOptions },
                    { key: 'keyboard', name: 'Teclado', options: keyboardOptions },
                    { key: 'mouse', name: 'Mouse', options: mouseOptions },
                    { key: 'joystick', name: 'Joystick', options: joystickOptions },
                    { key: 'auriculares', name: 'Auriculares', options: auricularesOptions },
                    { key: 'parlantes', name: 'Parlantes', options: parlantesOptions },
                    { key: 'microfono', name: 'Micrófono', options: microfonosOptions },
                    { key: 'webcam', name: 'Webcam', options: webcamOptions },
                    { key: 'wifi', name: 'Wireless', options: wifiOptions }
                ];

                peripheralCategories.forEach(cat => {
                    if (cat.options.length > 0) {
                        const container = document.createElement('div');
                        container.className = 'peripheral-container';
                        container.dataset.category = cat.key;
                        container.innerHTML = `
                            <div class="summary-card unselected">
                                <div class="summary-card-image-wrapper">
                                   <img src="comps/${cat.options[0].id}.webp" alt="${cat.name}" onerror="this.onerror=null;this.src='https://placehold.co/240x190/ffffff/333333?text=${cat.name}'">
                                </div>
                            </div>
                            <div class="peripheral-info">
                                <p class="peripheral-name text-white">${cat.name}</p>
                                <div class="peripheral-price-container"><p class="component-link">&nbsp;</p></div>
                            </div>`;
                        grid.appendChild(container);
                    }
                });
            }

            function populateOptionalAccessories() {
                const grid = document.getElementById('accessories-grid');
                grid.innerHTML = '';
                const accessoryCategories = [
                    { key: 'arodeluz', name: 'Luces', options: arosDeLuzOptions }
                ];

                accessoryCategories.forEach(cat => {
                    if (cat.options.length > 0) {
                        const container = document.createElement('div');
                        container.className = 'peripheral-container';
                        container.dataset.category = cat.key;
                        container.innerHTML = `
                            <div class="summary-card unselected">
                                <div class="summary-card-image-wrapper">
                                   <img src="comps/${cat.options[0].id}.webp" alt="${cat.name}" onerror="this.onerror=null;this.src='https://placehold.co/240x190/ffffff/333333?text=${cat.name}'">
                                </div>
                            </div>
                            <div class="peripheral-info">
                                <p class="peripheral-name text-white">${cat.name}</p>
                                <div class="peripheral-price-container"><p class="component-link">&nbsp;</p></div>
                            </div>`;
                        grid.appendChild(container);
                    }
                });
            }

            function handlePeripheralClick(e) {
                const container = e.target.closest('.peripheral-container');
                if (!container || !e.target.closest('.summary-card-image-wrapper')) return;

                const category = container.dataset.category;
                if (!category) return;

                const collections = {
                    monitor: monitorOptions, keyboard: keyboardOptions, mouse: mouseOptions, joystick: joystickOptions,
                    auriculares: auricularesOptions, parlantes: parlantesOptions, microfono: microfonosOptions,
                    webcam: webcamOptions, wifi: wifiOptions
                };
                const options = collections[category];

                let currentIndex = selectedPeripherals[category];

                currentIndex++;
                if (currentIndex >= options.length) {
                    currentIndex = -1; // Cycle back to unselected
                }
                selectedPeripherals[category] = currentIndex;

                const mainCardContainer = document.querySelector(`#peripherals-grid .peripheral-container[data-category="${category}"]`);
                if (mainCardContainer) {
                    mainCardContainer.classList.toggle('selected', currentIndex > -1);
                    updatePeripheralCard(mainCardContainer, currentIndex, options);
                }

                updatePrices();
            }

            function handleAccessoryClick(e) {
                const container = e.target.closest('.peripheral-container');
                if (!container || !e.target.closest('.summary-card-image-wrapper')) return;

                const category = container.dataset.category;
                if (!category) return;

                const collections = {
                    arodeluz: arosDeLuzOptions
                };
                const options = collections[category];

                let currentIndex = selectedAccessories[category];

                currentIndex++;
                if (currentIndex >= options.length) {
                    currentIndex = -1; // Cycle back to unselected
                }
                selectedAccessories[category] = currentIndex;

                const mainCardContainer = document.querySelector(`#accessories-grid .peripheral-container[data-category="${category}"]`);
                if (mainCardContainer) {
                    mainCardContainer.classList.toggle('selected', currentIndex > -1);
                    updatePeripheralCard(mainCardContainer, currentIndex, options);
                }

                updatePrices();
            }

            function handleSummaryCardClick(e) {
                const link = e.target.closest('a');
                if (!link) return;

                const href = link.getAttribute('href') || '';
                // If it's an internal anchor, prevent default and perform custom scroll/highlight
                if (href.startsWith('#')) {
                    e.preventDefault();
                    const anchor = href;
                    let selectId = null;
                    let targetId = anchor.replace('#', '');
                    if (anchor === '#gpu-select') selectId = 'gpu-select';
                    else if (anchor === '#ssd-select') selectId = 'ssd-select';
                    else if (anchor === '#psu-select') selectId = 'psu-select';
                    else if (anchor === '#section-bases') selectId = 'base-level-select';
                    // Custom scroll: center element with margin
                    const targetEl = document.getElementById(targetId);
                    if (targetEl) {
                        const rect = targetEl.getBoundingClientRect();
                        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                        const windowHeight = window.innerHeight;
                        const targetY = rect.top + scrollTop - (windowHeight / 2) + (rect.height / 2);
                        window.scrollTo({ top: targetY, behavior: 'smooth' });
                    }
                    // Highlight select after scroll
                    if (selectId) {
                        setTimeout(() => {
                            const select = document.getElementById(selectId);
                            if (select) {
                                select.classList.add('select-glow-violet');
                                setTimeout(() => {
                                    select.classList.remove('select-glow-violet');
                                }, 5000);
                            }
                        }, 500); // Wait for scroll animation
                    }
                    return;
                }

                // For external links, do nothing: allow the anchor's href/target to open normally.
                // This ensures links with target="_blank" open once via native browser behavior.
            }


            function updatePeripheralCard(container, index, options) {
                const card = container.querySelector('.summary-card');
                const img = container.querySelector('img');
                const info = container.querySelector('.peripheral-info');
                const nameEl = info.querySelector('.peripheral-name');
                const priceContainer = info.querySelector('.peripheral-price-container');
                let newImageSrc = '';

                // This function will be called after the new image is loaded and visible
                const updateTextCallback = () => {
                    if (index === -1) {
                        card.classList.add('unselected');
                        nameEl.textContent = container.dataset.category.charAt(0).toUpperCase() + container.dataset.category.slice(1);
                        priceContainer.innerHTML = `<p class="component-link">&nbsp;</p>`;
                    } else {
                        card.classList.remove('unselected');
                        const item = options[index];
                        nameEl.textContent = item.name;
                        let priceHTML = '&nbsp;';
                        if (item.price > 0 && item.link) {
                            priceHTML = `<a href="${item.link}" target="_blank" class="component-link" onclick="event.stopPropagation()">$${item.price.toLocaleString('es-AR')} <i class="fas fa-external-link-alt"></i></a>`;
                        } else if (item.price > 0) {
                            priceHTML = `<span class="component-link" style="color: var(--color-link);">$${item.price.toLocaleString('es-AR')}</span>`;
                        }
                        priceContainer.innerHTML = priceHTML;
                    }
                };

                // Determine the new image source before calling the loader
                if (index === -1) {
                    newImageSrc = `comps/${options[0].id}.webp`;
                } else {
                    const item = options[index];
                    newImageSrc = `comps/${item.id}.webp`;
                }
                
                // Call the loader with the callback
                loadComponentImage(img, newImageSrc, updateTextCallback);
            }


            // --- EVENT HANDLERS & HELPERS ---
            function prevTower() {
                currentTowerIndex = (currentTowerIndex - 1 + towersOptions.length) % towersOptions.length;
                updateTowerDisplay();
            }

            function nextTower() {
                currentTowerIndex = (currentTowerIndex + 1) % towersOptions.length;
                updateTowerDisplay();
            }

            let errorToastTimeout;
            let consecutiveErrorClicks = 0;
            function showErrorToast(message) {
                const errorToast = document.getElementById('error-toast');
                const errorToastMessage = document.getElementById('error-toast-message');
                const resetSelectionBtn = document.getElementById('reset-selection-btn');
                clearTimeout(errorToastTimeout);
                errorToast.classList.remove('show');
                setTimeout(() => {
                    errorToastMessage.textContent = message;
                    if (consecutiveErrorClicks >= 2) resetSelectionBtn.classList.remove('hidden');
                    errorToast.classList.add('show');
                    errorToastTimeout = setTimeout(() => {
                        errorToast.classList.remove('show');
                        resetSelectionBtn.classList.add('hidden');
                    }, 4000);
                }, 150);
            }

            function handleGameSelectionChange(e) {
                if (e.target.checked && document.querySelectorAll('input[name="game"]:checked').length > 3) {
                    e.target.checked = false;
                    consecutiveErrorClicks++;
                    showErrorToast('MAX 3 Juegos Incluidos');
                    return;
                }
                consecutiveErrorClicks = 0;
                clearTimeout(errorToastTimeout);
                document.getElementById('error-toast').classList.remove('show');

                const sticker = e.target.nextElementSibling.querySelector('.game-title-sticker');
                if (e.target.checked) {
                    sticker.style.top = `${Math.floor(Math.random() * 50) + 15}%`;
                    sticker.style.left = `${Math.floor(Math.random() * 40) + 10}%`;
                    sticker.style.transform = `rotate(${Math.floor(Math.random() * 20) - 10}deg)`;
                    sticker.classList.remove('hidden');
                } else {
                    sticker.classList.add('hidden');
                }
                updateSelectedGamesList();
            }

            function updateSelectedGamesList() {
                // const selectedCheckboxes = document.querySelectorAll('input[name="game"]:checked');
                // const listEl = document.getElementById('selected-games-list');
                // const sectionEl = document.getElementById('selected-games-section');
                // listEl.innerHTML = '';
                // if (selectedCheckboxes.length > 0) {
                //     sectionEl.classList.remove('hidden');
                //     selectedCheckboxes.forEach(cb => {
                //         listEl.innerHTML += `<div class="w-1/4 md:w-1/5 p-1"><a href="#card-game-${toSlug(cb.value)}"><img src="${cb.dataset.imgSrc}" alt="Carátula de ${cb.value}" class="rounded-md shadow-lg w-full h-full object-cover" onerror="this.onerror=null;this.src='https://placehold.co/300x400/111827/4f46e5?text=${cb.value.replace(/\s/g, '+')}';"></a></div>`;
                //     });
                // } else {
                //     sectionEl.classList.add('hidden');
                // }
            }

            function resetGameSelection() {
                // document.querySelectorAll('input[name="game"]:checked').forEach(cb => {
                //     cb.checked = false;
                //     cb.nextElementSibling.querySelector('.game-title-sticker').classList.add('hidden');
                // });
                // updateSelectedGamesList();
                // document.getElementById('error-toast').classList.remove('show');
                // consecutiveErrorClicks = 0;
            }

            let isGridExpanded = false;
            function expandGameGrid() {
                document.getElementById('game-grid-wrapper').style.maxHeight = `${document.getElementById('game-list').scrollHeight}px`;
                document.getElementById('load-more-games').classList.add('hidden');
                document.getElementById('no-more-games').classList.remove('hidden');
                const overlay = document.getElementById('load-more-overlay');
                overlay.style.opacity = '0';
                overlay.style.pointerEvents = 'none';
                isGridExpanded = true;
            }

            function setInitialGridHeight() {
                const gameListContainer = document.getElementById('game-list');
                const allGameCards = Array.from(gameListContainer.children);
                if (isGridExpanded || !allGameCards.length) return;
                const cardHeight = allGameCards[0].offsetHeight;
                if (cardHeight === 0) { setTimeout(setInitialGridHeight, 100); return; }
                const gridGap = parseInt(window.getComputedStyle(gameListContainer).getPropertyValue('grid-row-gap')) || 24;
                const rowHeight = cardHeight + gridGap;
                const teaserHeight = rowHeight / 2;
                const targetHeight = (6 * rowHeight) - gridGap + teaserHeight;
                document.getElementById('game-grid-wrapper').style.maxHeight = `${targetHeight}px`;
            }

            function showDolarPopup() {
                if (allDolarRates.length === 0) return;
                const dolarRatesList = document.getElementById('dolar-rates-list');
                dolarRatesList.innerHTML = '';
                const tiposPermitidos = [{ key: 'oficial', label: 'Oficial' }, { key: 'blue', label: 'Blue' }, { key: 'cripto', label: 'Cripto' }];
                let total = parseInt(document.getElementById('total-price').textContent.replace(/[$|.]/g, ''));

                tiposPermitidos.forEach(tipo => {
                    const rate = allDolarRates.find(r => r.nombre.toLowerCase().includes(tipo.key));
                    if (!rate) return;
                    const precioEnDolar = rate.venta ? (total / rate.venta).toFixed(0) : '-';
                    dolarRatesList.innerHTML += `<div class="flex flex-col gap-1 mb-3 border-b border-gray-700/50 pb-2 dolar-rate-item"><span class="font-bold text-gray-300 dolar-name">${tipo.label}</span><div class="text-right"><span class="text-gray-400">Compra: </span><span class="font-mono text-green-400">$${rate.compra}</span><br><span class="text-gray-400">Venta: </span><span class="font-mono text-green-400">$${rate.venta}</span></div><div class="font-saira text-violet-400 font-bold text-lg text-center mt-1">serían $${precioEnDolar} USD</div></div>`;
                });
                document.getElementById('google-link').href = `https://www.google.com/search?q=${total}+ars+to+usd`;
                document.getElementById('dolar-popup').style.display = 'flex';
            }

            // ================== NEW AI FUNCTION (CORRECTED) ==================
            async function checkGameCompatibility() {
                const gameName = document.getElementById('ai-input').value.trim();
                const button = document.getElementById('ai-button');
                const resultContainer = document.getElementById('ai-result');
                const placeholder = document.getElementById('ai-placeholder');
                const loader = document.getElementById('ai-loader');

                if (!gameName) {
                    alert("Por favor, ingresá el nombre de un juego.");
                    return;
                }

                // --- 1. Gather component data (now using indices) ---
                const baseConfig = baseOptions[currentBaseLevel];
                const cpu = cpuOptions.find(c => String(c.id) === String(baseConfig.cpu));
                const totalRam = baseConfig.totalram;
                const selectedGpu = gpuOptions[selectedComponentIndices.gpu];
                const selectedSsd = ssdOptions[selectedComponentIndices.ssd];

                // --- 2. Show loading state ---
                button.disabled = true;
                button.querySelector('span').textContent = 'Analizando...';
                placeholder.classList.add('hidden');
                resultContainer.innerHTML = ''; // Clear previous results
                loader.classList.remove('hidden');

                // --- 3. Call local API route ---
                try {
                    const response = await fetch('/api/analyze', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            gameName,
                            components: {
                                cpu,
                                totalRam,
                                selectedGpu,
                                selectedSsd
                            },
                            availableGpus: gpuOptions,
                            availableCpus: cpuOptions
                        })
                    });

                    if (!response.ok) {
                        const errorBody = await response.json();
                        console.error("API Error Response:", errorBody);
                        throw new Error(`Error de API: ${response.status} ${response.statusText}`);
                    }

                    const data = await response.json();
                    let text = data.result || '';
                    // Limpieza de saltos de línea extra
                    // text = text.trim(); // quita saltos al inicio y final
                    // Elimina cualquier salto de línea antes del primer punto numerado
                    text = text.replace(/^\s*\n*(\d+\.)/, '$1');

                    // Highlight CPU and GPU names with green rounded span and link
                    let htmlResult = text
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
                        .replace(/\*(.*?)\*/g, '<em>$1</em>')     // Italic
                        .replace(/(\d+\.)/g, '<br><strong>$1</strong>') // Numbered list items
                        .replace(/\n/g, '<br>');

                    // Get current CPU and GPU names
                    const cpuName = cpuOptions[selectedComponentIndices.cpu]?.name || cpuOptions.find(c => String(c.id) === String(baseOptions[currentBaseLevel].cpu))?.name;
                    const gpuName = gpuOptions[selectedComponentIndices.gpu]?.name;

                    // Replace CPU name with highlighted span and selection logic
                    if (cpuName) {
                        const cpuRegex = new RegExp(cpuName.replace(/[.*+?^${}()|[\\]/g, '\$&'), 'gi');
                        htmlResult = htmlResult.replace(cpuRegex, `<span class='green-333 font-saira px-2 py-1 rounded-lg cursor-pointer inline-block' style='background:#18122b;' data-component-type='cpu' data-component-name='${cpuName}'>${cpuName}</span>`);
                    }
                    // Highlight all GPU names from the collection that appear in the AI response
                    if (gpuOptions && gpuOptions.length > 0) {
                        // Helper para normalizar nombres
                        function normalize(str) {
                            return str.toLowerCase().replace(/\s|\-|_/g, '');
                        }
                        // Construir lista de keywords (sin deduplicar), excluyendo 'integrada'
                        let allKeywords = [];
                        gpuOptions.forEach(gpu => {
                            if (normalize(gpu.name) === 'integrada') return; // No resaltar 'integrada'
                            allKeywords.push(gpu.name);
                            if (gpu.name.includes('-')) {
                                allKeywords.push(gpu.name.split('-')[0].trim());
                            }
                        });
                        // Reemplazo global con regex que permite espacios, guiones y números
                        allKeywords.forEach(keyword => {
                            // Escapar correctamente y permitir coincidencias completas
                            const escaped = keyword.replace(/[.*+?^${}()|[\\]/g, '\\$&');
                            // Coincidencia: palabra completa, no parte de otra palabra
                            const regex = new RegExp(`(?<![\\w\\d])${escaped}(?![\\w\\d])`, 'gi');
                            htmlResult = htmlResult.replace(regex, match => {
                                // Buscar el objeto GPU original para el nombre
                                const norm = normalize(match);
                                const gpuObj = gpuOptions.find(g => normalize(g.name) === norm || normalize(g.name.split('-')[0]) === norm);
                                const gpuNameForSpan = gpuObj ? gpuObj.name : match;
                                return `<span class='green-333 font-saira px-2 py-1 rounded-lg cursor-pointer inline-block' style='background:#18122b;' data-component-type='gpu' data-component-name='${gpuNameForSpan}'>${match}</span>`;
                            });
                        });
                    }

                    // Add event listeners to highlighted spans for selection and scroll
                    setTimeout(() => {
                        document.querySelectorAll('#ai-result span[data-component-type]').forEach(span => {
                            span.onclick = function () {
                                const type = span.getAttribute('data-component-type');
                                const name = span.getAttribute('data-component-name');
                                if (type === 'gpu') {
                                    const select = document.getElementById('gpu-select');
                                    if (select) {
                                        for (let i = 0; i < select.options.length; i++) {
                                            if (select.options[i].textContent.trim().toLowerCase().includes(name.trim().toLowerCase())) {
                                                select.selectedIndex = i;
                                                select.dispatchEvent(new Event('change'));
                                                break;
                                            }
                                        }
                                        document.getElementById('component-list').scrollIntoView({ behavior: 'smooth' });
                                        // Add glow effect
                                        select.classList.add('select-glow-violet');
                                        setTimeout(() => {
                                            select.classList.remove('select-glow-violet');
                                        }, 5000);
                                    }
                                } else if (type === 'cpu') {
                                    document.getElementById('section-bases').scrollIntoView({ behavior: 'smooth' });
                                    // Opcional: si tienes un select de CPU, puedes agregar lógica similar aquí
                                }
                            };
                        });
                    }, 100);
                    // Elimina el primer <br> si existe
                    htmlResult = htmlResult.replace(/^<br\s*\/?>/, '');
                    resultContainer.innerHTML = htmlResult;

                } catch (error) {
                    console.error("Error al llamar a la API local:", error);
                    resultContainer.innerHTML = `<p class="text-red-400">¡Ups! Hubo un error al contactar a la IA. Verificá la consola (F12) para más detalles.</p>`;
                } finally {
                    loader.classList.add('hidden');
                    button.disabled = false;
                    button.querySelector('span').textContent = 'Analizar';
                }
            }

            function handleFormSubmit(e) {
                e.preventDefault();
                const selectedGames = Array.from(document.querySelectorAll('input[name="game"]:checked')).map(cb => cb.value);
                const selectedSoftware = Array.from(document.querySelectorAll('.custom-software-checkbox.checked')).map(cb => softwareData.find(s => s.slug === cb.dataset.slug)?.name).filter(Boolean);
                const extraNotes = document.getElementById('extra-notes').value;

                // --- REFACTORED: Get component names from selected indices ---
                const selectedGpuName = gpuOptions[selectedComponentIndices.gpu].name;
                const selectedSsdName = ssdOptions[selectedComponentIndices.ssd].name;
                const selectedPsuName = psuOptions[selectedComponentIndices.psu].name;

                let message = `¡Hola, me interesa esta Nave del Medio!\n\n`;
                message += `*Torre:* ${towersOptions[currentTowerIndex].name}\n`;
                message += `*Almacenamiento:* ${selectedSsdName}\n`;
                message += `*Gráfica:* ${selectedGpuName}\n`;
                message += `*Fuente:* ${selectedPsuName}\n`;

                let peripheralsMessage = '';
                const peripheralMap = {
                    monitor: { options: monitorOptions, name: 'Monitor' },
                    keyboard: { options: keyboardOptions, name: 'Teclado' },
                    mouse: { options: mouseOptions, name: 'Mouse' },
                    joystick: { options: joystickOptions, name: 'Joystick' },
                    auriculares: { options: auricularesOptions, name: 'Auriculares' },
                    parlantes: { options: parlantesOptions, name: 'Parlantes' },
                    microfono: { options: microfonosOptions, name: 'Micrófono' },
                    webcam: { options: webcamOptions, name: 'Webcam' },
                    wifi: { options: wifiOptions, name: 'WiFi' }
                };
                for (const key in selectedPeripherals) {
                    if (selectedPeripherals[key] > -1) {
                        const item = peripheralMap[key].options[selectedPeripherals[key]];
                        peripheralsMessage += `${peripheralsMessage ? ', ' : ''}${item.name}`;
                    }
                }
                if (peripheralsMessage) message += `*Periféricos:* ${peripheralsMessage}\n`;

                let accessoriesMessage = '';
                const accessoryMap = {
                    arodeluz: { options: arosDeLuzOptions, name: 'Aro de Luz' }
                };
                for (const key in selectedAccessories) {
                    if (selectedAccessories[key] > -1) {
                        const item = accessoryMap[key].options[selectedAccessories[key]];
                        accessoriesMessage += `${accessoriesMessage ? ', ' : ''}${item.name}`;
                    }
                }
                if (accessoriesMessage) message += `*Accesorios:* ${accessoriesMessage}\n`;


                if (selectedGames.length > 0) message += `*Juegos:* ${selectedGames.join(', ')}\n`;
                if (selectedSoftware.length > 0) {
                    message += `*Programas:*
`;
                    ['Juegos', 'Sistema', 'Multimedia', 'Web', 'Creación', 'Desarrollo'].forEach(cat => {
                        const programs = selectedSoftware.filter(name => softwareData.find(p => p.name === name)?.category === cat);
                        if (programs.length > 0) message += `- ${cat}: ${programs.join(', ')}\n`;
                    });
                }
                if (extraNotes.trim() !== '') message += `*Notas:* ${extraNotes}\n`;

                message += `\nPrecio Total: ${document.getElementById('top-total-price').textContent}`;
                message += `\n¡Quedo a la espera de tu respuesta!`;
                window.open(`https://wa.me/5492252513233?text=${encodeURIComponent(message)}`, '_blank');
            }

            // --- NEW: Enhanced Image Loader Function ---
            function loadComponentImage(imageElement, newSrc, onLoadCallback) {
                if (!imageElement) return;
                // If the element has no src yet, keep it hidden until a valid image is set
                if (!imageElement.getAttribute('src') || imageElement.getAttribute('src') === '') {
                    imageElement.style.visibility = 'hidden';
                }

                if (imageElement.src && imageElement.src.includes(newSrc.split('/').pop())) {
                    if (onLoadCallback) onLoadCallback();
                    return;
                }

                imageElement.classList.add('image-loading-effect');

                const tempImage = new Image();
                tempImage.src = newSrc;

                tempImage.onload = () => {
                    imageElement.style.opacity = '0';

                    setTimeout(() => {
                        imageElement.src = newSrc;
                        // ensure the element is visible once a real src is assigned
                        imageElement.style.visibility = '';
                        imageElement.classList.remove('image-loading-effect');
                        imageElement.style.opacity = '1';
                        if (onLoadCallback) onLoadCallback();
                    }, 300); // Duration should match CSS transition duration
                };

                tempImage.onerror = () => {
                    console.error(`Failed to load image: ${newSrc}`);
                    imageElement.classList.remove('image-loading-effect');
                    // keep hidden if image fails to load (avoid broken icon)
                    imageElement.style.visibility = 'hidden';
                    if (onLoadCallback) onLoadCallback();
                };
            }

            // --- NEW: Function to update GPU Slider UI ---
            function updateGpuSliderFill(slider) {
                if (!slider) return;
                const min = slider.min ? parseInt(slider.min) : 0;
                const max = slider.max ? parseInt(slider.max) : 1;
                const val = slider.value ? parseInt(slider.value) : 0;
                // Ensure max is not less than min to avoid division by zero or negative percentages
                const percentage = (max > min) ? ((val - min) * 100) / (max - min) : 0;
                slider.style.setProperty('--fill-percent', `${percentage}%`);
            }


            function updateSliderPosition() {
                const slider = document.getElementById('base-level-slider');
                const activeTab = document.querySelector('.base-level-tab.active');
                if (slider && activeTab) {
                    slider.style.width = `${activeTab.offsetWidth}px`;
                    slider.style.left = `${activeTab.offsetLeft}px`;
                }
            }
        
        
            function updateBaseSummaryText(cpu, ram, base) {
                const summaryEl = document.getElementById('base-summary-text');
                if (summaryEl && base) {
                    // Use same style as other component names: white, not underlined, font-saira
                    summaryEl.innerHTML = `<span class='font-saira green-333' style='font-size:1.6rem;'>${base.name}</span>`;
                    const basePriceEl = document.getElementById('base-price-text');
                    if (basePriceEl) {
                        basePriceEl.innerHTML = `<a href='#section-bases' class='component-link text-blue-400 font-bold' style='font-size:1.15rem;display:inline-flex;align-items:center;text-decoration:none;' onclick="event.preventDefault();document.getElementById('section-bases').scrollIntoView({behavior:'smooth'});">$${base.total.toLocaleString('es-AR')} <i class='fas text-sm fa-external-link-alt ml-1'></i></a>`;
                    }
                }
            }
        });
const words = ["USAR", "JUGAR", "CREAR", "VOLAR"];
                            let current = 0;
                            const el = document.getElementById("dynamic-word");
                            const maxLen = Math.max(...words.map(w => w.length));
                            el.style.width = `${maxLen}ch`;
                            el.style.display = "inline-block";
                            el.style.textAlign = "center";
                            setInterval(() => {
                                el.style.opacity = "0.2";
                                setTimeout(() => {
                                    current = (current + 1) % words.length;
                                    el.textContent = words[current];
                                    el.style.opacity = "1";
                                }, 350);
                            }, 2300);


// === Edit Mode  ===
(function () {
  const NS = '__laNaveEditMode_v1';
  if (window[NS]) return; // evita dobles inclusiones
  window[NS] = { enabled: false };

  function log(...args) { console.log('[EDIT MODE]', ...args); }

  function removeLinksAndIcons() {
    // Guardamos hrefs en data-_href por si querés restaurar luego
    document.querySelectorAll('#selected-components-preview a').forEach(a => {
      if (a.hasAttribute('href')) {
        a.dataset._href = a.getAttribute('href');
        a.removeAttribute('href');
        a.dataset.onclick = a.getAttribute('onclick') || '';
        a.removeAttribute('onclick');
      }
    });
    // Quitamos iconos de "external link" visibles
    document.querySelectorAll('#selected-components-preview i.fa-external-link-alt, #component-list i.fa-external-link-alt, .card-row i.fa-external-link-alt').forEach(i => i.remove());
  }

  function restoreLinks() {
    document.querySelectorAll('[data-_href]').forEach(el => {
      el.setAttribute('href', el.dataset._href);
      el.setAttribute('onclick', el.dataset._onclick);
      delete el.dataset._href;
    });
    // Notar: los íconos removidos no se recrean automáticamente.
  }

  function enableEditor() {
    if (window[NS].enabled) return;
    window[NS].enabled = true;
    log('activado');
    removeLinksAndIcons();
    document.documentElement.classList.add('la-nave-edit-mode');
  }

  function disableEditor() {
    if (!window[NS].enabled) return;
    window[NS].enabled = false;
    log('desactivado');
    restoreLinks();
    document.documentElement.classList.remove('la-nave-edit-mode');
  }

  function createFloatingImage(src) {
    const img = document.createElement('img');
    img.src = src;
    img.style.position = 'absolute';
    img.style.width = '200px';
    img.style.pointerEvents = 'auto'; // para detectar clic derecho en la imagen
    img.style.zIndex = 9999;
    img.style.left = '0px';
    img.style.top = '0px';
    document.body.appendChild(img);

    const moveHandler = (ev) => {
      // posiciono la esquina superior izquierda en el cursor (si querés lo centro, ajusto offsets)
      img.style.left = ev.pageX + 'px';
      img.style.top = ev.pageY + 'px';
    };
    document.addEventListener('mousemove', moveHandler);

    // eliminar con clic derecho
    img.addEventListener('contextmenu', (ev) => {
      ev.preventDefault();
      img.remove();
      document.removeEventListener('mousemove', moveHandler);
      log('imagen flotante eliminada');
    });

    log('imagen flotante creada', src);
    return img;
  }

  function setupClickToCreate(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    container.addEventListener('click', (e) => {
      if (!window[NS].enabled) return;
      // buscamos el card/row clickeado (adapta selectores si tu markup cambia)
      const clickTarget = e.target.closest('li, .card-row, .peripheral-container, .summary-card, .component-content-wrapper, .peripheral-info');
      if (!clickTarget) return;

      // preferimos una img dentro del elemento; si no, buscamos img dentro del row
      const imgEl = clickTarget.querySelector('img') || clickTarget.querySelector('picture img') || clickTarget.querySelector('img[onerror]');
      if (!imgEl || !imgEl.src) return;

      createFloatingImage(imgEl.src);
    });
  }

  function init() {
    const summaryTitle = document.getElementById('summary-title');
    const componentList = document.getElementById('component-list');
    const summaryPreview = document.getElementById('selected-components-preview');

    if (summaryTitle) {
      summaryTitle.addEventListener('dblclick', () => {
        if (window[NS].enabled) disableEditor(); else enableEditor();
      });
    } else {
      log('warning: #summary-title no encontrado en el DOM en init()');
    }

    // Registramos clicks en ambos contenedores relevantes (lista de componentes y resumen)
    setupClickToCreate('#component-list');
    setupClickToCreate('#selected-components-preview');
    setupClickToCreate('#peripherals-grid');
    setupClickToCreate('#accessories-grid');

    // Si el resumen se reconstruye dinámicamente, nos aseguramos de re-aplicar la remoción de links
    if (summaryPreview) {
      const mo = new MutationObserver(() => {
        if (window[NS].enabled) removeLinksAndIcons();
      });
      mo.observe(summaryPreview, { childList: true, subtree: true });
    }

    // Si la URL tiene ?edit activamos el modo editor automáticamente
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.has('edit')) {
        enableEditor();
      }
    } catch (err) {
      console.error('[EDIT MODE] error parseando query string', err);
    }

    log('inicializado (edit mode: ' + (window[NS].enabled ? 'ON' : 'OFF') + ')');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
