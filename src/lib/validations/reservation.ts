import { z } from "zod";

export const reservationSchema = z.object({
  customer_id: z.string().uuid().nullable().optional(),
  scheduled_at: z.string().min(1, "예약 일시를 선택해 주세요"),
  duration_min: z.number().int().positive(),
  services: z.array(z.string()),
  status: z.enum(["pending", "confirmed", "completed", "no_show", "cancelled"]),
  deposit_amount: z.number().int().nonnegative().nullable().optional(),
  notes: z.string().max(500).optional(),
});

export const publicBookingSchema = z.object({
  guest_name: z.string().min(1, "이름을 입력해 주세요").max(30),
  guest_phone: z
    .string()
    .min(9, "연락처를 입력해 주세요")
    .regex(/^[0-9-]+$/, "숫자와 하이픈만 입력해 주세요"),
  scheduled_at: z.string().min(1, "예약 일시를 선택해 주세요"),
  duration_min: z.number().int().positive(),
  services: z.array(z.string()),
  notes: z.string().max(500).optional(),
});

// Server-side schema for parsing FormData strings
export const reservationServerSchema = reservationSchema.extend({
  duration_min: z.coerce.number().int().positive(),
  deposit_amount: z.coerce.number().int().nonnegative().nullable().optional(),
});

export type ReservationValues = z.infer<typeof reservationSchema>;
export type PublicBookingValues = z.infer<typeof publicBookingSchema>;
