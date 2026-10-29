ALTER TABLE public.requests ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'new';
ALTER TABLE public.requests ADD CONSTRAINT requests_status_check CHECK (status IN ('new','confirmed','done','cancelled'));
GRANT SELECT, UPDATE, DELETE ON public.requests TO authenticated;
GRANT ALL ON public.requests TO service_role;
CREATE POLICY "admin update requests" ON public.requests FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin delete requests" ON public.requests FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

ALTER TABLE public.booking_settings ADD COLUMN IF NOT EXISTS blocked_dates date[] NOT NULL DEFAULT '{}';

CREATE TABLE public.price_settings (
  product text PRIMARY KEY,
  margin numeric NOT NULL DEFAULT 0 CHECK (margin >= -100 AND margin <= 1000),
  list_price numeric CHECK (list_price IS NULL OR (list_price >= 0 AND list_price <= 100000)),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.price_settings TO anon, authenticated;
GRANT UPDATE ON public.price_settings TO authenticated;
GRANT ALL ON public.price_settings TO service_role;
ALTER TABLE public.price_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read prices" ON public.price_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin update prices" ON public.price_settings FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
INSERT INTO public.price_settings(product, margin, list_price) VALUES
  ('diesel', 0.90, NULL), ('kerosene', 0.75, NULL), ('lpg', 0.45, NULL), ('syngas', 0.50, NULL),
  ('oxygen', 0, 1.60), ('nitrogen', 0, 1.20);

CREATE OR REPLACE FUNCTION public.get_booked_slots(_date date)
RETURNS SETOF text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT r.visit_slot FROM public.requests r, public.booking_settings s
  WHERE r.visit_date = _date AND r.visit_slot IS NOT NULL AND r.status <> 'cancelled'
  GROUP BY r.visit_slot, s.capacity HAVING count(*) >= s.capacity;
$$;

CREATE OR REPLACE FUNCTION public.submit_request(
  _kind text, _name text, _email text, _phone text, _product text, _quantity text,
  _visit_date date, _visit_slot text, _message text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE ref text; st public.booking_settings; used int;
BEGIN
  IF _kind NOT IN ('Enquiry','Booking') THEN RAISE EXCEPTION 'invalid kind'; END IF;
  IF length(trim(_name)) = 0 OR length(_name) > 100 OR _email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' OR length(_email) > 255
     OR length(_phone) > 30 OR length(_product) > 50 OR length(_quantity) > 30 OR length(_message) > 1000 THEN
    RAISE EXCEPTION 'invalid input';
  END IF;
  IF _visit_slot IS NOT NULL THEN
    SELECT * INTO st FROM public.booking_settings WHERE id = 1 FOR UPDATE;
    IF _visit_date IS NULL OR _visit_date <= current_date
       OR NOT (extract(dow FROM _visit_date)::int = ANY(st.days))
       OR _visit_date = ANY(st.blocked_dates)
       OR NOT (_visit_slot = ANY(st.slots)) THEN
      RAISE EXCEPTION 'invalid slot';
    END IF;
    SELECT count(*) INTO used FROM public.requests
      WHERE visit_date = _visit_date AND visit_slot = _visit_slot AND status <> 'cancelled';
    IF used >= st.capacity THEN RAISE EXCEPTION 'slot taken'; END IF;
  END IF;
  ref := 'EF-' || upper(substr(md5(gen_random_uuid()::text), 1, 6));
  INSERT INTO public.requests(reference, kind, name, email, phone, product, quantity, visit_date, visit_slot, message)
  VALUES (ref, _kind, trim(_name), trim(_email), _phone, _product, _quantity, _visit_date, _visit_slot, _message);
  RETURN ref;
END $$;