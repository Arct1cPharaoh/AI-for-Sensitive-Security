document.addEventListener('DOMContentLoaded', () => {
    chrome.runtime.sendMessage({ query: 'getStatus' }, (response) => {
        const statusDiv = document.getElementById('status');
        
        if (response.status === 'safe') {
            statusDiv.textContent = "Email is open, nothing is at risk.";
        } else if (response.status === 'unsafe') {
            statusDiv.textContent = "Email is open, sensitive information detected!";
        } else {
            statusDiv.textContent = "No email open.";
        }
    });
});
