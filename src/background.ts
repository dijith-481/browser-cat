chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.type === "GET_TAB_COUNT") {
    chrome.tabs.query({}, (tabs) => {
      sendResponse({ count: tabs.length });
    });

    return true;
  }
});
