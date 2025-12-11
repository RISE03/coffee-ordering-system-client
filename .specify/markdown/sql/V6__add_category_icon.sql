-- V6 Migration: Add Icon to Category
-- 为商品分类表添加图标字段，支持前端展示分类图标（这对C端用户体验至关重要）

SET NAMES utf8mb4;

DROP PROCEDURE IF EXISTS add_category_icon;

DELIMITER //
CREATE PROCEDURE add_category_icon()
BEGIN
    -- Add icon column
    IF NOT EXISTS (
        SELECT * FROM information_schema.columns
        WHERE table_schema = DATABASE()
        AND table_name = 't_category'
        AND column_name = 'icon'
    ) THEN
        ALTER TABLE t_category ADD COLUMN icon VARCHAR(255) DEFAULT NULL COMMENT '分类图标URL' AFTER name;
    END IF;
END //
DELIMITER ;

CALL add_category_icon();
DROP PROCEDURE IF EXISTS add_category_icon;
