import 'dotenv/config';
import { supabaseAdmin } from './src/lib/supabase.js';
import * as bcrypt from 'bcryptjs';

async function seedAdmin() {
  const email = 'cocomelon185@gmail.com';
  const password = 'password123';
  const hash = await bcrypt.hash(password, 12);
  
  // check if user exists
  const { data: existingUser } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (existingUser) {
    console.log('User exists. Updating password to password123...');
    const { error } = await supabaseAdmin
      .from('users')
      .update({ password_hash: hash, role: 'admin' })
      .eq('id', existingUser.id);
    if (error) console.error(error);
    else console.log('Update successful. You can log in with:');
    console.log('Email:', email);
    console.log('Password:', password);
  } else {
    console.log('User does not exist. Creating...');
    const username = 'admin_' + Math.floor(Math.random() * 10000);
    const { error } = await supabaseAdmin
      .from('users')
      .insert({
        email,
        username,
        password_hash: hash,
        role: 'admin',
        name: 'Admin Developer'
      });
    if (error) console.error(error);
    else console.log('Create successful. You can log in with:');
    console.log('Email:', email);
    console.log('Password:', password);
  }
}

seedAdmin().catch(console.error);
