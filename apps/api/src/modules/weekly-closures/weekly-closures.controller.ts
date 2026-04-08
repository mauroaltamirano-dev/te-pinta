import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { createWeeklyClosureSchema } from "./weekly-closures.schema";
import { weeklyClosuresService } from "./weekly-closures.service";

export const weeklyClosuresController = {
  async getAll(request: FastifyRequest, reply: FastifyReply) {
    const list = await weeklyClosuresService.getClosures();
    return reply.send(list);
  },

  async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const idSchema = z.string().uuid();
    const id = idSchema.parse(request.params.id);
    const item = await weeklyClosuresService.getClosureById(id);
    if (!item) return reply.status(404).send({ error: "Not found" });
    return reply.send(item);
  },

  async getCurrentOpen(request: FastifyRequest, reply: FastifyReply) {
    const item = await weeklyClosuresService.getCurrentOpenClosure();
    return reply.send(item || null);
  },

  async create(request: FastifyRequest, reply: FastifyReply) {
    const body = createWeeklyClosureSchema.parse(request.body);
    const item = await weeklyClosuresService.createClosure(body);
    return reply.status(201).send(item);
  },

  async closeClosure(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const idSchema = z.string().uuid();
    const id = idSchema.parse(request.params.id);
    const item = await weeklyClosuresService.closeClosure(id);
    return reply.send(item);
  },

  async getMetrics(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const idSchema = z.string().uuid();
    const id = idSchema.parse(request.params.id);
    const metrics = await weeklyClosuresService.getLiveMetrics(id);
    return reply.send(metrics);
  },

  async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const idSchema = z.string().uuid();
    const id = idSchema.parse(request.params.id);
    const success = await weeklyClosuresService.deleteClosure(id);
    if (!success) return reply.status(404).send({ error: "Not found or could not delete" });
    return reply.status(204).send();
  }
};
