
import express from 'express';
import pool from '../config/db.js'; // Hiermee praat deze route met HeidiSQL

const router = express.Router();

// ==========================================================================
// 1. REGISTRATIE ENDPOINT (Patiënten registreren)
// ==========================================================================
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    // Basiscontrole of alle velden zijn ingevuld
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Vul alstublieft alle velden in.' });
    }

    try {
        // SQL Query om de patiënt op te slaan in de database
        const sql = 'INSERT INTO patienten (patient_naam, patient_email, patient_password) VALUES (?, ?, ?)';
        
        // We voeren de query uit via de db connectie
        db.query(sql, [username, email, password], (err, result) => {
            if (err) {
                // Als het e-mailadres al bestaat krijgen we een databasefout
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ message: 'Dit e-mailadres of deze gebruikersnaam is al geregistreerd.' });
                }
                return res.status(500).json({ message: 'Database fout', error: err });
            }
            
            return res.status(201).json({ message: 'Registratie succesvol! U kunt nu inloggen.' });
        });

    } catch (error) {
        return res.status(500).json({ message: 'Server fout tijdens registratie.' });
    }
});

// ==========================================================================
// LOGIN ENDPOINT - Geschikt voor mysql2/promise (Async/Await)
// ==========================================================================
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Vul gebruikersnaam/e-mail en wachtwoord in.' });
    }

    try {
        // STAP A: Zoeken in de 'patienten' tabel
        const sqlPatient = 'SELECT * FROM patienten WHERE patient_naam = ? OR patient_email = ?';
        const [patientResults] = await pool.query(sqlPatient, [username, username]);

        // Als er een patiënt is gevonden
        if (patientResults.length > 0) {
            const patient = patientResults[0];

            // Wachtwoord controle
            if (patient.patient_password === password || patient.password === password) {
                return res.status(200).json({
                    role: 'patient',
                    message: 'Inloggen succesvol als patiënt!',
                    user: {
                        id: patient.patient_id,
                        name: patient.patient_naam,
                        email: patient.patient_email
                    }
                });
            } else {
                return res.status(401).json({ message: 'Onjuist wachtwoord voor patiënt.' });
            }
        }

        // STAP B: Als er GEEN patiënt is gevonden, zoeken we in de 'dokters' tabel
        const sqlDokter = 'SELECT * FROM dokters WHERE dokter_naam = ? OR dokter_email = ?';
        const [dokterResults] = await pool.query(sqlDokter, [username, username]);

        // Als er een dokter is gevonden
        if (dokterResults.length > 0) {
            const dokter = dokterResults[0];
            const dbPassword = dokter.dokter_password || dokter.password;

            if (dbPassword === password) {
                return res.status(200).json({
                    role: 'arts',
                    message: 'Inloggen succesvol als arts!',
                    user: {
                        id: dokter.dokter_id,
                        name: dokter.dokter_naam,
                        email: dokter.dokter_email,
                        specialty: dokter.specialty,
                        policlinic: dokter.policlinic_name
                    }
                });
            } else {
                return res.status(401).json({ message: 'Onjuist wachtwoord voor arts.' });
            }
        }

        // Als de gebruiker in BEIDE tabellen niet bestaat
        return res.status(404).json({ message: 'Gebruiker niet gevonden in het systeem.' });

    } catch (err) {
        console.error('Server of Database fout tijdens login:', err);
        return res.status(500).json({ message: 'Interne serverfout.', error: err.message });
    }
});



export default router;