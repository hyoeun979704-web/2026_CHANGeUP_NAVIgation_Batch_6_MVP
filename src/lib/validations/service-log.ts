import { z } from "zod";

export const serviceLogSchema = z.object({
  service_date: z.string().min(1, "날짜를 선택해 주세요"),
  services: z.array(z.string()).min(1, "서비스 항목을 하나 이상 선택해 주세요"),
  notes: z.string().optional(),
});

export type ServiceLogFormValues = z.infer<typeof serviceLogSchema>;

export const SERVICE_OPTIONS = [
  "목욕",
  "전체미용",
  "부분미용",
  "발톱정리",
  "귀청소",
  "항문낭",
  "치아관리",
  "눈주위정리",
  "풋케어",
] as const;
