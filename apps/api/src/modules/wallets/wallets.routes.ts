import type { FastifyPluginAsync } from "fastify";
import { WalletSchema, WalletTransactionSchema, WalletTransferSchema } from "@poker-tracker/shared";
import { prisma } from "../../shared/database.js";
import { authenticate } from "../../shared/auth.js";
import { Prisma } from "@prisma/client";

export const walletRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook("preHandler", authenticate);

  // Listar carteiras do usuário
  fastify.get("/", async (request, reply) => {
    const wallets = await prisma.wallet.findMany({
      where: { userId: request.user.userId, isArchived: false },
      orderBy: { createdAt: "asc" }
    });

    const totalBalance = wallets.reduce((acc, w) => acc + Number(w.balance), 0);

    return reply.send({
      wallets,
      totalBalance: Number(totalBalance.toFixed(2))
    });
  });

  // Criar nova carteira
  fastify.post("/", async (request, reply) => {
    const data = WalletSchema.parse(request.body);

    const wallet = await prisma.wallet.create({
      data: {
        userId: request.user.userId,
        name: data.name,
        currency: data.currency,
        balance: new Prisma.Decimal(data.balance)
      }
    });

    if (data.balance > 0) {
      await prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          userId: request.user.userId,
          type: "DEPOSIT",
          amount: new Prisma.Decimal(data.balance),
          description: "Saldo inicial da carteira"
        }
      });
    }

    return reply.status(201).send(wallet);
  });

  // Aporte ou Saque
  fastify.post("/transaction", async (request, reply) => {
    const data = WalletTransactionSchema.parse(request.body);

    const wallet = await prisma.wallet.findFirst({
      where: { id: data.walletId, userId: request.user.userId }
    });

    if (!wallet) {
      return reply.status(404).send({ message: "Carteira não encontrada." });
    }

    const currentBalance = Number(wallet.balance);
    const amount = Number(data.amount);
    let newBalance = currentBalance;

    if (data.type === "DEPOSIT") {
      newBalance += amount;
    } else if (data.type === "WITHDRAWAL") {
      newBalance -= amount;
    } else if (data.type === "ADJUSTMENT") {
      newBalance = amount;
    }

    const [updatedWallet, transaction] = await prisma.$transaction([
      prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: new Prisma.Decimal(newBalance) }
      }),
      prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          userId: request.user.userId,
          type: data.type,
          amount: new Prisma.Decimal(amount),
          description: data.description
        }
      })
    ]);

    return reply.send({ wallet: updatedWallet, transaction });
  });

  // Transferência entre carteiras
  fastify.post("/transfer", async (request, reply) => {
    const data = WalletTransferSchema.parse(request.body);

    const [fromWallet, toWallet] = await Promise.all([
      prisma.wallet.findFirst({ where: { id: data.fromWalletId, userId: request.user.userId } }),
      prisma.wallet.findFirst({ where: { id: data.toWalletId, userId: request.user.userId } })
    ]);

    if (!fromWallet || !toWallet) {
      return reply.status(404).send({ message: "Carteira de origem ou destino inválida." });
    }

    const amount = Number(data.amount);

    const [updatedFrom, updatedTo] = await prisma.$transaction([
      prisma.wallet.update({
        where: { id: fromWallet.id },
        data: { balance: new Prisma.Decimal(Number(fromWallet.balance) - amount) }
      }),
      prisma.wallet.update({
        where: { id: toWallet.id },
        data: { balance: new Prisma.Decimal(Number(toWallet.balance) + amount) }
      }),
      prisma.walletTransaction.create({
        data: {
          walletId: fromWallet.id,
          userId: request.user.userId,
          type: "TRANSFER_OUT",
          amount: new Prisma.Decimal(amount),
          description: data.description || `Transferência para ${toWallet.name}`
        }
      }),
      prisma.walletTransaction.create({
        data: {
          walletId: toWallet.id,
          userId: request.user.userId,
          type: "TRANSFER_IN",
          amount: new Prisma.Decimal(amount),
          description: data.description || `Transferência de ${fromWallet.name}`
        }
      })
    ]);

    return reply.send({
      message: "Transferência realizada com sucesso.",
      fromWallet: updatedFrom,
      toWallet: updatedTo
    });
  });
};
