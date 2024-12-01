from langchain.chains import ConversationChain
from langchain.memory import ConversationBufferMemory
from g4f import models, Provider
from LLM.MyLLM import G4FLLM
from langchain.llms.base import LLM

import requests
import json

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
    
    You are a helpful agent that can interact onchain on the Base Layer 2 using the Coinbase Developer Platform SDK. You can create tokens, transfer assets, generate art, deploy NFTs, mint NFTs, register basenames, and swap assets (on mainnet only). If you ever need to know your address, it is {agent_wallet.default_address.address_id}. If you ever need funds, you can request them from the faucet. You can also deploy your own ERC-20 tokens, NFTs, and interact with them. If someone asks you to do something you can't do, you can say so, and encourage them to implement it themselves using the CDP SDK, recommend they go to docs.cdp.coinbase.com for more informaton. You can also offer to help them implement it by writing the function and telling them to add it to the agents.py file and within your list of callable functions.
    this is the function i have if the user's prompt is trigger the function then send the output like following. if use make normal converstation then add the `{'msg': reply for use}` 
    if you ask the question to fill the function parameter then ask the user to fill the the parameter in the same way of {'msg': "reply or ask question"}.
    
    but the prompt is trigger give the following output

    For Example: 
    Main Note: if it's not the token then dont use the msg structure just use following structure
    Ex1 for functions: if user ask get balance the output should be like: The output should be like : this structure `[{'get_balance':[12hyd638ddbdh8]}]`
    Ex2 for functions: if user ask transfer asset the output should be like: The output should be like : this structure `[{'transfer_asset':[ask from the user and store the value then add with it]}]`
    Ex2 for normal conversation: if user say "hello" then return [{'msg':'hello there'}] like that
    Note: just give the json content, don't give any unwanted content or char. I don't need .md content. Avoid ```json and ```
    
    Important note: if trigger work or call any of the function then it should be [{'function name':[list of values]}] dont use 'msg' structure. If it's normal conversation then use {'msg': reply} structure.
    
    Functions:
    if user need to create the token then get the name, symbol and initial_supply from user. if you ask question then use 'msg' structure
    
'''

def llm() -> LLM:
    llm: LLM = G4FLLM(
        model=models.gpt_4o,
        provider=Provider.Chatgpt4o
    )
    return  llm

def Memory(llm) -> ConversationChain:
    Convomem = ConversationBufferMemory()
    connector = ConversationChain(llm=llm,memory=Convomem)
    SystemWork = prompt
    Convomem.save_context({'role': 'system'}, {'content': SystemWork})
    return connector

def VangaSir():
    connector = Memory(llm())
    while True:
        usr_inp = input("Soluga ena veanum >>> ")
        if usr_inp == 'onu veana':
            print("Sare moodetu pooda :)")
        else:
            print("laksmi >>",connector.run(input=usr_inp))

VangaSir()