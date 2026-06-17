// --- 1. GRAB THE ELEMENTS FROM THE HTML ---
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email-input');
const passwordInput = document.getElementById('password-input');
const loginPage = document.getElementById('login-page');
const appContainer = document.getElementById('app-container');

// Navigation Tabs
const navDash = document.getElementById('nav-dash');
const navAfspraak = document.getElementById('nav-afspraak');
const menuToggleBtn = document.getElementById('menu-toggle-btn');
const dropdownMenu = document.getElementById('dropdown-menu');
const navChat = document.getElementById('nav-chat');
const navRecepten = document.getElementById('nav-recepten');
const navNotificaties = document.getElementById('nav-notificaties');
const navPolibeheer = document.getElementById('nav-polibeheer');

// Dropdown openen en sluiten
if (menuToggleBtn && dropdownMenu) {
    menuToggleBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdownMenu.classList.toggle('class-hidden');
    });

    document.addEventListener('click', function() {
        dropdownMenu.classList.add('class-hidden');
    });
}
const navAdmin = document.getElementById('nav-admin');
const btnLogout = document.getElementById('btn-logout');
const userDisplayName = document.getElementById('user-display-name');

// Dashboard Section Views
const viewDashboard = document.getElementById('view-dashboard');
const viewAfspraak = document.getElementById('view-afspraak');
const viewAdmin = document.getElementById('view-admin');


// ============================== 2. THE LOCAL MOCK LOGIN SYSTEM ==============================
loginForm.addEventListener('submit', function(e) {
    e.preventDefault(); // Stop the page from reloading

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    // Check credentials locally right here in the browser
    if (email === "admin@clinic.com" && password === "123456") {
        // Log in as Doctor / Admin
        userDisplayName.textContent = "Dr. Amrita Ramdin (Nordic/Arts)";
        
        // 🔒 ROLES BEVEILIGING (Toon arts knoppen, verberg patiënt knoppen)
        navAdmin.classList.remove('hidden');
        if (navPolibeheer) navPolibeheer.classList.remove('hidden');
        navDash.classList.remove('hidden');
        
        navAfspraak.classList.add('hidden');
        if (navChat) navChat.classList.add('hidden');
        if (navRecepten) navRecepten.classList.add('hidden');
        if (navNotificaties) navNotificaties.classList.add('hidden');
        
        loginPage.classList.add('hidden'); // Hide login card
        appContainer.classList.remove('hidden'); // Show dashboard layout
        
        // Jump straight to the doctor's overview panel safely
       switchView('view-admin-dash');
        
    } else if (email === "patient@gmail.com" && password === "123456") {
        // Log in as standard Patient
        userDisplayName.textContent = "Lisa Patiënt";
        
        // 🔓 RESET ROLES FOR PATIENT (Verberg arts knoppen, toon patiënt knoppen)
        navAdmin.classList.add('hidden');
        if (navPolibeheer) navPolibeheer.classList.add('hidden');
        
        navDash.classList.remove('hidden');
        navAfspraak.classList.remove('hidden');
        if (navChat) navChat.classList.remove('hidden');
        if (navRecepten) navRecepten.classList.remove('hidden');
        if (navNotificaties) navNotificaties.classList.remove('hidden');
        
        loginPage.classList.add('hidden'); // Hide login card
        appContainer.classList.remove('hidden'); // Show dashboard layout
        
        // Jump to standard patient dashboard view safely
        switchView('view-dashboard');
    } else {
        // Wrong details typed in
        alert('Onjuist wachtwoord of email! Gebruik de demo-accounts.');
    }
});


// --- 4. NAVIGATION FUNCTION (TAB SWITCHER) ---
function switchView(targetViewId) {
    // 1. Verberg alle pagina-secties
    const allViews = document.querySelectorAll('.view-section');
    allViews.forEach(view => {
        view.classList.add('hidden');
    });

    // 2. Haal de 'active' status weg van alle navigatieknoppen
    const allNavButtons = document.querySelectorAll('.nav-btn');
    allNavButtons.forEach(btn => {
        btn.classList.remove('active');
    });

    // 3. Toon de specifieke pagina die is aangeroepen via het ID
    const activeView = document.getElementById(targetViewId);
    if (activeView) {
        activeView.classList.remove('hidden');
    }

    // 4. Maak de geklikte knop visueel actief
    // (We zoeken hier naar de knop die hoort bij deze weergave)
    const activeBtn = document.querySelector(`[onclick*="${targetViewId}"]`) || document.getElementById(`nav-${targetViewId.replace('view-', '')}`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }


    // 5. Sluit het dropdown menu netjes automatisch na een klik
    if (dropdownMenu) {
        dropdownMenu.classList.add('class-hidden');
    }
}


// Koppel de klik-events aan alle dropdown knoppen (met de juiste HTML-ID's)
if (navDash) navDash.addEventListener('click', () => switchView('view-dashboard'));
if (navAfspraak) navAfspraak.addEventListener('click', () => switchView('view-afspraak'));
if (navChat) navChat.addEventListener('click', () => switchView('view-chat'));
if (navRecepten) navRecepten.addEventListener('click', () => switchView('view-recepten'));
if (navNotificaties) navNotificaties.addEventListener('click', () => switchView('view-notificaties'));
if (navAdmin) navAdmin.addEventListener('click', () => switchView('view-admin-dash'));
if (navPolibeheer) navPolibeheer.addEventListener('click', () => switchView('view-beheer'));