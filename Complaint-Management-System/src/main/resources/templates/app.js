const API_BASE_URL = 'http://localhost:8080/api';
const API_COMPLAINTS_URL = `${API_BASE_URL}/complaints`;

// --- Global Auth State ---
let CURRENT_USER_ROLE = null;
let CURRENT_USERNAME = null;

// --- DOM ELEMENTS ---
const loginContainer = document.getElementById('login-container');
const dashboardContainer = document.getElementById('dashboard-container');
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');
const welcomeMessage = document.getElementById('welcome-message');

const form = document.getElementById('complaint-form');
const messageElement = document.getElementById('message');
const loginMessageElement = document.getElementById('login-message');
const themeToggle = document.getElementById('theme-toggle');
const filterCategory = document.getElementById('filter-category');

let allComplaints = []; // Store the full list of complaints locally


document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    
    // 2. Initialize Login Status
    checkLoginStatus(); 

    // 3. Attach Event Listeners
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
    themeToggle.addEventListener('click', toggleTheme);
    filterCategory.addEventListener('change', applyFilter);
});

// --- Authentication Logic ---

function checkLoginStatus() {
    // Retrieve credentials from session storage
    CURRENT_USER_ROLE = sessionStorage.getItem('userRole');
    CURRENT_USERNAME = sessionStorage.getItem('username');

    if (CURRENT_USER_ROLE) {
        // Logged In: Show dashboard, hide login
        loginContainer.style.display = 'none';
        dashboardContainer.style.display = 'block';
        logoutBtn.style.display = 'block';
        
        welcomeMessage.textContent = `Welcome, ${CURRENT_USERNAME} (${CURRENT_USER_ROLE})!`;
        fetchComplaints(); // Load data
    } else {
        // Logged Out: Show login, hide dashboard
        loginContainer.style.display = 'block';
        dashboardContainer.style.display = 'none';
        logoutBtn.style.display = 'none';
    }
}

async function handleLoginSubmit(event) {
    event.preventDefault();
    loginMessageElement.textContent = ''; 
    loginMessageElement.classList.remove('show', 'error');

    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch(`${API_BASE_URL}/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
            // Success
            sessionStorage.setItem('userRole', data.role);
            sessionStorage.setItem('username', data.username);
            checkLoginStatus(); 
        } else {
            // Failure
            loginMessageElement.textContent = data.message || 'Invalid username or password.';
            loginMessageElement.classList.add('show', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        loginMessageElement.textContent = 'Error connecting to the server.';
        loginMessageElement.classList.add('show', 'error');
    }
}

function handleLogout() {
    sessionStorage.clear();
    CURRENT_USER_ROLE = null;
    CURRENT_USERNAME = null;
    checkLoginStatus();
    showMessage('Logged out successfully.', false, loginMessageElement);
}

// --- General Message Helper ---
function showMessage(text, isError = false, element = messageElement) {
    element.textContent = text;
    element.classList.add('show');
    element.classList.remove('success', 'error');
    if (isError) {
        element.classList.add('error');
    } else {
        element.classList.add('success');
    }
    // Hide after 5 seconds
    setTimeout(() => {
        element.classList.remove('show');
    }, 5000); 
}


// --- Complaint Submission Logic ---
async function handleFormSubmit(event) {
    event.preventDefault(); 
    if (!CURRENT_USER_ROLE) {
        showMessage('Please log in to submit a complaint.', true);
        return;
    }
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
        const response = await fetch(API_COMPLAINTS_URL, {
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


// --- Complaint Fetching Logic ---
async function fetchComplaints() {
    const container = document.getElementById('complaint-container');
    container.innerHTML = '<p class="empty-list-message">Fetching data...</p>';

    try {
        const response = await fetch(API_COMPLAINTS_URL);
        
        // This endpoint should be public based on SecurityConfig, so 401/403 shouldn't happen here
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

// --- Filtering Logic ---
function applyFilter() {
    const selectedCategory = filterCategory.value;
    const filteredComplaints = allComplaints.filter(complaint => 
        selectedCategory === 'ALL' || complaint.category === selectedCategory
    );
    renderComplaints(filteredComplaints);
}


// --- Resolution Logic ---
window.resolveComplaint = async function(id) {
    if (CURRENT_USER_ROLE !== 'ADMIN') {
        showMessage('Access Denied: Only administrators can resolve complaints.', true);
        return;
    }
    
    if (!confirm(`Are you sure you want to mark complaint ID: ${id} as RESOLVED?`)) {
        return;
    }
    
    const resolveURL = `${API_COMPLAINTS_URL}/${id}/resolve`; // Changed to PATCH style endpoint
    
    try {
        const response = await fetch(resolveURL, {
            method: 'PATCH', // Changed to PATCH to align with typical Spring Security configuration
            headers: {
                // No complex headers needed since Spring Security is stateless and manages roles on the backend
                'Content-Type': 'application/json'
            }
        });
        
        if (response.status === 403) {
             showMessage('Access Denied: Your user role cannot perform this action.', true);
             return;
        }

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        showMessage(`Complaint ID ${id} marked as RESOLVED.`, false);
        fetchComplaints(); 
        
    } catch (error) {
        console.error('Error resolving complaint:', error);
        showMessage(`Error resolving complaint ID ${id}.`, true);
    }
}


// --- Function to Render Complaints ---
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
        const categoryClass = `category-${displayCategory.toUpperCase().replace(/\s/g, '_')}`;
        
        const statusClass = `status-${complaint.status.toUpperCase().replace(/\s/g, '_')}`;
        
        const isPending = complaint.status.toUpperCase() === 'PENDING';
        
        // Resolve Button only for ADMIN users AND if the complaint is PENDING
        const showResolveBtn = CURRENT_USER_ROLE === 'ADMIN' && isPending;
        
        const resolveButtonHtml = showResolveBtn
            ? `<button class="resolve-btn" onclick="resolveComplaint(${complaint.id})">Resolve</button>`
            : (isPending ? '' : `<button class="resolved-btn" disabled>Resolved</button>`);


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
                ${resolveButtonHtml}
            </div>
        `;

        container.appendChild(item);
    });
}


// --- Theme Toggling Functions ---
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


// Expose functions globally for HTML onClick
window.fetchComplaints = fetchComplaints;
window.applyFilter = applyFilter;