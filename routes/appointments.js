
import express from 'express';
import db from '../config/db.js'; // Verbinding met HeidiSQL

const router = express.Router();

// ==========================================================================
// 1. AFSPRAAK MAKEN (POST) - Patiënt dient een afspraak in
// ==========================================================================
router.post('/create', (req, res) => {
    const { patient_id, dokter_id, appointment_date, appointment_time, reason } = req.body;

    // Basiscontrole
    if (!patient_id || !dokter_id || !appointment_date || !appointment_time || !reason) {
        return res.status(400).json({ message: 'Alle velden zijn verplicht om een afspraak te plannen.' });
    }

    const sql = `
        INSERT INTO appointments (patient_id, dokter_id, appointment_date, appointment_time, reason, appointment_status) 
        VALUES (?, ?, ?, ?, ?, 'in afwachting')
    `;

    db.query(sql, [patient_id, dokter_id, appointment_date, appointment_time, reason], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Database fout bij aanmaken afspraak.', error: err });
        }
        return res.status(201).json({ message: 'Afspraak succesvol aangevraagd!', appointment_id: result.insertId });
    });
});

// ==========================================================================
// 2. AFSPRAKEN OPHALEN VOOR PATIËNT (GET) - Inclusief live telling!
// ==========================================================================
router.get('/patient/:id', (req, res) => {
    const patientId = req.params.id;

    // We halen alle afspraken op, én we voegen de naam van de dokter toe via een JOIN
    const sql = `
        SELECT a.*, d.dokter_naam, d.specialty, d.policlinic_name 
        FROM appointments a
        JOIN dokters d ON a.dokter_id = d.dokter_id
        WHERE a.patient_id = ?
        ORDER BY a.appointment_date DESC, a.appointment_time DESC
    `;

    db.query(sql, [patientId], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Fout bij ophalen van afspraken.', error: err });
        }

        // BI/Analyst logica: We tellen hier direct hoeveel afspraken deze patiënt heeft!
        const aantalAfspraken = results.length;

        // We sturen zowel de lijst met afspraken ALS het totale aantal terug naar de frontend
        return res.status(200).json({
            aantal_afspraken: aantalAfspraken,
            appointments: results
        });
    });
});

// ==========================================================================
// 3. AFSPRAKEN OPHALEN VOOR ARTS (GET) - Ziet alle binnenkomende aanvragen
// ==========================================================================
router.get('/doctor/:id', (req, res) => {
    const dokterId = req.params.id;

    const sql = `
        SELECT a.*, p.patient_naam, p.patient_email 
        FROM appointments a
        JOIN patienten p ON a.patient_id = p.patient_id
        WHERE a.dokter_id = ?
        ORDER BY a.appointment_date ASC, a.appointment_time ASC
    `;

    db.query(sql, [dokterId], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Fout bij ophalen artsen-overzicht.', error: err });
        }
        return res.status(200).json(results);
    });
});

// ==========================================================================
// 4. STATUS EN NOTITIES BIJWERKEN (PUT) - Arts keurt goed/behandelt afspraak
// ==========================================================================
router.put('/update/:id', (req, res) => {
    const appointmentId = req.params.id;
    const { appointment_status, doctor_notes } = req.body;

    // We bouwen de query dynamisch op, omdat de arts de status kan veranderen óf notities/recept kan toevoegen
    const sql = `
        UPDATE appointments 
        SET appointment_status = ?, doctor_notes = ? 
        WHERE appointment_id = ?
    `;

    db.query(sql, [appointment_status, doctor_notes || null, appointmentId], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Fout bij bijwerken van afspraak status.', error: err });
        }
        return res.status(200).json({ message: 'Afspraak succesvol bijgewerkt door de arts!' });
    });
});


export default router;