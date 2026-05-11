import type { FastifyInstance } from "fastify";

export async function ttsRoute(app: FastifyInstance) {
  app.post("/tts", async (request, reply) => {
    const { text, voiceId = "21m00Tcm4TlvDq8ikWAM" } = request.body as { 
      text: string; 
      voiceId?: string;
    };

    if (!text) {
      reply.status(400).send({ error: "Text is required" });
      return;
    }

    const apiKey = process.env.ELEVEN_LABS_API_KEY;
    if (!apiKey) {
      reply.status(500).send({ error: "ELEVEN_LABS_API_KEY is not configured on the server." });
      return;
    }

    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
        {
          method: "POST",
          headers: {
            "xi-api-key": apiKey,
            "Content-Type": "application/json",
            accept: "audio/mpeg",
          },
          body: JSON.stringify({
            text,
            model_id: "eleven_monolingual_v1",
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.5,
            },
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail?.message || "ElevenLabs API error");
      }

      const audioBuffer = await response.arrayBuffer();
      reply
        .header("Content-Type", "audio/mpeg")
        .send(Buffer.from(audioBuffer));

    } catch (err: any) {
      console.error("TTS Error:", err);
      reply.status(500).send({ error: err.message || "Failed to generate speech" });
    }
  });
}
