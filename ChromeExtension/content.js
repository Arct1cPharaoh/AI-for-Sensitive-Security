function debounce(func, wait) {
    let timeout;
  
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
  
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
    function checkForComposeBox() {
        const composeBox = document.querySelector('div[aria-label="Message Body"]');
        if (composeBox) {
            // Detected compose box, now check for sensitive information
            debouncedDetectSensitiveInformation(composeBox.innerText);
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
  
  // ... (rest of your content.js file)

function detectSensitiveInformation(text) {
    showLoadingIcon();

    fetch('http://localhost:5000/classify', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: text })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Entities:', data);
        updateStatusIcon(data.length > 0);
        hideLoadingIcon();

        // Send the detected entities to the popup
        chrome.runtime.sendMessage({ status: data.length > 0 ? 'unsafe' : 'safe', entities: data });
    })
    .catch((error) => {
        console.error('Error:', error);
        hideLoadingIcon();
        // Send the error status to the popup
        chrome.runtime.sendMessage({ status: 'error', error: error.toString() });
    });
}

// ... (rest of your content.js file)

  
  // Debounce the detectSensitiveInformation function
    debouncedDetectSensitiveInformation = debounce(detectSensitiveInformation, 2000);
  
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
  
  // Listen for changes in the compose box with debounced function
  document.addEventListener('input', (event) => {
      if (event.target.matches('div[aria-label="Message Body"]')) {
          debouncedDetectSensitiveInformation(event.target.innerText);
      }
  });
  
  // Initial check when the script is injected
  checkForComposeBox();
  insertStatusIcon();
  