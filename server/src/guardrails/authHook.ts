import type { FastifyRequest, FastifyReply } from "fastify";
import { getAuth } from "firebase-admin/auth";
import { firebaseAdminApp } from "../lib/firebaseAdmin.js";

declare module "fastify" {
  interface FastifyRequest {
    user?: {
      uid: string;
      email?: string | undefined;
      name?: string | undefined;
      picture?: string | undefined;
      [key: string]: any;
    };
  }
}

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  // Support mock authentication tokens during test runs
  if (process.env.NODE_ENV === "test" && !firebaseAdminApp) {
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer mock-token-")) {
      const mockUid = authHeader.replace("Bearer mock-token-", "");
      request.user = {
        uid: mockUid,
        email: `${mockUid}@example.com`,
        name: `Mock User ${mockUid}`,
      };
      return;
    }
  }

  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return reply.status(401).send({
      error: "UNAUTHORIZED",
      message: "Authorization header with Bearer token is required.",
    });
  }

  const token = authHeader.substring(7);

  if (!firebaseAdminApp) {
    return reply.status(500).send({
      error: "SERVER_ERROR",
      message: "Authentication service is not properly configured on the server.",
    });
  }

  try {
    const decodedToken = await getAuth(firebaseAdminApp).verifyIdToken(token);
    request.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
      picture: decodedToken.picture,
    };
  } catch (error) {
    request.log.error(error, "Firebase token verification failed");
    return reply.status(401).send({
      error: "INVALID_TOKEN",
      message: "The provided token is invalid or has expired.",
    });
  }
}
export default authenticate;
