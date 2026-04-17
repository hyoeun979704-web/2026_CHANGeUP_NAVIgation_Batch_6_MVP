import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("유효한 이메일을 입력해 주세요"),
  password: z.string().min(6, "비밀번호는 6자 이상이어야 합니다"),
});

export const signupSchema = z
  .object({
    email: z.string().email("유효한 이메일을 입력해 주세요"),
    password: z.string().min(6, "비밀번호는 6자 이상이어야 합니다"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["confirmPassword"],
  });

export const onboardingSchema = z.object({
  name: z.string().min(1, "매장 이름을 입력해 주세요"),
  phone: z.string().optional(),
  store_type: z.enum(["grooming", "daycare", "kindergarten", "mixed"]),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type SignupValues = z.infer<typeof signupSchema>;
export type OnboardingValues = z.infer<typeof onboardingSchema>;
