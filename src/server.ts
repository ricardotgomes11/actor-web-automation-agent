import express from 'express';
import { WidowProtocol, MagneticPayload } from './widow_protocol.js';

const app = express();
const PORT = process.env.PORT || 8080;

// Instantiate the brain
const widow = new WidowProtocol();

app.use(express.json());

// The core health-check and proof of life endpoint.
app.get('/', (_req, res) => {
    res.send('Widow Protocol - Web Automation Agent Physical Hands: LIVE.');
});

// The metabolic trigger hook (SweepSync will hit this).
app.post('/trigger', async (req, res) => {
    console.log('[CORE] Received metabolic stream payload', req.body);
    
    try {
        const payload = req.body as MagneticPayload;
        
        // Pass the magnetic data stream into the Widow Protocol for acoustic translation
        const result = await widow.processMagneticStream(payload);
        
        res.status(200).json({ 
            status: 'ACCEPTED', 
            details: result 
        });
    } catch (error: any) {
        console.error('[SYSTEM] Error during protocol decoding:', error);
        res.status(500).json({ error: 'Failed to process magnetic stream' });
    }
});

app.listen(PORT, () => {
    console.log(`[SYSTEM] Server listening on port ${PORT}`);
});
