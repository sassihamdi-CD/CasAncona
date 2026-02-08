/**
 * Minimal Supabase DB types for our schema.
 * For full types, run: npx supabase gen types typescript --project-id YOUR_REF > lib/supabase/database.types.ts
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      services: {
        Row: {
          id: string;
          name: string;
          name_en: string | null;
          name_ar: string | null;
          name_fr: string | null;
          description: string | null;
          description_en: string | null;
          description_ar: string | null;
          description_fr: string | null;
          documents_required: string | null;
          documents_required_en: string | null;
          documents_required_ar: string | null;
          documents_required_fr: string | null;
          duration_minutes: number;
          price_cents: number;
          currency: string;
          stripe_price_id: string | null;
          active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["services"]["Row"], "id" | "created_at" | "updated_at"> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["services"]["Insert"]>;
      };
      staff: {
        Row: {
          id: string;
          auth_user_id: string | null;
          name: string;
          email: string;
          telegram_chat_id: string | null;
          whatsapp_phone: string | null;
          role: string;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["staff"]["Row"], "id" | "created_at" | "updated_at"> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["staff"]["Insert"]>;
      };
      staff_availability: {
        Row: {
          id: string;
          staff_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["staff_availability"]["Row"], "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["staff_availability"]["Insert"]>;
      };
      staff_blocked_dates: {
        Row: {
          id: string;
          staff_id: string;
          date: string;
          reason: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["staff_blocked_dates"]["Row"], "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["staff_blocked_dates"]["Insert"]>;
      };
      appointments: {
        Row: {
          id: string;
          service_id: string;
          assigned_staff_id: string | null;
          consultation_type: string;
          client_name: string;
          client_email: string;
          client_phone: string | null;
          client_message: string | null;
          requested_start_at: string;
          duration_minutes: number;
          status: string;
          stripe_session_id: string | null;
          stripe_payment_intent_id: string | null;
          amount_paid_cents: number | null;
          currency: string | null;
          video_room_id: string | null;
          video_room_url: string | null;
          passport_document_path: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["appointments"]["Row"], "id" | "created_at" | "updated_at"> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["appointments"]["Insert"]>;
      };
      site_contact: {
        Row: {
          id: string;
          phone: string | null;
          email: string | null;
          hours: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["site_contact"]["Row"], "id" | "created_at" | "updated_at"> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["site_contact"]["Insert"]>;
      };
    };
  };
}
