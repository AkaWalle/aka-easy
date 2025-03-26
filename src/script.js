// Elementos do DOM
const elements = {
    sidebarLeft: document.getElementById('sideBar-left'),
    sidebarRight: document.getElementById('sideBar-right'),
    container: document.querySelector('.container'),
    historyList: document.getElementById('history-list'),
    clearHistoryButton: document.getElementById('clear-history'),
    campoComando: document.getElementById('campo-comando'),
    toggleDarkMode: document.getElementById('toggle-dark-mode')
};

// Estado inicial
let isDarkMode = true;

// Função para inicializar o aplicativo
function initializeApp() {
    loadDarkMode();
    loadHistory();
    setupEventListeners();
}

// Carrega o estado do modo escuro do localStorage
function loadDarkMode() {
    const savedMode = localStorage.getItem('darkMode');
    isDarkMode = savedMode ? JSON.parse(savedMode) : true;
    document.body.classList.toggle('dark-mode', isDarkMode);
    elements.toggleDarkMode.setAttribute('aria-label', isDarkMode ? 'Alternar para modo claro' : 'Alternar para modo escuro');
}

// Configura os ouvintes de eventos
function setupEventListeners() {
    // Alternar modo escuro/claro
    elements.toggleDarkMode.addEventListener('click', toggleDarkMode);

    // Limpar histórico
    elements.clearHistoryButton.addEventListener('click', clearHistory);

    // Manipular atalhos de teclado
    document.addEventListener('keydown', handleKeyboardShortcuts);

    // Manipular entrada no campo de comando
    elements.campoComando.addEventListener('keydown', handleCommandInput);
}

// Alternar modo escuro/claro
function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode', isDarkMode);
    localStorage.setItem('darkMode', isDarkMode);
    elements.toggleDarkMode.setAttribute('aria-label', isDarkMode ? 'Alternar para modo claro' : 'Alternar para modo escuro');
}

// Manipular atalhos de teclado
function handleKeyboardShortcuts(event) {
    // Detectar Ctrl + Shift para a barra lateral esquerda
    if (event.ctrlKey && event.shiftKey) {
        event.preventDefault();
        toggleSidebar(elements.sidebarLeft, 'shifted-left');
        return;
    }

    const keyMap = {
        'ctrlKey-Slash': () => toggleSidebar(elements.sidebarRight, 'shifted-right'),
        'ctrlKey-KeyP': abrirNavegador,
        'ctrlKey-Quote': abrirSpotify,
        'ctrlKey-Minus': abrirExplorador,
        'Escape': handleEscape,
        'ctrlKey-KeyN': abrirNotepad,
        'ctrlKey-KeyC': abrirCalculator,
        'ctrlKey-KeyU': abrirCustomURL,
        'ctrlKey-KeyK': abrirCmd,
        'ctrlKey-KeyT': abrirNovaJanela,
        'ctrlKey-KeyS': salvarConfiguracoes,
        'ctrlKey-KeyR': recarregarAplicativo,
        'ctrlKey-KeyL': limparCampoComando
    };

    const key = `${event.ctrlKey ? 'ctrlKey-' : ''}${event.shiftKey ? 'shiftKey-' : ''}${event.code}`;
    if (keyMap[key]) keyMap[key]();
}

// Manipular tecla Escape
function handleEscape() {
    if (!elements.sidebarRight.classList.contains('collapsed')) {
        toggleSidebar(elements.sidebarRight, 'shifted-right');
    } else if (!elements.sidebarLeft.classList.contains('collapsed')) {
        toggleSidebar(elements.sidebarLeft, 'shifted-left');
    } else {
        window.api.closeWindow();
    }
}

// Alternar visibilidade da barra lateral
function toggleSidebar(sidebar, shiftClass) {
    sidebar.classList.toggle('collapsed');
    elements.container.classList.toggle(shiftClass);
}

// Manipular entrada no campo de comando
function handleCommandInput(event) {
    if (event.key === 'Enter') {
        const command = elements.campoComando.value.trim();
        if (command) {
            if (command.toLowerCase().startsWith('http')) {
                abrirCustomURL(command);
            } else {
                addToHistory(command);
            }
            elements.campoComando.value = '';
        }
    }
}

// Funções para abrir aplicativos ou URLs
function abrirNavegador() {
    const urls = [
        "http://192.168.10.159/atendzap/view/dashboard_n2.php",
        "https://www.google.com",
        "https://encurtador.com.br/tkpR1",
        "https://encurtador.com.br/o7Xsg",
        "https://abrir.link/Zdnmx",
        "https://chamado.compudeck.com.br/main.php",
        "https://drive.google.com/drive/home"
    ];
    urls.forEach(url => window.api.openExternal(url));
    addToHistory('Ctrl + P');
}

function abrirSpotify() {
    window.api.openExternal('spotify:');
    addToHistory("Ctrl + '");
}

function abrirCmd() {
    window.api.execCommand('start cmd').catch(error => console.error('Erro ao abrir CMD:', error));
    addToHistory('Ctrl + K');
}

function abrirExplorador() {
    window.api.execCommand('explorer');
    addToHistory('Ctrl + -');
}

function abrirNotepad() {
    window.api.execCommand('start notepad').catch(error => console.error('Erro ao abrir Notepad:', error));
    addToHistory('Ctrl + N');
}

function abrirCalculator() {
    window.api.execCommand('start calc').catch(error => console.error('Erro ao abrir Calculadora:', error));
    addToHistory('Ctrl + C');
}

function abrirCustomURL(url = "https://example.com") {
    window.api.openExternal(url).catch(error => console.error('Erro ao abrir URL:', error));
    addToHistory(`Ctrl + U: ${url}`);
}

function abrirNovaJanela() {
    window.api.openExternal('https://example.com');
    addToHistory('Ctrl + T');
}

function salvarConfiguracoes() {
    const config = { darkMode: isDarkMode, customUrl: "https://example.com" };
    localStorage.setItem('appConfig', JSON.stringify(config));
    addToHistory('Ctrl + S: Configurações salvas');
}

function recarregarAplicativo() {
    window.location.reload();
    addToHistory('Ctrl + R');
}

function limparCampoComando() {
    elements.campoComando.value = '';
    addToHistory('Ctrl + L: Campo limpo');
}

// Gerenciamento do histórico
function addToHistory(command) {
    if (!command || command.trim() === '') return;
    try {
        const history = JSON.parse(localStorage.getItem('commandHistory')) || [];
        if (history[0] === command) return;
        history.unshift(command);
        if (history.length > 10) history.pop();
        localStorage.setItem('commandHistory', JSON.stringify(history));
        updateHistoryUI(history);
    } catch (error) {
        console.error('Erro ao adicionar ao histórico:', error);
    }
}

function loadHistory() {
    try {
        const history = JSON.parse(localStorage.getItem('commandHistory')) || [];
        updateHistoryUI(history);
    } catch (error) {
        console.error('Erro ao carregar histórico:', error);
    }
}

function updateHistoryUI(history) {
    elements.historyList.innerHTML = '';
    history.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        elements.historyList.appendChild(li);
    });
}

function clearHistory() {
    try {
        localStorage.removeItem('commandHistory');
        elements.historyList.innerHTML = '';
    } catch (error) {
        console.error('Erro ao limpar histórico:', error);
    }
}

// Inicializa o aplicativo ao carregar o DOM
document.addEventListener('DOMContentLoaded', initializeApp);