-- 建议：先创建数据库（如已存在可跳过）
CREATE DATABASE IF NOT EXISTS cafe_order
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;
USE cafe_order;

SET NAMES utf8mb4;

-- 通用约定：
-- 时间字段：DATETIME
-- 金额字段：DECIMAL(10,2)
-- 逻辑删除：deleted 0=正常 1=已删除

/* =========================
   1. 用户与权限相关表
   ========================= */

DROP TABLE IF EXISTS t_user;
CREATE TABLE t_user (
  id               BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
  username         VARCHAR(50)  NOT NULL COMMENT '登录账号，唯一',
  password_hash    VARCHAR(255) NOT NULL COMMENT '密码摘要（BCrypt）',
  nickname         VARCHAR(50)           DEFAULT NULL COMMENT '昵称',
  mobile           VARCHAR(20)           DEFAULT NULL COMMENT '手机号',
  avatar           VARCHAR(255)          DEFAULT NULL COMMENT '头像URL',
  role             VARCHAR(20)  NOT NULL COMMENT '角色：member/staff/admin',
  status           TINYINT      NOT NULL DEFAULT 1 COMMENT '账号状态：0禁用 1启用',
  level            INT          NOT NULL DEFAULT 1 COMMENT '会员等级：1晨曦 2烈阳 3晚霞 4繁星等',
  last_login_time  DATETIME              DEFAULT NULL COMMENT '最近登录时间',
  create_time      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_time      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  create_by        VARCHAR(50)           DEFAULT NULL COMMENT '创建人',
  update_by        VARCHAR(50)           DEFAULT NULL COMMENT '修改人',
  deleted          TINYINT      NOT NULL DEFAULT 0 COMMENT '逻辑删除：0正常 1删除',
  PRIMARY KEY (id),
  UNIQUE KEY uk_user_username (username),
  KEY idx_user_mobile (mobile),
  KEY idx_user_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

DROP TABLE IF EXISTS t_user_address;
CREATE TABLE t_user_address (
  id             BIGINT      NOT NULL AUTO_INCREMENT COMMENT '主键',
  user_id        BIGINT      NOT NULL COMMENT '用户ID',
  receiver_name  VARCHAR(50) NOT NULL COMMENT '收货人姓名',
  receiver_phone VARCHAR(20) NOT NULL COMMENT '收货人手机号',
  province       VARCHAR(50)          DEFAULT NULL COMMENT '省',
  city           VARCHAR(50)          DEFAULT NULL COMMENT '市',
  district       VARCHAR(50)          DEFAULT NULL COMMENT '区/县',
  detail_address VARCHAR(255) NOT NULL COMMENT '详细地址',
  is_default     TINYINT     NOT NULL DEFAULT 0 COMMENT '是否默认地址：0否 1是',
  create_time    DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_time    DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  create_by      VARCHAR(50)          DEFAULT NULL COMMENT '创建人',
  update_by      VARCHAR(50)          DEFAULT NULL COMMENT '修改人',
  deleted        TINYINT     NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  PRIMARY KEY (id),
  KEY idx_user_address_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户收货地址表';

/* =========================
   2. 商品与分类相关表
   ========================= */

DROP TABLE IF EXISTS t_category;
CREATE TABLE t_category (
  id          BIGINT      NOT NULL AUTO_INCREMENT COMMENT '主键',
  name        VARCHAR(50) NOT NULL COMMENT '分类名称',
  sort        INT         NOT NULL DEFAULT 0 COMMENT '排序值：越小越靠前',
  status      TINYINT     NOT NULL DEFAULT 1 COMMENT '状态：0禁用 1启用',
  create_time DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_time DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  create_by   VARCHAR(50)          DEFAULT NULL COMMENT '创建人',
  update_by   VARCHAR(50)          DEFAULT NULL COMMENT '修改人',
  deleted     TINYINT     NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品分类表';

DROP TABLE IF EXISTS t_product;
CREATE TABLE t_product (
  id          BIGINT        NOT NULL AUTO_INCREMENT COMMENT '主键',
  category_id BIGINT        NOT NULL COMMENT '分类ID',
  name        VARCHAR(100)  NOT NULL COMMENT '商品名称',
  price       DECIMAL(10,2) NOT NULL COMMENT '单价',
  description VARCHAR(500)           DEFAULT NULL COMMENT '商品简介',
  image_url   VARCHAR(255)           DEFAULT NULL COMMENT '商品图片URL',
  stock       INT           NOT NULL DEFAULT 0 COMMENT '库存数量',
  status      TINYINT       NOT NULL DEFAULT 1 COMMENT '状态：0下架 1上架',
  create_time DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_time DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  create_by   VARCHAR(50)            DEFAULT NULL COMMENT '创建人',
  update_by   VARCHAR(50)            DEFAULT NULL COMMENT '修改人',
  deleted     TINYINT       NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  PRIMARY KEY (id),
  KEY idx_product_category (category_id),
  KEY idx_product_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品表';

DROP TABLE IF EXISTS t_product_time_slot;
CREATE TABLE t_product_time_slot (
  id             BIGINT      NOT NULL AUTO_INCREMENT COMMENT '主键',
  product_id     BIGINT      NOT NULL COMMENT '商品ID',
  time_slot_code VARCHAR(20) NOT NULL COMMENT '时间段编码：dawn/midday/dusk等',
  start_time     TIME        NOT NULL COMMENT '开始时间 HH:mm:ss',
  end_time       TIME        NOT NULL COMMENT '结束时间 HH:mm:ss',
  priority       INT         NOT NULL DEFAULT 0 COMMENT '推荐优先级，越大越靠前',
  enabled        TINYINT     NOT NULL DEFAULT 1 COMMENT '是否启用：0否 1是',
  create_time    DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_time    DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  create_by      VARCHAR(50)          DEFAULT NULL COMMENT '创建人',
  update_by      VARCHAR(50)          DEFAULT NULL COMMENT '修改人',
  deleted        TINYINT     NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  PRIMARY KEY (id),
  KEY idx_pts_product (product_id),
  KEY idx_pts_code_time (time_slot_code, start_time, end_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品时间段配置表（时间感菜单）';

/* =========================
   3. 购物车相关表
   ========================= */

DROP TABLE IF EXISTS t_cart_item;
CREATE TABLE t_cart_item (
  id          BIGINT     NOT NULL AUTO_INCREMENT COMMENT '主键',
  user_id     BIGINT     NOT NULL COMMENT '用户ID',
  product_id  BIGINT     NOT NULL COMMENT '商品ID',
  quantity    INT        NOT NULL COMMENT '数量',
  selected    TINYINT    NOT NULL DEFAULT 1 COMMENT '是否选中：0否 1是',
  create_time DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_time DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  create_by   VARCHAR(50)         DEFAULT NULL COMMENT '创建人',
  update_by   VARCHAR(50)         DEFAULT NULL COMMENT '修改人',
  deleted     TINYINT    NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  PRIMARY KEY (id),
  UNIQUE KEY uk_cart_user_product (user_id, product_id, deleted),
  KEY idx_cart_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='购物车条目表';

/* =========================
   4. 订单相关表
   ========================= */

DROP TABLE IF EXISTS t_order;
CREATE TABLE t_order (
  id              BIGINT        NOT NULL AUTO_INCREMENT COMMENT '主键',
  order_no        VARCHAR(50)   NOT NULL COMMENT '订单编号，业务唯一',
  user_id         BIGINT        NOT NULL COMMENT '下单用户ID',
  order_status    TINYINT       NOT NULL DEFAULT 0 COMMENT '订单状态',
  pay_status      TINYINT       NOT NULL DEFAULT 0 COMMENT '支付状态：0未支付 1已支付',
  total_amount    DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '订单原始总金额',
  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '优惠金额',
  payable_amount  DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '应付金额',
  paid_amount     DECIMAL(10,2)          DEFAULT NULL COMMENT '实付金额',
  coupon_id       BIGINT                 DEFAULT NULL COMMENT '使用的用户优惠券ID',
  pickup_type     TINYINT       NOT NULL DEFAULT 0 COMMENT '取餐方式：0到店自取 1外卖配送',
  pickup_name     VARCHAR(50)   NOT NULL COMMENT '取餐/收货人姓名',
  pickup_phone    VARCHAR(20)   NOT NULL COMMENT '取餐/收货人手机号',
  pickup_address  VARCHAR(255)          DEFAULT NULL COMMENT '取餐/收货地址简要信息',
  pickup_code     VARCHAR(20)           DEFAULT NULL COMMENT '取餐码',
  remark          VARCHAR(255)          DEFAULT NULL COMMENT '订单备注',
  pay_time        DATETIME              DEFAULT NULL COMMENT '支付时间',
  complete_time   DATETIME              DEFAULT NULL COMMENT '完成时间',
  cancel_time     DATETIME              DEFAULT NULL COMMENT '取消时间',
  create_time     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_time     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  create_by       VARCHAR(50)           DEFAULT NULL COMMENT '创建人',
  update_by       VARCHAR(50)           DEFAULT NULL COMMENT '修改人',
  deleted         TINYINT       NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  PRIMARY KEY (id),
  UNIQUE KEY uk_order_no (order_no),
  KEY idx_order_user (user_id),
  KEY idx_order_status (order_status),
  KEY idx_order_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单主表';

DROP TABLE IF EXISTS t_order_item;
CREATE TABLE t_order_item (
  id              BIGINT        NOT NULL AUTO_INCREMENT COMMENT '主键',
  order_id        BIGINT        NOT NULL COMMENT '订单ID',
  product_id      BIGINT        NOT NULL COMMENT '商品ID',
  product_name    VARCHAR(100)  NOT NULL COMMENT '商品名称快照',
  product_price   DECIMAL(10,2) NOT NULL COMMENT '下单时商品单价快照',
  quantity        INT           NOT NULL COMMENT '数量',
  subtotal_amount DECIMAL(10,2) NOT NULL COMMENT '小计金额',
  create_time     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_time     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  create_by       VARCHAR(50)            DEFAULT NULL COMMENT '创建人',
  update_by       VARCHAR(50)            DEFAULT NULL COMMENT '修改人',
  deleted         TINYINT       NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  PRIMARY KEY (id),
  KEY idx_order_item_order (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单明细表';

DROP TABLE IF EXISTS t_order_status_history;
CREATE TABLE t_order_status_history (
  id            BIGINT      NOT NULL AUTO_INCREMENT COMMENT '主键',
  order_id      BIGINT      NOT NULL COMMENT '订单ID',
  from_status   TINYINT              DEFAULT NULL COMMENT '原状态',
  to_status     TINYINT      NOT NULL COMMENT '新状态',
  operator_id   BIGINT               DEFAULT NULL COMMENT '操作人ID',
  operator_role VARCHAR(20)          DEFAULT NULL COMMENT '操作人角色：admin/staff/system等',
  remark        VARCHAR(255)         DEFAULT NULL COMMENT '变更说明',
  create_time   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '变更时间',
  PRIMARY KEY (id),
  KEY idx_order_status_history_order (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单状态变更记录表';

/* =========================
   5. 积分（光阴值）相关表
   ========================= */

DROP TABLE IF EXISTS t_points_account;
CREATE TABLE t_points_account (
  id           BIGINT    NOT NULL AUTO_INCREMENT COMMENT '主键',
  user_id      BIGINT    NOT NULL COMMENT '用户ID',
  balance      INT       NOT NULL DEFAULT 0 COMMENT '当前积分余额（光阴值）',
  total_earned INT       NOT NULL DEFAULT 0 COMMENT '累计获得积分',
  total_spent  INT       NOT NULL DEFAULT 0 COMMENT '累计使用积分',
  create_time  DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_time  DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  create_by    VARCHAR(50)        DEFAULT NULL COMMENT '创建人',
  update_by    VARCHAR(50)        DEFAULT NULL COMMENT '修改人',
  deleted      TINYINT   NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  PRIMARY KEY (id),
  UNIQUE KEY uk_points_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='积分账户表（光阴值账户）';

DROP TABLE IF EXISTS t_points_history;
CREATE TABLE t_points_history (
  id           BIGINT      NOT NULL AUTO_INCREMENT COMMENT '主键',
  user_id      BIGINT      NOT NULL COMMENT '用户ID',
  change_amount INT        NOT NULL COMMENT '积分变动值，正数增加，负数减少',
  type         VARCHAR(50) NOT NULL COMMENT '变动类型，如order_gain、coupon_redeem等',
  order_id     BIGINT               DEFAULT NULL COMMENT '关联订单ID',
  coupon_id    BIGINT               DEFAULT NULL COMMENT '关联优惠券ID',
  description  VARCHAR(255)         DEFAULT NULL COMMENT '备注说明',
  create_time  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '记录时间',
  create_by    VARCHAR(50)          DEFAULT NULL COMMENT '创建人',
  PRIMARY KEY (id),
  KEY idx_points_history_user (user_id),
  KEY idx_points_history_order (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='积分流水表（光阴值流水）';

DROP TABLE IF EXISTS t_points_rule;
CREATE TABLE t_points_rule (
  id               BIGINT        NOT NULL AUTO_INCREMENT COMMENT '主键',
  amount_per_point DECIMAL(10,2) NOT NULL COMMENT '获取1积分所需金额，如1.00表示1元1分',
  enabled          TINYINT       NOT NULL DEFAULT 1 COMMENT '是否启用：0否 1是',
  remark           VARCHAR(255)           DEFAULT NULL COMMENT '备注',
  create_time      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_time      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  create_by        VARCHAR(50)            DEFAULT NULL COMMENT '创建人',
  update_by        VARCHAR(50)            DEFAULT NULL COMMENT '修改人',
  deleted          TINYINT       NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='积分规则表';

/* =========================
   6. 优惠券相关表
   ========================= */

DROP TABLE IF EXISTS t_coupon_template;
CREATE TABLE t_coupon_template (
  id              BIGINT        NOT NULL AUTO_INCREMENT COMMENT '主键',
  name            VARCHAR(100)  NOT NULL COMMENT '优惠券名称',
  type            VARCHAR(30)   NOT NULL COMMENT '优惠类型，如full_reduction',
  threshold_amount DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '满减门槛金额',
  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '减免金额',
  required_points INT           NOT NULL DEFAULT 0 COMMENT '兑换所需积分（光阴值）',
  valid_days      INT           NOT NULL DEFAULT 0 COMMENT '领取后有效天数',
  status          TINYINT       NOT NULL DEFAULT 1 COMMENT '状态：0停用 1启用',
  create_time     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_time     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  create_by       VARCHAR(50)            DEFAULT NULL COMMENT '创建人',
  update_by       VARCHAR(50)            DEFAULT NULL COMMENT '修改人',
  deleted         TINYINT       NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='优惠券模板表';

DROP TABLE IF EXISTS t_user_coupon;
CREATE TABLE t_user_coupon (
  id           BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
  user_id      BIGINT       NOT NULL COMMENT '用户ID',
  template_id  BIGINT       NOT NULL COMMENT '优惠券模板ID',
  coupon_code  VARCHAR(50)           DEFAULT NULL COMMENT '优惠券编码',
  status       TINYINT      NOT NULL DEFAULT 0 COMMENT '状态：0未使用 1已使用 2已过期',
  receive_time DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '领取时间',
  expire_time  DATETIME              DEFAULT NULL COMMENT '过期时间',
  use_time     DATETIME              DEFAULT NULL COMMENT '使用时间',
  order_id     BIGINT                DEFAULT NULL COMMENT '使用该券的订单ID',
  create_time  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_time  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  create_by    VARCHAR(50)           DEFAULT NULL COMMENT '创建人',
  update_by    VARCHAR(50)           DEFAULT NULL COMMENT '修改人',
  deleted      TINYINT      NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  PRIMARY KEY (id),
  KEY idx_user_coupon_user (user_id),
  KEY idx_user_coupon_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户优惠券表';

/* =========================
   7. 评价相关表
   ========================= */

DROP TABLE IF EXISTS t_order_review;
CREATE TABLE t_order_review (
  id          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
  order_id    BIGINT       NOT NULL COMMENT '订单ID',
  user_id     BIGINT       NOT NULL COMMENT '用户ID',
  rating      TINYINT      NOT NULL COMMENT '评分 1~5',
  content     VARCHAR(500)          DEFAULT NULL COMMENT '评价内容',
  create_time DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_time DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  create_by   VARCHAR(50)           DEFAULT NULL COMMENT '创建人',
  update_by   VARCHAR(50)           DEFAULT NULL COMMENT '修改人',
  deleted     TINYINT      NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  PRIMARY KEY (id),
  UNIQUE KEY uk_order_review_order (order_id),
  KEY idx_order_review_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单评价表';

/* =========================
   8. 系统配置与日志
   ========================= */

DROP TABLE IF EXISTS t_sys_config;
CREATE TABLE t_sys_config (
  id          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
  config_key  VARCHAR(100) NOT NULL COMMENT '配置键',
  config_value TEXT                 DEFAULT NULL COMMENT '配置值（可为JSON）',
  description VARCHAR(255)          DEFAULT NULL COMMENT '配置说明',
  create_time DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_time DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  create_by   VARCHAR(50)           DEFAULT NULL COMMENT '创建人',
  update_by   VARCHAR(50)           DEFAULT NULL COMMENT '修改人',
  deleted     TINYINT      NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  PRIMARY KEY (id),
  UNIQUE KEY uk_sys_config_key (config_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统配置表';

DROP TABLE IF EXISTS t_operation_log;
CREATE TABLE t_operation_log (
  id            BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
  operator_id   BIGINT                DEFAULT NULL COMMENT '操作人ID',
  operator_role VARCHAR(20)           DEFAULT NULL COMMENT '操作人角色：admin/staff/member等',
  operation_type VARCHAR(50) NOT NULL COMMENT '操作类型，如LOGIN、ORDER_STATUS_CHANGE等',
  target_type   VARCHAR(50)           DEFAULT NULL COMMENT '目标对象类型，如order、product、user等',
  target_id     BIGINT                DEFAULT NULL COMMENT '目标对象ID',
  description   VARCHAR(500)          DEFAULT NULL COMMENT '操作描述',
  ip_address    VARCHAR(50)           DEFAULT NULL COMMENT 'IP地址',
  create_time   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
  PRIMARY KEY (id),
  KEY idx_operation_log_operator (operator_id),
  KEY idx_operation_log_type (operation_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';
