import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import { chatRoute } from "./routes/chat.js";
import multipart from "@fastify/multipart";
import { uploadRoute } from "./routes/upload.js";
const app = Fastify();

await app.register(cors, {
  origin: true,
  methods:["GET", "POST", "OPTIONS"]
  // In production, replace with your frontend URL
});


await app.register(chatRoute);
await app.register(multipart, {
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});
await app.register(uploadRoute);

const PORT = Number(process.env.PORT) || 4000;

app.listen({ port: PORT }, () => {
  console.log(`Server running on port ${PORT}`);
//   console.log("KEY:", process.env.OPENAI_API_KEY);
});