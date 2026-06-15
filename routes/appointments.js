import express from 'express';
import pool from '../config/db.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Route 1: Haal alle afspraken op (beveiligd met de token!)
router.get('/', verifyToken, async (req, res) => {
  try {
    // Hier vragen we dadelijk de afspraken op uit HeidiSQL
    res.json({ message: "Hier komen straks de afspraken uit de database!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route 2: Maak een nieuwe afspraak aan
router.post('/', verifyToken, async (req, res) => {
  try {
    // Hier vangen we straks de data op uit jouw frontend formulier
    res.json({ message: "Afspraak succesvol ontvangen!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;