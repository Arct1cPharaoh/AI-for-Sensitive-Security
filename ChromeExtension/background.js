let currentStatus = 'off'; // Three statuses are 'off', 'safe', and 'unsafe'

chrome.tabs.onActivated.addListener(function(activeInfo) {
    chrome.tabs.get(activeInfo.tabId, function(tab) {
        updateStatusBasedOnTab(tab);
    });
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    updateStatusBasedOnTab(tab);
});

function updateStatusBasedOnTab(tab) {
    if (tab.url && tab.url.includes("mail.google.com")) {
        // User is on Gmail
        currentStatus = 'safe';
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
        });
    } else {
        // User is not on Gmail
        currentStatus = 'off';
    }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.query === 'getStatus') {
        sendResponse(currentStatus);
    } else if (message.status) {
        // Update the current status based on messages from content scripts
        currentStatus = { status: message.status, entities: message.entities || [] };
    }
});

// Respond to messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.query === 'getStatus') {
        sendResponse({ status: currentStatus });
    }
});
