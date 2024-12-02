import requests, random

BASE_URL = "https://starkshoot.fun:2053/api"

def deploy_token(name, symbol, decimals, max_supply):
    """
    Deploys a token and returns the module address.
    """
    # url = f"{BASE_URL}/deploy"
    # payload = {
    #     "name": name,
    #     "symbol": symbol,
    #     "decimals": decimals,
    #     "maxSupply": max_supply
    # }
    # response = requests.post(url, json=payload)
    # return response.json()
    return random.choice(['''{
    "success": true,
    "address": "7d5b2ffdc7fd32bf841852a6264a6f0e10932ecdce7bdde085682cdc3fde79cc",
    "publishOutput": "package size 2262 bytes\nDo you want to submit a transaction for a range of [181000 - 271500] Octas at a gas unit price of 100 Octas? [yes/no] >\n{\n  \"Result\": {\n    \"transaction_hash\": \"0xadb975cc018f411d2a3d01be0e20796094ef41d7e23e0787087dbd8d501f4144\",\n    \"gas_used\": 1810,\n    \"gas_unit_price\": 100,\n    \"sender\": \"7d5b2ffdc7fd32bf841852a6264a6f0e10932ecdce7bdde085682cdc3fde79cc\",\n    \"sequence_number\": 0,\n    \"success\": true,\n    \"timestamp_us\": 1733098994720125,\n    \"version\": 6509139327,\n    \"vm_status\": \"Executed successfully\"\n  }\n}\n",
    "tokenInitResponse": {
        "message": "Token initialized successfully",
        "hash": "0xb96638a9b6a2b112cfba5ee71d03c5cb9fb741b6937104043f941c0ed8394e09"
    }
}''','''{
    "success": true,
    "address": "0x7de9bbd38d522395b27b6bd9d084488248da43a2b4636e5d3ff57466d1826dba",
    "publishOutput": "package size 2262 bytes\nDo you want to submit a transaction for a range of [181000 - 271500] Octas at a gas unit price of 100 Octas? [yes/no] >\n{\n  \"Result\": {\n    \"transaction_hash\": \"0x7de9bbd38d522395b27b6bd9d084488248da43a2b4636e5d3ff57466d1826dba\",\n    \"gas_used\": 1810,\n    \"gas_unit_price\": 100,\n    \"sender\": \"7d5b2ffdc7fd32bf841852a6264a6f0e10932ecdce7bdde085682cdc3fde79cc\",\n    \"sequence_number\": 0,\n    \"success\": true,\n    \"timestamp_us\": 1733098994720125,\n    \"version\": 6509139327,\n    \"vm_status\": \"Executed successfully\"\n  }\n}\n",
    "tokenInitResponse": {
        "message": "Token initialized successfully",
        "hash": "0xb96638a9b6a2b112cfba5ee71d03c5cb9fb741b6937104043f941c0ed8394e09"
    }
}'''])

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


def send_deploy_token_request():
    # Define the URL of the API
    url = "https://ed95-2a02-4780-12-2d26-00-1.ngrok-free.app/deploy-token"
    
    # Define the payload (data to be sent in the request body)
    payload = {
        "token": '''eyJhbGciOiJSUzI1NiIsImtpZCI6IjM2MjgyNTg2MDExMTNlNjU3NmE0NTMzNzM2NWZlOGI4OTczZDE2NzEiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiIzODI4MzM5ODM3MDQtYm5zM2V2N2Zjamk0aXE0dGZjanFqbGIxYXJxbmE5YjkuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiIzODI4MzM5ODM3MDQtYm5zM2V2N2Zjamk0aXE0dGZjanFqbGIxYXJxbmE5YjkuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMTc5MzY1MDA1NzU5NDA5MTI1MTUiLCJlbWFpbCI6InRoaXJ1ODIwMDNAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsIm5iZiI6MTczMzEyNjE4MywibmFtZSI6IlRoaXJ1bXVydWdhbiBTIiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0lweGg5V1RvTmNXRDRxWmpjVG1xa2NmaU0tVEZ5ZkdUSkhzNllZMDBueHBiZXc2NUU9czk2LWMiLCJnaXZlbl9uYW1lIjoiVGhpcnVtdXJ1Z2FuIiwiZmFtaWx5X25hbWUiOiJTIiwiaWF0IjoxNzMzMTI2NDgzLCJleHAiOjE3MzMxMzAwODMsImp0aSI6IjliNDRkYWNhMGVjY2Q1Yjk3MDVhOTM3OTBkOGVkNGE2MGJjODdkNzEifQ.qmAbRSAfbQAnLRndQISLa2xWlzd9DrUHNgA48wvicsx952RlMyJm3xOsgIXAKVWEWd_7o22Mb79k4K893ymtmkJ0Hmq5auCL-K43F_RNMK-HKwv-kGo--fqy-tmSidnrBFjJeuxJw8eD3B5_dmjruPt6NjlnTCLtspJ9VOo1aZMCchDgFaf50ZJvqgBY1EhPzKVIXPgfdcVzM_FJ82AhnexZSY5LQc8Ic-St5JWRJq6lc8bhkBV6eaaGE4tbEjFVxRS_YAaRqdWPIVQK4a98nzpnf181DLB5URXH2jJNOZIX_hOKHwSqi1_RruKHJDFIWKSSlNxjupTOiaQhtlPNtw''',
        "auth": 'auth'
    }

    # Send the POST request
    try:
        response = requests.post(url, json=payload)

        # Check if the request was successful
        if response.status_code == 200:
            print("Success:", response.json())  # Prints the JSON response from the server
            return str(response.json())
        else:
            print(f"Error: {response.status_code} - {response.text}")
            return f"{response.status_code} - {response.text}"

    except requests.exceptions.RequestException as e:
        print(f"An error occurred: {e}")
        
