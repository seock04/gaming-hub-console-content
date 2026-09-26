import { z } from "zod";

export const consoleSchema = z.enum(["xbox", "playstation", "nintendo"]);

export const contentSchema = z.object({
  id: z.string().min(1),
  console: consoleSchema,
  title: z.string().min(1),
  kind: z.enum(["game", "news", "trailer", "offer"]),
  url: z.string().url(),
  imageUrl: z.string().url().optional(),
  locale: z.string().default("ko-KR"),
  publishedAt: z.string().datetime().optional(),
  metadata: z.record(z.unknown()).default({})
});

export type ConsoleContent = z.infer<typeof contentSchema>;

export const sampleContent: ConsoleContent[] = [
  { id: "xbox-demo-001", console: "xbox", title: "Xbox 콘텐츠 샘플", kind: "game", url: "https://www.xbox.com/ko-KR/", locale: "ko-KR", metadata: {} },
  { id: "playstation-demo-001", console: "playstation", title: "PlayStation 콘텐츠 샘플", kind: "news", url: "https://www.playstation.com/ko-kr/", locale: "ko-KR", metadata: {} },
  { id: "nintendo-demo-001", console: "nintendo", title: "Nintendo 콘텐츠 샘플", kind: "trailer", url: "https://www.nintendo.com/kr/", locale: "ko-KR", metadata: {} }
];
