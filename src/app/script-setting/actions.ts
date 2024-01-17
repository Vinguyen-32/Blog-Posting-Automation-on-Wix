'use server';

import ScriptModel from '@/models/script-model';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.REACT_APP_SUPABASE_URL as string, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string);

export async function getScript(): Promise<ScriptModel> {
  const { data: script } = await supabase.from('wix_config').select('script');

  const result = script ? script[0] : null;
  return result as any;
}

export async function saveScript(values: ScriptModel): Promise<number> {
  const result = await supabase
    .from('wix_config')
    .update({
      script: values.script,
    })
    .eq('id', 1);

  return result.status;
}
