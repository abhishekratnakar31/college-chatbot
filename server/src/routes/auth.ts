import type { FastifyInstance } from "fastify";
import { authenticate } from "../guardrails/authHook.js";

export async function authRoute(app: FastifyInstance) {
  app.get(
    "/auth/me",
    { preHandler: [authenticate] },
    async (request, reply) => {
      return { user: request.user };
    }
  );
}
