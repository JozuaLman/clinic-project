// chat.js
document.addEventListener('DOMContentLoaded', () => {
    const aiForm = document.getElementById('ai-chat-form');
    const aiInputField = document.getElementById('ai-input-field');
    const aiMessagesBox = document.getElementById('ai-messages-box');
    const aiTitle = document.querySelector('.ai-chat-header h3');
    const aiSub = document.querySelector('.status-ai');

    // Functie om de rol te bepalen
    function getRole() {
        const artsDashboard = document.getElementById('view-arts-dashboard');
        if (artsDashboard && !artsDashboard.classList.contains('class-hidden')) {
            return 'arts';
        }
        return 'patient';
    }

    // Pas de titels in de header aan zodra het scherm geladen wordt
    function pasAiHeaderAan() {
        if (!aiTitle || !aiSub) return;
        if (getRole() === 'arts') {
            aiTitle.innerText = "PoliMed Admin CoPilot";
            aiSub.innerText = "Online | BI & Klinische Assistent";
            
            // Pas ook het welkomstbericht aan als de box nog leeg is (of alleen het startbericht heeft)
            if (aiMessagesBox && aiMessagesBox.children.length <= 1) {
                aiMessagesBox.innerHTML = `
                    <div class="message message-other">
                        <p><strong>PoliMed CoPilot:</strong><br>Goagendag dr. Alberts. Ik sta klaar om uw administratie te versnellen. Vraag me gerust om een patiëntendossier samen te vatten, een receptconcept te schrijven of uw dagschema te analyseren.</p>
                        <span class="message-time">Zojuist</span>
                    </div>
                `;
            }
        } else {
            aiTitle.innerText = "PoliMed AI Assistent";
            aiSub.innerText = "Online | Virtuele Zorgbegeleider";
        }
    }

    // Observer om te kijken wanneer de sectie actief wordt
    const viewChatSection = document.getElementById('view-chat');
    if (viewChatSection) {
        const observer = new MutationObserver(() => {
            if (!viewChatSection.classList.contains('class-hidden')) {
                pasAiHeaderAan();
            }
        });
        observer.observe(viewChatSection, { attributes: true, attributeFilter: ['class'] });
    }

    // Antwoord-generator op basis van ROL en KEYWORDS
    function genereerAiAntwoord(getypteTekst, role) {
        const tekst = getypteTekst.toLowerCase();

        // --- INTERFACE VOOR DE ARTS (ADMIN / BI COPLIOT) ---
        if (role === 'arts') {
            if (tekst.includes('samenvatting') || tekst.includes('lisa') || tekst.includes('dossier')) {
                return "**Concept Samenvatting Patiënt Lisa (#49202):**\n32-jarige vrouw, bekend met spanningshoofdpijn. Sinds vorige week gestart met nieuwe medicatie. Patiënt meldt dat de hoofdpijn inmiddels aanzienlijk is verminderd. Geen ernstige bijwerkingen gerapporteerd. Advies: continueren huidige dosering.";
            }
            if (tekst.includes('recept') || tekst.includes('medicijn') || tekst.includes('voorschrijven')) {
                return "**Recept Concept Gegenereerd:**\nRx: Paracetamol 500mg\nDosering: 3 daags 1-2 tabletten p.o. voor max 5 dagen.\n*Klik op 'Accorderen' in uw Dossier-menu om dit direct naar de apotheek te verzenden.*";
            }
            if (tekst.includes('afspraken') || tekst.includes('schema') || tekst.includes('druk')) {
                return "U heeft voor vandaag nog **1 openstaande afspraak** op de agenda staan om 16:00 uur (Patiënt Lisa). Er zijn vandaag 2 afspraken succesvol afgerond.";
            }
            if (tekst.includes('bedankt') || tekst.includes('dank')) {
                return "Tot uw dienst, dokter. Laat het me weten als ik nog een rapportage of brief voor u moet opstellen.";
            }
            return "Ik heb uw verzoek geanalyseerd. Binnen deze frontend-demo kan ik dossiers samenvatten, recepten uitschrijven of uw dagschema opvragen. Probeer bijvoorbeeld eens te typen: 'samenvatting lisa'.";
        } 
        
        // --- INTERFACE VOOR DE PATIËNT (SYMPTOMEN) ---
        else {
            if (tekst.includes('hoofdpijn') || tekst.includes('pijn in mijn hoofd')) {
                return "Vervelend dat je hoofdpijn hebt. Drink voldoende water en neem rust. Als het al langere tijd aanhoudt, adviseer ik je om via het dashboard een afspraak te maken met de huisarts.";
            }
            if (tekst.includes('koorts') || tekst.includes('warm') || tekst.includes('temperatuur')) {
                return "Bij koorts is het belangrijk om goed te drinken en uit te rusten. Is de koorts boven de 39 graden of duurt het langer dan 3 dagen? Neem dan contact op met de poli.";
            }
            if (tekst.includes('afspraak') || tekst.includes('dokter zien')) {
                return "Je kunt heel eenvoudig zelf een afspraak inplannen! Ga in je hoofdmenu naar 'Nieuwe Afspraak' om een beschikbare datum en tijd te kiezen bij jouw arts.";
            }
            if (tekst.includes('bedankt') || tekst.includes('dank u')) {
                return "Graag gedaan! Als je nog meer vragen hebt over je gezondheid, stel ze gerust.";
            }
            return "Ik begrijp je situatie. Om je zo goed mogelijk te helpen, raad ik je aan om dit kort te bespreken met een van onze specialisten. Je kunt via het menu direct een consult boeken.";
        }
    }

    if (aiForm) {
        aiForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const messageText = aiInputField.value.trim();
            if (messageText === '') return;

            const now = new Date();
            const timeString = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
            const role = getRole();

            // 1. Toon eigen bericht aan de rechterkant
            const myMessageHtml = `
                <div class="message message-me">
                    <p><strong>Jij:</strong><br>${messageText}</p>
                    <span class="message-time">${timeString}</span>
                </div>
            `;
            aiMessagesBox.innerHTML += myMessageHtml;

            aiInputField.value = '';
            aiMessagesBox.scrollTop = aiMessagesBox.scrollHeight;

            // 2. Toon AI antwoord aan de linkerkant
            setTimeout(() => {
                const aiAntwoord = genereerAiAntwoord(messageText, role);
                const aiSender = (role === 'arts') ? "PoliMed CoPilot" : "PoliMed AI";

                const aiHtml = `
                    <div class="message message-other">
                        <p><strong>${aiSender}:</strong><br>${aiAntwoord.replace(/\n/g, '<br>')}</p>
                        <span class="message-time">${timeString}</span>
                    </div>
                `;
                aiMessagesBox.innerHTML += aiHtml;
                aiMessagesBox.scrollTop = aiMessagesBox.scrollHeight;
            }, 1000);
        });
    }
});