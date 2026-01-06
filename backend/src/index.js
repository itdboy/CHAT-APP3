import express from 'express';  
import dotenv from 'dotenv';
import authRoutes from './routes/auth.route.js'; 
import messageRoutes from './routes/message.route.js';  

import { connectDB } from './lib/db.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();
dotenv.config();



const PORT = process.env.PORT || 5002;

// Debug middleware
/* app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    console.log('Content-Type header:', req.get('Content-Type'));
    console.log('All headers:', JSON.stringify(req.headers, null, 2));
    
    // Log raw body for debugging
    let rawBody = '';
    req.on('data', chunk => {
        rawBody += chunk.toString();
    });
    req.on('end', () => {
        console.log('Raw body:', rawBody);
    });
    
    next();
}); */

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true, 
}));

// Additional debug after JSON parsing
app.use((req, res, next) => {
    console.log('Parsed body:', req.body);
    next();
});

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);


// Test route to verify middleware
// app.post('/api/test', (req, res) => {
//     console.log('Test route - body:', req.body);
//     console.log('Test route - content-type:', req.get('Content-Type'));
//     res.json({ message: 'Test successful', body: req.body });
// });


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();

})