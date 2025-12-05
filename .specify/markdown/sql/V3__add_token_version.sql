-- V3__add_token_version.sql
-- 添加 token_version 字段，用于 JWT Token 版本控制
-- 当用户禁用、重置密码、强制登出时，递增此版本号使旧 Token 失效

ALTER TABLE t_user
ADD COLUMN token_version INT NOT NULL DEFAULT 1 COMMENT 'Token 版本号，用于强制失效旧 Token';

-- 添加索引便于查询（可选，视业务量决定）
-- CREATE INDEX idx_user_token_version ON t_user(id, token_version);
