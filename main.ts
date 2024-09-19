import "jsr:@std/dotenv/load";
import { SocketModeClient } from "npm:@slack/socket-mode";
import { LogLevel } from "npm:@slack/logger";

interface Message {
    type: string;
    channel: string;
    text: string;
    user: string;
    ts: string;
}

function handleMessage(message: Message) {
    // TODO: implement 
    console.log(message);
}

if (import.meta.main) {
    const token = Deno.env.get("SLACK_APP_TOKEN");
    if (!token) {
        throw new Error("SLACK_APP_TOKEN is not set");
    }
    const client = new SocketModeClient({
        logLevel: LogLevel.INFO,
        pingPongLoggingEnabled: true,
        appToken: token,
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
