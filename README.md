# Slack Translation Bot

A Slack bot that provides real-time translation services using Ollama's local
language models.

## Features

- Listens to Slack messages in real-time using Socket Mode
- Translates messages to English using Ollama's Gemma 2 9B model
- Maintains formal, business-appropriate language in translations

## Prerequisites

- Deno runtime
- Ollama installed locally
- Slack App and Bot tokens

## Setup

1. Clone the repository
2. Create a `.env` file with your Slack tokens:
   ```
   SLACK_APP_TOKEN=your_app_token_here
   SLACK_BOT_TOKEN=your_bot_token_here
   ```
3. Ensure Ollama is running with the Gemma 2 9B model

## Usage

Run the bot:
