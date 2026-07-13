import express from 'express';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

// The core health-check and proof of life endpoint.
app.get('/', (_req, res) => {
    res.send('Widow Protocol - Web Automation Agent Physical Hands: LIVE.');
});

// The metabolic trigger hook (SweepSync will hit this).
app.post('/trigger', (req, res) => {
    // Placeholder: This will eventually spawn the Apify main.ts logic natively.
    console.log('[CORE] Received metabolic stream data', req.body);
    res.status(200).json({ 
        status: 'ACCEPTED', 
        message: 'Agent execution initiated via metabolic stream.' 
    });
});

app.listen(PORT, () => {
    console.log(`[SYSTEM] Server listening on port ${PORT}`);
});
