import { fetchDangerousKeywords } from './fetch-dangerous-list';

chrome.runtime.onInstalled.addListener(async () => {
  console.log('📦 Расширение установлено. Загружаем CSV...');

  const keywords = await fetchDangerousKeywords();

  const rules: chrome.declarativeNetRequest.Rule[] = keywords.map(
    (keyword: string, index: number) => ({
      id: index + 1,
      priority: 1,
      action: {
        type: 'redirect' as const,
        redirect: {
          url: chrome.runtime.getURL(`blocked.html?original=${encodeURIComponent(keyword)}`),
        },
      },
      condition: {
        urlFilter: keyword,
        resourceTypes: ['main_frame'],
      },
    }),
  );

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: rules.map((r) => r.id),
    addRules: rules,
  });

  console.log('✅ Правила обновлены:', rules.length);
});
