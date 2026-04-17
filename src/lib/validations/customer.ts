import { z } from "zod";

export const customerSchema = z.object({
  owner_name: z.string().min(1, "보호자 이름을 입력해 주세요"),
  owner_phone: z.string().min(9, "연락처를 입력해 주세요"),
  pet_name: z.string().min(1, "반려동물 이름을 입력해 주세요"),
  breed: z.string().optional(),
  pet_birthday: z.string().optional(),
  pet_weight_kg: z.string().optional(),
  neutered: z.boolean().optional(),
  allergies: z.string().optional(),
  medical_notes: z.string().optional(),
  special_notes: z.string().optional(),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;
