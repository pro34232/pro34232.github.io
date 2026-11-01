/*
# Create core application tables and market price cache

## Overview
This migration creates all tables the Eco Fuel application depends on.
The database is currently empty — no prior migrations have been applied.

## New Tables

1. `booking_settings` (id, days, slots, capacity, blocked_dates, updated_at)
   - Single-row table (id=1) storing the owner's booking configuration.
   - `days`: array of weekday numbers (0=Sun..6=Sat) that are open for booking.
   - `slots`: array of hourly slot strings ("HH:00") available each open day.
   - `capacity`: max bookings per slot per day.
   - `blocked_dates`: array of ISO date strings the owner has closed manually.

2. `price_settings` (product, margin, list_price, updated_at)
   - Per-product owner overrides for market-derived prices.
   - `margin`: AED amount added to the benchmark price (replaces hardcoded margins).
   - `list_price`: if non-null, overrides the market price entirely with a fixed price.

3. `requests` (id, reference, kind, name, email, phone, product, quantity,
   visit_date, visit_slot, message, status, created_at)
   - Stores enquiries and bookings submitted by visitors.
   - `reference`: human-readable booking reference (e.g. "EF-AB12CD").
   - `visit_date`/`visit_slot`: required for bookings, null for enquiries.
   - A trigger validates that bookings have both a date and slot.

4. `user_roles` (id, user_id, role)
   - Maps auth.users to app roles (currently "admin" only).
   - Used by the `has_role` RPC for the admin panel access check.

5. `market_cache` (id, snapshot, updated_at)
   - Single-row table (id=1) storing the last successful live market snapshot as JSON.
   - Written by the server whenever Yahoo Finance returns valid data.
   - Read as a fresh fallback when live fetch fails (instead of the daily static JSON).

## Functions

- `has_role(_user_id, _role)` → boolean: checks if a user has a specific role.
- `get_booked_slots(_date)` → text[]: returns slot strings already at capacity for a given date.
- `submit_request(_kind, _name, _email, _phone, _product, _quantity, _visit_date, _visit_slot, _message)` → text:
  Inserts a request with a generated reference; enforces slot capacity for bookings.

## Triggers

- `validate_request_booking` BEFORE INSERT on `requests`:
  Ensures bookings have both visit_date and visit_slot; clears them for enquiries.

## Security (RLS + Grants)

- `booking_settings`: SELECT to anon+authenticated; UPDATE to authenticated+service_role.
- `price_settings`: SELECT to anon+authenticated; UPDATE to authenticated+service_role.
- `requests`: SELECT, UPDATE, DELETE to authenticated; INSERT via `submit_request` RPC (anon+authenticated can call it).
- `user_roles`: SELECT to authenticated (owner checks own role); service_role full.
- `market_cache`: SELECT to anon+authenticated (public read); INSERT/UPDATE to service_role only (written server-side via service role key).
- `has_role`: executable by authenticated.
- `get_booked_slots`: executable by anon+authenticated.
- `submit_request`: executable by anon+authenticated (public booking submission).
- RLS enabled on all tables.
*/

-- booking_settings
CREATE TABLE IF NOT EXISTS public.booking_settings (
  id integer PRIMARY KEY DEFAULT 1,
  days integer[] NOT NULL DEFAULT ARRAY[0,1,2,3,4]::integer[],
  slots text[] NOT NULL DEFAULT ARRAY['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00']::text[],
  capacity integer NOT NULL DEFAULT 2 CHECK (capacity >= 1 AND capacity <= 100),
  blocked_dates text[] NOT NULL DEFAULT ARRAY[]::text[],
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.booking_settings ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.booking_settings TO anon, authenticated;
GRANT UPDATE ON public.booking_settings TO authenticated;
GRANT ALL ON public.booking_settings TO service_role;
DROP POLICY IF EXISTS "select_booking_settings" ON public.booking_settings;
CREATE POLICY "select_booking_settings" ON public.booking_settings
  FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "update_booking_settings" ON public.booking_settings;
CREATE POLICY "update_booking_settings" ON public.booking_settings
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- price_settings
CREATE TABLE IF NOT EXISTS public.price_settings (
  product text PRIMARY KEY,
  margin numeric NOT NULL DEFAULT 0 CHECK (margin >= 0),
  list_price numeric CHECK (list_price IS NULL OR list_price >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.price_settings ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.price_settings TO anon, authenticated;
GRANT UPDATE ON public.price_settings TO authenticated;
GRANT ALL ON public.price_settings TO service_role;
DROP POLICY IF EXISTS "select_price_settings" ON public.price_settings;
CREATE POLICY "select_price_settings" ON public.price_settings
  FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "update_price_settings" ON public.price_settings;
CREATE POLICY "update_price_settings" ON public.price_settings
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- requests
CREATE TABLE IF NOT EXISTS public.requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text NOT NULL UNIQUE,
  kind text NOT NULL CHECK (kind IN ('Enquiry', 'Booking')),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL DEFAULT '',
  product text NOT NULL DEFAULT '',
  quantity text NOT NULL DEFAULT '',
  visit_date date,
  visit_slot text,
  message text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
GRANT SELECT, UPDATE, DELETE ON public.requests TO authenticated;
GRANT ALL ON public.requests TO service_role;
DROP POLICY IF EXISTS "select_requests" ON public.requests;
CREATE POLICY "select_requests" ON public.requests
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "update_requests" ON public.requests;
CREATE POLICY "update_requests" ON public.requests
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "delete_requests" ON public.requests;
CREATE POLICY "delete_requests" ON public.requests
  FOR DELETE TO authenticated USING (true);

-- user_roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('admin')),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
DROP POLICY IF EXISTS "select_user_roles" ON public.user_roles;
CREATE POLICY "select_user_roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- market_cache
CREATE TABLE IF NOT EXISTS public.market_cache (
  id integer PRIMARY KEY DEFAULT 1,
  snapshot jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.market_cache ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.market_cache TO anon, authenticated;
GRANT INSERT, UPDATE ON public.market_cache TO service_role;
DROP POLICY IF EXISTS "select_market_cache" ON public.market_cache;
CREATE POLICY "select_market_cache" ON public.market_cache
  FOR SELECT TO anon, authenticated USING (true);

-- Validate request booking trigger
CREATE OR REPLACE FUNCTION public.validate_request_booking()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.kind = 'Booking' AND (NEW.visit_date IS NULL OR NEW.visit_slot IS NULL) THEN
    RAISE EXCEPTION 'invalid slot: bookings require a date and time';
  END IF;
  IF NEW.kind = 'Enquiry' THEN
    NEW.visit_date := NULL;
    NEW.visit_slot := NULL;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS validate_request_booking ON public.requests;
CREATE TRIGGER validate_request_booking
  BEFORE INSERT ON public.requests
  FOR EACH ROW EXECUTE FUNCTION public.validate_request_booking();

-- has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO authenticated;

-- get_booked_slots function
CREATE OR REPLACE FUNCTION public.get_booked_slots(_date date)
RETURNS text[]
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    array_agg(visit_slot),
    ARRAY[]::text[]
  )
  FROM public.requests
  WHERE kind = 'Booking'
    AND visit_date = _date
    AND visit_slot IS NOT NULL
  GROUP BY visit_slot
  HAVING count(*) >= (SELECT capacity FROM public.booking_settings WHERE id = 1);
$$;
REVOKE EXECUTE ON FUNCTION public.get_booked_slots(date) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_booked_slots(date) TO anon, authenticated;

-- submit_request function
CREATE OR REPLACE FUNCTION public.submit_request(
  _kind text,
  _name text,
  _email text,
  _phone text,
  _product text,
  _quantity text,
  _visit_date date,
  _visit_slot text,
  _message text
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _reference text;
  _capacity integer;
  _booked_count integer;
BEGIN
  SELECT capacity INTO _capacity FROM public.booking_settings WHERE id = 1;
  IF _capacity IS NULL THEN
    RAISE EXCEPTION 'booking settings not configured';
  END IF;

  _reference := 'EF-' || upper(substr(encode(gen_random_bytes(3), 'hex'), 1, 6));

  IF _kind = 'Booking' AND _visit_slot IS NOT NULL AND _visit_date IS NOT NULL THEN
    SELECT count(*) INTO _booked_count
    FROM public.requests
    WHERE kind = 'Booking'
      AND visit_date = _visit_date
      AND visit_slot = _visit_slot;
    IF _booked_count >= _capacity THEN
      RAISE EXCEPTION 'slot full';
    END IF;
  END IF;

  INSERT INTO public.requests (reference, kind, name, email, phone, product, quantity, visit_date, visit_slot, message)
  VALUES (_reference, _kind, _name, _email, _phone, _product, _quantity, _visit_date, _visit_slot, _message);

  RETURN _reference;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.submit_request(text, text, text, text, text, text, date, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_request(text, text, text, text, text, text, date, text, text) TO anon, authenticated;

-- Seed initial data
INSERT INTO public.booking_settings (id) VALUES (1)
  ON CONFLICT (id) DO NOTHING;

INSERT INTO public.price_settings (product, margin, list_price) VALUES
  ('diesel', 0.90, NULL),
  ('kerosene', 0.75, NULL),
  ('lpg', 0.45, NULL),
  ('syngas', 0.50, NULL),
  ('oxygen', 0.00, 1.60),
  ('nitrogen', 0.00, 1.20)
ON CONFLICT (product) DO NOTHING;