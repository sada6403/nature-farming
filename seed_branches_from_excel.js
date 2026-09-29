const xlsx = require('xlsx');
const path = require('path');
const { pool, query } = require('./backend/src/config/db');

async function seedBranchesFromExcel() {
  try {
    const excelPath = path.resolve(__dirname, 'Employee_Master_Sheet_20260421_1038.xlsx');
    console.log(`Reading Excel file: ${excelPath}`);
    const workbook = xlsx.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    console.log(`Found ${data.length} total entries in Excel.`);

    const managers = data.filter(row => row.Role === 'Branch Manager');
    console.log(`Processing ${managers.length} Branch Managers into PostgreSQL...`);

    for (const manager of managers) {
      const branchName = manager['Branch/Area'];
      const managerName = manager['Full Name'];
      const managerEmail = manager['Email'];
      const phone = manager['Phone']?.toString();

      if (!branchName) continue;

      const existing = await query('SELECT id FROM branches WHERE LOWER(name) = LOWER($1)', [branchName]);

      if (existing.rows.length > 0) {
        await query(
          `UPDATE branches SET
            manager_name = $1,
            email = $2,
            phone = $3,
            updated_at = NOW()
          WHERE id = $4`,
          [managerName, managerEmail, phone, existing.rows[0].id]
        );
        console.log(`Updated branch: ${branchName}`);
      } else {
        await query(
          `INSERT INTO branches (name, district, address, manager_name, email, phone, is_active, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, true, NOW(), NOW())`,
          [branchName, branchName, `${branchName}, Sri Lanka`, managerName, managerEmail, phone]
        );
        console.log(`Inserted branch: ${branchName}`);
      }
    }

    console.log('🎉 Excel branch import complete!');
  } catch (err) {
    console.error('Error importing branches from excel:', err.message);
  } finally {
    await pool.end();
  }
}

seedBranchesFromExcel();
