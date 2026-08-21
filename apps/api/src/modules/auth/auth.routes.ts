import type { FastifyPluginAsync } from "fastify";
import bcrypt from "bcryptjs";
import { RegisterSchema, LoginSchema } from "@poker-tracker/shared";
import { prisma } from "../../shared/database.js";
import { authenticate } from "../../shared/auth.js";

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post("/register", async (request, reply) => {
    const data = RegisterSchema.parse(request.body);

    const existing = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existing) {
      return reply.status(409).send({ message: "E-mail já cadastrado no sistema." });
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash,
        preferredCurrency: data.preferredCurrency
      }
    });

    // Cria carteira padrão para o usuário
    await prisma.wallet.create({
      data: {
        userId: user.id,
        name: "Carteira Principal",
        currency: data.preferredCurrency,
        balance: 0
      }
    });

    const token = fastify.jwt.sign({ userId: user.id, email: user.email });

    return reply.status(201).send({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        preferredCurrency: user.preferredCurrency
      },
      token
    });
  });

  fastify.post("/login", async (request, reply) => {
    const data = LoginSchema.parse(request.body);

    const user = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (!user) {
      return reply.status(401).send({ message: "E-mail ou senha incorretos." });
    }

    const passwordValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!passwordValid) {
      return reply.status(401).send({ message: "E-mail ou senha incorretos." });
    }

    const token = fastify.jwt.sign({ userId: user.id, email: user.email });

    return reply.send({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        preferredCurrency: user.preferredCurrency
      },
      token
    });
  });

  fastify.get("/me", { preHandler: [authenticate] }, async (request, reply) => {
    const user = await prisma.user.findUnique({
      where: { id: request.user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        preferredCurrency: true,
        createdAt: true
      }
    });

    if (!user) {
      return reply.status(404).send({ message: "Usuário não encontrado." });
    }

    return reply.send(user);
  });
};
