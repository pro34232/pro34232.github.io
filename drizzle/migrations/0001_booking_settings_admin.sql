CREATE TYPE public.app_role AS ENUM ('admin');
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- The owner's address becomes admin on sign-up.
CREATE OR REPLACE FUNCTION public.grant_owner_admin()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF lower(NEW.email) = 'abeljomy2012@gmail.com' THEN
    INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created_admin AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.grant_owner_admin();

CREATE TABLE public.booking_settings (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  days int[] NOT NULL DEFAULT '{1,2,3,4,5,6}',
  slots text[] NOT NULL DEFAULT '{08:00,09:00,10:00,11:00,12:00,13:00,14:00,15:00,16:00,17:00}',
  capacity int NOT NULL DEFAULT 1 CHECK (capacity BETWEEN 1 AND 100),
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.booking_settings (id) VALUES (1);
GRANT SELECT ON public.booking_settings TO anon, authenticated;
GRANT UPDATE ON public.booking_settings TO authenticated;
GRANT ALL ON public.booking_settings TO service_role;
ALTER TABLE public.booking_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read settings" ON public.booking_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin update settings" ON public.booking_settings FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

GRANT SELECT ON public.requests TO authenticated;
CREATE POLICY "admin read requests" ON public.requests FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP INDEX IF EXISTS public.requests_slot_unique;

-- Returns slots that are full for a date.
CREATE OR REPLACE FUNCTION public.get_booked_slots(_date date)
RETURNS SETOF text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT r.visit_slot FROM public.requests r, public.booking_settings s
  WHERE r.visit_date = _date AND r.visit_slot IS NOT NULL
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
       OR NOT (_visit_slot = ANY(st.slots)) THEN
      RAISE EXCEPTION 'invalid slot';
    END IF;
    SELECT count(*) INTO used FROM public.requests WHERE visit_date = _visit_date AND visit_slot = _visit_slot;
    IF used >= st.capacity THEN RAISE EXCEPTION 'slot taken'; END IF;
  END IF;
  ref := 'EF-' || upper(substr(md5(gen_random_uuid()::text), 1, 6));
  INSERT INTO public.requests(reference, kind, name, email, phone, product, quantity, visit_date, visit_slot, message)
  VALUES (ref, _kind, trim(_name), trim(_email), _phone, _product, _quantity, _visit_date, _visit_slot, _message);
  RETURN ref;
END $$;