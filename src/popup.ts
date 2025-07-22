function renderList(items: string[]) {
  const list = document.getElementById('list')!;
  list.innerHTML = '';

  for (const item of items) {
    const li = document.createElement('li');
    li.textContent = item;
    list.appendChild(li);
  }
}

function setStatus(text: string) {
  const el = document.getElementById('status');
  if (el) el.textContent = text;
}

function init() {
  const search = document.getElementById('search') as HTMLInputElement;

  chrome.storage.local.get(['dangerousKeywords', 'fetchStatus'], (res) => {
    const all = res.dangerousKeywords || [];
    setStatus(res.fetchStatus ?? 'Нет данных');

    renderList(all);

    search.addEventListener('input', () => {
      const q = search.value.toLowerCase();
      const filtered = all.filter((k: any) => k.includes(q));
      renderList(filtered);
    });
  });
}

document.addEventListener('DOMContentLoaded', init);
