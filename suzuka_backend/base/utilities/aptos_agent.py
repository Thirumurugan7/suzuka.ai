import requests

def deploy_token(api_url, name, symbol, decimals, max_supply):
    """
    Deploys a token to the specified module.

    Args:
        api_url (str): The API URL to send the request to.
        name (str): The name of the token.
        symbol (str): The symbol of the token.
        decimals (int): The decimal places for the token.
        max_supply (int): The maximum supply of the token.

    Returns:
        dict: Response from the API.
    """
    # Define the payload
    payload = {
        "name": name,
        "symbol": symbol,
        "decimals": decimals,
        "maxSupply": max_supply
    }

    try:
        # Make the POST request
        response = requests.post(api_url, json=payload)
        
        print(response.json())

        # Raise an exception for non-successful status codes
        response.raise_for_status()

        # Return the JSON response
        return response.json()
    except requests.exceptions.RequestException as e:
        return {"error": str(e)}

# Usage example
api_url = "https://starkshoot.fun:2053/deploy"
name = "MyToken"
symbol = "MT"
decimals = 6
max_supply = 10000000000000

response = deploy_token(api_url, name, symbol, decimals, max_supply)
print(response)
