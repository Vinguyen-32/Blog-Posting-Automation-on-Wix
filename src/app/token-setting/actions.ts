'use server';

import TokenModel from '@/models/token-model';
import { createClient } from '@supabase/supabase-js';
import { generateNewTokens as wixGenerateNewTokens } from '../wix-actions';
import { WixTokensModel } from '@/models/wix-tokens-model';

const supabase = createClient(process.env.REACT_APP_SUPABASE_URL as string, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string);
export async function getTokens(): Promise<TokenModel> {
  const { data: wix_config } = await supabase.from('wix_config').select('authorization_code,access_token,refresh_token');

  const result = wix_config ? wix_config[0] : null;
  return result as any;
}

export async function saveTokens(values: TokenModel): Promise<number> {
  const result = await supabase
    .from('wix_config')
    .update({
      authorization_code: values.authorization_code,
      access_token: values.access_token,
      refresh_token: values.refresh_token,
    })
    .eq('id', 1);

  return result.status;
}

export async function generateNewTokens(authorization_code: string): Promise<boolean> {
  const result = await wixGenerateNewTokens(authorization_code);
  if (result) {
    const tokens = result as WixTokensModel;
    await saveTokens({
      access_token: tokens.access_token,
      authorization_code: authorization_code,
      refresh_token: tokens.refresh_token,
    });
    return true;
  } else {
    return false;
  }
}
