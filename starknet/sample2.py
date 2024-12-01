from starknet_py.net.full_node_client import FullNodeClient
from starknet_py.net.account.account import Account
from starknet_py.net.models import StarknetChainId
from starknet_py.net.signer.stark_curve_signer import KeyPair
import asyncio
from pathlib import Path
import json
from eth_hash.auto import keccak

async def create_new_wallet(network: str = "testnet"):
    try:
        # Generate a random private key
        # Note: In production, use a more secure random number generator
        private_key = keccak(b'your_random_seed').digest().hex()
        key_pair = KeyPair.from_private_key(int(private_key, 16))

        # Set up the network client
        if network == "testnet":
            client = FullNodeClient(node_url="https://alpha4.starknet.io")
        elif network == "mainnet":
            client = FullNodeClient(node_url="https://alpha-mainnet.starknet.io")
        else:
            client = FullNodeClient(node_url="https://alpha4.starknet.io")  # Default to testnet

        # Create a new account
        account = Account(
            client=client,
            address=None,  # Will be generated during deployment
            key_pair=key_pair,
            chain=StarknetChainId.TESTNET if network == "testnet" else StarknetChainId.MAINNET
        )

        # Save wallet info to file
        wallet_info = {
            "private_key": private_key,
            "public_key": hex(key_pair.public_key),
            "network": network,
            "address": hex(account.address) if account.address else None
        }

        # Create wallets directory if it doesn't exist
        Path("wallets").mkdir(exist_ok=True)
        
        # Save to file
        wallet_file = f"wallets/wallet_{wallet_info['public_key'][-8:]}.json"
        with open(wallet_file, 'w') as f:
            json.dump(wallet_info, f, indent=4)

        print(f"New wallet created successfully!")
        print(f"Private Key: {private_key}")
        print(f"Public Key: {wallet_info['public_key']}")
        print(f"Address: {wallet_info['address']}")
        print(f"Wallet info saved to: {wallet_file}")

        return account, wallet_info

    except Exception as e:
        print(f"Error creating wallet: {str(e)}")
        raise

async def main():
    # Create a new wallet on testnet
    account, wallet_info = await create_new_wallet("testnet")
    
    # Important: Fund this account with testnet ETH before using!
    print("\nIMPORTANT: Before using this account, you need to:")
    print("1. Fund it with testnet ETH")
    print("2. Deploy the account contract")
    print(f"3. Save the private key securely: {wallet_info['private_key']}")

if __name__ == "__main__":
    asyncio.run(main())
    
