import { createClient } from '@supabase/supabase-js';

// Substitua pelos seus dados reais do painel do Supabase
const supabaseUrl = 'https://odbtyksmwagvdrxfareg.supabase.co';
const supabaseAnonKey = 'sb_publishable_i0_h2FgmhLcV5KHj25lpTA_a8WYapUQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);