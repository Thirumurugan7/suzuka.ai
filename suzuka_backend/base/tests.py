import requests
import json

# URL of the Django endpoint you're testing
url = 'http://127.0.0.1:8000/process/'  # Adjust this URL if your Django app is running on a different port

# Set the headers to specify the content type is JSON
headers = {
    'Content-Type': 'application/json',
}

# Start the conversation loop
while True:
    # Get the user's message
    user_input = input("You: ")  # This will allow the user to type a message

    if user_input.lower() in ['exit', 'quit', 'bye']:  # Exit condition for the loop
        print("Exiting chat. Goodbye!")
        break

    # Prepare the payload with the user's message
    payload = {
        'message': user_input
    }

    try:
        # Send the POST request to the Django server
        response = requests.post(url, data=json.dumps(payload), headers=headers)

        # Check if the response is successful (status code 200)
        if response.status_code == 200:
            # Parse the JSON response and display the chatbot's reply
            response_data = response.json()
            if 'messages' in response_data:
                # Assuming the first message in the 'messages' array is the chatbot's response
                chatbot_message = response_data['messages'][0]['text']
                print(f"Chatbot: {chatbot_message}")
            else:
                print("Chatbot response was not in the expected format.")
        else:
            print(f"Error: Received unexpected status code {response.status_code} from the server.")
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
