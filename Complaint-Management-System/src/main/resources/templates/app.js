const API_URL = 'http://localhost:8080/api/complaints';
const form = document.getElementById('complaint-form');
const messageElement = document.getElementById('message');
const themeToggle = document.getElementById('theme-toggle');
const filterCategory = document.getElementById('filter-category');

let allComplaints = []; // Store the full list of complaints locally

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    
    // 2. Initial data load
    fetchComplaints();
    
    // 3. Attach event listeners
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
    themeToggle.addEventListener('click', toggleTheme);
    filterCategory.addEventListener('change', applyFilter);
});

// --- Theme Toggling Functions (No Change) ---
function setTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        themeToggle.textContent = 'Switch to Light Mode';
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.classList.remove('dark-theme');
        themeToggle.textContent = 'Switch to Dark Mode';
        localStorage.setItem('theme', 'light');
    }
}

function toggleTheme() {
    const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
    setTheme(currentTheme === 'light' ? 'dark' : 'light');
}

// --- Filtering Logic (No Change) ---
function applyFilter() {
    const selectedCategory = filterCategory.value;
    const filteredComplaints = allComplaints.filter(complaint => 
        selectedCategory === 'ALL' || complaint.category === selectedCategory
    );
    renderComplaints(filteredComplaints);
}


function showMessage(text, isError = false) {
    messageElement.textContent = text;
    messageElement.className = 'show';
    messageElement.classList.remove('success', 'error');
    if (isError) {
        messageElement.classList.add('error');
    } else {
        messageElement.classList.add('success');
    }
    // Hide after 5 seconds
    setTimeout(() => {
        messageElement.classList.remove('show');
    }, 5000); 
}

// --- Handle Resolution (PUT Request) ---
window.resolveComplaint = async function(id) {
    if (!confirm(`Are you sure you want to mark complaint ID: ${id} as RESOLVED?`)) {
        return;
    }
    
    const resolveURL = `${API_URL}/${id}?status=RESOLVED`;
    
    try {
        const response = await fetch(resolveURL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        showMessage(`Complaint ID ${id} marked as RESOLVED.`, false);
        fetchComplaints(); 
        
    } catch (error) {
        console.error('Error resolving complaint:', error);
        showMessage(`Error resolving complaint ID ${id}. Ensure the backend is running and the PUT mapping is correct.`, true);
    }
}

// --- Function to Handle New Complaint Submission (No Change) ---
async function handleFormSubmit(event) {
    event.preventDefault(); 
    showMessage('Submitting...', false);

    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const category = document.getElementById('category').value; 

    if (!category) {
         showMessage('Please select your role/category.', true);
         return;
    }

    const newComplaint = {
        title: title,
        description: description,
        category: category, 
        status: "PENDING"
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newComplaint)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const createdComplaint = await response.json();
        
        showMessage(`Complaint submitted successfully! ID: ${createdComplaint.id}`, false);
        form.reset(); 
        document.getElementById('category').selectedIndex = 0; 
        fetchComplaints(); 

    } catch (error) {
        console.error('Error submitting complaint:', error);
        showMessage(`Error submitting: ${error.message}.`, true);
    }
}


// --- Function to Render Complaints (UPDATED TO DISPLAY CATEGORY CLASS) ---
function renderComplaints(complaintsToRender) {
    const container = document.getElementById('complaint-container');
    container.innerHTML = ''; 
    
    if (complaintsToRender.length === 0) {
        container.innerHTML = '<p class="empty-list-message">No complaints found matching the filter.</p>';
        return;
    }

    complaintsToRender.forEach(complaint => {
        const item = document.createElement('div');
        item.className = 'complaint-item';
        
        // Safely display category, defaulting to 'N/A' if null/undefined
        const displayCategory = complaint.category ? complaint.category : 'N/A';
        // Dynamically create the category CSS class (e.g., category-STUDENT, category-STAFF, category-N_A)
        const categoryClass = `category-${displayCategory.toUpperCase().replace(/\s/g, '_')}`;
        
        const statusClass = `status-${complaint.status.toUpperCase().replace(/\s/g, '_')}`;
        
        // Determine if the complaint is pending to show the action button
        const isPending = complaint.status.toUpperCase() === 'PENDING';
        
        const resolveButton = isPending
            ? `<button class="resolve-btn" onclick="resolveComplaint(${complaint.id})">Resolve</button>`
            : `<button class="resolved-btn" disabled>Resolved</button>`;

        item.innerHTML = `
            <div class="complaint-header">
                <div class="complaint-title">${complaint.title} (ID: ${complaint.id})</div>
                <div class="header-tags">
                    <span class="tag ${categoryClass}">${displayCategory}</span>
                    <span class="tag ${statusClass}">${complaint.status}</span>
                </div>
            </div>
            <p class="complaint-description">${complaint.description}</p>
            <div class="complaint-actions">
                ${resolveButton}
            </div>
        `;

        container.appendChild(item);
    });
}


// --- Function to Fetch All Complaints (No Change) ---
async function fetchComplaints() {
    const container = document.getElementById('complaint-container');
    container.innerHTML = '<p class="empty-list-message">Fetching data...</p>';

    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        allComplaints = await response.json(); 
        applyFilter(); 

    } catch (error) {
        console.error('Error fetching complaints:', error);
        container.innerHTML = `<p class="empty-list-message" style="color: var(--error-color);">Failed to connect to API: ${error.message}.</p>`;
    }
}