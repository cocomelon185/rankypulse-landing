require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
    const { data: users } = await supabase.from('users').select('*');
    if (!users || users.length === 0) return console.log("No users.");
    
    // Pick the most recently created or updated user
    const user = users[users.length - 1]; // or just filter by email

    console.log("Checking for user:", user.email);

    const { data: jobs, error } = await supabase
        .from('crawl_jobs')
        .select('*')
        .eq('user_id', user.id);
        
    console.log("Crawl Jobs:", jobs);
    if (error) console.error("Error:", error);
}

test();
