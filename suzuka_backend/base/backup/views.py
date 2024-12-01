from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from langchain.chains import ConversationChain
from langchain.memory import ConversationBufferMemory
from g4f import models, Provider
from .LLM.MyLLM import G4FLLM
from langchain.llms.base import LLM

# Define the prompt
prompt = '''
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
        
    Functions:
    if user need to create the token then get the name, symbol and initial_supply from user. if you ask question then use 'message' structure
        - if user say create orr add the data randomly or create yourself you need to add the data
    
    Very important Note: just give the json content, don't give any unwanted content or char. I don't need .md content. Avoid ```json and ```
    
'''

# Initialize the LLM
def llm() -> LLM:
    llm: LLM = G4FLLM(
        model=models.gpt_4o,
        provider=Provider.Chatgpt4o
    )
    return  llm

# Initialize the memory for conversation
def Memory(llm) -> ConversationChain:
    Convomem = ConversationBufferMemory()
    connector = ConversationChain(llm=llm, memory=Convomem)
    SystemWork = prompt
    Convomem.save_context({'role': 'system'}, {'content': SystemWork})
    return connector

# Function to process the response and extract the necessary data
def handle_data(res):
    if '~~' in res:
        return {'message': res.split('~~')[1]}
    elif '@@' in res:
        struct = res.split('@@')
        function_name = struct[0]
        function_values = struct[1].split('::')
        return {function_name: function_values}

# Django view to handle user input and respond with the appropriate JSON
@csrf_exempt
def chat_view(request):
    if request.method == 'POST':
        user_input = request.POST.get('user_input')
        
        if user_input:
            connector = Memory(llm())
            out_res = connector.run(input=user_input)
            response_data = handle_data(out_res)
            return JsonResponse(response_data)

    return JsonResponse({'error': 'No input provided'}, status=400)
