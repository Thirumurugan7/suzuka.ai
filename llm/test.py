import requests
import json

response = requests.post(
  url="https://api.red-pill.ai/v1/chat/completions",
  headers={
    "Authorization": "Bearer sk-lPrp67KbkKz8cojLOk0CvZvFgxGC5oOHRzRMAn6JnbQw8Nkz",
  },
  data=json.dumps({
    "model": "gpt-4o",
    "messages": [
      {
        "role": "user",
        "content": "What is the meaning of life?"
      }
    ]
  })
)

print(response.json().get('choices')[0].get('message').get('content'))