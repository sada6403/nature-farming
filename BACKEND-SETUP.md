# Nature Farming Backend Setup

The project uses Supabase for PostgreSQL, authentication and media storage. The two Next.js applications run on the VPS. Public form writes pass through the website server API; admin CRUD is protected by Supabase Auth and row-level security (RLS).

## 1. Install the database backend

1. Open the existing Supabase project.
2. Open **SQL Editor** and run [`supabase_production.sql`](./supabase_production.sql) in full.
3. In **Authentication > Providers > Email**, disable public user sign-up. Admin users should only be created by the project owner.
4. In **Authentication > Users**, create the first admin user.
5. Run the following in SQL Editor, replacing the email:

```sql
insert into public.profiles (id, email, full_name, role)
select id, email, 'Administrator', 'super_admin'
from auth.users
where email = 'admin@example.com'
on conflict (id) do update set role = 'super_admin';
```

Additional admins can be added with role `admin`. Never put the service-role key in a variable beginning with `NEXT_PUBLIC_`.

## 2. Configure environment files

Copy `website/.env.example` to `website/.env.local` and `admin/.env.example` to `admin/.env.local`. Fill the values from **Supabase > Project Settings > API**.

Generate the inquiry salt on the VPS:

```bash
openssl rand -hex 32
```

Use that output as `INQUIRY_RATE_LIMIT_SALT`. The website needs the service-role key only for its server-side inquiry API. The admin app needs it only for authenticated server routes such as manager email delivery.

## 3. Verify locally

```powershell
cd website
npm.cmd ci
npm.cmd run build

cd ..\admin
npm.cmd ci
npm.cmd run build
```

Start the apps in separate terminals with `npm.cmd run dev`. Verify:

- Website health: `http://localhost:3000/api/health`
- Admin health: `http://localhost:3001/api/health` when admin is started on port 3001
- A contact submission appears in the admin inquiry inbox.
- A non-admin Supabase user cannot access or modify CMS data.

## 4. Production checklist

- Use HTTPS for both the public and admin domains.
- Keep ports 3000 and 3001 bound behind Nginx; expose only SSH, HTTP and HTTPS in the firewall.
- Use a long unique admin password and enable MFA in Supabase when available.
- Back up the Supabase database and storage buckets regularly.
- Keep `.env.local` files on the VPS only and restrict them with `chmod 600`.
- Check `pm2 logs` and both `/api/health` endpoints after every deploy.

See [`deploy/DEPLOYMENT-GUIDE.md`](./deploy/DEPLOYMENT-GUIDE.md) for VPS commands.
