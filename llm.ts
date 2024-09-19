import { Ollama } from "npm:ollama";
import Groq from "npm:groq-sdk";

const OLLAMA_MODEL = "gemma2:9b";
const GROQ_MODEL = "llama3-70b-8192";
const TEST_PROMPT = Deno.readTextFileSync("./prompt.txt");

const OLLAMA_HOST = Deno.env.get("OLLAMA_HOST") || "http://localhost:11434";
const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");

const ollama = new Ollama({
    host: OLLAMA_HOST,
});

const groq = GROQ_API_KEY ? new Groq({ apiKey: GROQ_API_KEY }) : null;

async function chatWithGroq(system: string, message: string): Promise<string> {
    if (!groq) {
        throw new Error("Groq client is not initialized");
    }

    const chatCompletion = await groq.chat.completions.create({
        response_format: { type: "json_object" },
        messages: [
            { role: "system", content: system },
            { role: "user", content: JSON.stringify({ original: message }) },
        ],
        model: GROQ_MODEL,
    });

    const translated = chatCompletion.choices[0].message.content || "{}";
    const parsed = JSON.parse(translated);
    return parsed["translated"] || "translation failed";
}

async function chatWithOllama(
    system: string,
    message: string,
): Promise<string> {
    const response = await ollama.generate({
        model: OLLAMA_MODEL,
        system: system,
        prompt: JSON.stringify({ original: message }),
        stream: true,
        format: "json",
    });

    let result = "";
    for await (const chunk of response) {
        result += chunk.response;
        Deno.stderr.writeSync(new TextEncoder().encode(chunk.response));
    }
    const parsed = JSON.parse(result);
    return parsed["translated"] || "translation failed";
}

export async function chat(system: string, message: string): Promise<string> {
    if (GROQ_API_KEY) {
        console.log("Using Groq API");
        return await chatWithGroq(system, message);
    } else {
        console.log("Using Ollama");
        return await chatWithOllama(system, message);
    }
}

if (import.meta.main) {
    console.log("Testing chat...");
    const response = await chat(
        TEST_PROMPT,
        "이 번역기 제대로 작동하는건지가 궁금한데요, 이해하기에 무리가 없나요?",
    );
    console.log(response);
}
