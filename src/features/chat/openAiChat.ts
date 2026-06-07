import { Message } from "../messages/messages";

const BACKEND_URL = "/api/";

export async function getChatResponseStream(
  messages: Message[],
  _apiKey: string,
  _openRouterKey: string
) {
  const stream = new ReadableStream({
    async start(controller: ReadableStreamDefaultController) {
      try {
        const response = await fetch(`${BACKEND_URL}chat/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages }),
        });

        if (!response.ok) {
          throw new Error(`Backend returned ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || ""; // keep incomplete line in buffer

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;

            const jsonStr = trimmed.slice(5).trim();
            if (!jsonStr) continue;

            try {
              const data = JSON.parse(jsonStr);
              if (data.type === "chunk" && data.content) {
                controller.enqueue(data.content);
              } else if (data.type === "done") {
                // stream finished
              } else if (data.type === "error") {
                console.error("Chat error:", data.content);
              }
            } catch {
              // skip unparseable lines
            }
          }
        }
      } catch (error) {
        console.error("Chat stream error:", error);
        controller.error(error);
      } finally {
        controller.close();
      }
    },
  });

  return stream;
}
