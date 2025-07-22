function updateStatus() {
  chrome.storage.local.get(['fetchStatus', 'lastUpdated', 'dangerousKeywords'], (res) => {
    const status = res.fetchStatus || 'Не загружено';
    const updated = res.lastUpdated ? new Date(res.lastUpdated).toLocaleString() : '—';
    const list = res.dangerousKeywords || [];

    document.getElementById('status')!.textContent = status;
    document.getElementById('last-updated')!.textContent = updated;

    const ul = document.getElementById('danger-list')!;
    ul.innerHTML = '';
    for (const url of list.slice(0, 200)) {
      const li = document.createElement('li');
      li.textContent = url;
      ul.appendChild(li);
    }

    const search = document.getElementById('search')! as HTMLInputElement;
    search.addEventListener('input', () => {
      const value = search.value.toLowerCase();
      ul.innerHTML = '';
      for (const url of list) {
        if (url.toLowerCase().includes(value)) {
          const li = document.createElement('li');
          li.textContent = url;
          ul.appendChild(li);
        }
      }
    });
  });
}

document.getElementById('refresh')?.addEventListener('click', () => {
  const btn = document.getElementById('refresh') as HTMLButtonElement;
  btn.disabled = true;
  const originalText = btn.textContent;
  btn.textContent = '⏳ Обновление...';

  chrome.runtime.sendMessage({ type: 'manualRefresh' }, () => {
    updateStatus();
    btn.disabled = false;
    btn.textContent = originalText;
  });
});

updateStatus();
