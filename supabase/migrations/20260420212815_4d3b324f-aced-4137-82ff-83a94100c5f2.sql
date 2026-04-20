-- 1. Add stock + images array to products
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS stock INTEGER NOT NULL DEFAULT 10,
  ADD COLUMN IF NOT EXISTS images TEXT[] NOT NULL DEFAULT '{}';

-- Backfill images array from existing single image_url so the gallery has something to show
UPDATE public.products
SET images = ARRAY[image_url]
WHERE image_url IS NOT NULL AND (images IS NULL OR array_length(images, 1) IS NULL);

-- 2. Allow admins to view all profiles (for the customer list page)
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- 3. Atomic stock decrement function — safely reduces stock and fails if insufficient
CREATE OR REPLACE FUNCTION public.decrement_stock(_product_id UUID, _quantity INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.products
  SET stock = stock - _quantity
  WHERE id = _product_id AND stock >= _quantity;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient stock for product %', _product_id;
  END IF;
END;
$$;