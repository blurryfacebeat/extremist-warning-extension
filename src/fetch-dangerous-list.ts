const CSV_URL = 'https://minjust.gov.ru/uploaded/files/exportfsm.csv';

function isAscii(str: string): boolean {
  return /^[\x00-\x7F]+$/.test(str);
}

function cleanUrl(url: string): string {
  return url
    .trim()
    .replace(/[\s'"),.;]+$/g, '')
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .toLowerCase();
}

function isIgnorablePath(path: string): boolean {
  return (
    path === '/' ||
    path.startsWith('/search') ||
    path.startsWith('/results') ||
    path.startsWith('/feed') ||
    path.startsWith('/explore') ||
    path.startsWith('/watch?list') ||
    path.startsWith('/channel') ||
    path.startsWith('/@')
  );
}

export async function fetchDangerousKeywords(): Promise<string[]> {
  const response = await fetch(CSV_URL);
  const text = await response.text();
  const lines = text.split('\n').slice(1);

  const rawUrls = lines.flatMap((line) => {
    const matches = line.match(/https?:\/\/[^\s'"),;]+/gi);
    return matches || [];
  });

  const allVariants = new Set<string>();

  for (const raw of rawUrls) {
    const cleaned = cleanUrl(raw);
    if (!isAscii(cleaned)) continue;

    const [domain, ...pathParts] = cleaned.split('/');
    const path = '/' + pathParts.join('/');

    if (!pathParts.length || isIgnorablePath(path)) continue;

    allVariants.add(`http://${domain}${path}`);
    allVariants.add(`https://${domain}${path}`);
  }

  const result = [...allVariants];
  console.log(`[⚠️ Parser] Готово. Найдено валидных URL: ${result.length}`);

  await chrome.storage.local.set({
    dangerousKeywords: result,
    fetchStatus: `Готово: ${result.length} ссылок`,
  });

  return result;
}
