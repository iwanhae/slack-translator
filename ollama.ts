import ollama from "npm:ollama";

const OLLAMA_MODEL = "gemma2:latest";

export async function chat(system: string, message: string) {
    const response = await ollama.chat({
        model: OLLAMA_MODEL,
        messages: [
            { role: "system", content: system },
            {
                role: "user",
                content: message,
            },
        ],
    });
    return response.message.content;
}

if (import.meta.main) {
    console.log("Testing ollama chat...");
    const response = await chat(
        "You are a helpful assistant",
        "Why is the sky blue?",
    );
    console.log(response);
}
