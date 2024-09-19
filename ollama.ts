import ollama from "npm:ollama";

const OLLAMA_MODEL = "gemma2:9b";
const TEST_PROMPT = Deno.readTextFileSync("./prompt.txt");

export async function chat(system: string, message: string) {
    const response = await ollama.generate({
        model: OLLAMA_MODEL,
        system: system,
        prompt: message,
        stream: true,
    });

    let result = "";
    for await (const chunk of response) {
        result += chunk.response;
        Deno.stderr.writeSync(new TextEncoder().encode(chunk.response));
    }
    return result;
}

if (import.meta.main) {
    console.log("Testing ollama chat...");
    const response = await chat(
        TEST_PROMPT,
        "이 번역기 제대로 작동하는건지가 궁금한데요, 이해하기에 무리가 없나요?",
    );
    console.log(response);
}
