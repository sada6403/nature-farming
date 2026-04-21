const xlsx = require('xlsx');
const fs = require('fs');

try {
    const workbook = xlsx.readFile('Employee_Master_Sheet_20260421_1038.xlsx');
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const managers = data.filter(r => r.Role === 'Branch Manager');

    let sql = 'INSERT INTO public.branches (name, district, address, manager_name, email, phone) VALUES\n';
    
    const rows = managers.map(m => {
        const name = m['Branch/Area'] || '';
        const managerName = m['Full Name'] || '';
        const email = m['Email'] || '';
        const phone = m['Phone'] || '';
        
        // Escape single quotes for SQL
        const escapedName = name.toString().replace(/'/g, "''");
        const escapedManagerName = managerName.toString().replace(/'/g, "''");
        const escapedEmail = email.toString().replace(/'/g, "''");
        const escapedPhone = phone.toString().replace(/'/g, "''");

        return `('${escapedName}', '${escapedName}', '${escapedName}', '${escapedManagerName}', '${escapedEmail}', '${escapedPhone}')`;
    });

    sql += rows.join(',\n') + ';';

    fs.writeFileSync('insert_branches.sql', sql);
    console.log('Successfully generated insert_branches.sql');
} catch (error) {
    console.error('Error generating SQL:', error);
}
