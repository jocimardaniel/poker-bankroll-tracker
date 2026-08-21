import type { FastifyError, FastifyRequest, FastifyReply } from "fastify";
import { ZodError } from "zod";

export function errorHandler(error: FastifyError, request: FastifyRequest, reply: FastifyReply) {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      statusCode: 400,
      error: "Bad Request",
      message: "Erro de validação dos dados de entrada",
      issues: error.issues
    });
  }

  if (error.statusCode) {
    return reply.status(error.statusCode).send({
      statusCode: error.statusCode,
      error: error.name,
      message: error.message
    });
  }

  request.log.error(error);
  return reply.status(500).send({
    statusCode: 500,
    error: "Internal Server Error",
    message: "Ocorreu um erro interno no servidor."
  });
}
