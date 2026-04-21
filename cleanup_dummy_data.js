const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'admin/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function cleanup() {
  console.log('Cleaning up dummy data...');

  try {
    // 1. Delete dummy products
    // We'll delete all products since they were all samples
    const { error: prodError } = await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (prodError) console.error('Error deleting products:', prodError.message);
    else console.log('Successfully cleared products table.');

    // 2. Delete dummy categories
    const { error: catError } = await supabase.from('product_categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (catError) console.error('Error deleting categories:', catError.message);
    else console.log('Successfully cleared product_categories table.');

    // 3. Clear dummy inquiries if any (though currently empty)
    // We already know it's empty from previous checks, but for safety:
    // Actually, we'll keep inquiries if there were real ones, but since it's empty [], no action needed.

    console.log('Cleanup finished!');
  } catch (err) {
    console.error('Cleanup failed:', err);
  }
}

cleanup();
