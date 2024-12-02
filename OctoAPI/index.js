const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const app = express();
const cors = require('cors'); // Add this line
const { ethers } = require('ethers');

app.use(cors({
    origin: ['https://suzuka-ai-ljkp.vercel.app', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Api-Key'],
    credentials: true
}));
app.use(express.json());

const abi = [
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "bool",
				"name": "status",
				"type": "bool"
			}
		],
		"name": "ContractPaused",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "tokenAddress",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "symbol",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "initialSupply",
				"type": "uint256"
			}
		],
		"name": "ERC20Created",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "tokenAddress",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "symbol",
				"type": "string"
			}
		],
		"name": "ERC721Created",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "symbol",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "initialSupply",
				"type": "uint256"
			}
		],
		"name": "deployERC20",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "symbol",
				"type": "string"
			}
		],
		"name": "deployERC721",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "erc20InitialSupplies",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "erc20Tokens",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "erc721Tokens",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "tokenAddress",
				"type": "address"
			}
		],
		"name": "getERC20InitialSupply",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getERC20Tokens",
		"outputs": [
			{
				"internalType": "address[]",
				"name": "",
				"type": "address[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getERC721Tokens",
		"outputs": [
			{
				"internalType": "address[]",
				"name": "",
				"type": "address[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "tokenAddress",
				"type": "address"
			}
		],
		"name": "isERC20DeployedByFactory",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "tokenAddress",
				"type": "address"
			}
		],
		"name": "isERC721DeployedByFactory",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "paused",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bool",
				"name": "_paused",
				"type": "bool"
			}
		],
		"name": "setPaused",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
]

const processedTokens = new Set();



app.post('/deploy-token', async (req, res) => {
    try {
        const { token , auth } = req.body;
        
        if (!token) {
            return res.status(400).json({ error: 'Token is required' });
        }

        if (processedTokens.has(token)) {
            return res.status(400).json({ error: 'Token already processed' });
        }

        // Authentication request
        const authResponse = await axios({  // renamed from response to authResponse
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

        console.log("auth response", authResponse.data);
        processedTokens.add(token);

        const contractAddress = "0x7ECd045257107c84129BCce9DBa8feb211b4a7E7";
        const authToken = authResponse.data.data.auth_token;  // using authResponse instead of response

        // Create contract data
        const iface = new ethers.utils.Interface(abi);
        const data = iface.encodeFunctionData("deployERC20", [
            "thiru",
            "ts",
            ethers.utils.parseEther('100000')  // directly use string for better precision
        ]);

        console.log("data", data);
        console.log("Auth token", auth);

        // Get wallets
        try {

            console.log("authToken", authToken.trim());

            const authResponses = await axios({  // renamed from response to authResponse
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
    
            console.log("auth response", authResponses.data);
            const authToken1 = authResponses.data.data.auth_token;  // using authResponse instead of response


            
            const walletsResponse = await axios({  // renamed to walletsResponse
                method: 'post',
                url: "https://sandbox-api.okto.tech/api/v1/wallet",
                headers: {
                    'Authorization': `Bearer ${authToken1}`
                }
            });
            console.log("wallets", walletsResponse.data.data.wallets);
const networks = walletsResponse.data.data.wallets;
            const baseAddress = networks.find(network => network.network_name === 'BASE').address;
console.log(baseAddress); 

  // Execute transaction
        try {

            const authResponses = await axios({  // renamed from response to authResponse
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
    
            console.log("auth response", authResponses.data);
            const authToken1 = authResponses.data.data.auth_token;  // using authResponse instead of response

            const txResponse = await axios({  // renamed to txResponse
                method: 'post',
                url: 'https://sandbox-api.okto.tech/api/v1/rawtransaction/execute',
                headers: {
                    'Authorization': `Bearer ${authToken1}`,
                    'Content-Type': 'application/json'
                },
                data: {
                    network_name: "BASE",
                    transaction: {
                        from: baseAddress,
                        to: contractAddress,
                        data: data,
                        value: "0x"
                    }
                }
            });

            console.log('Transaction submitted:', txResponse.data);
            return res.json(txResponse.data);  // Return the transaction response
            
        } catch (error) {
            console.log("Error in contract:", error.response?.data || error);
            return res.status(500).json({ error: 'Contract execution failed' });
        }
        } catch (error) {
            console.log("Error in getting wallets:", error.response?.data || error);
        }

      

    } catch (error) {
        console.log("Error in auth:", error.response?.data || error);
        return res.status(500).json({ error: 'Authentication failed' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});