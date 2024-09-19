import "jsr:@std/dotenv/load";
import { SocketModeClient } from "npm:@slack/socket-mode";
import { LogLevel } from "npm:@slack/logger";
import { chat } from "./llm.ts";
import { ChatPostMessageArguments, WebClient } from "npm:@slack/web-api";
import { shouldTranslate } from "./utils.ts";

const SYSTEM_PROMPT = Deno.readTextFileSync("./prompt.txt");
const TRANSLATED_BY_BOT_TEXT = "[_translated by the Bot._]";

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
    if (message.text.includes(TRANSLATED_BY_BOT_TEXT)) {
        return;
    }
    const text = message.text;
    if (!shouldTranslate(text)) {
        return;
    }

    console.log("Received message:", text);
    const translation = await chat(
        SYSTEM_PROMPT,
        text,
    );
    console.log("Translation:", translation);

    const response = `${translation}\n${TRANSLATED_BY_BOT_TEXT}`;

    const msg: ChatPostMessageArguments = {
        channel: message.channel,
        text: response,
        blocks: [
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: response,
                },
            },
        ],
        thread_ts: message.ts,
        mrkdwn: true,
        parse: "full",
    };
    // Reply to the existing thread if it exists
    if (message.thread_ts) msg.thread_ts = message.thread_ts;

    try {
        await webClient.chat.postMessage(msg);
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
