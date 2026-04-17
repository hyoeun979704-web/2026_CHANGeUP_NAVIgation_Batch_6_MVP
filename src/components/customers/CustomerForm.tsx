"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { customerSchema, type CustomerFormValues } from "@/lib/validations/customer";
import { createCustomer, updateCustomer } from "@/actions/customers";
import { useToast } from "@/hooks/use-toast";
import type { Customer } from "@/types/database";

interface CustomerFormProps {
  customer?: Customer;
}

export function CustomerForm({ customer }: CustomerFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      owner_name: customer?.owner_name ?? "",
      owner_phone: customer?.owner_phone ?? "",
      pet_name: customer?.pet_name ?? "",
      breed: customer?.breed ?? "",
      pet_birthday: customer?.pet_birthday ?? "",
      pet_weight_kg: customer?.pet_weight_kg?.toString() ?? "",
      neutered: customer?.neutered ?? false,
      allergies: customer?.allergies ?? "",
      medical_notes: customer?.medical_notes ?? "",
      special_notes: customer?.special_notes ?? "",
    },
  });

  function onSubmit(values: CustomerFormValues) {
    const formData = new FormData();
    Object.entries(values).forEach(([k, v]) => {
      if (v !== undefined && v !== null) formData.set(k, String(v));
    });

    startTransition(async () => {
      const result = customer
        ? await updateCustomer(customer.id, formData)
        : await createCustomer(formData);

      if (result?.error) {
        toast({ title: "오류", description: result.error, variant: "destructive" });
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="owner_name" render={({ field }) => (
            <FormItem>
              <FormLabel>보호자 이름 *</FormLabel>
              <FormControl><Input placeholder="김보호" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="owner_phone" render={({ field }) => (
            <FormItem>
              <FormLabel>연락처 *</FormLabel>
              <FormControl><Input placeholder="010-0000-0000" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="pet_name" render={({ field }) => (
            <FormItem>
              <FormLabel>반려동물 이름 *</FormLabel>
              <FormControl><Input placeholder="뽀미" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="breed" render={({ field }) => (
            <FormItem>
              <FormLabel>견종/종</FormLabel>
              <FormControl><Input placeholder="말티즈" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="pet_birthday" render={({ field }) => (
            <FormItem>
              <FormLabel>생년월일</FormLabel>
              <FormControl><Input type="date" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="pet_weight_kg" render={({ field }) => (
            <FormItem>
              <FormLabel>체중 (kg)</FormLabel>
              <FormControl><Input type="number" step="0.1" placeholder="3.2" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="neutered" render={({ field }) => (
            <FormItem>
              <FormLabel>중성화 여부</FormLabel>
              <Select onValueChange={(v) => field.onChange(v === "true")} value={String(field.value)}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="선택" /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="true">완료</SelectItem>
                  <SelectItem value="false">미완료</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="allergies" render={({ field }) => (
          <FormItem>
            <FormLabel>알러지 / 금기 성분</FormLabel>
            <FormControl>
              <Textarea
                placeholder="닭고기, 밀, 특정 샴푸 성분..."
                className="resize-none"
                rows={2}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="medical_notes" render={({ field }) => (
          <FormItem>
            <FormLabel>의료 기록</FormLabel>
            <FormControl>
              <Textarea
                placeholder="슬개골 2기, 심장 질환 투약 중..."
                className="resize-none"
                rows={2}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="special_notes" render={({ field }) => (
          <FormItem>
            <FormLabel>특이사항</FormLabel>
            <FormControl>
              <Textarea
                placeholder="낯선 사람에게 예민함, 귀 만지는 것 싫어함..."
                className="resize-none"
                rows={2}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="flex gap-3">
          <Button type="submit" disabled={isPending}>
            {isPending ? "저장 중..." : customer ? "수정 저장" : "고객 등록"}
          </Button>
          <Button type="button" variant="outline" onClick={() => history.back()}>
            취소
          </Button>
        </div>
      </form>
    </Form>
  );
}
