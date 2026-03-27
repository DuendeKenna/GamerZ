// ESTADO GLOBAL
let dbMaster = [];
let currentCards = []; 
let currentlyEditingIndex = -1;

const STATE_KEY = 'mxp_booster_board';

// ELEMENTOS DOM
const viewGenerator = document.getElementById('view-generator');
const viewReward = document.getElementById('view-reward');
const viewBoard = document.getElementById('view-board');

const sliderPc = document.getElementById('slider-pc');
const sliderConsola = document.getElementById('slider-consola');
const sliderEntorno = document.getElementById('slider-entorno');
const boosterPack = document.getElementById('booster-pack');
const cardsContainer = document.getElementById('cards-container');

// ICONS (Using existing XP_Icons)
const iconMap = {
  'PC': '../XP_Icons/Computer.webp',
  'Entorno': '../XP_Icons/My Documents.webp',
  'Consola': '../XP_Icons/Help and Support.webp' // Fallback
};

const ERROR_ICON = '../XP_Icons/Help and Support.webp';

// Carga de bases de datos
async function init() {
  await loadDatabases();
  await autoLoadHistory();
  loadBoardState();
  setupDragAndDrop();
  setupSliders();
  
  // Mostrar tablero por defecto al cargar
  viewGenerator.classList.remove('active');
  viewReward.classList.remove('active');
  viewBoard.classList.add('active');
}

async function autoLoadHistory() {
  // Si ya hay estado local, no lo pisamos con el history.json del servidor
  if(localStorage.getItem(STATE_KEY)) return;

  try {
    const res = await fetch('history.json');
    if (res.ok) {
      const data = await res.json();
      if (data && data.todo && data.inprogress && data.published) {
        localStorage.setItem(STATE_KEY, JSON.stringify(data));
        console.log("Historial auto-cargado desde history.json");
      }
    }
  } catch (e) {
    console.log("No se encontró history.json o no se pudo cargar.");
  }
}

async function loadDatabases() {
  try {
    // 1. PC
    const pcRes = await fetch('data/pc.json');
    const pcData = await pcRes.json();
    
    // 2. Entorno
    let envData = [];
    const localEnvStr = localStorage.getItem('mxp_entorno_db');
    if (localEnvStr) {
      envData = JSON.parse(localEnvStr);
    } else {
      const envRes = await fetch('data/entorno.json');
      envData = await envRes.json();
    }
    
    // 3. Consolas
    // Primero leemos consoles.json para saber qué consolas hay
    const consolesListRes = await fetch('../Shots/consolas/consoles.json');
    const consolesList = await consolesListRes.json();
    
    let consoleGames = [];
    for(const c of consolesList) {
      if(c.visible !== false) {
        try {
          const cRes = await fetch(`../Shots/consolas/${c.id}.json`);
          const cData = await cRes.json();
          cData.forEach(game => {
            consoleGames.push({
              id: `${c.id}_${game.id || game.name}`,
              name: game.name,
              image: game.image || `../Shots/consolas/${c.id}.webp`,
              platform: 'Consola',
              specific_platform: c.name,
              year: game.releasedate ? game.releasedate.substring(0,4) : '',
              description_html: `Género: ${game.genre || '-'}<br>Jugadores: ${game.players || '-'}`,
              icon: `../Shots/consolas/${c.id}.svg`
            });
          });
        } catch(e) { console.warn('No se pudo cargar consola:', c.id); }
      }
    }

    dbMaster = [...pcData, ...envData, ...consoleGames];
    
    // Poblar el dropdown de consolas en el modal de búsqueda
    const consoleFilter = document.getElementById('consoleFilter');
    consolesList.forEach(c => {
      if(c.visible !== false) {
        const opt = document.createElement('option');
        opt.value = c.name;
        opt.innerText = c.name;
        consoleFilter.appendChild(opt);
      }
    });

    // Poblar listado de iconos para Entorno
    loadIconList();
    
    // Restaurar sliders si existen en el estado
    restoreSliderState();

    console.log("DB Loaded:", dbMaster.length, "items.");
  } catch(e) {
    console.error("Error loading DBs:", e);
    alert("Error cargando base de datos. Asegúrate de haber ejecutado el script extract_pc.py.");
  }
}

// SLIDERS LOGIC
function updateDistrib() {
  document.getElementById('val-pc').innerText = sliderPc.value;
  document.getElementById('val-consola').innerText = sliderConsola.value;
  document.getElementById('val-entorno').innerText = sliderEntorno.value;
  
  const total = parseInt(sliderPc.value) + parseInt(sliderConsola.value) + parseInt(sliderEntorno.value);
  document.getElementById('val-total').innerText = total;
}

function setupSliders() {
  updateDistrib();
  const sliders = ['slider-pc', 'slider-consola', 'slider-entorno'];
  sliders.forEach(id => {
    const s = document.getElementById(id);
    if(s) {
      s.addEventListener('input', () => {
        updateDistrib();
        const state = JSON.parse(localStorage.getItem(STATE_KEY)) || {todo:[], inprogress:[], published:[]};
        saveBoardState(state);
      });
    }
  });
}

// GENERATOR LOGIC
boosterPack.addEventListener('click', () => {
  const innerPack = boosterPack.querySelector('.booster-pack');
  if(innerPack.classList.contains('opening')) return;
  
  innerPack.classList.add('opening');
  
  setTimeout(() => {
    generateCards();
    viewGenerator.classList.remove('active');
    viewReward.classList.add('active');
    innerPack.classList.remove('opening');
  }, 800);
});

function getRandomItems(category, count, specificPlatform = null) {
  // Ignorar items que estén en el tablero ("historial" local) para no repetirlos si podemos evitarlo
  const boardIds = getBoardItemsIds();
  
  let pool = dbMaster.filter(i => i.platform === category);

  // Si se espeficica una plataforma de consola (Mega Drive, etc.), filtrar por ella
  if (category === 'Consola' && specificPlatform) {
    pool = pool.filter(i => i.specific_platform === specificPlatform);
  }
  
  // Tratar de filtrar los ya publicados/usados
  let pristinePool = pool.filter(i => !boardIds.includes(i.id));
  if(pristinePool.length < count) {
    // Si nos quedamos sin juegos nuevos en esta categoría, usamos todos (repetimos)
    pristinePool = pool; 
  }

  const shuffled = pristinePool.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function getBoardItemsIds() {
  const state = JSON.parse(localStorage.getItem(STATE_KEY) || '{"todo":[], "toedit":[], "inprogress":[], "published":[]}');
  return [...state.todo, ...state.toedit, ...state.inprogress, ...state.published].map(t => t.id);
}

function generateCards() {
  const pcCount = parseInt(sliderPc.value);
  const consCount = parseInt(sliderConsola.value);
  const envCount = parseInt(sliderEntorno.value);
  
  currentCards = [
    ...getRandomItems('PC', pcCount),
    ...getRandomItems('Consola', consCount),
    ...getRandomItems('Entorno', envCount)
  ];
  
  renderCards();
}

function renderCards() {
  cardsContainer.innerHTML = '';
  currentCards.forEach((item, index) => {
    if(!item) return; // Por si pidieron más que la bd
    
    let platIcon = item.icon;
    if(!platIcon) platIcon = iconMap[item.platform] || iconMap['PC'];

    const cardHTML = `
      <div class="quest-card">
        <div class="qc-img-container" style="${item.platform === 'Consola' ? 'display:flex; align-items:center; justify-content:center; background:#000;' : 'cursor:pointer;'} " onclick="openCardDetails(${index})">
          <img src="${item.platform === 'Consola' ? item.icon : item.image}" 
               class="${item.platform === 'Consola' ? 'console-svg-main' : 'game-img'}" 
               onerror="if(this.src != '${ERROR_ICON}') this.src='${ERROR_ICON}'"
               style="${item.platform === 'Consola' ? 'width:80%; height:80%; object-fit:contain;' : ''}">
          ${item.platform !== 'Consola' ? `<img src="${platIcon}" class="qc-platform-icon" onerror="this.style.display='none'">` : ''}
        </div>
        <div class="qc-content" onclick="openCardDetails(${index})" style="cursor:pointer;">
          <div class="qc-title" title="${item.name}">${item.name}</div>
          <div class="qc-year">${item.platform} ${item.specific_platform ? `(${item.specific_platform})` : ''} | ${item.year || ''}</div>
          <div class="qc-hook">${item.description_html ? item.description_html.substring(0, 100) + '...' : ''}</div>
        </div>
        <div class="qc-actions">
          <button class="qc-btn reroll" onclick="event.stopPropagation(); rerollCard(${index})">⟳ RE-ROLL</button>
          <button class="qc-btn edit" onclick="event.stopPropagation(); openEditModal(${index})">✎ BUSCAR</button>
        </div>
      </div>
    `;
    cardsContainer.innerHTML += cardHTML;
  });
}

window.rerollCard = function(index) {
  const item = currentCards[index];
  const newItems = getRandomItems(item.platform, 1, item.specific_platform);
  if(newItems.length > 0) {
    currentCards[index] = newItems[0];
    renderCards();
  }
};

// ACTIONS REWARD -> BOARD
document.getElementById('btn-accept-quests').addEventListener('click', () => {
  if(currentCards.length === 0) return;
  
  const state = JSON.parse(localStorage.getItem(STATE_KEY) || '{"todo":[], "toedit":[], "inprogress":[], "published":[]}');
  
  // Agregar al top de Todo
  state.todo = [...currentCards, ...state.todo];
  saveBoardState(state);
  
  currentCards = [];
  viewReward.classList.remove('active');
  viewBoard.classList.add('active');
  
  renderBoard();
});

// BOARD / KANBAN LOGIC
function loadBoardState() {
  renderBoard();
}

function renderBoard() {
  const state = JSON.parse(localStorage.getItem(STATE_KEY) || '{"todo":[], "toedit":[], "inprogress":[], "published":[]}');
  
  const renderCol = (colId, items) => {
    const colEl = document.getElementById(`col-${colId}`);
    colEl.innerHTML = '';
    items.forEach((item, index) => {
      // Sync form dbMaster para que refleje cambios de Entorno/PC
      const dbItem = dbMaster.find(i => i.id === item.id);
      if(dbItem) {
        item.name = dbItem.name;
        item.image = dbItem.image;
        if(dbItem.icon) item.icon = dbItem.icon;
      }
      
      const el = document.createElement('div');
      el.className = 'minimized-card';
      el.style.position = 'relative'; // Para que la cruz sea absoluta
      el.draggable = true;
      el.innerHTML = `
        <div style="display:flex; align-items:center; gap:10px; flex-grow:1;" onclick="openDetailsModal('${colId}', ${index})">
          <img src="${item.platform === 'Consola' ? item.icon : item.image}" onerror="if(this.src != '${ERROR_ICON}') this.src='${ERROR_ICON}'">
          <div style="flex-grow:1; overflow:hidden;">
            <div style="font-size:12px; white-space:nowrap; text-overflow:ellipsis; overflow:hidden;"><b>${item.name}</b></div>
            <div style="font-size:10px; color:#aaa;">${item.platform} ${item.developer ? `- ${item.developer}` : ''}</div>
            <div class="card-hooks" style="margin-top:5px; border-top:1px solid #3a4a73; padding-top:5px;">
              <!-- Render existing card hooks -->
              ${(item.hooks || []).map((g, gIdx) => `
                <div style="font-size:11px; display:flex; justify-content:space-between; margin-bottom:2px; background:rgba(0,0,0,0.5); padding:2px 4px; border-radius:3px;">
                  <span style="color:#ffcc00;">- ${g}</span>
                  <span style="color:#ff4d4d; cursor:pointer;" onclick="deleteCardHook('${colId}', ${index}, ${gIdx}); event.stopPropagation();">x</span>
                </div>
              `).join('')}
              <input type="text" placeholder="+ Gancho..." style="width:100%; padding:3px; background:#000; color:#fff; border:1px solid #3a4a73; font-size:10px; margin-top:3px; outline:none;" 
                     onclick="event.stopPropagation();" 
                     onkeydown="if(event.key==='Enter'){ addCardHook('${colId}', ${index}, this.value); this.value=''; event.stopPropagation(); }">
            </div>
          </div>
        </div>
        <div class="card-delete-btn" style="cursor:pointer; font-size:14px; position:absolute; top:8px; right:8px; display:none; filter: drop-shadow(0 0 5px red);" onclick="deleteBoardItem('${colId}', ${index})" title="Eliminar quest">❌</div>
      `;
      
      // Mostrar botón de borrar al pasar el mouse
      el.onmouseenter = () => el.querySelector('.card-delete-btn').style.display = 'block';
      el.onmouseleave = () => el.querySelector('.card-delete-btn').style.display = 'none';

      // Drag events con física de vaivén opaca
      el.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', JSON.stringify({ colId, index }));
        setTimeout(() => el.style.opacity = '0.3', 0); // Ocultar casi por completo el original, pero mantener su espacio en el DOM
        
        // Esconder la imagen fantasma por defecto
        const blank = new Image();
        blank.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
        if(e.dataTransfer.setDragImage) e.dataTransfer.setDragImage(blank, 0, 0);
        
        // Crear un clon físico 100% opaco
        window._dragClone = el.cloneNode(true);
        window._dragClone.style.opacity = '1';
        window._dragClone.style.position = 'fixed';
        window._dragClone.style.pointerEvents = 'none';
        window._dragClone.style.zIndex = '999999';
        window._dragClone.style.width = el.getBoundingClientRect().width + 'px';
        window._dragClone.style.transformOrigin = 'top center';
        window._dragClone.style.transition = 'transform 0.1s ease-out';
        
        document.body.appendChild(window._dragClone);
        
        const rect = el.getBoundingClientRect();
        window._dragOffsetX = e.clientX - rect.left;
        window._dragOffsetY = e.clientY - rect.top;
        window._lastDragX = e.clientX;
      });
      
      el.addEventListener('drag', (e) => {
        if (!window._dragClone || (e.clientX === 0 && e.clientY === 0)) return;
        
        const deltaX = e.clientX - window._lastDragX;
        window._lastDragX = e.clientX;
        
        let rot = deltaX * 1.2; 
        if(rot > 15) rot = 15;
        if(rot < -15) rot = -15;
        
        window._dragClone.style.left = (e.clientX - window._dragOffsetX) + 'px';
        window._dragClone.style.top = (e.clientY - window._dragOffsetY) + 'px';
        window._dragClone.style.transform = `rotate(${rot}deg)`;
      });
      
      el.addEventListener('dragend', () => {
        el.style.opacity = '1';
        if (window._dragClone) {
          window._dragClone.remove();
          window._dragClone = null;
        }
      });
      
      colEl.appendChild(el);
    });
  };

  renderCol('todo', state.todo);
  renderCol('toedit', state.toedit || []);
  renderCol('inprogress', state.inprogress);
  renderCol('published', state.published);
  
  // Render Production Panels
  document.getElementById('global-notes').value = state.globalNotes || '';
  renderSteps(state.steps || []);
}

window.renderSteps = function(steps) {
  const list = document.getElementById('list-steps');
  list.innerHTML = '';
  steps.forEach((text, index) => {
    const el = document.createElement('div');
    el.className = 'panel-item';
    el.draggable = true;
    el.id = `step-item-${index}`;
    el.innerHTML = `
      <b>${index + 1}.</b>
      <span class="step-text" ondblclick="editStepInline(${index})">${text}</span>
      <div class="delete-btn" onclick="deleteStep(${index})">x</div>
    `;
    
    // Drag and Drop for Steps
    el.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', index);
      el.classList.add('dragging');
    });
    el.addEventListener('dragend', () => el.classList.remove('dragging'));
    el.addEventListener('dragover', (e) => e.preventDefault());
    el.addEventListener('drop', (e) => {
      e.preventDefault();
      const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
      const toIndex = index;
      if(fromIndex === toIndex) return;
      
      const state = JSON.parse(localStorage.getItem(STATE_KEY));
      const movedItem = state.steps.splice(fromIndex, 1)[0];
      state.steps.splice(toIndex, 0, movedItem);
      saveBoardState(state);
      renderSteps(state.steps);
    });

    list.appendChild(el);
  });
};

window.editStepInline = function(index) {
  const itemEl = document.getElementById(`step-item-${index}`);
  const textSpan = itemEl.querySelector('.step-text');
  const currentText = textSpan.innerText;
  
  const input = document.createElement('input');
  input.type = 'text';
  input.value = currentText;
  input.className = 'inline-edit-input';
  input.style.width = '100%';
  input.style.background = '#000';
  input.style.color = '#fff';
  input.style.border = '1px solid var(--cyber-blue)';
  
  input.onkeydown = (e) => {
    if(e.key === 'Enter') saveInlineStep(index, input.value);
    if(e.key === 'Escape') renderBoard(); // Re-render to cancel
  };
  
  input.onblur = () => saveInlineStep(index, input.value);
  
  textSpan.innerHTML = '';
  textSpan.appendChild(input);
  input.focus();
};

window.saveInlineStep = function(index, newText) {
  if(!newText.trim()) return renderBoard();
  const state = JSON.parse(localStorage.getItem(STATE_KEY));
  state.steps[index] = newText.trim();
  saveBoardState(state);
  renderSteps(state.steps);
};

function saveBoardState(state) {
  // Guardar también la configuración de los sliders
  state.config = {
    pc: document.getElementById('slider-pc').value,
    consola: document.getElementById('slider-consola').value,
    entorno: document.getElementById('slider-entorno').value
  };
  // Asegurar que notes y steps existan
  if (!state.globalNotes) state.globalNotes = '';
  if (!state.steps) state.steps = [];
  if (!state.toedit) state.toedit = [];
  
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
}

function restoreSliderState() {
  const stateStr = localStorage.getItem(STATE_KEY);
  if (stateStr) {
    const state = JSON.parse(stateStr);
    if (state.config) {
      document.getElementById('slider-pc').value = state.config.pc;
      document.getElementById('slider-consola').value = state.config.consola;
      document.getElementById('slider-entorno').value = state.config.entorno;
      updateDistrib();
    }
  }
}

window.deleteBoardItem = function(colId, index) {
  const state = JSON.parse(localStorage.getItem(STATE_KEY));
  state[colId].splice(index, 1);
  saveBoardState(state);
  renderBoard();
};

function setupDragAndDrop() {
  const dropzones = document.querySelectorAll('.dropzone');
  
  dropzones.forEach(zone => {
    zone.addEventListener('dragover', e => {
      e.preventDefault();
      zone.classList.add('drag-over');
    });
    
    zone.addEventListener('dragleave', () => {
      zone.classList.remove('drag-over');
    });
    
    zone.addEventListener('drop', e => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      
      const targetColId = zone.getAttribute('data-col');
      const dataStr = e.dataTransfer.getData('text/plain');
      if(!dataStr) return;
      
      const { colId: sourceColId, index } = JSON.parse(dataStr);
      
      if(sourceColId === targetColId) return; // Same column
      
      const state = JSON.parse(localStorage.getItem(STATE_KEY));
      const item = state[sourceColId][index];
      
      // Asegurar que conservamos los hooks al mover
      if (!item.hooks) item.hooks = [];
      
      state[sourceColId].splice(index, 1);
      state[targetColId].unshift(item); // Add to top
      
      saveBoardState(state);
      renderBoard();
    });
  });
}

// MODAL EDIT LOGIC
const modal = document.getElementById('edit-modal');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('search-results');

window.openEditModal = function(index) {
  currentlyEditingIndex = index;
  const currentItem = currentCards[currentlyEditingIndex];
  
  // Mostrar el filtro de consolas solo si es una tarjeta de Consola
  const consoleSelector = document.getElementById('console-selector-container');
  if(currentItem.platform === 'Consola') {
    consoleSelector.style.display = 'block';
    document.getElementById('consoleFilter').value = 'all';
  } else {
    consoleSelector.style.display = 'none';
  }
  
  searchInput.value = '';
  modal.classList.add('active');
  searchInput.focus();
  filterModal();
}

window.closeModal = function() {
  modal.classList.remove('active');
  currentlyEditingIndex = -1;
}

window.filterModal = function() {
  const term = searchInput.value.toLowerCase();
  const currentItem = currentCards[currentlyEditingIndex];
  const consoleFilterVal = document.getElementById('consoleFilter').value;
  
  // Filtrar primero por la categoría que corresponde (PC, Consola o Entorno)
  let pool = dbMaster.filter(i => i.platform === currentItem.platform);
  
  // Si estamos en consola y hay un filtro de consola específica seleccionado
  if(currentItem.platform === 'Consola' && consoleFilterVal !== 'all') {
    pool = pool.filter(i => i.specific_platform === consoleFilterVal);
  }
  
  // Luego filtrar por texto
  const filtered = pool.filter(i => i.name.toLowerCase().includes(term)).slice(0, 50); 
  
  searchResults.innerHTML = '';
  filtered.forEach(item => {
    const el = document.createElement('div');
    el.className = 'search-item';
    el.innerHTML = `
      <img src="${item.platform === 'Consola' ? item.icon : item.image}" onerror="if(this.src != '${ERROR_ICON}') this.src='${ERROR_ICON}'">
      <div>
        <div style="font-weight:bold; font-size:14px;">${item.name}</div>
        <div style="font-size:11px; color:#888;">${item.platform} ${item.specific_platform ? `(${item.specific_platform})` : ''} ${item.year ? ' - '+item.year : ''}</div>
      </div>
    `;
    el.onclick = () => {
      currentCards[currentlyEditingIndex] = item;
      renderCards();
      closeModal();
    };
    searchResults.appendChild(el);
  });
}

// DETAILS MODAL LOGIC
const detailsModal = document.getElementById('details-modal');
window.openDetailsModal = function(colId, index) {
  const state = JSON.parse(localStorage.getItem(STATE_KEY));
  const item = state[colId][index];
  fillDetailsModal(item);
};

window.openCardDetails = function(index) {
  const item = currentCards[index];
  fillDetailsModal(item);
};

function fillDetailsModal(item) {
  document.getElementById('details-name').innerText = item.name;
  document.getElementById('details-platform').innerText = `${item.platform} ${item.specific_platform ? `(${item.specific_platform})` : ''} ${item.developer ? `| ${item.developer}` : ''} ${item.year ? '| '+item.year : ''}`;
  document.getElementById('details-desc').innerHTML = item.description_html;
  
  const dImg = document.getElementById('details-img');
  const dContainer = document.getElementById('details-img-container');
  const modalContent = detailsModal.querySelector('.modal-content');
  const detailsDesc = document.getElementById('details-desc');
  
  modalContent.style.width = '80%';
  modalContent.style.maxWidth = '1200px';
  modalContent.style.minWidth = '450px';
  modalContent.style.maxHeight = '90vh';
  modalContent.style.display = 'flex';
  modalContent.style.flexDirection = 'column';
  
  const xpContent = modalContent.querySelector('.xp-content');
  xpContent.style.overflowY = 'auto';
  xpContent.style.flexGrow = '1';
  
  detailsDesc.style.maxHeight = 'none'; 
  
  const isIconBase = item.platform === 'Consola' || item.platform === 'Entorno';
  
  if(isIconBase) {
    dImg.src = isIconBase && item.platform === 'Consola' ? item.icon : item.image;
    dImg.style.width = '70%';
    dImg.style.height = 'auto';
    dImg.style.objectFit = 'contain';
  } else {
    dImg.src = item.image;
    dImg.style.width = 'auto';
    dImg.style.maxWidth = '100%';
    dImg.style.height = 'auto';
    dImg.style.maxHeight = '400px';
    dImg.style.objectFit = 'contain';
    dImg.style.borderRadius = '8px';
  }

  detailsModal.classList.add('active');
}

window.closeDetailsModal = function() {
  detailsModal.classList.remove('active');
};

// ICON LIST FOR ENTORNO ABM (GRID MODAL)
async function loadIconList() {
    const grid = document.getElementById('entorno-icons-grid');
    grid.innerHTML = '<div style="color:#666; padding:10px; font-size:10px;">Cargando...</div>';
    
    try {
        const response = await fetch('data/icons_list.json');
        const icons = await response.json();
        
        grid.innerHTML = '';
        icons.forEach(iconName => {
            const iconPath = `../XP_Icons/${iconName}`;
            const img = document.createElement('img');
            img.src = iconPath;
            img.title = iconName.replace('.webp', '');
            img.style.width = '100%';
            img.style.aspectRatio = '1/1';
            img.style.objectFit = 'contain';
            img.style.cursor = 'pointer';
            img.style.padding = '4px';
            img.style.border = '1px solid transparent';
            
            img.onclick = () => {
                // Desmarcar anteriores
                grid.querySelectorAll('img').forEach(i => i.style.borderColor = 'transparent');
                // Marcar actual
                img.style.borderColor = 'var(--cyber-blue)';
                img.style.background = 'rgba(0, 163, 255, 0.2)';
                
                document.getElementById('entorno-icon-path').value = iconPath;
                updateIconPreview();
                // Auto-cerrar grilla al elegir
                toggleIconGrid(false);
            };
            
            grid.appendChild(img);
        });
    } catch(e) {
        console.error("Error loading icons_list.json:", e);
        grid.innerHTML = '<div style="color:red; padding:10px; font-size:10px;">Error cargando data/icons_list.json</div>';
    }
}

window.toggleIconGrid = function(forceState) {
    const container = document.getElementById('icon-grid-container');
    if (typeof forceState === 'boolean') {
        container.style.display = forceState ? 'block' : 'none';
    } else {
        container.style.display = container.style.display === 'none' ? 'block' : 'none';
    }
};

// GLOBAL KEYBOARD & CLICK LISTENERS
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();
    closeDetailsModal();
    closeAdminModal();
  }
});

// Clic fuera para cerrar
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        if(e.target === overlay) {
            closeModal();
            closeDetailsModal();
            closeAdminModal();
        }
    });
});

// NAVIGATION
document.getElementById('id-nav-generator').addEventListener('click', () => {
  viewBoard.classList.remove('active');
  viewReward.classList.remove('active');
  viewGenerator.classList.add('active');
});

document.getElementById('btn-nav-board').addEventListener('click', () => {
  viewGenerator.classList.remove('active');
  viewReward.classList.remove('active');
  viewBoard.classList.add('active');
});

// CLEAR BOOSTER (THE CURRENT PACK)
document.getElementById('btn-clear-booster').addEventListener('click', () => {
  if(confirm("¿Estás seguro de que quieres descartar este booster? No se guardará nada en el tablero.")) {
    currentCards = [];
    viewReward.classList.remove('active');
    viewGenerator.classList.add('active');
  }
});

// CLEAR BOARD (COLUMN)
window.clearColumn = function(colId) {
  const colName = colId === 'todo' ? 'To Do' : (colId === 'toedit' ? 'To Edit' : (colId === 'inprogress' ? 'In Progress' : 'Published'));
  if(confirm(`¿Estás seguro de que deseas limpiar la columna '${colName}'?`)) {
    const state = JSON.parse(localStorage.getItem(STATE_KEY));
    state[colId] = [];
    saveBoardState(state);
    renderBoard();
  }
};



// ADMIN DB / ENTORNO ABM LOGIC
const adminModal = document.getElementById('admin-db-modal');
let tempEntornoList = [];

document.getElementById('btn-admin-db').addEventListener('click', () => {
  // Cargar la lista actual de entorno desde dbMaster
  tempEntornoList = dbMaster.filter(i => i.platform === 'Entorno');
  renderEntornoAdminList();
  adminModal.classList.add('active');
});

window.renderEntornoAdminList = function() {
  const listEl = document.getElementById('entorno-list');
  listEl.innerHTML = '';
  tempEntornoList.forEach((item, index) => {
    const el = document.createElement('div');
    el.className = 'admin-list-item'; // Clase nueva para CSS
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'space-between';
    el.style.padding = '5px 10px';
    el.style.marginBottom = '3px';
    el.style.cursor = 'pointer';
    el.style.background = 'rgba(255,255,255,0.03)';
    el.style.borderRadius = '3px';
    el.innerHTML = `
      <div style="display:flex; align-items:center; gap:8px; flex-grow:1;" onclick="editEntornoItem(${index})">
        <img src="${item.image}" style="width:24px; height:24px;" onerror="this.src='${ERROR_ICON}'">
        <div style="flex-grow:1;">
          <div style="font-weight:bold; font-size:12px; color:#fff;">${item.name}</div>
        </div>
      </div>
      <button class="col-clear-btn delete-icon" style="opacity:0; width:20px; height:20px; font-size:12px; position:relative; right:0; transition: opacity 0.2s;" onclick="deleteEntornoAdmin(${index}); event.stopPropagation();">×</button>
    `;
    
    // Hover logic via JS inline for simplicity without breaking CSS file
    el.onmouseenter = () => el.querySelector('.delete-icon').style.opacity = '1';
    el.onmouseleave = () => el.querySelector('.delete-icon').style.opacity = '0';
    
    listEl.appendChild(el);
  });
};

window.updateIconPreview = function() {
  const path = document.getElementById('entorno-icon-path').value;
  const img = document.getElementById('entorno-preview-img');
  const span = document.getElementById('preview-placeholder');
  
  if(path) {
    img.src = path;
    img.style.display = 'block';
    span.style.display = 'none';
  } else {
    img.style.display = 'none';
    span.style.display = 'block';
  }
}

window.editEntornoItem = function(index) {
  const item = tempEntornoList[index];
  
  document.getElementById('entorno-id').value = item.id;
  document.getElementById('entorno-name').value = item.name;
  document.getElementById('entorno-icon-path').value = item.image;
  document.getElementById('entorno-desc').value = item.description_html || '';
  
  // Marcar en la grilla
  const grid = document.getElementById('entorno-icons-grid');
  grid.querySelectorAll('img').forEach(img => {
      if(img.getAttribute('src') === item.image) {
          img.style.borderColor = 'var(--cyber-blue)';
          img.style.background = 'rgba(0, 163, 255, 0.2)';
          img.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
          img.style.borderColor = 'transparent';
          img.style.background = 'transparent';
      }
  });

  updateIconPreview();
  
  // Alternar botones
  document.getElementById('btn-entorno-create').style.display = 'none';
  document.getElementById('btn-entorno-save').style.display = 'block';
  document.getElementById('btn-entorno-cancel').style.display = 'block';
}

window.cancelEntornoEdit = function() {
  document.getElementById('entorno-id').value = '';
  document.getElementById('entorno-name').value = '';
  document.getElementById('entorno-icon-path').value = '';
  document.getElementById('entorno-desc').value = '';
  
  const grid = document.getElementById('entorno-icons-grid');
  grid.querySelectorAll('img').forEach(i => {
      i.style.borderColor = 'transparent';
      i.style.background = 'transparent';
  });

  updateIconPreview();
  
  document.getElementById('btn-entorno-create').style.display = 'block';
  document.getElementById('btn-entorno-save').style.display = 'none';
  document.getElementById('btn-entorno-cancel').style.display = 'none';
}

window.updateEntornoItem = function() {
  const id = document.getElementById('entorno-id').value;
  const name = document.getElementById('entorno-name').value.trim();
  const image = document.getElementById('entorno-icon-path').value;
  const desc = document.getElementById('entorno-desc').value.trim();
  
  if(!name || !image) return alert("Nombre e Icono son obligatorios.");
  
  // Actualizar en temp list
  const index = tempEntornoList.findIndex(i => i.id === id);
  if(index !== -1) {
    tempEntornoList[index].name = name;
    tempEntornoList[index].image = image;
    tempEntornoList[index].description_html = desc;
    
    // Actualizar en dbMaster
    const dbIndex = dbMaster.findIndex(i => i.id === id);
    if(dbIndex !== -1) {
       dbMaster[dbIndex] = {...tempEntornoList[index]};
    }
    
    // Actualizar también en el historial (Board State) para que el cambio de icono se refleje
    const stateStr = localStorage.getItem(STATE_KEY);
    if(stateStr) {
      const state = JSON.parse(stateStr);
      ['todo', 'inprogress', 'published'].forEach(col => {
        if(state[col]) {
          state[col].forEach(card => {
            if(card.id === id) {
              card.name = name;
              card.image = image;
              card.description_html = desc;
            }
          });
        }
      });
      saveBoardState(state);
      renderBoard();
    }
    
    saveEntornoDb(); // Guardar en historial maestro
  }
  
  cancelEntornoEdit();
  renderEntornoAdminList();
};

window.addEntornoItem = function() {
  const name = document.getElementById('entorno-name').value.trim();
  const image = document.getElementById('entorno-icon-path').value;
  const desc = document.getElementById('entorno-desc').value.trim();
  
  if(!name || !image) return alert("Nombre e Icono son obligatorios.");
  
  const newItem = {
    id: 'env_' + Date.now(),
    name: name,
    platform: 'Entorno',
    image: image,
    description_html: desc
  };
  
  tempEntornoList.push(newItem);
  
  // Actualizar dbMaster para que el generador lo vea
  dbMaster.push(newItem);
  
  saveEntornoDb(); // Guardar en historial maestro
  cancelEntornoEdit(); // Limpia y resetea visual
  renderEntornoAdminList();
};

window.deleteEntornoAdmin = function(index) {
  const item = tempEntornoList[index];
  tempEntornoList.splice(index, 1);
  // Quitar también de dbMaster
  dbMaster = dbMaster.filter(i => i.id !== item.id);
  
  saveEntornoDb(); // Guardar en historial maestro
  renderEntornoAdminList();
};

function saveEntornoDb() {
  localStorage.setItem('mxp_entorno_db', JSON.stringify(tempEntornoList));
}

window.saveEntornoFile = function() {
  const blob = new Blob([JSON.stringify(tempEntornoList, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'entorno.json';
  a.click();
  alert("Se ha descargado 'entorno.json'. Sobrescribe el archivo en MXP/Admin/data para que los cambios sean permanentes.");
};

window.closeAdminModal = function() {
  adminModal.classList.remove('active');
}



window.addCardHook = function(colId, index, text) {
  text = text.trim();
  if(!text) return;
  const state = JSON.parse(localStorage.getItem(STATE_KEY));
  const item = state[colId][index];
  if(!item.hooks) item.hooks = [];
  item.hooks.push(text);
  saveBoardState(state);
  renderBoard();
};

window.deleteCardHook = function(colId, index, hookIndex) {
  const state = JSON.parse(localStorage.getItem(STATE_KEY));
  state[colId][index].hooks.splice(hookIndex, 1);
  saveBoardState(state);
  renderBoard();
};

window.saveGlobalNotes = function() {
  const text = document.getElementById('global-notes').value;
  const state = JSON.parse(localStorage.getItem(STATE_KEY) || '{"todo":[], "toedit":[], "inprogress":[], "published":[]}');
  state.globalNotes = text;
  saveBoardState(state);
};

window.addStep = function() {
  const input = document.getElementById('input-new-step');
  const text = input.value.trim();
  if(!text) return;
  
  const state = JSON.parse(localStorage.getItem(STATE_KEY));
  if(!state.steps) state.steps = [];
  state.steps.push(text);
  saveBoardState(state);
  renderSteps(state.steps);
  input.value = '';
};

window.deleteStep = function(index) {
  const state = JSON.parse(localStorage.getItem(STATE_KEY));
  state.steps.splice(index, 1);
  saveBoardState(state);
  renderSteps(state.steps);
};

// BOOT
init();
