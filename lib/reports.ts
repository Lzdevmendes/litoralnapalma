/**
 * Operações de CRUD para reports da comunidade usando Supabase.
 * Upvote sem autenticação via fingerprint do device (UUID em AsyncStorage).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import type { Report, ReportType } from '@/lib/types';

const DEVICE_ID_KEY = '@litoral_na_palma:device_id';
const UPVOTED_KEY = '@litoral_na_palma:upvoted_reports';

// ---------------------------------------------------------------------------
// Device fingerprint
// ---------------------------------------------------------------------------

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export async function getDeviceId(): Promise<string> {
  const stored = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (stored) return stored;
  const id = generateUUID();
  await AsyncStorage.setItem(DEVICE_ID_KEY, id);
  return id;
}

/** Verifica se este device já votou no report (evita duplo upvote). */
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
 * Prevenção de duplo-voto via AsyncStorage do device.
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
