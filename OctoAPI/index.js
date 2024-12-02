const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const app = express();
const cors = require('cors'); // Add this line
const { ethers } = require('ethers');

app.use(cors({
    origin: 'http://localhost:5173' // Your frontend URL
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
            // setTimeout(() => {
            //     processedTokens.delete(token);
            // }, 3600000); // 1 hour


            const contractAddress = "0x7ECd045257107c84129BCce9DBa8feb211b4a7E7";


            const tokenName = "My Token";
            const tokenSymbol = "MTK";
        
const supply = 100000;
const iface = new ethers.utils.Interface(abi);
            const data = iface.encodeFunctionData("deployERC20", [
                "thiru",
                "ts",
                ethers.utils.parseEther(supply.toString())
            ]);
         

            console.log("data",data);
            
            const authToken = response.data.data.auth_token;

            console.log("Auth token", authToken);
            
            try {
                const wallets = await axios ({
                    method: 'post',
                    url: "https://sandbox-api.okto.tech/api/v1/wallet",
                    headers:{
                        'Authorization': `Bearer ${response.data.data.auth_token}`,
                    }  

                })

                console.log("wallets",wallets.data)
            } catch (error) {
                console.log("error i ngeting ", error);
                
            }
            try {
                const response = await axios({
                    method: 'post',
                    url: 'https://sandbox-api.okto.tech/api/v1/rawtransaction/execute',
                    headers: {
                        'Authorization': `Bearer ${response.data.data.auth_token}`,
                        'Content-Type': 'application/json'
                    },
                    data: {
                        network_name: "BASE",
                        transaction: {
                            from: "0x89E2600ba719F3637C154D88Cfc941FC94fF9c7f", // Replace with your wallet address
                            to: contractAddress,
                            data: data,
                            value: "0x0" // No value needed for this call
                        }
                    }
                });
        
                console.log('Transaction submitted:', response.data);
            } catch (error) {
                console.log("erroo in  conrracrt",error);
                
            }

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