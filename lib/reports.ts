/**
 * Operações de CRUD para reports da comunidade usando Supabase.
 *
 * 🔴 Nota de segurança (gap confirmado — ver AGENTS.md): `hasUpvoted`/`markUpvoted` abaixo são a
 * ÚNICA proteção contra duplo-voto hoje — puramente client-side via AsyncStorage, bypassável
 * reinstalando o app. A tabela `report_upvotes` já existe no banco com a infraestrutura correta
 * (PK composta `(report_id, user_id)`, RLS, FK para `auth.users`), mas a RPC que `upvoteReport`
 * chama (`increment_report_upvote`) não a usa — só incrementa `reports.upvotes` sem checar
 * `user_id` nem inserir linha de dedupe. A correção não é adicionar constraint nova: é trocar a
 * RPC por uma que valide `auth.uid()` e faça `insert into report_upvotes ... on conflict do nothing`
 * antes de incrementar — usando a infraestrutura que já está pronta no banco.
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
