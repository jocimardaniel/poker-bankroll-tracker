import { buildApp } from "./app.js";

const app = buildApp();
const port = Number(process.env.PORT) || 3333;
const host = process.env.HOST || "0.0.0.0";

app.listen({ port, host }, (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  console.log(`🚀 Poker Bankroll API rodando em: ${address}`);
  console.log(`📚 Documentação Swagger disponível em: ${address}/docs`);
});
