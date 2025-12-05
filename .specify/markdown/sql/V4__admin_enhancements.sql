-- V4 Migration: Admin Console Enhancements
-- This migration adds fields and indexes to support admin console features

SET NAMES utf8mb4;

-- =====================================================
-- 1. Product Table Enhancements
-- =====================================================

DROP PROCEDURE IF EXISTS add_product_columns;

DELIMITER //
CREATE PROCEDURE add_product_columns()
BEGIN
    -- Add member_price column
    IF NOT EXISTS (
        SELECT * FROM information_schema.columns
        WHERE table_schema = DATABASE()
        AND table_name = 't_product'
        AND column_name = 'member_price'
    ) THEN
        ALTER TABLE t_product ADD COLUMN member_price DECIMAL(10,2) DEFAULT NULL COMMENT '会员价' AFTER price;
    END IF;

    -- Add tags column
    IF NOT EXISTS (
        SELECT * FROM information_schema.columns
        WHERE table_schema = DATABASE()
        AND table_name = 't_product'
        AND column_name = 'tags'
    ) THEN
        ALTER TABLE t_product ADD COLUMN tags VARCHAR(255) DEFAULT NULL COMMENT '商品标签（JSON数组）' AFTER image_url;
    END IF;

    -- Add sort column
    IF NOT EXISTS (
        SELECT * FROM information_schema.columns
        WHERE table_schema = DATABASE()
        AND table_name = 't_product'
        AND column_name = 'sort'
    ) THEN
        ALTER TABLE t_product ADD COLUMN sort INT NOT NULL DEFAULT 0 COMMENT '排序值：越小越靠前' AFTER tags;
    END IF;

    -- Add version column for optimistic locking
    IF NOT EXISTS (
        SELECT * FROM information_schema.columns
        WHERE table_schema = DATABASE()
        AND table_name = 't_product'
        AND column_name = 'version'
    ) THEN
        ALTER TABLE t_product ADD COLUMN version INT NOT NULL DEFAULT 1 COMMENT '乐观锁版本号' AFTER sort;
    END IF;
END //
DELIMITER ;

CALL add_product_columns();
DROP PROCEDURE IF EXISTS add_product_columns;

-- =====================================================
-- 2. Category Table Enhancements
-- =====================================================

DROP PROCEDURE IF EXISTS add_category_columns;

DELIMITER //
CREATE PROCEDURE add_category_columns()
BEGIN
    -- Add version column for optimistic locking
    IF NOT EXISTS (
        SELECT * FROM information_schema.columns
        WHERE table_schema = DATABASE()
        AND table_name = 't_category'
        AND column_name = 'version'
    ) THEN
        ALTER TABLE t_category ADD COLUMN version INT NOT NULL DEFAULT 1 COMMENT '乐观锁版本号' AFTER status;
    END IF;
END //
DELIMITER ;

CALL add_category_columns();
DROP PROCEDURE IF EXISTS add_category_columns;

-- =====================================================
-- 3. Operation Log Table Enhancements
-- =====================================================

DROP PROCEDURE IF EXISTS add_operation_log_columns;

DELIMITER //
CREATE PROCEDURE add_operation_log_columns()
BEGIN
    -- Add before_value column
    IF NOT EXISTS (
        SELECT * FROM information_schema.columns
        WHERE table_schema = DATABASE()
        AND table_name = 't_operation_log'
        AND column_name = 'before_value'
    ) THEN
        ALTER TABLE t_operation_log ADD COLUMN before_value TEXT DEFAULT NULL COMMENT '变更前值（JSON）' AFTER description;
    END IF;

    -- Add after_value column
    IF NOT EXISTS (
        SELECT * FROM information_schema.columns
        WHERE table_schema = DATABASE()
        AND table_name = 't_operation_log'
        AND column_name = 'after_value'
    ) THEN
        ALTER TABLE t_operation_log ADD COLUMN after_value TEXT DEFAULT NULL COMMENT '变更后值（JSON）' AFTER before_value;
    END IF;

    -- Add correlation_id column
    IF NOT EXISTS (
        SELECT * FROM information_schema.columns
        WHERE table_schema = DATABASE()
        AND table_name = 't_operation_log'
        AND column_name = 'correlation_id'
    ) THEN
        ALTER TABLE t_operation_log ADD COLUMN correlation_id VARCHAR(50) DEFAULT NULL COMMENT '请求追踪ID' AFTER after_value;
    END IF;
END //
DELIMITER ;

CALL add_operation_log_columns();
DROP PROCEDURE IF EXISTS add_operation_log_columns;

-- =====================================================
-- 4. Add Indexes
-- =====================================================

DROP PROCEDURE IF EXISTS add_admin_indexes;

DELIMITER //
CREATE PROCEDURE add_admin_indexes()
BEGIN
    -- Index for operation log time range queries
    IF NOT EXISTS (
        SELECT * FROM information_schema.statistics
        WHERE table_schema = DATABASE()
        AND table_name = 't_operation_log'
        AND index_name = 'idx_operation_log_time'
    ) THEN
        CREATE INDEX idx_operation_log_time ON t_operation_log(create_time);
    END IF;

    -- Index for operation log target queries
    IF NOT EXISTS (
        SELECT * FROM information_schema.statistics
        WHERE table_schema = DATABASE()
        AND table_name = 't_operation_log'
        AND index_name = 'idx_operation_log_target'
    ) THEN
        CREATE INDEX idx_operation_log_target ON t_operation_log(target_type, target_id);
    END IF;

    -- Index for product sorting
    IF NOT EXISTS (
        SELECT * FROM information_schema.statistics
        WHERE table_schema = DATABASE()
        AND table_name = 't_product'
        AND index_name = 'idx_product_sort'
    ) THEN
        CREATE INDEX idx_product_sort ON t_product(sort, id);
    END IF;

    -- Index for category sorting
    IF NOT EXISTS (
        SELECT * FROM information_schema.statistics
        WHERE table_schema = DATABASE()
        AND table_name = 't_category'
        AND index_name = 'idx_category_sort'
    ) THEN
        CREATE INDEX idx_category_sort ON t_category(sort, id);
    END IF;
END //
DELIMITER ;

CALL add_admin_indexes();
DROP PROCEDURE IF EXISTS add_admin_indexes;

-- =====================================================
-- 5. Insert Default System Configs
-- =====================================================

INSERT INTO t_sys_config (config_key, config_value, description, create_time, update_time, deleted)
SELECT 'business_hours', '{"start": "08:00", "end": "22:00"}', '营业时间', NOW(), NOW(), 0
WHERE NOT EXISTS (SELECT 1 FROM t_sys_config WHERE config_key = 'business_hours' AND deleted = 0);

INSERT INTO t_sys_config (config_key, config_value, description, create_time, update_time, deleted)
SELECT 'pickup_deadline', '21:00', '当日取餐截止时间', NOW(), NOW(), 0
WHERE NOT EXISTS (SELECT 1 FROM t_sys_config WHERE config_key = 'pickup_deadline' AND deleted = 0);

INSERT INTO t_sys_config (config_key, config_value, description, create_time, update_time, deleted)
SELECT 'pickup_tips', '请凭取餐码到门店取餐，超时未取将自动取消订单', '取餐提示语', NOW(), NOW(), 0
WHERE NOT EXISTS (SELECT 1 FROM t_sys_config WHERE config_key = 'pickup_tips' AND deleted = 0);

INSERT INTO t_sys_config (config_key, config_value, description, create_time, update_time, deleted)
SELECT 'delivery_enabled', 'true', '是否开启配送', NOW(), NOW(), 0
WHERE NOT EXISTS (SELECT 1 FROM t_sys_config WHERE config_key = 'delivery_enabled' AND deleted = 0);

INSERT INTO t_sys_config (config_key, config_value, description, create_time, update_time, deleted)
SELECT 'delivery_fee', '5.00', '配送费', NOW(), NOW(), 0
WHERE NOT EXISTS (SELECT 1 FROM t_sys_config WHERE config_key = 'delivery_fee' AND deleted = 0);

-- =====================================================
-- Migration complete
-- =====================================================
