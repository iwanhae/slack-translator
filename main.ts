import "jsr:@std/dotenv/load";
import { SocketModeClient } from "npm:@slack/socket-mode";
import { LogLevel } from "npm:@slack/logger";
import { chat } from "./ollama.ts";
import { WebClient } from "npm:@slack/web-api";
import { shouldTranslate, stripSlackFormatting } from "./utils.ts";

const SYSTEM_PROMPT = Deno.readTextFileSync("./prompt.txt");

interface Message {
    type: string;
    channel: string;
    text: string;
    user: string;
    ts: string;
    thread_ts?: string;
}

function getEnvOrThrow(key: string): string {
    const value = Deno.env.get(key);
    if (!value) {
        throw new Error(`${key} is not set`);
    }
    return value;
}

const slackAppToken = getEnvOrThrow("SLACK_APP_TOKEN");
const slackBotToken = getEnvOrThrow("SLACK_BOT_TOKEN");
const webClient = new WebClient(slackBotToken);

async function handleMessage(message: Message) {
    const text = stripSlackFormatting(message.text);
    if (!shouldTranslate(text)) {
        return;
    }

    console.log("Received message:", text);
    const translation = await chat(SYSTEM_PROMPT, text);
    console.log("Translation:", translation);

    try {
        if (message.thread_ts) {
            // Reply to the existing thread
            await webClient.chat.postMessage({
                channel: message.channel,
                thread_ts: message.thread_ts,
                text: translation,
                mrkdwn: true,
            });
        } else {
            // Create a new thread with the translation
            await webClient.chat.postMessage({
                channel: message.channel,
                thread_ts: message.ts,
                text: translation,
                mrkdwn: true,
            });
        }
        console.log("Reply sent successfully");
    } catch (error) {
        console.error("Error sending reply:", error);
    }
}

if (import.meta.main) {
    const client = new SocketModeClient({
        logLevel: LogLevel.INFO,
        pingPongLoggingEnabled: true,
        appToken: slackAppToken,
    });

    client.on("message", async ({ ack, event }) => {
        // handles only ack-able events
        if (ack === undefined) {
            return;
        }

        // skip if event.text is undefined
        if (!event.text) {
            return;
        }

        try {
            handleMessage(event);
        } catch (error) {
            console.error(error);
        } finally {
            await ack();
        }
    });
    client.start();
}
