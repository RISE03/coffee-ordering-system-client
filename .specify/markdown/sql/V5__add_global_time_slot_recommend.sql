/*
 * 全局时段推荐表
 */
CREATE TABLE IF NOT EXISTS t_time_slot_recommend (
  id              BIGINT      NOT NULL AUTO_INCREMENT COMMENT '主键',
  time_slot_code  VARCHAR(20) NOT NULL COMMENT '时间段编码：dawn/midday/dusk',
  product_id      BIGINT      NOT NULL COMMENT '推荐商品ID',
  sort            INT         NOT NULL DEFAULT 0 COMMENT '推荐顺序，越小越靠前',
  create_time     DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_time     DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  create_by       VARCHAR(50)          DEFAULT NULL COMMENT '创建人',
  update_by       VARCHAR(50)          DEFAULT NULL COMMENT '修改人',
  deleted         TINYINT     NOT NULL DEFAULT 0 COMMENT '逻辑删除：0正常 1删除',
  PRIMARY KEY (id),
  KEY idx_ts_recommend_code_sort (time_slot_code, sort),
  KEY idx_ts_recommend_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='全局时段推荐商品表';

