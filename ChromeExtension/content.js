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

    function stringToColor(str) {
        console.log('Generating color for string:', str); // Debug: Check the input string
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 7) - hash);
        }
        console.log('Hash generated:', hash); // Debug: Check the generated hash

        // Initialize RGB values
        let r = 0, g = 0, b = 0;

        for (let i = 0; i < 3; i++) {
            // Ensure each color component is at least 127 (halfway to 255)
            let value = ((hash >> (i * 8)) & 0xFF) + 127;
            // If the value goes beyond 255, wrap it around
            value = value % 256;
            // If the value is less than 127, make it bright by setting a minimum threshold
            if (value < 127) {
                value = 127;
            }
            // Assign the value to the appropriate RGB component
            if (i === 0) r = value;
            else if (i === 1) g = value;
            else if (i === 2) b = value;
        }

        // Set the alpha value for semi-transparency
        let alpha = 0.5; // Semi-transparent

        // Construct the RGBA color string
        let color = `rgba(${r}, ${g}, ${b}, ${alpha})`;

        console.log('Color generated:', color); // Debug: Check the generated color
        return color;
    }

    function highlightTextInstances(searchText, highlightColor) {
        const escapedSearchText = searchText.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const searchRegExp = new RegExp('\\b' + escapedSearchText + '\\b', 'gi');

        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
        let node;
        while ((node = walker.nextNode())) {
            if (node.parentNode.nodeName === 'SPAN' && node.parentNode.classList.contains('highlight')) {
                continue;
            }

            const matches = [...node.nodeValue.matchAll(searchRegExp)];
            for (const match of matches) {
                const matchText = match[0];
                const matchStart = match.index;
                const matchEnd = matchStart + matchText.length;

                const endNode = node.splitText(matchStart);
                const middleNode = endNode.splitText(matchText.length);

                const highlightSpan = document.createElement('span');
                highlightSpan.classList.add('highlight');
                highlightSpan.style.backgroundColor = highlightColor;
                highlightSpan.textContent = matchText;

                endNode.parentNode.replaceChild(highlightSpan, endNode);

                node = middleNode;
            }
        }
    }

    let currentHighlights = [];

    function updateHighlights(newEntities) {
        currentHighlights.forEach((entity) => {
            if (!newEntities.some(e => e[1] === entity[1])) {
                removeHighlight(entity[1]);
            }
        });

        newEntities.forEach((entity) => {
            const color = stringToColor(entity[0]);
            highlightTextInstances(entity[1], color);
        });

        currentHighlights = newEntities;
    }

    function removeHighlight(text) {
        document.querySelectorAll('.highlight').forEach((highlight) => {
            if (highlight.textContent === text) {
                const parent = highlight.parentNode;
                parent.replaceChild(document.createTextNode(text), highlight);
                parent.normalize();
            }
        });
    }

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

            updateHighlights(data);

            chrome.runtime.sendMessage({ status: data.length > 0 ? 'unsafe' : 'safe', entities: data });
        })
        .catch((error) => {
            console.error('Error:', error);
            hideLoadingIcon();
            chrome.runtime.sendMessage({ status: 'error', error: error.toString() });
        });
    }


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
