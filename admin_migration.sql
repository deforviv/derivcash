-- Run this script in Supabase SQL Editor after the existing migrations.
-- It adds administrator support, wallet balances, bans, notifications, and transactions.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  ADD COLUMN IF NOT EXISTS wallet_balance NUMERIC NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_banned BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS banned_at TIMESTAMPTZ;

ALTER TABLE public.loan_applications
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  sent_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  label TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable select for anon notifications" ON public.notifications;
DROP POLICY IF EXISTS "Enable insert for anon notifications" ON public.notifications;
CREATE POLICY "Enable select for anon notifications" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "Enable insert for anon notifications" ON public.notifications FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable select for anon transactions" ON public.transactions;
DROP POLICY IF EXISTS "Enable insert for anon transactions" ON public.transactions;
CREATE POLICY "Enable select for anon transactions" ON public.transactions FOR SELECT USING (true);
CREATE POLICY "Enable insert for anon transactions" ON public.transactions FOR INSERT WITH CHECK (true);

CREATE INDEX IF NOT EXISTS notifications_profile_id_idx ON public.notifications(profile_id);
CREATE INDEX IF NOT EXISTS transactions_profile_id_idx ON public.transactions(profile_id);
CREATE INDEX IF NOT EXISTS loan_applications_status_idx ON public.loan_applications(status);

INSERT INTO public.profiles (
  first_name,
  last_name,
  gender,
  email,
  phone,
  country,
  city,
  password_hash,
  role,
  wallet_balance,
  is_banned
) VALUES (
  'Admin',
  'Derivcash',
  'male',
  'admin@derivcash.com',
  '+22900000000',
  'Benin',
  'Cotonou',
  'RGVyaXZjYXNoQWRtaW4yMDI2IQ==',
  'admin',
  0,
  false
)
ON CONFLICT (email) DO UPDATE SET
  role = 'admin',
  password_hash = EXCLUDED.password_hash,
  is_banned = false,
  banned_at = null;

CREATE OR REPLACE FUNCTION public.approve_loan_application(
  p_loan_id UUID,
  p_admin_id UUID DEFAULT NULL
)
RETURNS TABLE (
  loan_id UUID,
  profile_id UUID,
  credited_amount NUMERIC,
  wallet_balance NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_loan loan_applications%ROWTYPE;
  v_wallet_balance NUMERIC;
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = p_admin_id
      AND role = 'admin'
      AND COALESCE(is_banned, false) = false
  ) THEN
    RAISE EXCEPTION 'Only an active administrator can approve a loan';
  END IF;

  SELECT *
  INTO v_loan
  FROM public.loan_applications
  WHERE id = p_loan_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Loan application % not found', p_loan_id;
  END IF;

  IF v_loan.status IN ('approved', 'active') THEN
    SELECT COALESCE(p.wallet_balance, 0)
    INTO v_wallet_balance
    FROM public.profiles p
    WHERE p.id = v_loan.profile_id;

    RETURN QUERY SELECT v_loan.id, v_loan.profile_id, 0::NUMERIC, COALESCE(v_wallet_balance, 0);
    RETURN;
  END IF;

  IF v_loan.status <> 'pending' THEN
    RAISE EXCEPTION 'Loan application % is not pending', p_loan_id;
  END IF;

  UPDATE public.profiles p
  SET wallet_balance = COALESCE(p.wallet_balance, 0) + COALESCE(v_loan.amount, 0)
  WHERE p.id = v_loan.profile_id
  RETURNING p.wallet_balance INTO v_wallet_balance;

  IF v_wallet_balance IS NULL THEN
    RAISE EXCEPTION 'Profile % not found for loan %', v_loan.profile_id, p_loan_id;
  END IF;

  UPDATE public.loan_applications
  SET status = 'approved',
      reviewed_at = NOW(),
      reviewed_by = p_admin_id
  WHERE id = p_loan_id;

  INSERT INTO public.transactions (profile_id, type, amount, label)
  VALUES (v_loan.profile_id, 'loan_disbursement', v_loan.amount, 'Versement de pret approuve');

  RETURN QUERY SELECT v_loan.id, v_loan.profile_id, v_loan.amount, v_wallet_balance;
END;
$$;

GRANT EXECUTE ON FUNCTION public.approve_loan_application(UUID, UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.approve_loan_application(UUID, UUID) TO authenticated;

-- Repair legacy approved loans that were validated before wallet crediting was made atomic.
WITH approved_totals AS (
  SELECT profile_id, COALESCE(SUM(amount), 0) AS approved_amount
  FROM public.loan_applications
  WHERE status IN ('approved', 'active')
  GROUP BY profile_id
)
UPDATE public.profiles p
SET wallet_balance = GREATEST(COALESCE(p.wallet_balance, 0), approved_totals.approved_amount)
FROM approved_totals
WHERE p.id = approved_totals.profile_id;
