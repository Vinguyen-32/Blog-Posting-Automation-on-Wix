import TokenModel from '@/models/token-model';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.REACT_APP_SUPABASE_URL as string, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string);
export async function getTokens(): Promise<TokenModel> {
  const { data: wix_config } = await supabase.from('wix_config').select('authorization_code,access_token,refresh_token');

  const result = wix_config ? wix_config[0] : null;
  return result as any;
}

export async function GET() {
  const token = await getTokens();
  return Response.json(token);
}
