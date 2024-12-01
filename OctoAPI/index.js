const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(express.json());




// Endpoint to deploy module and initialize token
app.post('/deploy-token', async (req, res) => {

});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});