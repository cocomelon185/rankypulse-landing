const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        let key = match[1].trim();
        let val = match[2].trim();
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        env[key] = val;
    }
});

async function run() {
    const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
    const jobId = "6a3d3d35-4720-4b2e-971b-0f1f4102f3a2";
    const { data, error } = await sb.from('audit_pages').select('id, url, issues').eq('job_id', jobId).limit(3);
    console.log("Audit Pages for job:", JSON.stringify(data, null, 2));
    if (error) console.error("Error:", error);
}

run();
