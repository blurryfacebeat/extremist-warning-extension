import { fetchDangerousKeywords } from './fetch-dangerous-list';

const RULE_PREFIX = 1000;

async function updateRulesFromKeywords() {
  const keywords = await fetchDangerousKeywords();

  const rules: chrome.declarativeNetRequest.Rule[] = keywords.map((url, index) => ({
    id: RULE_PREFIX + index,
    priority: 1,
    action: {
      type: 'redirect' as const,
      redirect: {
        url: chrome.runtime.getURL(`blocked.html?original=${encodeURIComponent(url)}`),
      },
    },
    condition: {
      urlFilter: url,
      resourceTypes: ['main_frame'],
    },
  }));

  chrome.declarativeNetRequest.updateDynamicRules(
    {
      removeRuleIds: rules.map((r) => r.id),
      addRules: rules,
    },
    () => {
      console.log(`✅ Обновлено ${rules.length} правил`);

      chrome.storage.local.set({
        lastUpdated: new Date().toISOString(),
      });
    },
  );
}

chrome.runtime.onInstalled.addListener(async () => {
  console.log('📦 Установка расширения: загружаем список...');

  await updateRulesFromKeywords();
});

chrome.runtime.onMessage.addListener(async (msg, _sender, sendResponse) => {
  if (msg.type === 'manualRefresh') {
    console.log('🔄 Ручное обновление...');

    await updateRulesFromKeywords();

    sendResponse({ ok: true });
  }
});
