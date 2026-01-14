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

app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true, 
}));

// Capture raw body for debugging
app.use('/api', (req, res, next) => {
    let rawBody = '';
    req.on('data', chunk => {
        rawBody += chunk.toString();
    });
    req.on('end', () => {
        console.log('=== RAW REQUEST DEBUG ===');
        console.log('Content-Type:', req.get('Content-Type'));
        console.log('Raw body length:', rawBody.length);
        console.log('Raw body content:', JSON.stringify(rawBody));
        console.log('========================');
    });
    next();
});

// Add error handling for JSON parsing
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        console.error('JSON Parse Error:', err.message);
        console.error('Request body was:', req.body);
        return res.status(400).json({ 
            message: 'Invalid JSON in request body',
            error: err.message 
        });
    }
    next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Handle text/plain requests that should be JSON
app.use('/api', (req, res, next) => {
    if (req.get('Content-Type') === 'text/plain' && req.method === 'POST') {
        let rawBody = '';
        req.on('data', chunk => {
            rawBody += chunk.toString();
        });
        req.on('end', () => {
            console.log('Raw body content:', JSON.stringify(rawBody));
            console.log('Raw body length:', rawBody.length);
            try {
                req.body = JSON.parse(rawBody);
                console.log('Parsed text/plain as JSON:', req.body);
            } catch (e) {
                console.log('Failed to parse text/plain as JSON:', e.message);
                console.log('Raw body was:', rawBody);
            }
            next();
        });
    } else {
        next();
    }
});

app.use(cookieParser());

// Additional debug after JSON parsing
app.use((req, res, next) => {
    console.log('=== DEBUG INFO ===');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Content-Type:', req.get('Content-Type'));
    console.log('Content-Length:', req.get('Content-Length'));
    console.log('Parsed body:', req.body);
    console.log('Body keys:', Object.keys(req.body || {}));
    console.log('==================');
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