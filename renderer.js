let sourcePath = '';
let destPath = '';

document.getElementById('selectSource').addEventListener('click', async () => {
  sourcePath = await window.api.selectFolders();
  document.getElementById('sourcePath').textContent = sourcePath || 'None';
});

document.getElementById('selectDest').addEventListener('click', async () => {
  destPath = await window.api.selectFolders();
  document.getElementById('destPath').textContent = destPath || 'None';
});

document.getElementById('startBackup').addEventListener('click', async () => {
  if (!sourcePath || !destPath) {
    document.getElementById('status').textContent = 'Select both folders first.';
    return;
  }

  document.getElementById('status').textContent = 'Backing up...';
  const result = await window.api.backupFiles(sourcePath, destPath);
  document.getElementById('status').textContent = result;
});