function checkForComposeBox() {
    const composeBox = document.querySelector('div[aria-label="Message Body"]');
    if (composeBox) {
        // Detected compose box, now check for sensitive information
        detectSensitiveInformation(composeBox.innerText);
    }
}

function detectSensitiveInformation(text) {
    // REPLACE WITH ACTUAL LOGIC HERE
    // Temporary Test
    let isSensitive = false;
    if (text.includes("qwerty")) { // Changed from strict equality to 'includes'
        isSensitive = true;
    }
    
    if (isSensitive) {
        chrome.runtime.sendMessage({ status: 'unsafe' });
    } else {
        chrome.runtime.sendMessage({ status: 'safe' });
    }
}

// Set up a MutationObserver to detect changes in the DOM
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.addedNodes.length || mutation.removedNodes.length) {
            checkForComposeBox();
        }
    });
});

observer.observe(document.body, { childList: true, subtree: true });

// Listen for changes in the compose box
document.addEventListener('input', (event) => {
    if (event.target.matches('div[aria-label="Message Body"]')) {
        detectSensitiveInformation(event.target.innerText);
    }
});
