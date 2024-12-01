from django.shortcuts import render, redirect
from django.contrib.auth import login, authenticate
from django.contrib.auth.models import User
from django.contrib import messages
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
import re

# Helper function to validate password strength
def is_strong_password(password):
    # At least 8 characters, one uppercase, one lowercase, and one digit
    return bool(re.match(r'^(?=.*[A-Za-z])(?=.*\d)(?=.*[A-Z])(?=.*[a-z]).{8,}$', password))

# Signup view
def signup(request):
    if request.method == 'POST':
        # Get form data from the POST request
        username = request.POST.get('username')
        password = request.POST.get('password')
        password_confirmation = request.POST.get('password_confirmation')
        
        # Check if username is already taken
        if User.objects.filter(username=username).exists():
            messages.error(request, 'Username already taken. Please choose a different one.')
            return redirect('signup')
        
        # Validate password strength
        # if not is_strong_password(password):
        #     messages.error(request, 'Password must be at least 8 characters long, contain an uppercase letter, a lowercase letter, and a number.')
        #     return redirect('signup')
        
        # Check if password and confirmation match
        if password != password_confirmation:
            messages.error(request, 'Passwords do not match.')
            return redirect('signup')
        
        # Create the user
        user = User.objects.create_user(username=username, password=password)
        login(request, user)  # Automatically log the user in after successful signup
        
        messages.success(request, f'Account created successfully for {username}!')
        return redirect('login')  # Redirect to home or any other page after signup
    else:
        return render(request, 'signup.html')  # Render the signup page

# Login view
def login_view(request):
    if request.method == 'POST':
        # Get form data from the POST request
        username = request.POST.get('username')
        password = request.POST.get('password')
        
        # Authenticate the user
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            # Log the user in
            login(request, user)
            messages.success(request, f'Welcome back, {username}!')
            return redirect('signup')  # Redirect to home or any other page after successful login
        else:
            messages.error(request, 'Invalid username or password')
            return redirect('signup')
    else:
        return render(request, 'login.html')  # Render the login page

