import { groundingPrompt, reply } from "./reply";
import type { DemoProfile } from "./profile";

export const DEMO_MODEL = "google/gemini-2.5-flash-lite";

const encoder = new TextEncoder();

function textResponse(text: string) {
  const chunks = text.match(/\S+|\s+/g) ?? [text];
  const stream = new ReadableStream({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
      controller.close();
    },
  });
  return new Response(stream, { headers: demoHeaders() });
}

function demoHeaders() {
  return {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Robots-Tag": "noindex, nofollow",
  };
}

export async function streamDemoReply(profile: DemoProfile, message: string): Promise<Response> {
  const apiKey = process.env.AI_GATEWAY_API_KEY?.trim();
  const fallback = reply(profile, message);
  if (!apiKey) return textResponse(fallback.text);

  try {
    const { createGateway, streamText } = await import("ai");
    const gateway = createGateway({ apiKey });
    const result = streamText({
      model: gateway.chat(DEMO_MODEL),
      system: groundingPrompt(profile),
      prompt: message,
      temperature: 0,
      maxOutputTokens: 400,
      maxRetries: 0,
    });

    let started = false;
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.textStream) {
            if (!chunk) continue;
            started = true;
            controller.enqueue(encoder.encode(chunk));
          }
          if (!started) controller.enqueue(encoder.encode(fallback.text));
        } catch (err) {
          console.error("demo model", err instanceof Error ? err.message : "failed");
          if (!started) controller.enqueue(encoder.encode(fallback.text));
        } finally {
          controller.close();
        }
      },
    });
    return new Response(stream, { headers: demoHeaders() });
  } catch (err) {
    console.error("demo model", err instanceof Error ? err.message : "failed");
    return textResponse(fallback.text);
  }
}
