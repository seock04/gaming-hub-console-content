import Fastify from "fastify";
import cors from "@fastify/cors";
import { contentSchema, sampleContent } from "./content.js";

const app = Fastify({ logger: true });
const contents = new Map(sampleContent.map((item) => [item.id, item]));

await app.register(cors, { origin: true });

app.get("/health", async () => ({ status: "ok", service: "gaming-hub-console-content" }));

app.get("/api/v1/content", async (request) => {
  const query = request.query as { console?: string };
  return [...contents.values()].filter((item) => !query.console || item.console === query.console);
});

app.post("/api/v1/content", async (request, reply) => {
  const parsed = contentSchema.safeParse(request.body);
  if (!parsed.success) return reply.code(400).send({ error: "Invalid content", details: parsed.error.flatten() });
  contents.set(parsed.data.id, parsed.data);
  return reply.code(201).send(parsed.data);
});

const port = Number(process.env.PORT ?? 3000);
await app.listen({ port, host: "0.0.0.0" });
