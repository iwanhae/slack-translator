import { franc } from "https://esm.sh/franc@6";

export function shouldTranslate(text: string): boolean {
    // check if the message is in english
    const lang = franc(text);
    if (lang === "eng") {
        console.log("Message is in English, skipping");
        return false;
    }

    // check if the message is a URL (by checking if the text starts with http or https)
    if (text.startsWith("http") || text.startsWith("https")) {
        console.log("Message is a URL, skipping");
        return false;
    }

    // check if the message is a code block
    if (text.startsWith("```")) {
        console.log("Message is a code block, skipping");
        return false;
    }

    console.log(`Message is in ${lang.toUpperCase()}, translating`);
    return true;
}

export function stripSlackFormatting(message: string): string {
    // Remove bold (*bold*)
    message = message.replace(/\*(.*?)\*/g, "$1");

    // Remove italic (_italic_)
    message = message.replace(/_(.*?)_/g, "$1");

    // Remove strikethrough (~strikethrough~)
    message = message.replace(/~(.*?)~/g, "$1");

    // Remove inline code (`code`)
    message = message.replace(/`(.*?)`/g, "$1");

    // Remove code blocks (```multiline code```)
    message = message.replace(/```(.*?)```/gs, "$1");

    // Remove Slack links (<https://example.com|description>)
    message = message.replace(/<([^|]+)\|([^>]+)>/g, "$2");

    // Remove plain links (<https://example.com>)
    message = message.replace(/<([^>]+)>/g, "$1");

    // Remove mentions (@username)
    message = message.replace(/<@([A-Z0-9]+)>/g, "");

    // Remove channel references (#channel)
    message = message.replace(/<#([A-Z0-9]+)\|([^>]+)>/g, "$2");

    // Remove emoji (:emoji:)
    message = message.replace(/:([a-zA-Z0-9_+-]+):/g, "");

    // Remove any remaining formatting or special characters
    message = message.replace(/[&<>]/g, "");

    return message.trim();
}
