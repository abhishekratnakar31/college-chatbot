import { describe, it, expect, beforeAll, afterAll } from "vitest";
import Fastify from "fastify";
import { authRoute } from "../../routes/auth.js";

describe("Auth Route and Middleware", () => {
  let app: any;

  beforeAll(async () => {
    app = Fastify();
    await app.register(authRoute);
  });

  afterAll(async () => {
    await app.close();
  });

  it("blocks requests without authorization header", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/auth/me",
    });

    expect(res.statusCode).toBe(401);
    const body = JSON.parse(res.payload);
    expect(body.error).toBe("UNAUTHORIZED");
  });

  it("blocks requests with non-Bearer token", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/auth/me",
      headers: {
        authorization: "Basic credentials",
      },
    });

    expect(res.statusCode).toBe(401);
    const body = JSON.parse(res.payload);
    expect(body.error).toBe("UNAUTHORIZED");
  });

  it("allows mock token during testing", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/auth/me",
      headers: {
        authorization: "Bearer mock-token-user123",
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.user).toBeDefined();
    expect(body.user.uid).toBe("user123");
    expect(body.user.email).toBe("user123@example.com");
    expect(body.user.name).toBe("Mock User user123");
  });
});
