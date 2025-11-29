-- V2 Migration: Cart, Order, and Points Enhancements for Feature 003
-- This migration adds enhancements to support the member cart, checkout, and order flow
-- as defined in specs/003-cart-checkout-orders/data-model.md

SET NAMES utf8mb4;

-- =====================================================
-- 1. Cart Item Table Enhancements
-- =====================================================

-- Add price_snapshot column for quick display (not used for settlement)
-- Using a procedure to safely add column if not exists
DROP PROCEDURE IF EXISTS add_column_if_not_exists;

DELIMITER //
CREATE PROCEDURE add_column_if_not_exists()
BEGIN
    -- Add price_snapshot to t_cart_item if not exists
    IF NOT EXISTS (
        SELECT * FROM information_schema.columns
        WHERE table_schema = DATABASE()
        AND table_name = 't_cart_item'
        AND column_name = 'price_snapshot'
    ) THEN
        ALTER TABLE t_cart_item ADD COLUMN price_snapshot DECIMAL(10,2) DEFAULT NULL COMMENT 'Price snapshot for display, not for settlement';
    END IF;

    -- Add delivery_address_id to t_order if not exists
    IF NOT EXISTS (
        SELECT * FROM information_schema.columns
        WHERE table_schema = DATABASE()
        AND table_name = 't_order'
        AND column_name = 'delivery_address_id'
    ) THEN
        ALTER TABLE t_order ADD COLUMN delivery_address_id BIGINT DEFAULT NULL COMMENT 'Delivery address ID for delivery orders' AFTER pickup_address;
    END IF;

    -- Add delivery_snapshot to t_order if not exists
    IF NOT EXISTS (
        SELECT * FROM information_schema.columns
        WHERE table_schema = DATABASE()
        AND table_name = 't_order'
        AND column_name = 'delivery_snapshot'
    ) THEN
        ALTER TABLE t_order ADD COLUMN delivery_snapshot JSON DEFAULT NULL COMMENT 'Delivery address snapshot as JSON';
    END IF;

    -- Add product_image to t_order_item if not exists
    IF NOT EXISTS (
        SELECT * FROM information_schema.columns
        WHERE table_schema = DATABASE()
        AND table_name = 't_order_item'
        AND column_name = 'product_image'
    ) THEN
        ALTER TABLE t_order_item ADD COLUMN product_image VARCHAR(255) DEFAULT NULL COMMENT 'Product image URL snapshot' AFTER product_name;
    END IF;
END //
DELIMITER ;

-- Execute the procedure
CALL add_column_if_not_exists();

-- Clean up the procedure
DROP PROCEDURE IF EXISTS add_column_if_not_exists;

-- =====================================================
-- 2. Add Indexes (using procedure for safety)
-- =====================================================

DROP PROCEDURE IF EXISTS add_index_if_not_exists;

DELIMITER //
CREATE PROCEDURE add_index_if_not_exists()
BEGIN
    -- Add composite index for user order list queries
    IF NOT EXISTS (
        SELECT * FROM information_schema.statistics
        WHERE table_schema = DATABASE()
        AND table_name = 't_order'
        AND index_name = 'idx_order_user_status_time'
    ) THEN
        CREATE INDEX idx_order_user_status_time ON t_order(user_id, order_status, create_time DESC);
    END IF;

    -- Add index for user coupon order lookup
    IF NOT EXISTS (
        SELECT * FROM information_schema.statistics
        WHERE table_schema = DATABASE()
        AND table_name = 't_user_coupon'
        AND index_name = 'idx_user_coupon_order'
    ) THEN
        CREATE INDEX idx_user_coupon_order ON t_user_coupon(order_id);
    END IF;
END //
DELIMITER ;

-- Execute the procedure
CALL add_index_if_not_exists();

-- Clean up the procedure
DROP PROCEDURE IF EXISTS add_index_if_not_exists;

-- =====================================================
-- Migration complete
-- =====================================================
