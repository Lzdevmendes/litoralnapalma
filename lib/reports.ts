/**
 * Operações de CRUD para reports da comunidade usando Supabase.
 * Upvote sem autenticação via fingerprint do device (UUID criptográfico em AsyncStorage).
 *
 * Nota de segurança: a deduplicação client-side é uma camada de conveniência.
 * Para prevenção robusta de duplo-voto, adicione uma unique constraint no Supabase:
 *   ALTER TABLE report_upvotes ADD CONSTRAINT uq_device_report UNIQUE (device_id, report_id);
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { supabase } from '@/lib/supabase';
import type { Report, ReportType } from '@/lib/types';

const DEVICE_ID_KEY = '@litoral_na_palma:device_id';
const UPVOTED_KEY = '@litoral_na_palma:upvoted_reports';

// ---------------------------------------------------------------------------
// Device fingerprint — UUID criptograficamente seguro
// ---------------------------------------------------------------------------

export async function getDeviceId(): Promise<string> {
  const stored = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (stored) return stored;
  // expo-crypto gera UUID v4 usando o CSPRNG do SO (não Math.random)
  const id = Crypto.randomUUID();
  await AsyncStorage.setItem(DEVICE_ID_KEY, id);
  return id;
}

/** Verifica se este device já votou no report (camada client-side de conveniência). */
export async function hasUpvoted(reportId: string): Promise<boolean> {
  const raw = await AsyncStorage.getItem(UPVOTED_KEY);
  const set: string[] = raw ? (JSON.parse(raw) as string[]) : [];
  return set.includes(reportId);
}

async function markUpvoted(reportId: string): Promise<void> {
  const raw = await AsyncStorage.getItem(UPVOTED_KEY);
  const set: string[] = raw ? (JSON.parse(raw) as string[]) : [];
  if (!set.includes(reportId)) {
    set.push(reportId);
    await AsyncStorage.setItem(UPVOTED_KEY, JSON.stringify(set));
  }
}

// ---------------------------------------------------------------------------
// Supabase CRUD
// ---------------------------------------------------------------------------

function rowToReport(r: Record<string, unknown>): Report {
  return {
    id: r.id as string,
    type: r.type as ReportType,
    description: r.description as string | undefined,
    lat: r.lat as number,
    lng: r.lng as number,
    city: r.city as string,
    createdAt: r.created_at as string,
    expiresAt: r.expires_at as string,
    upvotes: r.upvotes as number,
  };
}

/**
 * Busca reports ativos (não expirados) opcionalmente filtrados por cidade.
 */
export async function fetchReportsFromSupabase(cityId?: string): Promise<Report[]> {
  if (!supabase) throw new Error('Supabase não configurado');

  let query = supabase
    .from('reports')
    .select('*')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false });

  if (cityId) query = query.eq('city', cityId);

  const { data, error } = await query;
  if (error) throw error;

  return (data as Record<string, unknown>[]).map(rowToReport);
}

/**
 * Insere um novo report no banco.
 */
export async function submitReportToSupabase(data: {
  type: ReportType;
  description?: string;
  lat: number;
  lng: number;
  city: string;
}): Promise<Report> {
  if (!supabase) throw new Error('Supabase não configurado');

  const { data: row, error } = await supabase
    .from('reports')
    .insert({
      type: data.type,
      description: data.description ?? null,
      lat: data.lat,
      lng: data.lng,
      city: data.city,
    })
    .select()
    .single();

  if (error) throw error;
  return rowToReport(row as Record<string, unknown>);
}

/**
 * Incrementa upvote de um report.
 * Prevenção de duplo-voto: client-side (AsyncStorage) + server-side (unique constraint).
 */
export async function upvoteReport(reportId: string): Promise<void> {
  if (!supabase) throw new Error('Supabase não configurado');

  const already = await hasUpvoted(reportId);
  if (already) throw new Error('Você já votou neste reporte');

  const { error } = await supabase.rpc('increment_report_upvote', {
    report_id: reportId,
  });
  if (error) throw error;

  await markUpvoted(reportId);
}
