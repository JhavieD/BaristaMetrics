-- ====================================================================
-- AUDIT TRIGGERS
-- Run this to auto-log all changes to audit_log table
-- ====================================================================

-- Generic audit function
CREATE OR REPLACE FUNCTION public.log_audit()
RETURNS TRIGGER AS $$
DECLARE
  v_operation VARCHAR(10);
  v_old_data JSONB;
  v_new_data JSONB;
  v_user_email VARCHAR(100);
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_operation := 'INSERT';
    v_old_data := NULL;
    v_new_data := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    v_operation := 'UPDATE';
    v_old_data := to_jsonb(OLD);
    v_new_data := to_jsonb(NEW);
  ELSIF TG_OP = 'DELETE' THEN
    v_operation := 'DELETE';
    v_old_data := to_jsonb(OLD);
    v_new_data := NULL;
  END IF;

  v_user_email := COALESCE(
    current_setting('request.jwt.claims', true)::json->>'email',
    'system'
  );

  INSERT INTO public.audit_log (table_name, operation, user_email, old_data, new_data)
  VALUES (TG_TABLE_NAME, v_operation, v_user_email, v_old_data, v_new_data);

  IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS after_inventory_changes ON public.inventory_master;
DROP TRIGGER IF EXISTS after_logs_changes ON public.daily_logs;
DROP TRIGGER IF EXISTS after_transfer_changes ON public.transfers;

-- Attach triggers to tables
CREATE TRIGGER after_inventory_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.inventory_master
  FOR EACH ROW EXECUTE FUNCTION public.log_audit();

CREATE TRIGGER after_logs_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.daily_logs
  FOR EACH ROW EXECUTE FUNCTION public.log_audit();

CREATE TRIGGER after_transfer_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.transfers
  FOR EACH ROW EXECUTE FUNCTION public.log_audit();
