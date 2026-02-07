-- Migration: Add order tracking timestamps
-- Run this in your Supabase SQL Editor

-- Add timestamp columns for order lifecycle tracking
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS returned_at TIMESTAMPTZ;

-- Create index on status for faster filtering
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Create index on created_at for faster date-based queries
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Optional: Add comments for documentation
COMMENT ON COLUMN orders.confirmed_at IS 'Timestamp when admin confirmed/processed the order';
COMMENT ON COLUMN orders.shipped_at IS 'Timestamp when order was marked as shipped';
COMMENT ON COLUMN orders.delivered_at IS 'Timestamp when order was delivered';
COMMENT ON COLUMN orders.cancelled_at IS 'Timestamp when order was cancelled';
COMMENT ON COLUMN orders.returned_at IS 'Timestamp when order was returned';

-- Verify the changes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'orders'
AND column_name IN ('confirmed_at', 'shipped_at', 'delivered_at', 'cancelled_at', 'returned_at');
