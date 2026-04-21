-- Database Schema for Natural Farming

-- 1. Profiles (Admins)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Company Settings (Singleton)
CREATE TABLE IF NOT EXISTS public.company_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    company_name TEXT DEFAULT 'Nature Farming',
    tagline TEXT DEFAULT 'Sri Lanka''s Leading Aloe Vera Partner',
    logo_url TEXT,
    head_office_address TEXT,
    primary_phone TEXT,
    secondary_phone TEXT,
    primary_email TEXT,
    whatsapp_number TEXT,
    facebook_link TEXT,
    instagram_link TEXT,
    youtube_link TEXT,
    about_us TEXT,
    mission TEXT,
    vision TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT singleton_row CHECK (id = 1)
);

-- 3. Product Categories
CREATE TABLE IF NOT EXISTS public.product_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Products
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    benefits TEXT[],
    price DECIMAL(10,2),
    image_url TEXT,
    category_id UUID REFERENCES public.product_categories(id),
    is_featured BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Branches
CREATE TABLE IF NOT EXISTS public.branches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    district TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    map_url TEXT,
    manager_name TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Inquiries (Combined Contact & Farmer Interest)
CREATE TABLE IF NOT EXISTS public.inquiries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT CHECK (type IN ('contact', 'farmer_interest')),
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    subject TEXT,
    message TEXT,
    district TEXT, -- Useful for farmer interest
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'closed')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Gallery
CREATE TABLE IF NOT EXISTS public.gallery (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT,
    image_url TEXT NOT NULL,
    category TEXT CHECK (category IN ('farm', 'production', 'products', 'events', 'other')),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. FAQ
CREATE TABLE IF NOT EXISTS public.faqs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

-- 1. Profiles: Admins can read all profiles, users can only read their own
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id OR role = 'super_admin');

-- 2. Public Read Policies
CREATE POLICY "Public Read Settings" ON public.company_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Read Categories" ON public.product_categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Read Products" ON public.products FOR SELECT TO anon, authenticated USING (is_published = true);
CREATE POLICY "Public Read Branches" ON public.branches FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Public Read Gallery" ON public.gallery FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Read FAQs" ON public.faqs FOR SELECT TO anon, authenticated USING (true);

-- 3. Anonymous Insert for Inquiries
CREATE POLICY "Anyone can submit inquiries" ON public.inquiries FOR INSERT TO anon, authenticated WITH CHECK (true);

-- 4. Admin Full Access Policies
-- (We'll simplify this for the admin dashboard by letting authenticated admins do everything)
CREATE POLICY "Admins full access settings" ON public.company_settings FOR ALL TO authenticated USING (true);
CREATE POLICY "Admins full access categories" ON public.product_categories FOR ALL TO authenticated USING (true);
CREATE POLICY "Admins full access products" ON public.products FOR ALL TO authenticated USING (true);
CREATE POLICY "Admins full access branches" ON public.branches FOR ALL TO authenticated USING (true);
CREATE POLICY "Admins full access inquiries" ON public.inquiries FOR ALL TO authenticated USING (true);
CREATE POLICY "Admins full access gallery" ON public.gallery FOR ALL TO authenticated USING (true);
CREATE POLICY "Admins full access faqs" ON public.faqs FOR ALL TO authenticated USING (true);

-- Insert Default Settings
INSERT INTO public.company_settings (id, company_name, tagline)
VALUES (1, 'Natural Farming', 'Sri Lanka''s Leading Aloe Vera Partner')
ON CONFLICT (id) DO NOTHING;

-- Insert Sample Categories
INSERT INTO public.product_categories (name, slug) VALUES 
('Personal Care', 'personal-care'),
('Raw Materials', 'raw-materials'),
('Agriculture', 'agriculture')
ON CONFLICT (slug) DO NOTHING;

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'admin'); -- Defaulting to admin for this internal system
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- One-time sync for existing users missing profiles
INSERT INTO public.profiles (id, email, role)
SELECT id, email, 'admin'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;
