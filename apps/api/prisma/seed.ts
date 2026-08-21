import { prisma } from "../src/shared/database.js";
import bcrypt from "bcryptjs";

async function main() {
  console.log("Iniciando seed do banco de dados...");

  // Limpa registros anteriores se houver
  await prisma.playerProfile.deleteMany();
  await prisma.cashGameDetails.deleteMany();
  await prisma.tournamentDetails.deleteMany();
  await prisma.session.deleteMany();
  await prisma.walletTransaction.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.user.deleteMany();

  // 1. Cria usuário de teste (US01)
  const passwordHash = await bcrypt.hash("poker123", 10);
  const user = await prisma.user.create({
    data: {
      id: "usr-demo-1",
      name: "Jogador Pro",
      email: "jogador@poker.com",
      passwordHash,
      preferredCurrency: "BRL"
    }
  });

  console.log("Usuario criado:", user.email);

  // 2. Cria carteiras (US02)
  const walletH2 = await prisma.wallet.create({
    data: {
      id: "wal-1",
      userId: user.id,
      name: "Club H2 Live",
      currency: "BRL",
      balance: 3500.0
    }
  });

  const walletPS = await prisma.wallet.create({
    data: {
      id: "wal-2",
      userId: user.id,
      name: "PokerStars Online",
      currency: "USD",
      balance: 1250.0
    }
  });

  await prisma.wallet.create({
    data: {
      id: "wal-3",
      userId: user.id,
      name: "GG Poker",
      currency: "USD",
      balance: 800.0
    }
  });

  // 3. Cria sessões de exemplo (US03 e US05)
  await prisma.session.create({
    data: {
      id: "sess-demo-1",
      userId: user.id,
      walletId: walletH2.id,
      sessionType: "CASH_GAME",
      gameVariant: "NLH",
      locationType: "LIVE",
      locationName: "H2 Club Moema",
      startTime: new Date(Date.now() - 86400000 * 2),
      durationMinutes: 270,
      netProfit: 1300.0,
      status: "COMPLETED",
      notes: "Mesa bem agressiva, bom controle de pot.",
      cashGameDetails: {
        create: {
          smallBlind: 5.0,
          bigBlind: 10.0,
          initialBuyin: 1000.0,
          totalRebuys: 500.0,
          cashoutAmount: 2800.0,
          tipsAndExpenses: 0.0,
          tableSize: "SIX_MAX"
        }
      }
    }
  });

  await prisma.session.create({
    data: {
      id: "sess-demo-2",
      userId: user.id,
      walletId: walletPS.id,
      sessionType: "TOURNAMENT",
      gameVariant: "NLH",
      locationType: "ONLINE",
      locationName: "PokerStars Sunday Warm-Up",
      startTime: new Date(Date.now() - 86400000 * 5),
      durationMinutes: 320,
      netProfit: 295.0,
      status: "COMPLETED",
      notes: "5º lugar no MTT Regular.",
      tournamentDetails: {
        create: {
          buyinFee: 50.0,
          entryFee: 5.0,
          reentriesCount: 0,
          reentriesCost: 0.0,
          addonsAmount: 0.0,
          bountyCollected: 0.0,
          prizeWon: 350.0,
          totalEntries: 180,
          finalPosition: 5,
          isItm: true,
          tournamentFormat: "FREEZEOUT"
        }
      }
    }
  });

  // 4. Cria perfis de Vilões (US09)
  await prisma.playerProfile.createMany({
    data: [
      {
        userId: user.id,
        playerName: "João Silva (Mesa 4)",
        tag: "Calling Station / Passivo",
        colorHex: "#10B981",
        notes: "Paga muito pré-flop com suited connectors. Só aposta forte com o nuts."
      },
      {
        userId: user.id,
        playerName: "Pedro Reg",
        tag: "TAG (Tight Agressivo - Reg)",
        colorHex: "#3B82F6",
        notes: "Frequente do 5/10. 3-beta bastante no botão e defende muito o Big Blind."
      }
    ]
  });

  console.log("Seed concluido com sucesso!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
