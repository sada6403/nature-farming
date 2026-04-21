const SUPABASE_URL = "https://pczusosdrucxsmqvyvag.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjenVzb3NkcnVjeHNtcXZ5dmFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MzQ2MDUsImV4cCI6MjA5MjIxMDYwNX0.ipAluiddX-YI9ELY7JJH1_ld2c_jBxpJPXpmFLpc_SI";

async function post(table, data) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
        method: "POST",
        headers: {
            "apikey": SUPABASE_KEY,
            "Authorization": `Bearer ${SUPABASE_KEY}`,
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates"
        },
        body: JSON.stringify(data)
    });
    if (!res.ok) {
        const err = await res.text();
        console.error(`Error seeding ${table}:`, err);
        return false;
    }
    console.log(`Successfully seeded ${table}`);
    return true;
}

async function seed() {
  console.log("Starting robust seeding...");

  // 1. Categories
  await post("product_categories", [
    { name: "Personal Care", slug: "personal-care" },
    { name: "Plants", slug: "plants" },
    { name: "Agriculture", slug: "agriculture" }
  ]);

  // Fetch Category IDs
  const catRes = await fetch(`${SUPABASE_URL}/rest/v1/product_categories?select=id,name`, {
    headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` }
  });
  const catData = await catRes.json();
  const getCatId = (name) => catData.find(c => c.name === name)?.id;

  // 2. Products
  const products = [
    {
      name: "Pure Aloe Vera Soap",
      slug: "pure-aloe-soap",
      description: "100% natural, handcrafted soap for sensitive skin.",
      price: 450,
      image_url: "/aloe_soap_product_1776647089967.png",
      category_id: getCatId("Personal Care"),
      is_featured: true,
      is_published: true
    },
    {
      name: "Medicinal Aloe Plant",
      slug: "medicinal-aloe-plant",
      description: "Healthy, mature aloe vera plant for home remedy and air purification.",
      price: 850,
      image_url: "/aloe_plant_1776648136140.png",
      category_id: getCatId("Plants"),
      is_featured: true,
      is_published: true
    },
    {
      name: "Raw Aloe Leaves (Bulk)",
      slug: "raw-aloe-leaves",
      description: "Freshly harvested organic aloe leaves for industrial and domestic use.",
      price: 250,
      image_url: "/aloe_farm_hero_1776647052615.png",
      category_id: getCatId("Agriculture"),
      is_featured: true,
      is_published: true
    }
  ];
  await post("products", products);

  // 3. Branches
  const branches = [
    {
      name: "Colombo Head Office",
      district: "Colombo",
      address: "123 Aloe Vera Estate Road, Colombo 08",
      phone: "+94 11 234 5678",
      is_active: true
    },
    {
      name: "Kurunegala Collection Center",
      district: "Kurunegala",
      address: "45 Lake Road, Kurunegala",
      phone: "+94 37 123 4567",
      is_active: true
    }
  ];
  await post("branches", branches);

  // 4. Company Settings
  const settings = {
    id: 1,
    company_name: "Natural Farming",
    tagline: "Leading Sri Lanka in Premium Aloe Vera Production",
    primary_email: "info@naturalfarming.lk",
    primary_phone: "+94 77 123 4567",
    mission: "To empower local farmers with sustainable practices and fair compensation while delivering pure aloe vera excellence."
  };
  await post("company_settings", settings);

  console.log("Robust seeding complete!");
}

seed().catch(err => console.error("Script failed:", err));
