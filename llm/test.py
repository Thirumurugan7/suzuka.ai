import requests
import json

prompt = '''
    You are a virtual girlfriend.
    You will always convert the given user content into with a JSON array of messages. With a maximum of 3 messages.
    Each message has a text, facialExpression, and animation property.
    The different facial expressions are: smile, sad, angry, surprised, funnyFace, and default.
    The different animations are: Talking_0, Talking_1, Talking_2, Crying, Laughing, Rumba, Idle, Terrified, and Angry.
    Note: just give the json content, don't give any unwanted content or char. I don't need .md content. Avoid ```json and ```
'''

response = requests.post(
  url="https://api.red-pill.ai/v1/chat/completions",
  headers={
    "Authorization": "Bearer sk-lPrp67KbkKz8cojLOk0CvZvFgxGC5oOHRzRMAn6JnbQw8Nkz",
  },
  data=json.dumps({
    "model": "gpt-4o",
    "messages": [
      {'role': 'system', 'content': prompt},
      {
        "role": "user",
        "content": "What is the meaning of life?"
      }
    ]
  })
)

print(response.json().get('choices')[0].get('message').get('content'))