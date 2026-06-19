import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import pool from './config/db.js';

// Snel aanpassen naar jouw import-stijl:
import appointmentRoutes from './routes/appointments.js'; 
import authRoutes from './routes/auth.js';
import doktersRoutes from './routes/dokters.js';
import patientenRoutes from './routes/patienten.js';
import authMiddleware from './middlewares/authMiddleware.js';

// Laad de instellingen uit de .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares voor de server zelf
app.use(cors()); // Zorgt ervoor dat je frontend veilig met je backend mag praten
app.use(express.json()); // Zorgt ervoor dat de server JSON-data kan begrijpen
app.use(express.static('public')); // Serveert je frontend bestanden automatisch

// Koppel alle routes aan de server (HIEER MOETEN ZE STAAN!)
// 1. De INLOG-ROUTE: Deze moet OPEN blijven (geen authMiddleware)
app.use('/api/auth', authRoutes);

// 2. De BEVEILIGDE ROUTES: Hier voegen we authMiddleware toe als "tussenstap"
app.use('/api/appointments', authMiddleware, appointmentRoutes);
app.use('/api/dokters', authMiddleware, doktersRoutes);
app.use('/api/patienten', authMiddleware, patientenRoutes);

// Start de server op
app.listen(PORT, () => {
    console.log(` let's go Server is running beautifully on http://localhost:${PORT}`);
});