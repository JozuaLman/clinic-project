document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Elementen selecteren
    const menuToggleBtn = document.getElementById('menu-toggle-btn');
    const dropdownMenu = document.getElementById('dropdown-menu');
    
    const navDash = document.getElementById('nav-dash');
    const navAfspraak = document.getElementById('nav-afspraak');
    const navChat = document.getElementById('nav-chat');
    const navRecepten = document.getElementById('nav-recepten');
    
    // Login Elementen
    const loginForm = document.getElementById('login-form');
    const loginSection = document.getElementById('view-login');
    const mainHeader = document.getElementById('main-header');
    const mainContent = document.getElementById('main-content');
    const btnLogout = document.getElementById('btn-logout');

    // 2. Toggle Menu functionaliteit
    if (menuToggleBtn && dropdownMenu) {
        menuToggleBtn.addEventListener('click', () => {
            dropdownMenu.classList.toggle('class-hidden');
        });
    }

    // 3. Schermen Switch Functie
    function switchView(targetViewId) {
        const allViews = document.querySelectorAll('.view-section');
        allViews.forEach(view => {
            view.classList.add('class-hidden');
        });

        const targetView = document.getElementById(targetViewId);
        if (targetView) {
            targetView.classList.remove('class-hidden');
        }

        if (dropdownMenu) {
            dropdownMenu.classList.add('class-hidden');
        }
    }
    window.switchView = switchView;

function showMenuFor(role) {
    const menu = document.getElementById('dropdown-menu');
    
   if (role === 'arts') {
            menu.innerHTML = `
                <button onclick="switchView('view-arts-dashboard')">Dashboard</button>
                <button onclick="switchView('view-afspraken-lijst')">Afsprakenlijst</button>
                <button onclick="switchView('view-dossiers-recepten')">Dossiers & Recepten</button>
                <button onclick="switchView('view-chat')">PoliMed AI CoPilot</button>
                <button onclick="switchView('view-beheer')">Poli & Arts Beheer</button>
                <hr>
                <button onclick="logout()">Uitloggen</button>
            `;
        
    } else {
        menu.innerHTML = `
            <button onclick="switchView('view-dashboard')">Mijn Dossier</button>
            <button onclick="switchView('view-afspraak')">Nieuwe Afspraak</button>
            <button onclick="switchView('view-chat')">PoliMed AI CoPilots</button>
            <hr>
            <button onclick="logout()">Uitloggen</button>
        `;
    }
}

    // 4. Werkende Login Handler
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Voorkom dat de pagina herlaadt

            // Haal het e-mailadres op dat is ingevuld
            const email = document.getElementById('login-email').value;

            // Controleer of de gebruiker een arts is
            if (email.includes('arts')) {
                showMenuFor('arts'); // Bouw het artsen-menu
                switchView('view-arts-dashboard'); // Open het artsen-dashboard
            } else {
                showMenuFor('patient'); // Bouw het patiënten-menu
                switchView('view-dashboard'); // Open het patiënten-dashboard
            }

            // Toon de rest van de applicatie
            loginSection.classList.add('class-hidden');
            mainHeader.classList.remove('class-hidden');
            mainContent.classList.remove('class-hidden');
        });
    }
    // 5. Uitloggen Handler
    // 5. Uitloggen Handler
    function logout() {
        mainHeader.classList.add('class-hidden');    // Verberg navbar
        mainContent.classList.add('class-hidden');   // Verberg content
        loginSection.classList.remove('class-hidden'); // Toon inlogscherm weer
        
        if (loginForm) loginForm.reset();             // Maak invoervelden leeg
    }
    window.logout = logout; // Maak uitloggen overal beschikbaar

    // Zorg dat de fysieke uitlogknop (als die er is) deze functie ook aanroept
    if (btnLogout) {
        btnLogout.addEventListener('click', logout);
    }

    // 6. Navigatie Event Listeners
    if (navDash) navDash.addEventListener('click', () => switchView('view-dashboard'));
    if (navAfspraak) navAfspraak.addEventListener('click', () => switchView('view-afspraak'));
    if (navChat) navChat.addEventListener('click', () => switchView('view-chat'));
    if (navRecepten) navRecepten.addEventListener('click', () => switchView('view-recepten'));

});