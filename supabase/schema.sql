-- ==============================================================================
-- DEVSETU CONNECT - 100% IDEMPOTENT PRODUCTION SUPABASE DATABASE SCHEMA
-- ==============================================================================
-- Location: supabase/schema.sql & schema.sql
-- Description: Fully idempotent PostgreSQL & Supabase schema. Can be executed 
--              multiple times on fresh or existing databases without errors.
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. CUSTOM ENUMS (Idempotent Creation)
-- ==============================================================================
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'astrologer', 'client');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE account_status AS ENUM ('pending', 'approved', 'rejected', 'suspended', 'blocked');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE booking_status AS ENUM ('created', 'submitted', 'approved', 'rejected', 'in_progress', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('UPI', 'NetBanking', 'Card', 'Cash', 'Other');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE ticket_status AS ENUM ('Open', 'In Progress', 'Resolved', 'Closed');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE pin_reset_status AS ENUM ('pending', 'in_review', 'pin_reset', 'closed');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE notif_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE notif_type AS ENUM ('info', 'success', 'warning', 'error', 'registration', 'booking', 'chat', 'admin');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ==============================================================================
-- 3. SEQUENTIAL ID GENERATORS (Atomic Sequence Generators)
-- ==============================================================================
CREATE SEQUENCE IF NOT EXISTS seq_astrologer_profile_id START 1;
CREATE SEQUENCE IF NOT EXISTS seq_admin_profile_id START 1;
CREATE SEQUENCE IF NOT EXISTS seq_booking_id START 1;
CREATE SEQUENCE IF NOT EXISTS seq_ticket_id START 1000;

CREATE OR REPLACE FUNCTION generate_astrologer_profile_id()
RETURNS TEXT AS $$
BEGIN
    RETURN 'DEV-AST-' || LPAD(nextval('seq_astrologer_profile_id')::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_admin_profile_id()
RETURNS TEXT AS $$
DECLARE
    next_id BIGINT;
BEGIN
    next_id := nextval('seq_admin_profile_id');
    RETURN 'DEV-ADM-' || LPAD(next_id::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_booking_id()
RETURNS TEXT AS $$
BEGIN
    RETURN 'DEV-BKG-' || LPAD(nextval('seq_booking_id')::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_ticket_id()
RETURNS TEXT AS $$
BEGIN
    RETURN 'TK-' || nextval('seq_ticket_id')::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions to sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- ==============================================================================
-- 4. UTILITY FUNCTIONS (Auto updated_at trigger)
-- ==============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 5. CORE TABLES
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 5.1 USERS & PROFILES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id VARCHAR(32) UNIQUE NOT NULL,
    admin_id VARCHAR(32) UNIQUE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(30) UNIQUE,
    password_hash TEXT,
    password_salt TEXT,
    role user_role NOT NULL DEFAULT 'astrologer',
    account_status account_status NOT NULL DEFAULT 'approved',
    state VARCHAR(100) DEFAULT 'Maharashtra',
    district VARCHAR(100),
    city VARCHAR(100) DEFAULT 'Pune',
    experience VARCHAR(50) DEFAULT '1 Year',
    specialization TEXT,
    avatar_url TEXT,
    device_token TEXT,
    notification_preferences JSONB DEFAULT '{"email": true, "push": true, "sms": true, "inApp": true}'::jsonb,
    session_version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 5.1.1 ROBUST AUTH.USERS <-> PUBLIC.PROFILES SYNC TRIGGERS
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.profiles (
        auth_user_id,
        profile_id,
        admin_id,
        name,
        email,
        phone,
        role,
        account_status
    ) VALUES (
        NEW.id,
        'DEV-ADM-' || UPPER(SUBSTRING(REPLACE(NEW.id::text, '-', ''), 1, 6)),
        'ADM00001',
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(COALESCE(NEW.email, 'User'), '@', 1)),
        NEW.email,
        COALESCE(NEW.phone, '9763147067'),
        'admin',
        'approved'
    )
    ON CONFLICT (auth_user_id) DO NOTHING;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- ------------------------------------------------------------------------------
-- 5.2 POOJA BOOKINGS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bookings (
    id VARCHAR(32) PRIMARY KEY,
    astrologer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    astrologer_profile_id VARCHAR(32),
    astrologer_name VARCHAR(255) NOT NULL,
    service_id VARCHAR(100) NOT NULL,
    package_name VARCHAR(255) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    astro_fee NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    client_name VARCHAR(255) NOT NULL,
    client_mobile VARCHAR(20) NOT NULL,
    yajmaan_dob DATE,
    pooja_place TEXT,
    city VARCHAR(150),
    date DATE NOT NULL,
    status booking_status NOT NULL DEFAULT 'created',
    payment_reference VARCHAR(255),
    payment_method payment_method DEFAULT 'UPI',
    screenshot_url TEXT,
    notes TEXT,
    submitted_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_bookings_updated_at ON public.bookings;
CREATE TRIGGER trg_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 5.3 SUPPORT TICKETS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id VARCHAR(32) PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    profile_id VARCHAR(32),
    category VARCHAR(100) NOT NULL DEFAULT 'General Queries',
    subject VARCHAR(255) NOT NULL,
    status ticket_status NOT NULL DEFAULT 'Open',
    priority notif_priority NOT NULL DEFAULT 'MEDIUM',
    last_update_text VARCHAR(100) DEFAULT 'Just now',
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_tickets_updated_at ON public.support_tickets;
CREATE TRIGGER trg_tickets_updated_at
BEFORE UPDATE ON public.support_tickets
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 5.4 SUPPORT CHATS TABLE (Live Realtime Enabled)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.support_chats (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    ticket_id VARCHAR(32) NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    sender_role VARCHAR(20) NOT NULL,
    sender_name VARCHAR(255),
    text TEXT,
    attachment_url TEXT,
    category VARCHAR(100) DEFAULT 'General Queries',
    read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5.5 NOTIFICATIONS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
    id VARCHAR(64) PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_email VARCHAR(255),
    user_phone VARCHAR(20),
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    type notif_type NOT NULL DEFAULT 'info',
    priority notif_priority NOT NULL DEFAULT 'MEDIUM',
    related_booking_id VARCHAR(32) REFERENCES public.bookings(id) ON DELETE SET NULL,
    related_profile_id VARCHAR(32),
    read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5.6 PIN RESET REQUESTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pin_reset_requests (
    id VARCHAR(64) PRIMARY KEY,
    profile_id VARCHAR(32) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20) NOT NULL,
    status pin_reset_status NOT NULL DEFAULT 'pending',
    reason TEXT,
    temp_pin TEXT,
    reset_completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_pin_resets_updated_at ON public.pin_reset_requests;
CREATE TRIGGER trg_pin_resets_updated_at
BEFORE UPDATE ON public.pin_reset_requests
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 5.7 AUDIT LOGS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    user_identifier VARCHAR(255) NOT NULL,
    action VARCHAR(255) NOT NULL,
    ip_address VARCHAR(50),
    metadata JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5.8 EMAIL LOGS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.email_logs (
    id VARCHAR(64) PRIMARY KEY,
    recipient VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body_preview TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'Sent',
    error_message TEXT,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5.9 ONE-TIME PASSWORDS (OTP) TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.otps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identity VARCHAR(255) NOT NULL,
    code VARCHAR(10) NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5.10 SYSTEM / APP SETTINGS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.app_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 6. PERFORMANCE INDEXES (Idempotent Creation)
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_auth_user_id ON public.profiles(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(account_status);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_profile_id ON public.profiles(profile_id);

CREATE INDEX IF NOT EXISTS idx_bookings_astrologer_id ON public.bookings(astrologer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON public.bookings(date);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON public.bookings(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON public.support_tickets(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chats_ticket_id ON public.support_chats(ticket_id);
CREATE INDEX IF NOT EXISTS idx_chats_created_at ON public.support_chats(created_at ASC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_email ON public.notifications(user_email);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_otps_identity ON public.otps(identity);

-- ==============================================================================
-- 7. SUPABASE STORAGE BUCKETS SETUP (Idempotent)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES 
    ('booking-receipts', 'booking-receipts', true),
    ('support-attachments', 'support-attachments', true),
    ('profile-avatars', 'profile-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Bucket Policies
DROP POLICY IF EXISTS "Allow Read Access for All" ON storage.objects;
CREATE POLICY "Allow Read Access for All" 
ON storage.objects FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Allow Upload Access for All" ON storage.objects;
CREATE POLICY "Allow Upload Access for All" 
ON storage.objects FOR INSERT 
WITH CHECK (true);

-- ==============================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES (Full Access for Anon, Authenticated, Service)
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pin_reset_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "profiles_insert_all" ON public.profiles;
CREATE POLICY "profiles_insert_all" ON public.profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "profiles_update_all" ON public.profiles;
CREATE POLICY "profiles_update_all" ON public.profiles FOR UPDATE USING (true);

DROP POLICY IF EXISTS "profiles_delete_all" ON public.profiles;
CREATE POLICY "profiles_delete_all" ON public.profiles FOR DELETE USING (true);

-- Bookings Policies
DROP POLICY IF EXISTS "bookings_select_all" ON public.bookings;
CREATE POLICY "bookings_select_all" ON public.bookings FOR SELECT USING (true);

DROP POLICY IF EXISTS "bookings_insert_all" ON public.bookings;
CREATE POLICY "bookings_insert_all" ON public.bookings FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "bookings_update_all" ON public.bookings;
CREATE POLICY "bookings_update_all" ON public.bookings FOR UPDATE USING (true);

-- Support Tickets Policies
DROP POLICY IF EXISTS "tickets_all" ON public.support_tickets;
CREATE POLICY "tickets_all" ON public.support_tickets FOR ALL USING (true) WITH CHECK (true);

-- Support Chats Policies
DROP POLICY IF EXISTS "chats_all" ON public.support_chats;
CREATE POLICY "chats_all" ON public.support_chats FOR ALL USING (true) WITH CHECK (true);

-- Notifications Policies
DROP POLICY IF EXISTS "notifications_all" ON public.notifications;
CREATE POLICY "notifications_all" ON public.notifications FOR ALL USING (true) WITH CHECK (true);

-- Pin Resets Policies
DROP POLICY IF EXISTS "pin_resets_all" ON public.pin_reset_requests;
CREATE POLICY "pin_resets_all" ON public.pin_reset_requests FOR ALL USING (true) WITH CHECK (true);

-- Audit Logs Policies
DROP POLICY IF EXISTS "audit_logs_all" ON public.audit_logs;
CREATE POLICY "audit_logs_all" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);

-- Email Logs Policies
DROP POLICY IF EXISTS "email_logs_all" ON public.email_logs;
CREATE POLICY "email_logs_all" ON public.email_logs FOR ALL USING (true) WITH CHECK (true);

-- OTPs Policies
DROP POLICY IF EXISTS "otps_all" ON public.otps;
CREATE POLICY "otps_all" ON public.otps FOR ALL USING (true) WITH CHECK (true);

-- App Settings Policies
DROP POLICY IF EXISTS "settings_all" ON public.app_settings;
CREATE POLICY "settings_all" ON public.app_settings FOR ALL USING (true) WITH CHECK (true);

-- Grants on Public Schema
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- 8.4 Enable Realtime for key tables (Idempotent)
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.support_chats;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ==============================================================================
-- 9. INITIAL SYSTEM SEED DATA (Idempotent)
-- ==============================================================================

-- 9.1 Default App Settings
INSERT INTO public.app_settings (key, value) VALUES 
('email_settings', '{"enabled": true, "provider": "brevo"}'::jsonb),
('general_settings', '{"appName": "DevSetu Connect", "supportPhone": "+91 97631 47067", "supportEmail": "devsetuconnect@gmail.com"}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 9.2 Seed Admin Account
INSERT INTO public.profiles (
    profile_id,
    admin_id,
    name,
    email,
    phone,
    role,
    account_status,
    state,
    city,
    experience
) VALUES (
    'DEV-ADM-00001',
    'ADM00001',
    'System Administrator',
    'devsetuconnect@gmail.com',
    '9763147067',
    'admin',
    'approved',
    'Maharashtra',
    'Pune',
    'Admin'
) ON CONFLICT (profile_id) DO UPDATE SET
    role = 'admin',
    account_status = 'approved',
    updated_at = NOW();

-- 9.3 Seed Initial Astrologers
INSERT INTO public.profiles (
    profile_id,
    name,
    email,
    phone,
    role,
    account_status,
    state,
    district,
    city,
    experience,
    specialization
) VALUES 
(
    'DEV-AST-000001',
    'Shaunak Mulay',
    'shaunakmulay19@gmail.com',
    '8698378379',
    'astrologer',
    'approved',
    'Maharashtra',
    'Pune',
    'Pune',
    '5 Years',
    'Vedic Pooja & Rituals'
),
(
    'DEV-AST-000002',
    'Verification Astro',
    'verifyastro@gmail.com',
    '9876543210',
    'astrologer',
    'approved',
    'Maharashtra',
    'Pune',
    'Wagholi',
    '3 Years',
    'Mahamrityunjaya Pooja'
) ON CONFLICT (profile_id) DO UPDATE SET
    role = 'astrologer',
    account_status = 'approved',
    updated_at = NOW();
