import { z } from "zod";

export const notificationGenerateSchema = z.object({
  customerId: z.string().uuid("유효한 고객 ID가 아닙니다"),
  keywords: z.string().min(1, "오늘 서비스 내용을 입력해 주세요").max(500),
  imageUrl: z.string().url().optional().or(z.literal("")),
  qualityMode: z.boolean().default(false),
});

export type NotificationGenerateValues = z.infer<typeof notificationGenerateSchema>;
