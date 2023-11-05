let currentStatus = 'off'; // Three statuses are 'off', 'safe', and 'unsafe'

function checkIfGmail(tabId, changeInfo, tab) {
    if (tab.url && tab.url.includes("mail.google.com")) {
        // User is on Gmail
        currentStatus = 'safe';
    } else {
        // User is not on Gmail
        currentStatus = 'off';
    }
}

// Listen for any changes in the tabs
chrome.tabs.onUpdated.addListener(checkIfGmail);

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.status) {
        currentStatus = message.status;
    }
});

// Respond to messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.query === 'getStatus') {
        sendResponse({ status: currentStatus });
    }
});
