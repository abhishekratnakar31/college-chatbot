import type { FastifyInstance, FastifyPluginOptions } from "fastify";

export async function ttsRoute(app: FastifyInstance, options: FastifyPluginOptions) {
  app.post("/tts", async (request, reply) => {
    const { text, voiceId = "21m00Tcm4TlvDq8ikWAM" } = request.body as { 
      text: string; 
      voiceId?: string;
    };

    if (!text) {
      return reply.status(400).send({ error: "Text is required" });
    }

    const apiKey = process.env.ELEVEN_LABS_API_KEY;
    if (!apiKey) {
      console.error("TTS: ELEVEN_LABS_API_KEY missing");
      return reply.status(500).send({ error: "ELEVEN_LABS_API_KEY is not configured on the server." });
    }

    try {
      console.log(`TTS: Requesting synthesis for ${text.length} chars...`);
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
            model_id: "eleven_multilingual_v2",
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.5,
            },
          }),
        }
      );

      if (!response.ok) {
        let errorMsg = "ElevenLabs API error";
        try {
          const error = await response.json();
          errorMsg = error.detail?.message || JSON.stringify(error) || errorMsg;
        } catch (e) {
          errorMsg = `HTTP ${response.status}: ${response.statusText}`;
        }
        console.error(`TTS ElevenLabs Error: ${errorMsg}`);
        return reply.status(response.status).send({ error: errorMsg });
      }

      const audioBuffer = await response.arrayBuffer();
      console.log(`TTS: Success, sending ${audioBuffer.byteLength} bytes`);
      
      return reply
        .header("Content-Type", "audio/mpeg")
        .send(Buffer.from(audioBuffer));

    } catch (err: any) {
      console.error("TTS Server Error:", err);
      return reply.status(500).send({ error: err.message || "Failed to generate speech" });
    }
  });
}
