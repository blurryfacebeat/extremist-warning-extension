const CSV_URL = 'https://minjust.gov.ru/uploaded/files/exportfsm.csv';

function isAscii(str: string): boolean {
  return /^[\x00-\x7F]+$/.test(str);
}

export async function fetchDangerousKeywords(): Promise<string[]> {
  const response = await fetch(CSV_URL);
  const text = await response.text();
  const lines = text.split('\n').slice(1);

  const baseUrls = lines
    .map((line) => line.split(';')[1]?.trim().toLowerCase())
    .filter(Boolean)
    .filter((line) => isAscii(line) && (line.includes('http://') || line.includes('https://')))
    .flatMap((line) => {
      const matches = line.match(/https?:\/\/[^\s"']+/gi);
      return matches ? matches.map((u) => u.trim()) : [];
    });

  const allVariants = new Set<string>();
  for (const url of baseUrls) {
    const cleaned = url.replace(/^https?:\/\//, '').replace(/^www\./, '');
    allVariants.add(`http://${cleaned}`);
    allVariants.add(`https://${cleaned}`);
  }

  const result = [...allVariants];
  console.log(`[CSV] Загружено URL-правил: ${result.length}`);

  await chrome.storage.local.set({
    dangerousKeywords: result,
    fetchStatus: `Загружено URL: ${result.length}`,
  });

  return result;
}
