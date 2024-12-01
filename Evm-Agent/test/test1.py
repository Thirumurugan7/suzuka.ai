import json
import requests
from swarm import Agent
from cdp import *
from typing import List, Dict, Any
import os
from openai import OpenAI
from decimal import Decimal
from typing import Union
from web3 import Web3
from web3.exceptions import ContractLogicError
from cdp.errors import ApiError, UnsupportedAssetError

# Get configuration from environment variables
API_KEY_NAME = "organizations/0e12463b-bdb4-407e-b8d0-b3f8bdeece03/apiKeys/967dfc0e-082e-499c-8309-bf4670fa75e1"
PRIVATE_KEY = '''-----BEGIN EC PRIVATE KEY-----\nMHcCAQEEIK39w9I0AF5kY+YdSQrAf3sxQsWuwPMN8DLGogABmT2foAoGCCqGSM49\nAwEHoUQDQgAEvHedQg1bYJK/9WYGvp97vVFkxVhv8Ifu6N7+1mW42SMQOqDq2q7C\nHC1xv2X6qjh4INJLrJ9uAld4YGRcVe13zw==\n-----END EC PRIVATE KEY-----\n'''

# Configure CDP with environment variables
Cdp.configure(API_KEY_NAME, PRIVATE_KEY)

# Fetch and load agent wallet
agent_wallet = Wallet.fetch("0484b428-44aa-46d2-a9a9-25ad45f485f8")
print("fetched_data: ", agent_wallet)
agent_wallet.load_seed('my_seed.json')

# Function to interact with Red-Pill AI
def query_redpill_ai(prompt: str) -> str:
    """
    Query the Red-Pill AI API and get the response.
    
    Args:
        prompt (str): The input prompt to send to Red-Pill AI
    
    Returns:
        str: AI response
    """
    try:
        response = requests.post(
            url="https://api.red-pill.ai/v1/chat/completions",
            headers={
                "Authorization": "Bearer sk-lPrp67KbkKz8cojLOk0CvZvFgxGC5oOHRzRMAn6JnbQw8Nkz",
            },
            data=json.dumps({
                "model": "gpt-4o",
                "messages": [
                    {"role": "user", "content": prompt}
                ]
            })
        )
        response_data = response.json()
        return response_data.get("choices", [{}])[0].get("message", {}).get("content", "No response from AI.")
    except Exception as e:
        return f"Error querying Red-Pill AI: {str(e)}"

# Function to deploy meme coin (ERC-20 token) dynamically
def deploy_meme_coin(name: str = None, symbol: str = None, initial_supply: int = None):
    """
    Deploy a meme coin token (ERC-20) with the provided parameters or defaults.
    
    Args:
        name (str): The name of the token (optional)
        symbol (str): The symbol of the token (optional)
        initial_supply (int): The initial supply of tokens (optional)
    
    Returns:
        str: The result of the token creation
    """
    # Use default values if parameters are not provided
    name = name or "MemeCoin"
    symbol = symbol or "MEME"
    initial_supply = initial_supply or 1000000  # Default 1 million tokens
    
    try:
        deployed_contract = agent_wallet.deploy_token(name, symbol, initial_supply)
        deployed_contract.wait()
        return f"Successfully deployed {name} ({symbol}) with an initial supply of {initial_supply} tokens at contract address: {deployed_contract.contract_address}"
    except Exception as e:
        return f"Error deploying meme coin token: {str(e)}"

# Function to interact with the AI agent and handle deployment requests
def handle_deployment_request(prompt: str):
    """
    Handles requests to deploy a meme coin token by the AI agent.
    
    Args:
        prompt (str): The prompt that contains deployment request.
    
    Returns:
        str: The result of the token deployment process.
    """
    if "deploy the meme coin" in prompt.lower() or "let's deploy the meme coin" in prompt.lower():
        # Check if the user provides additional info (like name, symbol, supply)
        prompt_lower = prompt.lower()
        
        if "name" in prompt_lower and "symbol" in prompt_lower and "supply" in prompt_lower:
            # Extract the name, symbol, and supply from the prompt if provided
            parts = prompt_lower.split()
            name = parts[parts.index("name") + 1] if "name" in parts else None
            symbol = parts[parts.index("symbol") + 1] if "symbol" in parts else None
            supply = int(parts[parts.index("supply") + 1]) if "supply" in parts else None
            
            return deploy_meme_coin(name, symbol, supply)
        
        # If not provided, ask for details and deploy with defaults
        return deploy_meme_coin()
    
    return "I didn't recognize the command to deploy the meme coin."

# Function to deploy NFT
def deploy_nft(name, symbol, base_uri):
    try:
        deployed_nft = agent_wallet.deploy_nft(name, symbol, base_uri)
        deployed_nft.wait()
        contract_address = deployed_nft.contract_address
        return f"Successfully deployed NFT contract '{name}' ({symbol}) at address {contract_address} with base URI: {base_uri}"
    except Exception as e:
        return f"Error deploying NFT contract: {str(e)}"

# Based Agent with AI-driven deployment of meme coins
based_agent = Agent(
    name="Based Agent",
    instructions="You are a helpful agent that can interact on-chain and deploy tokens like meme coins when requested.",
    functions=[
        handle_deployment_request,  # Added AI-driven meme coin deployment handler
        query_redpill_ai,  # Added Red-Pill AI functionality
    ],
)

# Example Usage
prompt = "Let's deploy the meme coin with name MemeCoinX, symbol MX, and supply 500000"
deployment_response = handle_deployment_request(prompt)
print(f"Response: {deployment_response}")

# Example Usage without parameters (will use defaults)
prompt = "Hello"
deployment_response = handle_deployment_request(prompt)
print(f"Response: {deployment_response}")
