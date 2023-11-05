document.addEventListener('DOMContentLoaded', () => {
    chrome.runtime.sendMessage({ query: 'getStatus' }, (response) => {
        const statusDiv = document.getElementById('status');
        const entitiesList = document.getElementById('entities').querySelector('.entities-list');

        if (response.status === 'safe') {
            statusDiv.textContent = "Email is open, nothing is at risk.";
            entitiesList.innerHTML = ""; // Clear previous entities
        } else if (response.status === 'unsafe') {
            statusDiv.textContent = "Email is open, sensitive information detected!";
            // List the entities
            entitiesList.innerHTML = response.entities.map(entity => {
                let entityClass = '';
                let entityText = entity[0];
                let entityValue = entity[1];

                // Check if the entity is 'PASSWORD' and format it
                if (entity[0].toUpperCase() === 'PASSWORD') {
                    entityClass = 'password-entity';
                    entityText = 'Password'; // Change text to 'Password'
                    return `<li class="${entityClass}"><span class="entity-type">${entityText}:</span> <span class="entity-value">${entityValue}</span></li>`;
                }

                return `<li>${entityText}: ${entityValue}</li>`;
            }).join('');
        } else if (response.status === 'error') {
            statusDiv.textContent = "Error detecting sensitive information.";
            entitiesList.innerHTML = response.error; // Show the error message
        } else {
            statusDiv.textContent = "No email open.";
            entitiesList.innerHTML = ""; // Clear previous entities
        }
    });
});
