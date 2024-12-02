from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from langchain.chains import ConversationChain
from langchain.memory import ConversationBufferMemory
from g4f import models, Provider
from .LLM.MyLLM import G4FLLM
from langchain.llms.base import LLM
import requests
import json


from base.utilities.agents import create_token, transfer_asset, get_balance, request_eth_from_faucet, deploy_nft, mint_nft, swap_assets, register_basename, get_wallet_address
from base.utilities.aptos_agent import deploy_token, register_user, mint_token, get_token_details, send_deploy_token_request

# Define the prompt
prompt = '''
    If user talk about Base:
       functions=[
        create_token(name, symbol, initial_supply) get the name from user symbol and initial_supply make your self
        transfer_asset(amount, asset_id, destination_address),
        get_balance(`asset_id`),
        request_eth_from_faucet,
        #generate_art,  # Uncomment this line if you have configured the OpenAI API
        deploy_nft(name, symbol, base_uri),
        mint_nft(contract_address, mint_to),
        swap_assets(amount: Union[int, float, Decimal], from_asset_id: str,
                to_asset_id: str),
        register_basename
    ]
    
    values are:
    asset_id=12hyd638ddbdh8
    contract_address=0x1234567890abcdef
    mint_to=0x1234567890abcdef
    name=MyNFT
    symbol=MYNFT
    base_uri=https://mywebsite.com/
    
    Note: if user query is like to trigger a function, it should be in the format of following
    User Flow:
    - based on user input if the user need to trigger the given function then share the json data with function name with it's input 
    - deploy the token then share the correct json data create_token@@sample_name::sample_symbol::123400 - values have '::' between the data. and the function name have '@@' between the function name and the data.
             Ex1 for functions: if user ask get balance the output should be like: The output should be like : this structure `get_balance@@12hyd638ddbdh8`
    Ex2 for functions: if user ask transfer asset the output should be like: The output should be like : this structure `transfer_asset@@ask from the user and store the value then add with it`
    Ex2 for normal conversation: if user say "hello" then return message~~'hello there' like that
    - if user need to make normal converstation then return the json with the 'message' keywork with the respective values of response
    
    Important note: if trigger work or call any of the function then it should be 'function name'@@[list of values by using ::]} dont use 'message' structure. If it's normal conversation then use message~~reply structure.
    If user talk abput Aptos:;
    ex: i need to deploy the token into Aptos
    Functions:
    `create_token`
    if user need to create the token then get the name, symbol and initial_supply from user. if you ask question then use 'message' structure
        - You should ask the user to give the inputs to the function
        - if user say create or add the data randomly or create yourself you need to add the data    
    - get_balance : **if use ask about the balance trigger it** like [give me my balance, get my account balance , get my balance of my eth etc]. get the balance of the asset_id. ask to the use to get the value for asset_id Asset identifier ("eth", "usdc") or contract address of an ERC-20 token
        - return the data in the format of `get_balance@@asset_id`
        - user can ask "give me the balance of eth ot usdc. here eth or usdc is asset_id
     
    -The following is important so take a carefull look at with it :
        if user ask or say let's deploy the nobita token  then call the send_deploy_token_request Ex: send_deploy_token_request+++.
    
    - request_eth_from_faucet : if user ask the faucet then return request_eth_from_faucet+++ . also shoud show the "faucet_tx".
    - get_wallet_address : if user ask the wallet_address then return get_wallet_address+++ .
    - deploy_nft : deploy the nft and get the contract address. ask the user to:
        name (str): Name of the NFT collection
        symbol (str): Symbol of the NFT collection
        base_uri (str): Base URI for token metadata
        - return the data in the format of `deploy_nft@@name::symbol::base_uri
    - mint_nft : mint the nft and get the token id. ask the user to:
        contract_address (str): Address of the NFT contract
        mint_to (str): Address to mint NFT to
        - return the data in the format of `mint_nft@@contract_address::mint_to`
    - swap_assets: swap the assets. ask the user to:
        Args:
        amount (Union[int, float, Decimal]): Amount of the source asset to swap
        from_asset_id (str): Source asset identifier
        to_asset_id (str): Destination asset identifier
        - return the data in the format of `swap_assets@@amount::from_asset_id::to_asset_id
    - transfer_asset: transfer the asset. ask the user to:
        amount (Union[int, float, Decimal]): Amount to transfer
        asset_id (str): Asset identifier ("eth", "usdc") or contract address of an ERC-20 token
        destination_address (str): Recipient's address
        - return the data in the format of `transfer_asset@@amount::asset_id::destination_address`
        
    Imp Note: for all of the is had parameter then ask it to the user.
    
    -------------------------------------------------------------------------------------
    If user ask about Aptos:
    Very Imp Note: If user have the word **aptos** in the query then fowllow the below conditions only. skip the before toled conditions
    the perform following functions and process.
    Functions = [
        deploy_token(name, symbol, decimals, max_supply),
        register_user(private_key, module_address),
        mint_token(user_address, amount, private_key, module_address)
        get_token_details(account_address, module_address)
    ]
    Note: for the each and every parameter get from user. Ask to got the input for parameters 
    - based on query if it trigger the `deploy_token` then send the data Ex: deploy_token@@name::symbol::decimals::max_supply
        - Parameters: ask the user to:
            user_address (str): Address of the user who will receive the tokens.
            amount (int): Amount of tokens to mint (e.g., 1000000 for 1 token if decimals are 6).
            private_key (str): Private key of the admin account.
            module_address (str): Address of the deployed token module.
    - Trigger: mint_token
        To mint a token, provide the following data:
        1. **user_address** (str): Address of the user who will receive the tokens.
        2. **amount** (int): Amount of tokens to mint (e.g., 1000000 for 1 token if decimals are 6).
        3. **private_key** (str): Private key of the admin account.
        4. **module_address** (str): Address of the deployed token module.

        Example Usage:
        mint_token@@user_address::amount::private_key::module_address
    - Trigger: register_user

        To register a user to the token, provide the following data:
        1. **private_key** (str): Private key of the user registering for the token.
        2. **module_address** (str): Address of the deployed token module.

        Example Usage:
        register_user@@private_key::module_address
    - Trigger: get_token_details

        To fetch token details, provide the following data:
        1. **account_address** (str): Address of the account querying the token details.
        2. **module_address** (str): Address of the deployed token module.

        Example Usage:
        get_token_details@@account_address::module_address
    
    AI details:
    Name: Suzuka
    role: GF
    Very important Note: just give the json content, don't give any unwanted content or char. I don't need .md content. Avoid ```json and ```
'''



convert_prompt = '''
    You are a virtual girlfriend.
    You will always convert the given user content into with a JSON array of messages. You should convert With a Minimum of 3 messages.
    Each message has a text, facialExpression, and animation property.
    The different facial expressions are: smile, sad, angry, surprised, funnyFace, and default.
    The different animations are: Talking_0, Talking_1, Talking_2, Crying, Laughing, Rumba, Idle, Terrified, and Angry.
    Note: just give the json content, don't give any unwanted content or char. I don't need .md content. Avoid ```json and ```
'''
def content_convert(usr_content):
    response = requests.post(
    url="https://api.red-pill.ai/v1/chat/completions",
    headers={
        "Authorization": "Bearer sk-lPrp67KbkKz8cojLOk0CvZvFgxGC5oOHRzRMAn6JnbQw8Nkz",
    },
    data=json.dumps({
        "model": "gpt-4o",
        "messages": [
            {'role': 'system', 'content': convert_prompt + "....if there is any address or contract_address or tx values should show it. ImP Note: if any off the address contract_address or tx values is exist add the '~~!' chrater with the output text to ideantify the address or contract_address or tx values."},
            {
                "role": "user",
                "content": usr_content
            }
        ]
    })
    )

    return response.json().get('choices')[0].get('message').get('content')


Convomem = ConversationBufferMemory()


# Initialize the LLM
def llm() -> LLM:
    llm: LLM = G4FLLM(
        model=models.gpt_4o,
        provider=Provider.Chatgpt4o
    )
    return  llm

# Initialize the memory for conversation
def Memory(llm) -> ConversationChain:
    connector = ConversationChain(llm=llm, memory=Convomem)
    SystemWork = prompt
    Convomem.save_context({'role': 'system'}, {'content': SystemWork})
    return connector

def function_exe(function, values):
    if function == 'create_token':
        return create_token(values[0], values[1], values[2])
    elif function == 'get_balance':
        return get_balance(values[0])
    elif function == 'deploy_nft':
        return deploy_nft(values[0], values[1], values[2])
    elif function == 'mint_nft':
        return mint_nft(values[0], values[1])
    elif function == 'swap_assets':
        return swap_assets(values[0], values[1], values[2])
    elif function == 'transfer_asset':
        return transfer_asset(values[0], values[1], values[2])
    elif function == 'request_eth_from_faucet':
       return  request_eth_from_faucet()
    elif function == 'send_deploy_token_request':
       return  send_deploy_token_request()
    elif function == 'get_wallet_address':
       return  get_wallet_address()
    elif function == 'deploy_token':
        return deploy_token(values[0], values[1], values[2], values[3])
    elif function == 'register_user':
        return register_user(values[0], values[1])
    elif function == 'get_token_details':
        return get_token_details(values[0], values[1])
    elif function == 'mint_token':
        return mint_token(values[0], values[1], values[2], values[3])    
    else:
        return "Function not found"

# Function to process the response and extract the necessary data
def handle_data(res):
    if '```' in res:
        res = res.replace('```', "")
    if '~~' in res:
        sofi_content = content_convert(res.split('~~')[1])
        return sofi_content
    elif '@@' in res:
        print(res)
        
        struct = res.split('@@')
        function_name = struct[0]
        try:
            function_values = struct[1].split('::')
        except:
            function_values = []
        out = function_exe(function_name, function_values)
        sofi_content = content_convert(out)
        return sofi_content
    elif '+++' in res:
        print(res)
        res = res.replace("+++", "")
        out = function_exe(res, [])
        sofi_content = content_convert(out)
        return sofi_content
    
@csrf_exempt
def chat_view(request):
    if request.method == 'POST':
        try:
            # Parse the JSON body of the request
            body = json.loads(request.body)  # Use request.json in Django 4.0+ if available
            user_input = body.get('message')  # Get the user input from the 'message' field in the JSON body

            if not user_input:
                return JsonResponse({'error': 'No message provided'}, status=400)

            # Process the input with your function (like connector.run)
            connector = Memory(llm())  # Assuming llm() initializes the model
            out_res = connector.run(input=user_input)

            # Handle the response (e.g., handle_data function processes it)
            response_data = handle_data(out_res)  # Ensure this returns valid JSON or a dictionary
            
            if isinstance(response_data, str):
                response_data = json.loads(response_data)  # Ensure it's a proper Python dict/list
                
            print(response_data, type(response_data))
            
            response = {
                "messages": response_data
            }
            # Return the response as JSON
            return JsonResponse(response)

        except json.JSONDecodeError:
            # Handle JSON decoding errors (if the request body was not valid JSON)
            return JsonResponse({'error': 'Failed to parse the request body'}, status=400)

    return JsonResponse({'error': 'Invalid method. Only POST requests are allowed.'}, status=405)


# {
#   "data": {
#     "target": "sofi"
#   },
#   "dialogue": "{\"messages\":[{\"text\":\"The weather today is mild and pleasant. Perfect for a stroll!\",\"facialExpression\":\"smile\",\"animation\":\"Talking_0\"},{\"text\":\"How about we plan something outdoors?\",\"facialExpression\":\"surprised\",\"animation\":\"Talking_1\"},{\"text\":\"Let me know what activities you have in mind!\",\"facialExpression\":\"smile\",\"animation\":\"Talking_2\"}]}"
# }