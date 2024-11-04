let session = '';

async function fetchVaultSession() {
    const url = `https://cors-anywhere.herokuapp.com/https://partnersi-prana4life-clinical.veevavault.com/api/v24.2/auth`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                username: `prana.user3@partnersi-prana4life.com`,
                password: `Pr@n@U$er3!`
            })
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        console.log("API response:", data); // Log the entire response for debugging
        session = data.sessionId;

        if (session) {
            console.log("Session ID fetched:", session);
            sessionStorage.setItem('sessionId', session); // Save session ID in sessionStorage
        } else {
            console.error("Session ID not found.");
        }
    } catch (error) {
        console.error("Failed to fetch session:", error);
    }
}

async function fetchRecords() {
    const session = sessionStorage.getItem('sessionId'); // Retrieve session ID from sessionStorage
    console.log("Fetching records with session ID:", session);

    const resultsMessage = document.getElementById("resultsMessage");

    if (!session) {
        resultsMessage.textContent = "Session not initialized. Refresh the page to get a session.";
        return;
    }

    const searchTerm = document.getElementById("searchInput").value;
    console.log("Search term entered:", searchTerm);

    if (!searchTerm) {
        resultsMessage.textContent = "Please enter a search term.";
        return;
    }

    const url2 = `https://cors-anywhere.herokuapp.com/https://partnersi-prana4life-clinical.veevavault.com/api/v24.2/query?q=SELECT id, name__v, state__v, study_type__v, study_subtype__v FROM study__v FIND('${searchTerm}')`;
    console.log("Query URL:", url2);

    resultsMessage.textContent = "Searching...";

    try {
        const response = await fetch(url2, {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${session}`
            }
        });

        console.log("Response from records fetch:", response);

        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const result = await response.json();
        console.log("Fetched records data:", result);

        const records = result.data || [];
        
        // Show the table
        document.getElementById("searchContainer").style.display = "block";
        document.getElementById("resultsContainer").style.display = "block";
        
        displayResults(records);
    } catch (error) {
        console.error("Failed to fetch records:", error);
        resultsMessage.textContent = "Error fetching records: " + error.message;
    }
}

function displayResults(records) {
    const resultsMessage = document.getElementById("resultsMessage");
    const tableBody = document.getElementById("resultsTable").querySelector("tbody");

    if (resultsMessage) {
        resultsMessage.style.display = "none";
    }

    // Clear any existing rows in the table body
    tableBody.innerHTML = "";

    if (records.length > 0) {
        records.forEach(record => {
            const row = document.createElement("tr");

            const nameCell = document.createElement("td");
            nameCell.textContent = record.name__v;
            row.appendChild(nameCell);

            const stateCell = document.createElement("td");
            stateCell.textContent = record.state__v;
            row.appendChild(stateCell);

            const studyTypeCell = document.createElement("td");
            studyTypeCell.textContent = record.study_type__v || 'N/A';
            row.appendChild(studyTypeCell);

            const studySubtypeCell = document.createElement("td");
            studySubtypeCell.textContent = record.study_subtype__v || 'N/A';
            row.appendChild(studySubtypeCell);

            tableBody.appendChild(row);
        });
    } else {
        if (resultsMessage) {
            resultsMessage.textContent = "No records found.";
            resultsMessage.style.display = "block";
        }
    }
}
