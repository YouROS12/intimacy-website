-- Create a secure function to handle order creation
-- This runs with SECURITY DEFINER to bypass RLS on the orders table
-- Updated: Inserts into 'items' JSONB column directly (Orders table is denormalized)

CREATE OR REPLACE FUNCTION create_order(
    p_user_id UUID,
    p_items JSONB,
    p_total NUMERIC,
    p_shipping_info JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_order_id UUID;
BEGIN
    -- 1. Create the Order with all data (including items JSON)
    INSERT INTO orders (
        user_id,
        total,
        status,
        shipping_info,
        items,
        created_at
    ) VALUES (
        p_user_id, -- Can be NULL for guest checkout
        p_total,
        'pending',
        p_shipping_info,
        p_items,
        NOW()
    )
    RETURNING id INTO new_order_id;

    RETURN new_order_id;
END;
$$;

-- Grant execute permission to everyone (including anon/guests)
GRANT EXECUTE ON FUNCTION create_order TO anon, authenticated, service_role;
