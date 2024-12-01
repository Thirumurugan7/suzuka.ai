import openai
from langchain.agents import initialize_agent, Tool, AgentType
from langchain.agents import AgentExecutor
from langchain.prompts import PromptTemplate
from langchain.chat_models import ChatOpenAI
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
import re

# Set your OpenAI API key
openai.api_key = "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"

# Function definitions that we will trigger
def draw_graphic():
    print("Drawing the graphic...")

def open_tkinter_window():
    print("Opening the Tkinter window...")

def play_music():
    print("Playing music...")

# Define the function to trigger based on the AI's response
def trigger_function_based_on_response(response):
    """Check the AI response and trigger functions."""
    if re.search(r'\bdraw_graphic\b', response, re.IGNORECASE):
        draw_graphic()
    elif re.search(r'\bopen_tkinter_window\b', response, re.IGNORECASE):
        open_tkinter_window()
    elif re.search(r'\bplay_music\b', response, re.IGNORECASE):
        play_music()
    else:
        print(f"AI Response: {response}")

# Define tools that LangChain will use. These tools will be "triggered" based on user input.
tools = [
    Tool(
        name="draw_graphic",
        func=draw_graphic,
        description="This tool draws a graphic."
    ),
    Tool(
        name="open_tkinter_window",
        func=open_tkinter_window,
        description="This tool opens a tkinter window."
    ),
    Tool(
        name="play_music",
        func=play_music,
        description="This tool plays music."
    ),
]

# Initialize the LLM (Large Language Model) - GPT-3.5, GPT-4, etc.
llm = ChatOpenAI(model="gpt-4", openai_api_key=openai.api_key)

# Set up the agent using LangChain with the tools and the model
agent = initialize_agent(tools, llm, agent_type=AgentType.ZERO_SHOT_REACT_DESCRIPTION, verbose=True)

# Function to run the agent and trigger functions based on the response
def run_agent(user_input):
    # Use LangChain to run the agent with the user input
    print(f"User input: {user_input}")
    response = agent.run(user_input)

    # After receiving the agent's response, trigger functions if required
    trigger_function_based_on_response(response)

def main():
    # Run the program continuously
    while True:
        user_input = input("You: ")

        if user_input.lower() in ['exit', 'quit']:
            print("Goodbye!")
            break
        
        run_agent(user_input)

if __name__ == "__main__":
    main()
