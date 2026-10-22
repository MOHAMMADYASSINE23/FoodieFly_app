-- Run after setup.sql, schema.sql, orders.sql, and security-hardening.sql.
\set ON_ERROR_STOP on

-- A signup must ignore a user-supplied delivery role.
INSERT INTO auth.users (id, raw_user_meta_data)
VALUES (
  '11111111-1111-4111-8111-111111111111',
  '{"full_name":"Test Customer","role":"delivery"}'::jsonb
);
INSERT INTO auth.users (id, raw_user_meta_data)
VALUES (
  '22222222-2222-4222-8222-222222222222',
  '{"full_name":"Test Driver","role":"delivery"}'::jsonb
);

DO $$
BEGIN
  IF (SELECT role::text FROM public.profiles WHERE id = '11111111-1111-4111-8111-111111111111') <> 'customer' THEN
    RAISE EXCEPTION 'Signup metadata granted an elevated role';
  END IF;
END;
$$;

-- Only the trusted database owner/admin can promote a verified driver.
UPDATE public.profiles
SET role = 'delivery'
WHERE id = '22222222-2222-4222-8222-222222222222';

-- An authenticated customer cannot promote their own profile.
SET request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';
SET ROLE authenticated;
DO $$
BEGIN
  BEGIN
    UPDATE public.profiles SET role = 'delivery' WHERE id = auth.uid();
  EXCEPTION WHEN insufficient_privilege OR raise_exception THEN
    RETURN;
  END;
  RAISE EXCEPTION 'A customer was able to change their own role';
END;
$$;

-- The browser-provided order total is ignored; totals are recomputed from line items.
INSERT INTO public.orders (
  customer_id, store, category, delivery_address, phone, total
)
VALUES (
  auth.uid(), 'Test Store', 'Restaurants', '1 Test Street', '555-0100', 999
)
RETURNING id \gset

SET app.test_order_id = :'id';

INSERT INTO public.order_items (order_id, product_name, unit_price, quantity)
VALUES (:'id', 'Test meal', 10, 2);

SELECT (total = 20.00) AS total_ok
FROM public.orders
WHERE id = :'id'
\gset

\if :total_ok
  \echo 'PASS: order total is calculated from line items'
\else
  \quit 1
\endif

RESET ROLE;

-- A delivery driver cannot skip the workflow and mark a pending order delivered.
SET request.jwt.claim.sub = '22222222-2222-4222-8222-222222222222';
SET ROLE authenticated;
DO $$
BEGIN
  BEGIN
    UPDATE public.orders
    SET status = 'delivered', driver_id = auth.uid()
    WHERE id = current_setting('app.test_order_id')::uuid;
  EXCEPTION WHEN raise_exception THEN
    RETURN;
  END;
  RAISE EXCEPTION 'A driver was able to skip delivery status transitions';
END;
$$;

-- Valid transitions must still work.
UPDATE public.orders
SET status = 'accepted', driver_id = auth.uid()
WHERE id = current_setting('app.test_order_id')::uuid;

UPDATE public.orders
SET status = 'picked_up'
WHERE id = current_setting('app.test_order_id')::uuid;

UPDATE public.orders
SET status = 'on_the_way'
WHERE id = current_setting('app.test_order_id')::uuid;

UPDATE public.orders
SET status = 'delivered'
WHERE id = current_setting('app.test_order_id')::uuid;

DO $$
BEGIN
  IF (SELECT status FROM public.orders WHERE id = current_setting('app.test_order_id')::uuid) <> 'delivered' THEN
    RAISE EXCEPTION 'Valid delivery status transitions did not complete';
  END IF;
END;
$$;

RESET ROLE;
RESET request.jwt.claim.sub;
\echo 'PASS: role protection, order totals, and delivery transitions'
