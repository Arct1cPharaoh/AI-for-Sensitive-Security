function checkForComposeBox() {
    const composeBox = document.querySelector('div[aria-label="Message Body"]');
    if (composeBox) {
        // Detected compose box, now check for sensitive information
        detectSensitiveInformation(composeBox.innerText);
    }
}

function insertStatusIcon() {
    const composeBox = document.querySelector('div[aria-label="Message Body"]');
    if (composeBox) {
        let statusIcon = document.querySelector('#status-icon');
        if (!statusIcon) {
            // Status Icon
            statusIcon = document.createElement('img');
            statusIcon.id = 'status-icon';
            statusIcon.style.position = 'absolute';
            statusIcon.style.bottom = '10px';
            statusIcon.style.right = '10px';
            statusIcon.style.width = '20px';
            statusIcon.style.height = '20px';
            statusIcon.src = chrome.runtime.getURL('img/safe.png'); // Default icon
            composeBox.parentElement.style.position = 'relative';
            composeBox.parentElement.appendChild(statusIcon);

            // Loading Icon
            loadingIcon = document.createElement('img');
            loadingIcon.id = 'loading-icon';
            loadingIcon.style.position = 'absolute';
            loadingIcon.style.bottom = '10px';
            loadingIcon.style.right = '10px';
            loadingIcon.style.width = '20px';
            loadingIcon.style.height = '20px';
            loadingIcon.src = chrome.runtime.getURL('img/loading.gif');
            loadingIcon.style.display = 'none'; // Initially hidden
            composeBox.parentElement.appendChild(loadingIcon);
        }
    }
}

function showLoadingIcon() {
    const loadingIcon = document.querySelector('#loading-icon');
    if (loadingIcon) {
        loadingIcon.style.display = 'block'; // Show loading icon
    }
}

function hideLoadingIcon() {
    const loadingIcon = document.querySelector('#loading-icon');
    if (loadingIcon) {
        loadingIcon.style.display = 'none'; // Hide loading icon
    }
}

function updateStatusIcon(isSensitive) {
    const statusIcon = document.querySelector('#status-icon');
    if (statusIcon) {
        statusIcon.src = isSensitive ? chrome.runtime.getURL('img/unsafe.png') : chrome.runtime.getURL('img/safe.png');
    }
}

function detectSensitiveInformation(text) {
    showLoadingIcon();

    // INSERT LOGIC HERE
    let isSensitive = text.includes("qwerty"); // Temporary (For Testing Purposes Only)

    // Updates Icon to stop loading and indicate safety of text
    updateStatusIcon(isSensitive);
    hideLoadingIcon();

    if (isSensitive) {
        chrome.runtime.sendMessage({ status: 'unsafe' });
    } else {
        chrome.runtime.sendMessage({ status: 'safe' });
    }

    fetch('http://localhost:5000/classify', { // Need to change this to the actual URL
        method: 'POST',
        headers: {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: text })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Entities:', data);
    })
    .catch((error) => {
        //console.error('Error:', error);
    });
}

if (!window.hasObserver) {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length || mutation.removedNodes.length) {
                checkForComposeBox();
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });
    window.hasObserver = true;
}

// Listen for changes in the compose box
document.addEventListener('input', (event) => {
    if (event.target.matches('div[aria-label="Message Body"]')) {
        detectSensitiveInformation(event.target.innerText);
    }
});

// Initial check when the script is injected
checkForComposeBox();
insertStatusIcon();
