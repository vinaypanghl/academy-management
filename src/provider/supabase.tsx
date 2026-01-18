import { SupabaseClient } from "@supabase/supabase-js";
import { createContext, ReactNode } from "react";

export interface SupabaseProviderProps {
  children: ReactNode;
  client: SupabaseClient;
}

export const SupabaseContext = createContext<{
  client: SupabaseClient;
} | null>(null);

/** A context provider for a Supabase client. */
export const SupabaseProvider = ({ client, children }: SupabaseProviderProps) => {
  return <SupabaseContext.Provider value={{ client }}>{children}</SupabaseContext.Provider>;
};
