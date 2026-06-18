// Globale statusvariabele voor de actieve rol
let currentRole = ''; 

// 1. Inlog Systeem Logica
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const userInvoer = document.getElementById('login-username').value.trim().toLowerCase();
    const wachtwoordInvoer = document.getElementById('login-password').value;
    const errorMelding = document.getElementById('login-error-message');

    // Controleer de inloggegevens (eenvoudige frontend check voor demo)
    if (userInvoer === 'lisa' && wachtwoordInvoer === '123') {
        currentRole = 'patient';
        startSessie('view-patient-dashboard');
    } else if (userInvoer === 'dr_ramdin' && wachtwoordInvoer === '123') {
        currentRole = 'arts';
        startSessie('view-arts-dashboard');
    } else {
        // Toon foutmelding bij verkeerde inlog
        errorMelding.classList.remove('class-hidden');
    }
});

function startSessie(startView) {
    // Verberg het inlogscherm en toon de hoofdapplicatie container
    document.getElementById('view-login').classList.add('class-hidden');
    document.getElementById('app-container').classList.remove('class-hidden');
    
    // Reset eventuele foutmeldingen
    document.getElementById('login-error-message').classList.add('class-hidden');
    
    // Open direct het juiste start-dashboard
    switchView(startView);
}

// 2. Schakelen Tussen Schermen (Views)
function switchView(viewId) {
    const sections = document.querySelectorAll('.view-section');
    sections.forEach(section => {
        section.classList.add('class-hidden');
    });

    const targetSection = document.getElementById(viewId);
    if (targetSection) {
        targetSection.classList.remove('class-hidden');
    }

    // Sluit het dropdown menu na het inklikken van een optie
    document.getElementById('dropdown-menu').classList.add('class-hidden');
}

// 3. Dynamisch Dropdown Menu Genereren
function toggleMenu() {
    const menu = document.getElementById('dropdown-menu');
    menu.classList.toggle('class-hidden');

    if (!menu.classList.contains('class-hidden')) {
        let menuHTML = '';
        if (currentRole === 'patient') {
            menuHTML = `
                <button onclick="switchView('view-patient-dashboard')">📊 Dashboard</button>
                <button onclick="switchView('view-patient-afspraken')">📅 Afspraak Boeken</button>
                <button onclick="switchView('view-chat')">🤖 PoliMed AI Assistent</button>
                <hr style="border: 0; border-top: 1px solid #eee;">
                <button onclick="logout()" style="color: red;">Uitloggen</button>
            `;
        } else if (currentRole === 'arts') {
            menuHTML = `
                <button onclick="switchView('view-arts-dashboard')">📊 Medisch Dashboard</button>
                <button onclick="switchView('view-arts-binnenkomend')">🔔 Binnenkomende Afspraken</button>
                <button onclick="switchView('view-arts-recepten')">💊 Recept & Dossier</button>
                <button onclick="switchView('view-arts-beheer')">⚙️ Poli & Arts Beheer</button>
                <button onclick="switchView('view-chat')">🤖 PoliMed Admin CoPilot</button>
                <hr style="border: 0; border-top: 1px solid #eee;">
                <button onclick="logout()" style="color: red;">Uitloggen</button>
            `;
        }
        menu.innerHTML = menuHTML;
    }
}

// 4. Notificatie Dropdown (Bel)
function toggleNotifications() {
    const drop = document.getElementById('notification-dropdown');
    drop.classList.toggle('class-hidden');
    document.getElementById('bell-badge-count').textContent = '0';
}

// 5. Uitloggen Functionaliteit
function logout() {
    currentRole = '';
    document.getElementById('login-form').reset();
    document.getElementById('app-container').classList.add('class-hidden');
    document.getElementById('view-login').classList.remove('class-hidden');
    document.getElementById('dropdown-menu').classList.add('class-hidden');
}

// Sluit popups zodra de gebruiker buiten het menu klikt
window.addEventListener('click', function(e) {
    if (!e.target.matches('.menu-trigger-btn') && !e.target.closest('.dropdown-menu-wrapper')) {
        document.getElementById('dropdown-menu').classList.add('class-hidden');
    }
    if (!e.target.closest('.notification-container')) {
        document.getElementById('notification-dropdown').classList.add('class-hidden');
    }
});