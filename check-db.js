const SUPABASE_URL = "https://pczusosdrucxsmqvyvag.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjenVzb3NkcnVjeHNtcXZ5dmFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MzQ2MDUsImV4cCI6MjA5MjIxMDYwNX0.ipAluiddX-YI9ELY7JJH1_ld2c_jBxpJPXpmFLpc_SI";

async function check() {
  const tables = ["product_categories", "products", "branches", "company_settings"];
  for (const table of tables) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*`, {
      headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` }
    });
    const data = await res.json();
    console.log(`Table: ${table}, Count: ${data.length}`);
    if (data.length > 0) {
        console.log(`Sample Row: ${JSON.stringify(data[0]).substring(0, 100)}...`);
    }
  }
}

check().catch(err => console.error(err));
