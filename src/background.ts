const blockedSubstrings = [
  "vk.com"
];

function isBlocked(url: string): boolean {
  return blockedSubstrings.some((entry) => url.includes(entry));
}

chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    const url = details.url;
    if (isBlocked(url)) {
      const redirect = chrome.runtime.getURL("public/blocked.html") + "?original=" + encodeURIComponent(url);
      return { redirectUrl: redirect };
    }
  },
  { urls: ["<all_urls>"], types: ["main_frame"] },
  ["blocking"]
);
