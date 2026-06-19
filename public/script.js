// Globale statusvariabele voor de actieve rol
let currentRole = ''; 

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
    const poliSelect = document.getElementById('appointment-poli-select');

    if (!doctorSelect || !poliSelect) return;

    // Vraag alle dokters op via onze backend route
    fetch('/api/dokters/all')
        .then(res => res.json())
        .then(dokters => {
            // Maak de dropdowns eerst leeg (behalve de eerste standaardoptie)
            doctorSelect.innerHTML = '<option value="">-- Selecteer een specialist --</option>';
            poliSelect.innerHTML = '<option value="">-- Selecteer een poli --</option>';

            // Handige sets om dubbele poli-namen te voorkomen in de poli-dropdown
            const uniekePolis = new Set();

            dokters.forEach(dokter => {
                // 1. Voeg de dokter toe aan de artsen-dropdown
                // We zetten het dokter_id in de 'value', zodat de database straks weet welke dokter het is!
                const docOption = document.createElement('option');
                docOption.value = dokter.dokter_id; 
                docOption.textContent = `Dr. ${dokter.dokter_naam} (${dokter.specialty})`;
                doctorSelect.appendChild(docOption);

                // 2. Voeg de poli toe aan de poli-dropdown (als deze er nog niet in zit)
                if (!uniekePolis.has(dokter.policlinic_name)) {
                    uniekePolis.add(dokter.policlinic_name);
                    const poliOption = document.createElement('option');
                    poliOption.value = dokter.policlinic_name;
                    poliOption.textContent = dokter.policlinic_name;
                    poliSelect.appendChild(poliOption);
                }
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
        patient_id: patientId,
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

    if (!doctorId) {
        console.error('Geen arts ID gevonden in de sessie.');
        return;
    }

    // Vraag de specifieke afspraken van deze arts op bij de backend
    fetch(`/api/appointments/doctor/${doctorId}`)
        .then(res => res.json())
        .then(appointments => {
            // Maak de tabel eerst helemaal leeg
            tableBody.innerHTML = '';

            if (appointments.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">U heeft momenteel geen binnenkomende consulten.</td></tr>';
                return;
            }

            // Loop door alle afspraken heen en bouw de tabelrijen
            appointments.forEach(app => {
                const row = document.createElement('tr');

                // Zet de datum om naar een net formaat (DD-MM-YYYY)
                const formattedDate = new Date(app.appointment_date).toLocaleDateString('nl-NL');
                // Pak de uren en minuten (08:00:00 -> 08:00)
                const formattedTime = app.appointment_time ? app.appointment_time.substring(0, 5) : '08:00';

                row.innerHTML = `
                    <td><strong>${app.patient_naam || 'Onbekende Patiënt'}</strong></td>
                    <td>${formattedDate} om ${formattedTime}u</td>
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
        console.error('Fout bij het ophalen van artsenafspraken: ', err);
        tableBody.innerHTML = '<tr><td colspan="4" style="color:red; text-align:center;">Fout bij laden van gegevens uit database.</td></tr>';
    });
}

// ==========================================================================
// AFSPRAAK VERSTUREN VANUIT DE FRONTEND
// ==========================================================================
const appointmentForm = document.getElementById('appointment-form');

if (appointmentForm) {
    appointmentForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Voorkom dat de pagina ongewenst herlaadt

        // 1. Grijp alle ingevulde waarden uit jouw HTML select en input ID's
        const dokter_id = document.getElementById('appointment-doctor-select').value;
        const appointment_date = document.getElementById('appointment-date').value;
        const appointment_time = document.getElementById('appointment-time').value;
        const reason = document.getElementById('appointment-reason').value;

        // 2. Haal de ID van de ingelogde patiënt op uit de localStorage
        // Zorg dat je bij een succesvolle login de patient_id opslaat als: localStorage.setItem('userId', user.id)
        const patient_id = localStorage.getItem('userId'); 

        if (!patient_id) {
            alert("Je sessie is verlopen of je bent niet ingelogd als patiënt. Log opnieuw in.");
            return;
        }

        // 3. Stuur de data door naar de stabiele async/await backend route
        try {
            const response = await fetch('/api/appointments/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    patient_id,
                    dokter_id,
                    appointment_date,
                    appointment_time,
                    reason
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert('Afspraak succesvol ingediend bij de poli!');
                appointmentForm.reset(); // Maak het formulier weer helemaal leeg
            } else {
                alert('Foutmelding: ' + data.message);
            }

        } catch (error) {
            console.error('Frontend error tijdens aanmaken afspraak:', error);
            alert('Kon geen verbinding maken met de server.');
        }
    });
}

// ==========================================================================
// AUTOMATISCH DOKTERS INLADEN IN HET FORMULIER
// ==========================================================================
async function loadDoctorsIntoForm() {
    const doctorSelect = document.getElementById('appointment-doctor-select');
    
    if (!doctorSelect) return; // Als we niet op het juiste scherm zijn, doe niks

    try {
        const response = await fetch('/api/appointments/dokters-lijst', {
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
    }
});
const dokters = await response.json();
        if (response.ok) {
            // Maak de dropdown eerst leeg, behalve de eerste placeholder optie
            doctorSelect.innerHTML = '<option value="">-- Selecteer een specialist --</option>';

            // Loop door alle dokters uit de database en maak een <option> tag voor ze
            dokters.forEach(dokter => {
                const option = document.createElement('option');
                option.value = dokter.dokter_id; // De database ID sturen we mee naar de backend
                option.textContent = `Dr. ${dokter.dokter_naam} (${dokter.specialty})`; // Dit ziet de patiënt
                doctorSelect.appendChild(option);
            });
        } else {
            console.error('Fout bij laden dokters:', dokters.message);
        }
    } catch (error) {
        console.error('Kon geen verbinding maken om dokters te laden:', error);
    }
}