import requests
import json
import re

# Function Definitions to Trigger Based on Response
def draw_graphic():
    print("Drawing the graphic...")

def open_tkinter_window():
    print("Opening the Tkinter window...")

def play_music():
    print("Playing music...")

# Function to Trigger Based on AI Response
def trigger_function_based_on_response(response):
    """Check the AI response and trigger corresponding functions."""
    if re.search(r'\bdraw_graphic\b', response, re.IGNORECASE):
        draw_graphic()
    elif re.search(r'\bopen_tkinter_window\b', response, re.IGNORECASE):
        open_tkinter_window()
    elif re.search(r'\bplay_music\b', response, re.IGNORECASE):
        play_music()
    else:
        print(f"AI Response: {response}")

# Custom LLM Function Using the Red-Pill API
def chat_with_custom_llm(user_input):
    url = "https://api.red-pill.ai/v1/chat/completions"
    headers = {
        "Authorization": "Bearer sk-lPrp67KbkKz8cojLOk0CvZvFgxGC5oOHRzRMAn6JnbQw8Nkz",  # Replace with your actual API key
    }
    payload = {
        "model": "gpt-4o",
        "messages": [
            {"role": "user", "content": user_input}
        ]
    }

    # Send POST request to the Red-Pill API
    response = requests.post(url, headers=headers, data=json.dumps(payload))

    if response.status_code == 200:
        ai_response = response.json()
        return ai_response['choices'][0]['message']['content'].strip()
    else:
        print(f"Error: {response.status_code}")
        return None

# Main Function to Continuously Interact with User and Trigger Functions
def main():
    while True:
        user_input = input("You: ")

        # Exit condition if the user wants to quit
        if user_input.lower() in ['exit', 'quit']:
            print("Goodbye!")
            break

        # Get the response from the custom LLM
        ai_response = chat_with_custom_llm(user_input)
        
        if ai_response:
            print(f"AI: {ai_response}")
            # Trigger function based on AI response
            trigger_function_based_on_response(ai_response)

if __name__ == "__main__":
    main()
