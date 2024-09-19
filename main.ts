import "jsr:@std/dotenv/load";
import { SocketModeClient } from "npm:@slack/socket-mode";
import { LogLevel } from "npm:@slack/logger";
import { chat } from "./ollama.ts";

const SYSTEM_PROMPT = Deno.readTextFileSync("./prompt.txt");

interface Message {
    type: string;
    channel: string;
    text: string;
    user: string;
    ts: string;
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

async function handleMessage(message: Message) {
    // TODO: reply to the message with translated message
    // if message is a thread, reply to the thread
    // if message is not a thread, create a new thread and reply to the thread

    console.log(message);
    const translation = await chat(SYSTEM_PROMPT, message.text);
    console.log(translation);
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
