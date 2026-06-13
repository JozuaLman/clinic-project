// --- 1. GRAB THE ELEMENTS FROM THE HTML ---
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email-input');
const passwordInput = document.getElementById('password-input');
const loginPage = document.getElementById('login-page');
const appContainer = document.getElementById('app-container');

// Navigation Tabs
const navDash = document.getElementById('nav-dash');
const navAfspraak = document.getElementById('nav-afspraak');
const navAdmin = document.getElementById('nav-admin');
const btnLogout = document.getElementById('btn-logout');
const userDisplayName = document.getElementById('user-display-name');

// Dashboard Section Views
const viewDashboard = document.getElementById('view-dashboard');
const viewAfspraak = document.getElementById('view-afspraak');
const viewAdmin = document.getElementById('view-admin');


// ==================== 2. THE LOCAL MOCK LOGIN SYSTEM ====================
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Stop the page from reloading

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        // Check credentials locally right here in the browser
        if (email === "admin@clinic.com" && password === "123456") {
            // Log in as Doctor / Admin
            userDisplayName.textContent = "Dr. Amrita Ramdin (🩺)";
            
            // 🔒 ROLES BEVEILIGING:
            navAdmin.classList.remove('hidden');       // Show secret admin tab
            navAfspraak.classList.add('hidden');    // Hide booking tab from doctors!
            navDash.classList.add('hidden');            // Hide patient dashboard tab
            
            loginPage.classList.add('hidden');          // Hide login card
            appContainer.classList.remove('hidden');    // Show dashboard layout
            
            // Jump straight to the doctor's overview panel safely
            switchView('admin', navAdmin);       
        } 
        else if (email === "patient@email.com" && password === "123456") {
            // Log in as standard Patient
            userDisplayName.textContent = "Lisa Patiënt";
            
            // 🔓 RESET ROLES FOR PATIENT:
            navAdmin.classList.add('hidden');          // Keep admin panel hidden
            navAfspraak.classList.remove('hidden');    // Show booking tab
            navDash.classList.remove('hidden');         // Show patient dashboard tab
            
            loginPage.classList.add('hidden');          // Hide login card
            appContainer.classList.remove('hidden');    // Show dashboard layout
            
            // Jump to standard patient dashboard view safely
            switchView('dashboard', navDash);    
        } 
        else {
            // Wrong details typed in
            alert('Onjuist wachtwoord of email! Gebruik de demo-accounts.');
        }
    });


// --- 3. LOGOUT HANDLING ---
btnLogout.addEventListener('click', function() {
    appContainer.classList.add('hidden');    // Hide the whole dashboard
    loginPage.classList.remove('hidden');    // Bring back the login page
    loginForm.reset();                       // Clear the input fields
});


// --- 4. NAVIGATION FUNCTION (TAB SWITCHER) ---
function switchView(viewName, activeNavButton) {
    // Hide all main views first
    viewDashboard.classList.add('hidden');
    viewAfspraak.classList.add('hidden');
    viewAdmin.classList.add('hidden');

    // Remove the active highlight from all navigation tabs
    navDash.classList.remove('active');
    navAfspraak.classList.remove('active');
    navAdmin.classList.remove('active');

    // Add back the highlight to the tab you just clicked
    activeNavButton.classList.add('active');
    
    // Show only the page section you actually want to see
    if (viewName === 'dashboard') viewDashboard.classList.remove('hidden');
    if (viewName === 'afspraak')  viewAfspraak.classList.remove('hidden');
    if (viewName === 'admin')     viewAdmin.classList.remove('hidden');
}

// Attach click triggers to the top navbar navigation buttons
if(navDash) navDash.addEventListener('click', () => switchView('dashboard', navDash));
if(navAfspraak) navAfspraak.addEventListener('click', () => switchView('afspraak', navAfspraak));
if(navAdmin) navAdmin.addEventListener('click', () => switchView('admin', navAdmin));