const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, 'assets/backup.ico'), 
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  win.loadFile('index.html');
}

app.whenReady().then(createWindow);

const config = require('./backup-config.json');

ipcMain.handle('get-config-folders', async () => config.folders);

const compareFiles = (srcFile, destFile) => {
  if (!fs.existsSync(destFile)) return false;
  const srcStats = fs.statSync(srcFile);
  const destStats = fs.statSync(destFile);
  return (
    srcStats.size === destStats.size &&
    srcStats.mtimeMs === destStats.mtimeMs
  );
};

ipcMain.handle('compare-all-folders', async (_event, { sourceFolders, destinationRoot }) => {
  const differences = {};

  for (const folder of sourceFolders) {
    const relFolderName = path.basename(folder);
    const destFolder = path.join(destinationRoot, relFolderName);
    const filesToCopy = [];

    const walk = (srcDir, destDir) => {
      if (!fs.existsSync(srcDir)) return;
      fs.readdirSync(srcDir).forEach(file => {
        const srcPath = path.join(srcDir, file);
        const destPath = path.join(destDir, file);
        if (fs.lstatSync(srcPath).isDirectory()) {
          walk(srcPath, destPath);
        } else {
          if (!compareFiles(srcPath, destPath)) {
            filesToCopy.push({ path: srcPath, relative: path.relative(folder, srcPath) });
          }
        }
      });
    };

    walk(folder, destFolder);
    if (filesToCopy.length > 0) {
      differences[relFolderName] = filesToCopy;
    }
  }

  return differences;
});

ipcMain.handle('select-destination', async () => {
  const result = await dialog.showOpenDialog({ properties: ['openDirectory'] });
  return result.filePaths[0];
});

ipcMain.handle('copy-selected-files', async (_event, { paths, destinationRoot }) => {
  for (const file of paths) {
    const { source, relative } = file;
    const destPath = path.join(destinationRoot, relative);
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
    fs.copyFileSync(source, destPath);
  }
  return 'Done';
});
