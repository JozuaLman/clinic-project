// Globale statusvariabele voor de actieve rol
let currentRole = ''; 
// --- UNIVERSELE FETCH FUNCTIE ---
async function secureFetch(url, options = {}) {
    const token = localStorage.getItem('token');
    
    options.headers = { 
        ...options.headers, 
        'Authorization': `Bearer ${token}`, 
        'Content-Type': 'application/json' 
    };

    return await fetch(url, options); 
}

// 1. Inlog Systeem (Aangepast voor echte Database!)
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const userValue = document.getElementById('login-username').value.trim(); 
const passwordValue = document.getElementById('login-password').value; 
const errorMsg = document.getElementById('login-error-message');

    // We sturen de inloggegevens naar onze Express backend route /api/auth/login
    fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: userValue, password: passwordValue })
    })
    .then(res => res.json())
    .then(data => {
        if (data.role) {
            // Succesvol ingelogd! De backend geeft ons de rol ('patient' of 'arts')
            currentRole = data.role;
            
            // Sla de unieke ID van de ingelogde persoon op voor later gebruik bij afspraken
            localStorage.setItem('userId', data.user.id);
            localStorage.setItem('userRole', data.user.id); 

            if (data.token) {
                localStorage.setItem('token', data.token);
             
            }

            // Bepaal het startscherm op basis van de rol
            let startView = (currentRole === 'patient') ? 'view-patient-dashboard' : 'view-arts-dashboard';
            
            // Start de sessie (haalt loginsscherm weg, etc.) via jouw bestaande functie
            startSessie(startView);

            // Als het een patiënt is, laden we de dokters. Als het een arts is, de consulten!
if (currentRole === 'patient') {
    loadDoctorsIntoForm();
} else if (currentRole === 'arts') {
    loadDoctorAppointments();
}
        } else {
            // Als de backend een foutmelding stuurt (bijv. verkeerd wachtwoord)
            errorMsg.textContent = data.message || 'Inloggen mislukt.';
            errorMsg.classList.remove('class-hidden');
        }
    })
    .catch(err => {
        console.error('Inlogfout:', err);
        errorMsg.textContent = 'Er is een serverfout opgetreden.';
        errorMsg.classList.remove('class-hidden');
    });
});

// ==========================================================================
// NIEUW: Haal dokters live op uit de database en vul de HTML dropdowns!
// ==========================================================================
function loadDoctorsIntoForm() {
    const doctorSelect = document.getElementById('appointment-doctor-select');


   if (!doctorSelect) return;

    // Vraag alle dokters op via onze backend route
   const token = localStorage.getItem('token');

   fetch('/api/appointments/dokters-lijst', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(res => {
        if (!res.ok) throw new Error('Server gaf een foutmeding');
        return res.json();
    })
    .then(dokters => {
        console.log("De dokters die binnenkomen in de frontend:", dokters);
            // Maak de dropdowns eerst leeg (behalve de eerste standaardoptie)
            doctorSelect.innerHTML = '<option value="">-- Selecteer een specialist --</option>';
         

 dokters.forEach(dokter => {
            const docOption = document.createElement('option');
            docOption.value = dokter.dokter_id;
            docOption.textContent = `Dr. ${dokter.dokter_naam} (${dokter.specialty})`;
            doctorSelect.appendChild(docOption);
        });
    })
            
        
        .catch(err => console.error('Fout bij het laden van de dokters:', err));
}

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

// ==========================================================================
// AFSPRAAK VERZENDEN NAAR DATABASE
// ==========================================================================
const appointmentForm = document.getElementById('appointment-form');
if (appointmentForm) {
    // We halen eerst de oude inline onsubmit alert weg die we in de HTML zagen
   appointmentForm.addEventListener('submit', function(e) {
    e.preventDefault();

    // Haal de opgeslagen patiënt ID op
    const patientId = localStorage.getItem('userId');

    // Haal waarden uit het formulier
    const doctorId = document.getElementById('appointment-doctor-select').value;
    const appointmentDate = document.getElementById('appointment-date').value;
    const appointmentReason = document.getElementById('appointment-reason').value;

    const appointmentTime = '08:00:00';

    if (!doctorId) {
        alert('Selecteer aub eerst een arts.');
        return;
    }

    const appointmentData = {
        
        dokter_id: doctorId,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        reason: appointmentReason
    };

    fetch('/api/appointments/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(appointmentData)
    })
    .then(res => res.json())
    .then(data => {
        if (data.appointment_id) {
            alert('Afspraak succesvol opgeslagen in de database!');
            appointmentForm.reset();
        } else {
            alert('Fout bij het aanvragen: ' + data.message);
        }
    })
    .catch(err => {
        console.error('Netwerkfout bij afspraak maken:', err);
        alert('Er is een serverfout opgetreden bij het verzenden.');
    });
});
}

// ==========================================================================
// AFSPRAKEN LIVE INLADEN VOOR DE INLOGGEDE ARTS
// ==========================================================================
function loadDoctorAppointments() {
    const tableBody = document.getElementById('doctor-appointments-table');
    if (!tableBody) return;

    // Haal de unieke ID van de ingelogde arts op uit de localStorage
    const doctorId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    if (!doctorId) {
        console.error('Geen arts ID gevonden in de sessie.');
        return;
    }

    // Vraag de specifieke afspraken van deze arts op bij de backend
    fetch(`/api/appointments/dokter/${doctorId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(res => {
        if (!res.ok) throw new Error('Server gaf een foutmelding');
        return res.json();
    })
    .then(appointments => {
        // Maak de tabel eerst helemaal leeg
        tableBody.innerHTML = '';

        // Pak de array veilig uit de response
        const appointmentsArray = Array.isArray(appointments) ? appointments : (appointments.appointments || []);

        if (appointmentsArray.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">U heeft momenteel geen binnenkomende consulten.</td></tr>';
            return;
        }

        // Loop door alle afspraken heen en bouw de tabelrijen
        appointmentsArray.forEach(app => {
            const row = document.createElement('tr');

            // Zet de datum om naar een net formaat (DD-MM-YYYY)
            const formattedDate = new Date(app.appointment_date).toLocaleDateString('nl-NL');
            // Pak de uren en minuten
            const formattedTime = app.appointment_time ? app.appointment_time.substring(0, 5) : '08:00';

            row.innerHTML = `
                <td><strong>${app.patient_naam || 'Onbekende Patiënt'}</strong></td>
                <td>${formattedDate} om ${formattedTime} u</td>
                <td>${app.reason || 'Geen klachten ingevuld.'}</td>
                <td>
                    <div class="action-btn-group">
                        <button class="btn-table btn-approve" onclick="alert('Afspraak goedgekeurd!')">✓ Goedkeuren</button>
                        <button class="btn-table btn-reject" onclick="alert('Afspraak geweigerd.')">✕ Weigeren</button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
    })
    .catch(err => {
        console.error('Fout bij het ophalen van artsenafspraken:', err);
        tableBody.innerHTML = '<tr><td colspan="4" style="color:red; text-align:center;">Fout bij laden van gegevens uit database.</td></tr>';
    });
}

// ==========================================================================
// AUTOMATISCH DOKTERS INLADEN IN HET FORMULIER (PATIËNT DASHBOARD)
// ==========================================================================
async function loadDoctorsIntoForm() {
    const doctorSelect = document.getElementById('appointment-doctor-select');
    if (!doctorSelect) return;

   try {
    // Haal de beveiligingstoken op uit de localStorage
    const token = localStorage.getItem('token');

    // Stuur de token netjes mee in de headers
    const response = await fetch('/api/appointments/dokters-lijst', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    const dokters = await response.json();

        if (response.ok) {
            doctorSelect.innerHTML = '<option value="">-- Selecteer een specialist --</option>';

            dokters.forEach(dokter => {
                const option = document.createElement('option');
                option.value = dokter.dokter_id;
                option.textContent = `Dr. ${dokter.dokter_naam} (${dokter.specialty})`;
                doctorSelect.appendChild(option);
            });
        } else {
            console.error('Fout bij laden dokters:', dokters.message);
        }
    } catch (error) {
        console.error('Kon geen verbinding maken om dokters te laden:', error);
    }
}