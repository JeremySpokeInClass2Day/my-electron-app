let destinationRoot = '';
let folderList = [];
let comparisonResult = {};

document.getElementById('selectDest').addEventListener('click', async () => {
  destinationRoot = await window.api.selectDestination();
  document.getElementById('destDisplay').textContent = destinationRoot || 'No destination selected';
});

document.getElementById('compareBtn').addEventListener('click', async () => {
  folderList = await window.api.getConfigFolders();
  if (!destinationRoot || folderList.length === 0) return;

  comparisonResult = await window.api.compareAllFolders(folderList, destinationRoot);
  renderTreeView(comparisonResult);
});

function renderTreeView(data) {
  const container = document.getElementById('fileTree');
  container.innerHTML = '';
  for (const [folder, files] of Object.entries(data)) {
    const ul = document.createElement('ul');
    const folderTitle = document.createElement('li');
    folderTitle.innerHTML = `<strong>${folder}</strong>`;
    ul.appendChild(folderTitle);

    files.forEach(file => {
      const li = document.createElement('li');
      li.innerHTML = `<input type="checkbox" data-source="${file.path}" data-relative="${folder}/${file.relative}" checked> ${file.relative}`;
      ul.appendChild(li);
    });

    container.appendChild(ul);
  }
}

document.getElementById('copyBtn').addEventListener('click', async () => {
  const checkboxes = document.querySelectorAll('#fileTree input[type=checkbox]:checked');
  const selectedFiles = Array.from(checkboxes).map(cb => ({
    source: cb.getAttribute('data-source'),
    relative: cb.getAttribute('data-relative')
  }));

  if (selectedFiles.length === 0 || !destinationRoot) return;

  document.getElementById('status').textContent = 'Copying...';
  await window.api.copySelectedFiles(selectedFiles, destinationRoot);
  document.getElementById('status').textContent = 'Copy complete.';
});
