// ─────────────────────────────────────────────────────────────────────────────
// PetRoamID – Supabase Database Types (hand-written to match schema.sql)
// In a real project, generate this with: npx supabase gen types typescript
// ─────────────────────────────────────────────────────────────────────────────
import type { Pet, Trip, PurchaseRecord } from '../store/appStore';

export interface Database {
  public: {
    Tables: {
      pets: {
        Row:    { id: string; user_id: string; data: Pet;            created_at: string; updated_at: string };
        Insert: { id: string; user_id: string; data: Pet;            created_at?: string; updated_at?: string };
        Update: { id?: string; user_id?: string; data?: Partial<Pet>; updated_at?: string };
      };
      trips: {
        Row:    { id: string; user_id: string; data: Trip;           created_at: string; updated_at: string };
        Insert: { id: string; user_id: string; data: Trip;           created_at?: string; updated_at?: string };
        Update: { id?: string; user_id?: string; data?: Partial<Trip>; updated_at?: string };
      };
      purchases: {
        Row:    { id: string; user_id: string; trip_id: string; data: PurchaseRecord; created_at: string };
        Insert: { id?: string; user_id: string; trip_id: string; data: PurchaseRecord };
        Update: never;
      };
      profiles: {
        Row:    { id: string; display_name: string; avatar_emoji: string; updated_at: string };
        Insert: { id: string; display_name?: string; avatar_emoji?: string };
        Update: { display_name?: string; avatar_emoji?: string; updated_at?: string };
      };
    };
  };
}
