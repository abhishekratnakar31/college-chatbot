import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import { chatRoute } from "./routes/chat.js";

const app = Fastify();

await app.register(cors, {
  origin: true, // In production, replace with your frontend URL
});

await app.register(chatRoute);

const PORT = Number(process.env.PORT) || 4000;

app.listen({ port: PORT }, () => {
  console.log(`Server running on port ${PORT}`);
//   console.log("KEY:", process.env.OPENAI_API_KEY);
});