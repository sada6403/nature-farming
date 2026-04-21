const { createClient } = require('@supabase/supabase-js');
const xlsx = require('xlsx');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from admin/.env.local
dotenv.config({ path: path.resolve(__dirname, 'admin/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seed() {
  try {
    console.log('Reading Excel file...');
    const workbook = xlsx.readFile('Employee_Master_Sheet_20260421_1038.xlsx');
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    console.log(`Found ${data.length} entries in Excel.`);

    // Filter only Branch Managers or similar roles if necessary
    // Based on the sample: { "Role": "Branch Manager", "Branch/Area": "Chavakachcheri", ... }
    const managers = data.filter(row => row.Role === 'Branch Manager');
    console.log(`Processing ${managers.length} Branch Managers.`);

    for (const manager of managers) {
      const branchName = manager['Branch/Area'];
      const managerName = manager['Full Name'];
      const managerEmail = manager['Email'];
      const phone = manager['Phone']?.toString();

      console.log(`Upserting branch: ${branchName} (Manager: ${managerName})`);

      // Check if branch exists
      const { data: existingBranch } = await supabase
        .from('branches')
        .select('id')
        .eq('name', branchName)
        .single();

      if (existingBranch) {
        // Update
        const { error } = await supabase
          .from('branches')
          .update({
            manager_name: managerName,
            email: managerEmail,
            phone: phone,
            updated_at: new Date()
          })
          .eq('id', existingBranch.id);
        
        if (error) console.error(`Error updating branch ${branchName}:`, error.message);
      } else {
        // Insert
        const { error } = await supabase
          .from('branches')
          .insert([{
            name: branchName,
            district: branchName, // Using branch name as district for now
            address: branchName, // Placeholder address
            manager_name: managerName,
            email: managerEmail,
            phone: phone,
            is_active: true
          }]);
        
        if (error) console.error(`Error inserting branch ${branchName}:`, error.message);
      }
    }

    console.log('Seed finished successfully!');
  } catch (error) {
    console.error('Seed failed:', error);
  }
}

seed();
