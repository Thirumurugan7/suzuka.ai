from django.db import models
from django.contrib.auth.models import User

class ConversationHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)  # Optional: associate with a user
    session_id = models.CharField(max_length=255, unique=True)  # You can also use session ID for anonymous users
    history = models.TextField()  # Store the conversation history as a JSON string

    def __str__(self):
        return f"Conversation History for {self.session_id}"
