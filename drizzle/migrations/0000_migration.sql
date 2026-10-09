CREATE TABLE public.requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text NOT NULL UNIQUE,
  kind text NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL DEFAULT '',
  product text NOT NULL DEFAULT '',
  quantity text NOT NULL DEFAULT '',
  visit_date date,
  visit_slot text,
  message text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.requests TO service_role;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX requests_slot_unique ON public.requests (visit_date, visit_slot) WHERE visit_slot IS NOT NULL;

CREATE OR REPLACE FUNCTION public.get_booked_slots(_date date)
RETURNS SETOF text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT visit_slot FROM public.requests WHERE visit_date = _date AND visit_slot IS NOT NULL;
$$;

CREATE OR REPLACE FUNCTION public.submit_request(
  _kind text, _name text, _email text, _phone text, _product text, _quantity text,
  _visit_date date, _visit_slot text, _message text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE ref text;
BEGIN
  IF _kind NOT IN ('Enquiry','Booking') THEN RAISE EXCEPTION 'invalid kind'; END IF;
  IF length(trim(_name)) = 0 OR length(_name) > 100 OR _email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' OR length(_email) > 255
     OR length(_phone) > 30 OR length(_product) > 50 OR length(_quantity) > 30 OR length(_message) > 1000 THEN
    RAISE EXCEPTION 'invalid input';
  END IF;
  IF _visit_slot IS NOT NULL THEN
    IF _visit_date IS NULL OR _visit_date <= current_date OR _visit_slot NOT IN ('09:00','11:00','13:00','15:00') THEN
      RAISE EXCEPTION 'invalid slot';
    END IF;
  END IF;
  ref := 'EF-' || upper(substr(md5(gen_random_uuid()::text), 1, 6));
  INSERT INTO public.requests(reference, kind, name, email, phone, product, quantity, visit_date, visit_slot, message)
  VALUES (ref, _kind, trim(_name), trim(_email), _phone, _product, _quantity, _visit_date, _visit_slot, _message);
  RETURN ref;
EXCEPTION WHEN unique_violation THEN
  RAISE EXCEPTION 'slot taken';
END;
$$;
REVOKE ALL ON FUNCTION public.get_booked_slots(date) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.submit_request(text,text,text,text,text,text,date,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_booked_slots(date) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_request(text,text,text,text,text,text,date,text,text) TO anon, authenticated;