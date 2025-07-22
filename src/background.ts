import { fetchDangerousKeywords } from './fetch-dangerous-list';

const RULE_PREFIX = 1000;

async function updateRulesFromKeywords() {
  fetchDangerousKeywords().then((keywords) => {
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
  });
}

chrome.runtime.onInstalled.addListener(() => {
  console.log('📦 Установка расширения: загружаем список...');

  updateRulesFromKeywords();
});

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'manualRefresh') {
    console.log('🔄 Ручное обновление...');

    updateRulesFromKeywords();

    sendResponse({ ok: true });
  }
});
