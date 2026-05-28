/**
 * Camada de autenticação do app.
 *
 * Implementação atual: mock local (AsyncStorage) para desenvolvimento.
 *
 * TODO: substituir por Supabase Auth quando o projeto for configurado.
 * Referência: https://supabase.com/docs/guides/auth/social-login/auth-google
 * Env vars necessárias:
 *   EXPO_PUBLIC_SUPABASE_URL=...
 *   EXPO_PUBLIC_SUPABASE_ANON_KEY=...
 *   EXPO_PUBLIC_GOOGLE_CLIENT_ID=...
 *
 * Exemplo de swap (supabase):
 *   const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
 *   export async function signInWithEmail(...) { return supabase.auth.signInWithOtp({ email }) }
 */

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Código OTP para desenvolvimento (qualquer código de 6 dígitos é aceito em prod real) */
export const DEV_OTP = '000000';

export interface AuthUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
}

/** Envia OTP para o e-mail informado. */
export async function sendEmailOTP(email: string): Promise<void> {
  await delay(700);
  // TODO: await supabase.auth.signInWithOtp({ email })
  console.log(`[auth] OTP enviado para ${email}`);
}

/** Envia OTP via SMS para o telefone informado. */
export async function sendPhoneOTP(phone: string): Promise<void> {
  await delay(700);
  // TODO: await supabase.auth.signInWithOtp({ phone })
  console.log(`[auth] SMS OTP enviado para ${phone}`);
}

/** Verifica o código OTP e retorna o usuário autenticado. */
export async function verifyOTP(
  contact: string,
  code: string,
  type: 'email' | 'phone'
): Promise<AuthUser> {
  await delay(600);
  // TODO: const { data, error } = await supabase.auth.verifyOtp({ email/phone, token: code, type: 'email'/'sms' })
  if (code.length !== 6) throw new Error('Código inválido');
  const isEmail = type === 'email';
  return {
    id: `u_${Date.now()}`,
    name: isEmail ? contact.split('@')[0] : 'Usuário',
    email: isEmail ? contact : undefined,
    phone: isEmail ? undefined : contact,
  };
}

/** Cria conta com e-mail + senha e envia confirmação. */
export async function signUpWithEmail(
  name: string,
  email: string,
  _password: string
): Promise<void> {
  await delay(800);
  // TODO: await supabase.auth.signUp({ email, password, options: { data: { name } } })
  console.log(`[auth] Conta criada para ${email}, confirmação enviada`);
}

/** Cria conta com telefone e envia OTP via SMS. */
export async function signUpWithPhone(name: string, phone: string): Promise<void> {
  await delay(800);
  // TODO: await supabase.auth.signUp({ phone, options: { data: { name } } })
  console.log(`[auth] Conta criada para ${phone}`);
}

/**
 * Login com Google via OAuth.
 * Em produção: usa expo-auth-session + expo-web-browser.
 */
export async function signInWithGoogle(): Promise<AuthUser> {
  await delay(900);
  // TODO: usar expo-auth-session com Google OAuth + Supabase
  // const { params } = await AuthSession.startAsync({ authUrl: supabase.auth.getOAuthSignInUrl('google') })
  return {
    id: `g_${Date.now()}`,
    name: 'Usuário Google',
    email: 'usuario@gmail.com',
    photoUrl: undefined,
  };
}

/** Encerra a sessão do usuário. */
export async function signOut(): Promise<void> {
  await delay(200);
  // TODO: await supabase.auth.signOut()
}
