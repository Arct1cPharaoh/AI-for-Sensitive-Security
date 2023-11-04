function getComposeBoxContent() {
    // Find the compose box using the aria-label attribute
    const composeBox = document.querySelector('div[aria-label="Message Body"]');
    // Check if composeBox exists to avoid errors
    if (composeBox) {
        // Get the text content of the compose box
        return composeBox.textContent || composeBox.innerText;
    }
    return '';
}

function detectSensitiveInformation(emailContent) {
    // Your logic for detecting sensitive information goes here
    // Return true if sensitive info is detected, false otherwise
}

function checkEmailContent() {
    // Get the content of the compose box
    const emailContent = getComposeBoxContent();

    // Check if the email content contains sensitive information
    const isSensitive = detectSensitiveInformation(emailContent);

    // Establish a connection to the background script
    const backgroundPageConnection = chrome.runtime.connect({ name: 'secureEmailChecker' });

    // Send a message to the background script with the analysis result
    backgroundPageConnection.postMessage({
        message: 'updateStatus',
        status: isSensitive ? 'unsafe' : 'safe'
    });
}