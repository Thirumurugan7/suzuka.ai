import requests

BASE_URL = 'http://127.0.0.1:8000/process/'  # Ensure this matches the actual URL in your Django project

def test_chat():
    with requests.Session() as session:  # Using a session to maintain cookies and state
        while True:
            # Get user input for the next message
            user_input = input("You: ")

            # Exit condition
            if user_input.lower() in ['exit', 'quit']:
                print("Exiting chat...")
                break

            # Send the user input to the Django endpoint using the session
            response = session.post(BASE_URL, data={'user_input': user_input})
            
            # Print the raw response content to inspect it
            print("Raw Response Text:", response.text)

            # Try to parse JSON if response is valid
            try:
                response_data = response.json()
                print("Response:", response_data)
            except requests.exceptions.JSONDecodeError:
                print("Failed to decode JSON")

if __name__ == "__main__":
    test_chat()
