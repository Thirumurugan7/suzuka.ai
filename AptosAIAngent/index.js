const express = require('express');
const { AptosClient, AptosAccount, FaucetClient, HexString } = require('aptos');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(express.json());

// Configure Aptos client (default to devnet)
const NODE_URL = process.env.APTOS_NODE_URL || "https://fullnode.devnet.aptoslabs.com";
const FAUCET_URL = process.env.APTOS_FAUCET_URL || "https://faucet.devnet.aptoslabs.com";

const client = new AptosClient(NODE_URL);
const faucetClient = new FaucetClient(NODE_URL, FAUCET_URL);

// Helper function to validate private key
function validatePrivateKey(privateKey) {
    if (!privateKey) {
        throw new Error('Private key is required');
    }
    
    // Ensure the private key is a valid hex string
    if (!/^(0x)?[0-9a-fA-F]{64}$/.test(privateKey)) {
        throw new Error('Invalid private key format. Must be a 32-byte hex string');
    }
    
    // Remove '0x' prefix if present
    return privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
}

// Endpoint to deploy module and initialize token
app.post('/deploy-token', async (req, res) => {
    try {
        const {
            name,
            symbol,
            decimals,
            maxSupply,
            privateKey
        } = req.body;

        // Validate required fields
        if (!name || !symbol || decimals === undefined || maxSupply === undefined) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: name, symbol, decimals, maxSupply'
            });
        }

        // Validate and format private key
        let formattedPrivateKey;
        try {
            formattedPrivateKey = validatePrivateKey(privateKey);
        } catch (error) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        // Create account from private key
        const deployerAccount = new AptosAccount(
            new HexString(formattedPrivateKey).toUint8Array()
        );

        // Read the Move module code
        const modulePath = path.join(__dirname, 'meme2.move');
        try {
            const moduleCode = await fs.readFile(modulePath, 'utf8');
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: `Failed to read module file: ${error.message}`
            });
        }

        // Fund account if needed (on devnet)
        try {
            await faucetClient.fundAccount(deployerAccount.address(), 100_000_000);
        } catch (error) {
            console.warn('Warning: Failed to fund account:', error.message);
        }

        // Deploy the module
        const moduleHex = Buffer.from(moduleCode).toString('hex');
        const deployTxnPayload = {
            type: "module_bundle_payload",
            modules: [
                {
                    bytecode: moduleHex
                }
            ]
        };

        const deployTxn = await client.generateTransaction(
            deployerAccount.address(),
            deployTxnPayload
        );
        
        const signedDeployTxn = await client.signTransaction(
            deployerAccount,
            deployTxn
        );
        
        const deployTxnResult = await client.submitTransaction(signedDeployTxn);
        await client.waitForTransaction(deployTxnResult.hash);

        // Initialize the token
        const moduleAddress = deployerAccount.address().hex();
        const initializeTokenPayload = {
            type: "entry_function_payload",
            function: `${moduleAddress}::meme2::initialize_token`,
            type_arguments: [],
            arguments: [
                Buffer.from(name).toString('hex'),
                Buffer.from(symbol).toString('hex'),
                decimals,
                maxSupply
            ]
        };

        const initTxn = await client.generateTransaction(
            deployerAccount.address(),
            initializeTokenPayload
        );
        
        const signedInitTxn = await client.signTransaction(
            deployerAccount,
            initTxn
        );
        
        const initTxnResult = await client.submitTransaction(signedInitTxn);
        await client.waitForTransaction(initTxnResult.hash);

        res.json({
            success: true,
            moduleAddress: moduleAddress,
            deployTxnHash: deployTxnResult.hash,
            initTxnHash: initTxnResult.hash
        });

    } catch (error) {
        console.error('Deployment error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});