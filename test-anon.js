const { createClient } = require('@supabase/supabase-js');
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
sb.from('audit_pages').select('url, issues, score').order('created_at', { ascending: false }).limit(1).then(x => console.log(JSON.stringify(x.data, null, 2)));
