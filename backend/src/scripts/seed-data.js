const { pool, query } = require('../config/db');

async function seedData() {
  console.log('🌱 Seeding initial data into Nature Farming PostgreSQL...');
  try {
    // 1. Categories
    const categories = [
      { name: 'Personal Care', slug: 'personal-care' },
      { name: 'Raw Materials', slug: 'raw-materials' },
      { name: 'Agriculture', slug: 'agriculture' },
      { name: 'Plants', slug: 'plants' },
    ];
    for (const cat of categories) {
      await query(
        'INSERT INTO product_categories (name, slug) VALUES ($1, $2) ON CONFLICT (slug) DO NOTHING',
        [cat.name, cat.slug]
      );
    }
    const catRows = await query('SELECT id, name FROM product_categories');
    const catMap = {};
    catRows.rows.forEach(r => { catMap[r.name] = r.id; });

    // 2. Products
    const products = [
      {
        name: 'Pure Aloe Vera Soap',
        slug: 'pure-aloe-soap',
        description: '100% natural, handcrafted soap for sensitive skin with pure aloe extract.',
        price: 450.00,
        image_url: '/aloe_soap_product_1776647089967.png',
        category_id: catMap['Personal Care'] || null,
        is_featured: true,
        is_published: true,
      },
      {
        name: 'Medicinal Aloe Plant',
        slug: 'medicinal-aloe-plant',
        description: 'Healthy, mature aloe vera plant for home remedy and air purification.',
        price: 850.00,
        image_url: '/aloe_plant_1776648136140.png',
        category_id: catMap['Plants'] || catMap['Raw Materials'] || null,
        is_featured: true,
        is_published: true,
      },
      {
        name: 'Fresh Aloe Vera Leaves (Per Kg)',
        slug: 'fresh-aloe-leaves',
        description: 'Directly harvested from organic Sri Lankan farms. Ideal for cosmetics and consumption.',
        price: 320.00,
        image_url: '/9b9ccd87-044b-4de5-a020-a7b6e7c2475b.jpg',
        category_id: catMap['Raw Materials'] || null,
        is_featured: true,
        is_published: true,
      },
      {
        name: 'Aloe Soothing Gel (250ml)',
        slug: 'aloe-soothing-gel-250ml',
        description: 'Cold-pressed 99% pure aloe vera soothing and hydrating gel.',
        price: 650.00,
        image_url: '/aloe_soap_product_1776647089967.png',
        category_id: catMap['Personal Care'] || null,
        is_featured: true,
        is_published: true,
      },
    ];

    for (const p of products) {
      await query(`
        INSERT INTO products (name, slug, description, price, image_url, category_id, is_featured, is_published)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          price = EXCLUDED.price,
          image_url = EXCLUDED.image_url,
          category_id = EXCLUDED.category_id,
          is_featured = EXCLUDED.is_featured,
          is_published = EXCLUDED.is_published
      `, [p.name, p.slug, p.description, p.price, p.image_url, p.category_id, p.is_featured, p.is_published]);
    }
    console.log('✅ Products seeded.');

    // 3. Branches
    const branches = [
      { name: 'Chavakachcheri', district: 'Jaffna', address: 'Chavakachcheri, Jaffna', manager_name: 'KAANDIPAN ABISHAJAN', email: 'nfplantationas@gmail.com', phone: '0706189612' },
      { name: 'Kilinochchi Central', district: 'Kilinochchi', address: 'A9 Road, Kilinochchi', manager_name: 'SRIKANTHAN KALAIVANY', email: 'skalai0714@gmail.com', phone: '0776355774' },
      { name: 'Puthukkudiyiruppu', district: 'Mullaitivu', address: 'Main Street, Puthukkudiyiruppu', manager_name: 'SASIKKUMAR MAHILINY', email: 'silampusilamparasan55@gmail.com', phone: '0764243506' },
      { name: 'Mulliyawalai', district: 'Mullaitivu', address: 'Mulliyawalai', manager_name: 'KAGILAITHIRUNATHAN VITHUSAN', email: 'vithusanvithu291@gmail.com', phone: '0774844182' },
      { name: 'Mallavi', district: 'Mullaitivu', address: 'Mallavi Town', manager_name: 'KIRUSHNAMOORTHI THARMARANY', email: 'tharmaranibanu@gmail.com', phone: '0775851256' },
      { name: 'Nedunkeny', district: 'Vavuniya', address: 'Nedunkeny', manager_name: 'MODSARASA PURADSIKA', email: 'pmodsarasa@gmail.com', phone: '0766448018' },
      { name: 'Thirunelvelly', district: 'Jaffna', address: 'Palaly Road, Thirunelvelly', manager_name: 'VIJAYARATNAM GOWRIKASAN', email: 'v.ragisan@gmail.com', phone: '0775474745' },
      { name: 'Karachchi', district: 'Kilinochchi', address: 'Karachchi', manager_name: 'JEGARAJASEKARAM KARTHIGA', email: 'karthigakarththi@gmail.com', phone: '0770232509' },
      { name: 'Poonakary', district: 'Kilinochchi', address: 'Poonakary Junction', manager_name: 'PARAMESWARAN ANUSHAN', email: 'anushan.bavi@gmail.com', phone: '0770055759' },
      { name: 'Kandawalai', district: 'Kilinochchi', address: 'Kandawalai', manager_name: 'JEKATHEESVARAN NILOJANA', email: 'nilonilo947@gmail.com', phone: '0768269378' },
      { name: 'Vavuniya Town', district: 'Vavuniya', address: 'Kandy Road, Vavuniya', manager_name: 'RAGEEVKARAN LOGINI', email: 'logil1833@gmail.com', phone: '0773520629' },
      { name: 'Akkaraipattu', district: 'Ampara', address: 'Main Street, Akkaraipattu', manager_name: 'KOPAL JEEVITHA', email: 'preshwinr@gmail.com', phone: '0755392402' },
      { name: 'Ampara Central', district: 'Ampara', address: 'Ampara', manager_name: 'ABDAL RAHUMAN SULKIFLY AHAMED', email: 'kiflyahamed@gmail.com', phone: '0777251128' },
      { name: 'Cheddikulam', district: 'Vavuniya', address: 'Cheddikulam', manager_name: 'Sithmbaram Subanthini', email: 'subanthini29@gmail.com', phone: '0773830680' },
      { name: 'Kalmunai', district: 'Ampara', address: 'Kalmunai Town', manager_name: 'VAIRAMUTHU LOGINI', email: 'gayathrigayagaya8@gmail.com', phone: '0763015040' },
      { name: 'Mannar', district: 'Mannar', address: 'Mannar Island', manager_name: 'Anne Rucksini Thomas Culas', email: 'annerucksini@gmail.com', phone: '0757076946' },
    ];

    for (const b of branches) {
      const existing = await query('SELECT id FROM branches WHERE name = $1 AND district = $2', [b.name, b.district]);
      if (existing.rows.length === 0) {
        await query(`
          INSERT INTO branches (name, district, address, manager_name, email, phone, is_active)
          VALUES ($1, $2, $3, $4, $5, $6, true)
        `, [b.name, b.district, b.address, b.manager_name, b.email, b.phone]);
      }
    }
    console.log('✅ Branches seeded.');

    // 4. FAQs
    const faqs = [
      { question: 'How can I join as a farmer?', answer: 'Click on the "Join as a Farmer" button, fill out the application form, and our regional branch manager will contact you for a field consultation and nursery supply.', display_order: 1 },
      { question: 'Are your products 100% natural?', answer: 'Yes, all our products are handcrafted using pure organic Aloe Vera harvested from our partner Sri Lankan farms without harmful chemicals.', display_order: 2 },
      { question: 'Where are your branches located?', answer: 'We currently operate extensively in Northern and Eastern provinces of Sri Lanka, including Jaffna, Kilinochchi, Mullaitivu, Vavuniya, Mannar, and Ampara.', display_order: 3 },
      { question: 'Do you offer bulk delivery for industrial use?', answer: 'Yes, we provide bulk raw aloe leaves and cold-pressed gel for industrial cosmetic and pharmaceutical manufacturers.', display_order: 4 },
    ];
    for (const f of faqs) {
      const existing = await query('SELECT id FROM faqs WHERE question = $1', [f.question]);
      if (existing.rows.length === 0) {
        await query('INSERT INTO faqs (question, answer, display_order) VALUES ($1, $2, $3)', [f.question, f.answer, f.display_order]);
      }
    }
    console.log('✅ FAQs seeded.');

    console.log('🎉 Seeding successfully finished!');
  } catch (error) {
    if (error.code === 'ECONNREFUSED' || (error.errors && error.errors[0]?.code === 'ECONNREFUSED')) {
      console.error('\n⚠️ Could not connect to PostgreSQL (ECONNREFUSED).');
      console.error('👉 Please ensure PostgreSQL is running, or set your remote DATABASE_URL in backend/.env');
    } else {
      console.error('❌ Seeding error:', error.message || error);
    }
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  seedData();
}

module.exports = { seedData };
