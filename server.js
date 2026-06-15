import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import appointmentRoutes from './routes/appointments.js'; // Let op: als jouw bestand in 'routes' router.js heet, verander dit dan naar ./routes/router.js

// Laad de instellingen uit de .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares voor de server zelf
app.use(cors()); // Zorgt ervoor dat je frontend veilig met je backend mag praten
app.use(express.json()); // Zorgt ervoor dat de server JSON-data kan begrijpen
app.use(express.static('public')); // Serveert je frontend bestanden automatisch

// Koppel de afspraken-routes aan de server
app.use('/api/appointments', appointmentRoutes);

// Start de server op
app.listen(PORT, () => {
  console.log(`🚀 Server is running beautifully on http://localhost:${PORT}`);
});