export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      stores: {
        Row: {
          id: string;
          name: string;
          phone: string | null;
          business_number: string | null;
          store_type: "grooming" | "daycare" | "kindergarten" | "mixed";
          plan: "free" | "starter" | "pro" | "pro_pg";
          monthly_ai_quota: number;
          toss_customer_key: string | null;
          slug: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          phone?: string | null;
          business_number?: string | null;
          store_type?: "grooming" | "daycare" | "kindergarten" | "mixed";
          plan?: "free" | "starter" | "pro" | "pro_pg";
          monthly_ai_quota?: number;
          toss_customer_key?: string | null;
          slug?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          phone?: string | null;
          business_number?: string | null;
          store_type?: "grooming" | "daycare" | "kindergarten" | "mixed";
          plan?: "free" | "starter" | "pro" | "pro_pg";
          monthly_ai_quota?: number;
          toss_customer_key?: string | null;
          slug?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      store_members: {
        Row: {
          store_id: string;
          user_id: string;
          role: "owner" | "staff";
          created_at: string;
        };
        Insert: {
          store_id: string;
          user_id: string;
          role?: "owner" | "staff";
          created_at?: string;
        };
        Update: {
          store_id?: string;
          user_id?: string;
          role?: "owner" | "staff";
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "store_members_store_id_fkey";
            columns: ["store_id"];
            referencedRelation: "stores";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "store_members_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      customers: {
        Row: {
          id: string;
          store_id: string;
          owner_name: string;
          owner_phone: string;
          pet_name: string;
          breed: string | null;
          pet_birthday: string | null;
          pet_weight_kg: number | null;
          neutered: boolean | null;
          allergies: string | null;
          medical_notes: string | null;
          special_notes: string | null;
          last_visit_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          owner_name: string;
          owner_phone: string;
          pet_name: string;
          breed?: string | null;
          pet_birthday?: string | null;
          pet_weight_kg?: number | null;
          neutered?: boolean | null;
          allergies?: string | null;
          medical_notes?: string | null;
          special_notes?: string | null;
          last_visit_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          owner_name?: string;
          owner_phone?: string;
          pet_name?: string;
          breed?: string | null;
          pet_birthday?: string | null;
          pet_weight_kg?: number | null;
          neutered?: boolean | null;
          allergies?: string | null;
          medical_notes?: string | null;
          special_notes?: string | null;
          last_visit_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "customers_store_id_fkey";
            columns: ["store_id"];
            referencedRelation: "stores";
            referencedColumns: ["id"];
          }
        ];
      };
      service_logs: {
        Row: {
          id: string;
          customer_id: string;
          service_date: string;
          services: string[];
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          service_date?: string;
          services: string[];
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          service_date?: string;
          services?: string[];
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "service_logs_customer_id_fkey";
            columns: ["customer_id"];
            referencedRelation: "customers";
            referencedColumns: ["id"];
          }
        ];
      };
      notifications: {
        Row: {
          id: string;
          store_id: string;
          customer_id: string;
          keywords: string;
          image_url: string | null;
          ai_draft: string | null;
          final_text: string | null;
          tokens_used: number | null;
          latency_ms: number | null;
          draft_accepted_as_is: boolean | null;
          edit_distance: number | null;
          estimated_seconds_saved: number;
          is_sent: boolean;
          sent_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          customer_id: string;
          keywords: string;
          image_url?: string | null;
          ai_draft?: string | null;
          final_text?: string | null;
          tokens_used?: number | null;
          latency_ms?: number | null;
          draft_accepted_as_is?: boolean | null;
          edit_distance?: number | null;
          estimated_seconds_saved?: number;
          is_sent?: boolean;
          sent_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          customer_id?: string;
          keywords?: string;
          image_url?: string | null;
          ai_draft?: string | null;
          final_text?: string | null;
          tokens_used?: number | null;
          latency_ms?: number | null;
          draft_accepted_as_is?: boolean | null;
          edit_distance?: number | null;
          estimated_seconds_saved?: number;
          is_sent?: boolean;
          sent_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_store_id_fkey";
            columns: ["store_id"];
            referencedRelation: "stores";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notifications_customer_id_fkey";
            columns: ["customer_id"];
            referencedRelation: "customers";
            referencedColumns: ["id"];
          }
        ];
      };
      reservations: {
        Row: {
          id: string;
          store_id: string;
          customer_id: string | null;
          scheduled_at: string;
          duration_min: number;
          services: string[];
          status: "pending" | "confirmed" | "completed" | "no_show" | "cancelled";
          deposit_amount: number | null;
          deposit_paid_at: string | null;
          notes: string | null;
          guest_name: string | null;
          guest_phone: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          customer_id?: string | null;
          scheduled_at: string;
          duration_min?: number;
          services?: string[];
          status?: "pending" | "confirmed" | "completed" | "no_show" | "cancelled";
          deposit_amount?: number | null;
          deposit_paid_at?: string | null;
          notes?: string | null;
          guest_name?: string | null;
          guest_phone?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          customer_id?: string | null;
          scheduled_at?: string;
          duration_min?: number;
          services?: string[];
          status?: "pending" | "confirmed" | "completed" | "no_show" | "cancelled";
          deposit_amount?: number | null;
          deposit_paid_at?: string | null;
          notes?: string | null;
          guest_name?: string | null;
          guest_phone?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          store_id: string;
          reservation_id: string | null;
          toss_payment_key: string | null;
          amount: number;
          status: string;
          paid_at: string | null;
          raw_response: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          reservation_id?: string | null;
          toss_payment_key?: string | null;
          amount: number;
          status: string;
          paid_at?: string | null;
          raw_response?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          reservation_id?: string | null;
          toss_payment_key?: string | null;
          amount?: number;
          status?: string;
          paid_at?: string | null;
          raw_response?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      current_user_stores: {
        Args: Record<string, never>;
        Returns: string[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// Convenience types
export type Store = Database["public"]["Tables"]["stores"]["Row"];
export type StoreMember = Database["public"]["Tables"]["store_members"]["Row"];
export type Customer = Database["public"]["Tables"]["customers"]["Row"];
export type ServiceLog = Database["public"]["Tables"]["service_logs"]["Row"];
export type Notification = Database["public"]["Tables"]["notifications"]["Row"];
export type Reservation = Database["public"]["Tables"]["reservations"]["Row"];
export type Payment = Database["public"]["Tables"]["payments"]["Row"];

export type NotificationWithCustomer = Notification & {
  customers: Pick<Customer, "pet_name" | "breed" | "owner_name" | "owner_phone">;
};

export type ReservationWithCustomer = Reservation & {
  customers: Pick<Customer, "pet_name" | "owner_name" | "owner_phone"> | null;
};
