const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
    // Criar a janela do navegador
    const win = new BrowserWindow({
        width: 800,         // Largura padrão
        height: 600,        // Altura padrão
        center: true,       // Centralizar a janela na tela
        resizable: true,    // Permitir redimensionamento
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        }
    });

    // Carregar o arquivo index.html com o caminho correto
    win.loadFile(path.join(__dirname, 'index.html')).catch(err => {
        console.error('Erro ao carregar index.html:', err);
    });

    // Abrir as DevTools (opcional, remover se não for necessário)
    // win.webContents.openDevTools();

    // Gerenciar comandos IPC
    const { ipcMain } = require('electron');
    ipcMain.handle('openExternal', async (event, url) => {
        require('electron').shell.openExternal(url);
    });

    ipcMain.handle('execCommand', async (event, command) => {
        const { exec } = require('child_process');
        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) reject(error);
                else resolve(stdout);
            });
        });
    });

    ipcMain.handle('closeWindow', () => {
        win.close();
    });
}

// Este método será chamado quando o Electron terminar de inicializar
app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});