
import express from 'express';
import pool from '../config/db.js'; // Verbinding met HeidiSQL
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();


// ==========================================================================
// 1. AFSPRAAK MAKEN (POST) - Patiënt dient een afspraak in
// ==========================================================================
router.post('/create', authMiddleware, async (req, res) => {
    try {
        const patient_id = req.user.id;
        const { dokter_id, appointment_date, appointment_time, reason } = req.body;

        const query = `INSERT INTO appointments (patient_id, dokter_id, appointment_date, appointment_time, reason, appointment_status) VALUES (?, ?, ?, ?, ?, 'pending')`;
        
        await pool.query(query, [patient_id, dokter_id, appointment_date, appointment_time, reason]);

        res.status(201).json({ message: 'Afspraak succesvol aangemaakt!' });
    } catch (error) {
        console.error("FOUT IN APPOINTMENTS.JS:", error);
        res.status(500).json({ message: 'Interne serverfout' });
    }
});
// ==========================================================================
// 2. AFSPRAKEN OPHALEN VOOR PATIËNT (GET) - Inclusief live telling!
// ==========================================================================
router.get('/patient/:id', async (req, res) => {
    const patientId = req.params.id; // Of req.params.id gebruiken i.p.value van req.body

    try {
        const sql = `
            SELECT a.*, d.dokter_naam, d.specialty, d.policlinic_name 
            FROM appointments a
            JOIN dokters d ON a.dokter_id = d.dokter_id
            WHERE a.patient_id = ?
            ORDER BY a.appointment_date DESC, a.appointment_time DESC
        `;

        const [results] = await pool.query(sql, [patientId]);

        return res.status(200).json({
            bericht: 'Succesvol',
            aantal_appointments: results.length,
            appointments: results
        });

    } catch (err) {
        console.error('Fout bij ophalen van appointments:', err);
        return res.status(500).json({ message: 'Interne serverfout', error: err.message });
    }
});

// ==========================================================================
// 3. AFSPRAKEN OPHALEN VOOR ARTS (GET) - Ziet alle binnenkomende aanvragen
// ==========================================================================
router.get('/dokter/:id', async (req, res) => {
    const dokterId = req.params.id;

    try {
        const sql = `
            SELECT a.*, p.patient_naam, p.patient_email 
            FROM appointments a
            JOIN patienten p ON a.patient_id = p.patient_id
            WHERE a.dokter_id = ?
            ORDER BY a.appointment_date ASC, a.appointment_time ASC
        `;

        const [results] = await pool.query(sql, [dokterId]);
        return res.status(200).json(results);

    } catch (err) {
        console.error('Fout bij ophalen artsen-overzicht:', err);
        return res.status(500).json({ message: 'Fout bij ophalen artsen-overzicht.', error: err.message });
    }
});

// ==========================================================================
// 4. STATUS EN NOTITIES BIJWERKEN (PUT) - Arts keurt goed/behandelt afspraak
// ==========================================================================
router.put('/update/:id', async (req, res) => {
    const appointmentId = req.params.id;
    const { appointment_status, doctor_notes } = req.body;

    try {
        const sql = `
            UPDATE appointments 
            SET appointment_status = ?, doctor_notes = ? 
            WHERE appointment_id = ?
        `;

        await pool.query(sql, [appointment_status, doctor_notes, appointmentId]);
        return res.status(200).json({ message: 'Afspraak succesvol bijgewerkt door de arts!' });

    } catch (err) {
        console.error('Fout bij bijwerken van afspraak status:', err);
        return res.status(500).json({ message: 'Fout bij bijwerken van afspraak status.', error: err.message });
    }
});

// ==========================================================================
// DOKTERS OPHALEN VOOR DROPDOWN (GET)
// ==========================================================================
router.get('/dokters-lijst', async (req, res) => {
    try {
        // We halen het ID, de naam en het specialisme op van alle dokters
        const [rows] = await pool.query('SELECT dokter_id, dokter_naam, specialty FROM dokters ORDER BY dokter_naam ASC');
        return res.status(200).json(rows);
    } catch (err) {
        console.error('Fout bij ophalen dokterslijst:', err);
        return res.status(500).json({ message: 'Kon dokters niet ophalen uit database.', error: err.message });
    }
});

export default router;