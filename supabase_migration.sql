-- Run this script in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- This creates the profiles table with all required fields and constraints

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL UNIQUE,
  country TEXT NOT NULL,
  city TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security (industry best practice)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (registration from the site)
CREATE POLICY "Allow anonymous insert"
  ON public.profiles
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anonymous reads for duplicate checking only
CREATE POLICY "Allow anonymous select for duplicate check"
  ON public.profiles
  FOR SELECT
  TO anon
  USING (true);

-- Index on email and phone for fast duplicate lookups
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);
CREATE INDEX IF NOT EXISTS profiles_phone_idx ON public.profiles(phone);
