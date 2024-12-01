const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const app = express();
const cors = require('cors'); // Add this line

app.use(cors({
    origin: 'http://localhost:5173' // Your frontend URL
}));
app.use(express.json());



const processedTokens = new Set();


// Endpoint to deploy module and initialize token
app.post('/deploy-token', async (req, res) => {

        const { token } = req.body;
        
        if (!token) {
            return res.status(400).json({ error: 'Token is required' });
        }

        // Check if token was already processed
        if (processedTokens.has(token)) {
            return res.status(400).json({ error: 'Token already processed' });
        }

        try {
            const response = await axios({
                method: 'post',
                url: 'https://sandbox-api.okto.tech/api/v2/authenticate',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Api-Key': 'ac9502db-13f0-4074-8ae0-6dc10ad2d0c5'
                },
                data: {
                    id_token: token
                }
            });

            console.log("res",response.data);
            
            // Add token to processed set
            processedTokens.add(token);
            
            // Set expiry for the token in cache (e.g., after 1 hour)
            setTimeout(() => {
                processedTokens.delete(token);
            }, 3600000); // 1 hour

            return res.json(response.data);
        } catch (error) {
            console.log("Error in auth", error);
            return res.status(500).json({ error: 'Authentication failed' });
        }
    
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});