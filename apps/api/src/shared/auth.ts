import type { FastifyRequest, FastifyReply } from "fastify";

export interface AuthPayload {
  userId: string;
  email: string;
}

declare module "fastify" {
  interface FastifyRequest {
    user: AuthPayload;
  }
}

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    return reply.status(401).send({ message: "Não autorizado. Token inválido ou expirado." });
  }
}
