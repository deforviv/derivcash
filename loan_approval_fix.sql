-- Apply this in Supabase SQL Editor to make loan approval atomic and repair old approved loans.

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

-- Repair already-approved loans whose balance was not reflected on the profile.
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
