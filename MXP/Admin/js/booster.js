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
}

async function autoLoadHistory() {
  try {
    const res = await fetch('history.json');
    if (res.ok) {
      const data = await res.ok ? await res.json() : null;
      if (data && data.todo && data.inprogress && data.published) {
        localStorage.setItem(STATE_KEY, JSON.stringify(data));
        console.log("Historial auto-cargado desde history.json");
      }
    }
  } catch (e) {
    console.log("No se encontró history.json o no se pudo cargar automáticamente.");
  }
}

async function loadDatabases() {
  try {
    // 1. PC
    const pcRes = await fetch('data/pc.json');
    const pcData = await pcRes.json();
    
    // 2. Entorno
    const envRes = await fetch('data/entorno.json');
    const envData = await envRes.json();
    
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
  const state = JSON.parse(localStorage.getItem(STATE_KEY) || '{"todo":[], "inprogress":[], "published":[]}');
  return [...state.todo, ...state.inprogress, ...state.published].map(t => t.id);
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
          <button class="qc-btn reroll" onclick="rerollCard(${index})">⟳ RE-ROLL</button>
          <button class="qc-btn edit" onclick="openEditModal(${index})">✎ BUSCAR</button>
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
  
  const state = JSON.parse(localStorage.getItem(STATE_KEY) || '{"todo":[], "inprogress":[], "published":[]}');
  
  // Agregar al top de Todo
  state.todo = [...currentCards, ...state.todo];
  saveBoardState(state);
  
  currentCards = [];
  viewReward.classList.remove('active');
  viewBoard.classList.add('active');
  
  renderBoard();
});

// BOARD / KANBAN LOGIC

function saveBoardState(state) {
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
}

function loadBoardState() {
  renderBoard();
}

function renderBoard() {
  const state = JSON.parse(localStorage.getItem(STATE_KEY) || '{"todo":[], "inprogress":[], "published":[]}');
  
  const renderCol = (colId, items) => {
    const colEl = document.getElementById(`col-${colId}`);
    colEl.innerHTML = '';
    items.forEach((item, index) => {
      const el = document.createElement('div');
      el.className = 'minimized-card';
      el.draggable = true;
      el.innerHTML = `
        <div style="display:flex; align-items:center; gap:10px; flex-grow:1;" onclick="openDetailsModal('${colId}', ${index})">
          <img src="${item.platform === 'Consola' ? item.icon : item.image}" onerror="if(this.src != '${ERROR_ICON}') this.src='${ERROR_ICON}'">
          <div style="flex-grow:1; overflow:hidden;">
            <div style="font-size:12px; white-space:nowrap; text-overflow:ellipsis; overflow:hidden;"><b>${item.name}</b></div>
            <div style="font-size:10px; color:#aaa;">${item.platform} ${item.developer ? `- ${item.developer}` : ''}</div>
          </div>
        </div>
        <div style="cursor:pointer; color:#ff4d4d; font-weight:bold; padding:0 5px;" onclick="deleteBoardItem('${colId}', ${index})">x</div>
      `;
      // Drag events
      el.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', JSON.stringify({ colId, index }));
        el.classList.add('dragging');
      });
      el.addEventListener('dragend', () => el.classList.remove('dragging'));
      colEl.appendChild(el);
    });
  };

  renderCol('todo', state.todo);
  renderCol('inprogress', state.inprogress);
  renderCol('published', state.published);
}

function saveBoardState(state) {
  // Guardar también la configuración de los sliders
  state.config = {
    pc: document.getElementById('slider-pc').value,
    consola: document.getElementById('slider-consola').value,
    entorno: document.getElementById('slider-entorno').value
  };
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
      updateSliderVisuals();
    }
  }
}

function updateSliderVisuals() {
  document.getElementById('val-pc').innerText = document.getElementById('slider-pc').value;
  document.getElementById('val-consola').innerText = document.getElementById('slider-consola').value;
  document.getElementById('val-entorno').innerText = document.getElementById('slider-entorno').value;
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

// ICON LIST FOR ENTORNO ABM
async function loadIconList() {
    const iconSelect = document.getElementById('entorno-icon-select');
    // Como no podemos listar archivos directamente desde JS en el cliente, 
    // usaremos una lista pre-generada o la extraeremos de lo que ya tenemos.
    // Pero como yo tengo acceso al sistema, la voy a dejar "hardcodeada" dinámicamente según lo que vi en el sistema.
    const icons = ["Accessibility Wizard.webp", "Accessibility.webp", "Activation.webp", "Add Network Place.webp", "Add New Hardware.webp", "Add New Programs.webp", "Add or Remove Windows Components.webp", "Add.webp", "Address Book.webp", "Administrative Tools.webp", "Appearance Settings.webp", "Application.webp", "Archive.webp", "Audio CD.webp", "Audio.webp", "Backup.webp", "Briefcase.webp", "Calculator.webp", "Calendar.webp", "Camera.webp", "Certificate.webp", "Characters.webp", "Clipboard.webp", "Clock.webp", "Command Prompt.webp", "Computer.webp", "Control Panel.webp", "Deletion.webp", "Desktop.webp", "Devices.webp", "DirectX.webp", "Explorer.webp", "Favorites.webp", "Fax.webp", "Folder.webp", "Font.webp", "Game.webp", "Help and Support.webp", "History.webp", "Hyper Terminal.webp", "Internet Explorer.webp", "Messenger.webp", "Move to.webp", "Movie.webp", "Music.webp", "My Documents.webp", "Network.webp", "Notepad.webp", "Outlook Express.webp", "Paint.webp", "Printer.webp", "Recycle Bin.webp", "Run.webp", "Search.webp", "Security.webp", "Settings.webp", "Sound.webp", "System Information.webp", "Users.webp", "Video.webp", "Winamp.webp", "Windows Media Player.webp", "Wordpad.webp"];
    
    iconSelect.innerHTML = '<option value="">-- Seleccionar Icono --</option>';
    icons.forEach(icon => {
        const opt = document.createElement('option');
        opt.value = `../XP_Icons/${icon}`;
        opt.innerText = icon.replace('.webp', '');
        iconSelect.appendChild(opt);
    });
}

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
  const colName = colId === 'todo' ? 'To Do' : (colId === 'inprogress' ? 'In Progress' : 'Published');
  if(confirm(`¿Estás seguro de que deseas limpiar la columna '${colName}'?`)) {
    const state = JSON.parse(localStorage.getItem(STATE_KEY));
    state[colId] = [];
    saveBoardState(state);
    renderBoard();
  }
};

// HISTORIAL SAVE
document.getElementById('btn-save-fixed-history').addEventListener('click', () => {
  const stateStr = localStorage.getItem(STATE_KEY) || '{"todo":[], "inprogress":[], "published":[]}';
  const blob = new Blob([stateStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `history.json`;
  a.click();
  URL.revokeObjectURL(url);
  alert("Se ha generado 'history.json'. Sobrescribe el archivo en MXP/Admin para persistir los cambios.");
});

document.getElementById('load-history-file').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if(!file) return;
  
  const reader = new FileReader();
  reader.onload = (evt) => {
    try {
      const data = JSON.parse(evt.target.result);
      if(data.todo && data.inprogress && data.published) {
        localStorage.setItem(STATE_KEY, JSON.stringify(data));
        alert("¡Historial cargado con éxito!");
        loadBoardState();
        document.getElementById('btn-nav-board').click();
      } else {
        alert("El archivo no tiene el formato correcto.");
      }
    } catch(err) {
      alert("Error leyendo el JSON.");
    }
  };
  reader.readAsText(file);
  // Reset input
  e.target.value = '';
});

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
    el.className = 'search-item'; // Reutilizamos estilo
    el.style.marginBottom = '5px';
    el.style.cursor = 'pointer';
    el.innerHTML = `
      <div style="display:flex; align-items:center; gap:10px; flex-grow:1;" onclick="editEntornoItem(${index})">
        <img src="${item.image}" onerror="this.src='${ERROR_ICON}'">
        <div style="flex-grow:1;">
          <div style="font-weight:bold; font-size:13px;">${item.name}</div>
          <div style="font-size:10px; color:#666; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; width: 350px;">${item.image}</div>
        </div>
      </div>
      <button class="col-clear-btn" style="opacity:1; position:relative; right:0;" onclick="deleteEntornoAdmin(${index}); event.stopPropagation();">🗑</button>
    `;
    listEl.appendChild(el);
  });
};

window.updateIconPreview = function() {
  const select = document.getElementById('entorno-icon-select');
  const img = document.getElementById('entorno-preview-img');
  const span = document.getElementById('preview-placeholder');
  
  if(select.value) {
    img.src = select.value;
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
  document.getElementById('entorno-icon-select').value = item.image;
  document.getElementById('entorno-desc').value = item.description_html || '';
  
  updateIconPreview();
  
  // Alternar botones
  document.getElementById('btn-entorno-create').style.display = 'none';
  document.getElementById('btn-entorno-save').style.display = 'block';
  document.getElementById('btn-entorno-cancel').style.display = 'block';
}

window.cancelEntornoEdit = function() {
  document.getElementById('entorno-id').value = '';
  document.getElementById('entorno-name').value = '';
  document.getElementById('entorno-icon-select').value = '';
  document.getElementById('entorno-desc').value = '';
  updateIconPreview();
  
  document.getElementById('btn-entorno-create').style.display = 'block';
  document.getElementById('btn-entorno-save').style.display = 'none';
  document.getElementById('btn-entorno-cancel').style.display = 'none';
}

window.updateEntornoItem = function() {
  const id = document.getElementById('entorno-id').value;
  const name = document.getElementById('entorno-name').value.trim();
  const image = document.getElementById('entorno-icon-select').value;
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
  }
  
  cancelEntornoEdit();
  renderEntornoAdminList();
};

window.addEntornoItem = function() {
  const name = document.getElementById('entorno-name').value.trim();
  const image = document.getElementById('entorno-icon-select').value;
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
  
  // Limpiar form
  document.getElementById('entorno-name').value = '';
  document.getElementById('entorno-icon-select').value = '';
  document.getElementById('entorno-desc').value = '';
  
  renderEntornoAdminList();
};

window.deleteEntornoAdmin = function(index) {
  const item = tempEntornoList[index];
  tempEntornoList.splice(index, 1);
  // Quitar también de dbMaster
  dbMaster = dbMaster.filter(i => i.id !== item.id);
  renderEntornoAdminList();
};

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

function setupSliders() {
  const sliders = ['slider-pc', 'slider-consola', 'slider-entorno'];
  sliders.forEach(id => {
    const s = document.getElementById(id);
    s.addEventListener('input', () => {
      updateSliderVisuals();
      // Guardar el estado cada vez que se mueve un slider
      const state = JSON.parse(localStorage.getItem(STATE_KEY)) || {todo:[], inprogress:[], published:[]};
      saveBoardState(state);
    });
  });
}

// BOOT
init();
