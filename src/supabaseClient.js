import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fojzksksxygscovfsm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvanprc2tzeWdzY29jdmZzbSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzI1MzY4MTMxLCJleHAiOjE4ODI4MzQxMzF9.ALYbTt8JYz_qYKKY3bkPfExMgzHKd9d8wC5FlZCvQvE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
