const CSV_URL = 'https://minjust.gov.ru/uploaded/files/exportfsm.csv';

function isAscii(str: string): boolean {
  return /^[\x00-\x7F]+$/.test(str);
}

function cleanUrl(url: string): string {
  return url
    .trim()
    .replace(/[\s'"),.;]+$/, '') // отрезаем мусор в конце
    .replace(/^https?:\/\//, '') // убираем схему
    .replace(/^www\./, '');
}

export async function fetchDangerousKeywords(): Promise<string[]> {
  const response = await fetch(CSV_URL);
  const text = await response.text();
  const lines = text.split('\n').slice(1);

  const rawUrls = lines.flatMap((line) => {
    const matches = line.match(/https?:\/\/[^\s]+/gi);
    return matches || [];
  });

  const allVariants = new Set<string>();

  for (const raw of rawUrls) {
    const cleaned = cleanUrl(raw.toLowerCase());
    if (!isAscii(cleaned)) continue;

    const segments = cleaned.split('/');
    if (segments.length <= 1 || segments[1] === '') continue; // <-- пропускаем vk.com и подобное

    allVariants.add(`http://${cleaned}`);
    allVariants.add(`https://${cleaned}`);
  }

  const result = [...allVariants];
  console.log(`[CSV] Парсинг завершён. Итоговых ссылок: ${result.length}`);

  await chrome.storage.local.set({
    dangerousKeywords: result,
    fetchStatus: `Загружено ссылок: ${result.length}`,
  });

  return result;
}
