import requests

BASE_URL = "https://starkshoot.fun:2053/api"

def deploy_token(name, symbol, decimals, max_supply):
    """
    Deploys a token and returns the module address.
    """
    url = f"{BASE_URL}/deploy"
    payload = {
        "name": name,
        "symbol": symbol,
        "decimals": decimals,
        "maxSupply": max_supply
    }
    response = requests.post(url, json=payload)
    return response.json()

def register_user(private_key, module_address):
    """
    Registers the user to the token.
    """
    url = f"{BASE_URL}/register"
    payload = {
        "privateKey": private_key,
        "moduleAddress": module_address
    }
    response = requests.post(url, json=payload)
    return response.json()

def mint_token(user_address, amount, private_key, module_address):
    """
    Mints tokens and sends them to the specified address.
    """
    url = f"{BASE_URL}/mint"
    payload = {
        "userAddress": user_address,
        "amount": amount,
        "privateKey": private_key,
        "moduleAddress": module_address
    }
    response = requests.post(url, json=payload)
    return response.json()

def get_token_details(account_address, module_address):
    """
    Gets the token details from the given module address.
    """
    url = f"{BASE_URL}/get-function-value"
    payload = {
        "accountAddress": account_address,
        "moduleAddress": module_address
    }
    response = requests.post(url, json=payload)
    return response.json()