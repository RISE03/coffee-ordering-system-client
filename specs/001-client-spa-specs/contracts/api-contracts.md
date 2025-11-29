# API Contracts: Frontend Client SPA

**Branch**: `001-client-spa-specs` | **Date**: 2025-11-27

本文档定义 frontend-client 与后端 API 的接口契约，基于后端接口设计说明 V1.2。

---

## 1. 通用约定

### 1.1 基础配置

| 项目 | 值 |
|------|-----|
| Base URL | `/api` |
| Content-Type | `application/json` |
| 认证方式 | `Authorization: Bearer <token>` |
| 时间格式 | `yyyy-MM-dd HH:mm:ss` |
| 金额单位 | 元，两位小数 |

### 1.2 响应结构

```json
{
  "code": 0,
  "message": "success",
  "data": { ... }
}
```

### 1.3 分页响应

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "total": 100,
    "page": 1,
    "size": 10,
    "list": [ ... ]
  }
}
```

---

## 2. 认证接口

### 2.1 用户注册

```
POST /api/auth/register
```

**Request:**
```json
{
  "username": "string",
  "password": "string",
  "confirmPassword": "string",
  "mobile": "string?"
}
```

**Response:**
```json
{
  "code": 0,
  "message": "注册成功",
  "data": {
    "userId": 1,
    "username": "string"
  }
}
```

### 2.2 用户登录

```
POST /api/auth/login
```

**Request:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "code": 0,
  "message": "登录成功",
  "data": {
    "token": "jwt-token-xxxx",
    "user": {
      "id": 1,
      "username": "string",
      "nickname": "string",
      "role": "member",
      "level": 2,
      "levelName": "烈阳"
    }
  }
}
```

### 2.3 获取当前用户信息

```
GET /api/user/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1,
    "username": "string",
    "nickname": "string",
    "mobile": "string",
    "avatar": "string?",
    "role": "member",
    "level": 2,
    "levelName": "烈阳"
  }
}
```

### 2.4 退出登录

```
POST /api/auth/logout
Authorization: Bearer <token>
```

**Response:**
```json
{
  "code": 0,
  "message": "退出成功",
  "data": null
}
```

---

## 3. 商品接口

### 3.1 获取商品分类列表

```
GET /api/categories
```

**Response:**
```json
{
  "code": 0,
  "data": [
    { "id": 1, "name": "咖啡" },
    { "id": 2, "name": "饮品" }
  ]
}
```

### 3.2 获取商品列表

```
GET /api/products?categoryId=1&keyword=拿铁&page=1&size=10
```

**Query Parameters:**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| categoryId | number | 否 | 分类 ID |
| keyword | string | 否 | 搜索关键字 |
| page | number | 否 | 页码，默认 1 |
| size | number | 否 | 每页条数，默认 10 |

**Response:**
```json
{
  "code": 0,
  "data": {
    "total": 100,
    "list": [
      {
        "id": 1,
        "name": "拿铁咖啡",
        "price": 18.50,
        "imageUrl": "https://example.com/latte.jpg",
        "categoryId": 1
      }
    ]
  }
}
```

### 3.3 获取商品详情

```
GET /api/products/{id}
```

**Response:**
```json
{
  "code": 0,
  "data": {
    "id": 1,
    "name": "拿铁咖啡",
    "price": 18.50,
    "description": "浓缩咖啡加牛奶",
    "imageUrl": "https://example.com/latte.jpg",
    "categoryId": 1,
    "status": 1
  }
}
```

### 3.4 时间段推荐商品

```
GET /api/products/recommend?scene=home&timeSlotCode=dawn
```

**Query Parameters:**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| scene | string | 否 | 场景标识，如 home |
| timeSlotCode | string | 否 | 时间段编码：dawn/midday/dusk，不传则后端自动判断 |

**Response:**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "timeSlotCode": "dawn",
    "timeSlotName": "朝·醒",
    "products": [
      {
        "id": 1,
        "name": "美式咖啡",
        "price": 16.00,
        "imageUrl": "https://example.com/americano.jpg",
        "tag": "醒神推荐"
      }
    ]
  }
}
```

---

## 4. 购物车接口

### 4.1 获取购物车列表

```
GET /api/cart
Authorization: Bearer <token>
```

**Response:**
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": 1,
      "productId": 1,
      "productName": "拿铁咖啡",
      "productImageUrl": "https://example.com/latte.jpg",
      "price": 18.50,
      "quantity": 2,
      "subtotal": 37.00
    }
  ]
}
```

### 4.2 添加商品到购物车

```
POST /api/cart
Authorization: Bearer <token>
```

**Request:**
```json
{
  "productId": 1,
  "quantity": 2
}
```

**Response:**
```json
{
  "code": 0,
  "message": "success",
  "data": null
}
```

### 4.3 修改购物车条目数量

```
PUT /api/cart/{cartItemId}
Authorization: Bearer <token>
```

**Request:**
```json
{
  "quantity": 3
}
```

**Response:**
```json
{
  "code": 0,
  "message": "success",
  "data": null
}
```

### 4.4 删除购物车条目

```
DELETE /api/cart/{cartItemId}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "code": 0,
  "message": "success",
  "data": null
}
```

---

## 5. 订单接口

### 5.1 创建订单

```
POST /api/orders
Authorization: Bearer <token>
```

**Request:**
```json
{
  "items": [
    { "productId": 1, "quantity": 2 },
    { "productId": 3, "quantity": 1 }
  ],
  "pickupType": 0,
  "pickupName": "张三",
  "pickupPhone": "13800000000",
  "addressId": 5,
  "couponId": 10,
  "remark": "不要太甜"
}
```

**Response:**
```json
{
  "code": 0,
  "data": {
    "orderId": 1001,
    "orderNo": "202511230001",
    "payableAmount": 27.50
  }
}
```

### 5.2 查询我的订单列表

```
GET /api/orders/my?status=0&page=1&size=10
Authorization: Bearer <token>
```

**Query Parameters:**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| status | number | 否 | 订单状态 |
| page | number | 否 | 页码 |
| size | number | 否 | 每页条数 |

**Response:**
```json
{
  "code": 0,
  "data": {
    "total": 10,
    "page": 1,
    "size": 10,
    "list": [
      {
        "orderId": 1001,
        "orderNo": "202511230001",
        "status": 0,
        "statusName": "待支付",
        "orderTime": "2025-11-23 10:10:00",
        "payableAmount": 27.50
      }
    ]
  }
}
```

### 5.3 查询订单详情

```
GET /api/orders/{orderId}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "orderId": 1001,
    "orderNo": "202511230001",
    "status": 3,
    "statusName": "待取餐",
    "orderTime": "2025-11-23 10:10:00",
    "payTime": "2025-11-23 10:11:00",
    "pickupType": 0,
    "pickupTypeName": "到店自取",
    "pickupName": "张三",
    "pickupPhone": "13800000000",
    "pickupCode": "123456",
    "address": null,
    "items": [
      {
        "productId": 1,
        "productName": "拿铁咖啡",
        "productImageUrl": "https://example.com/latte.jpg",
        "price": 18.50,
        "quantity": 2,
        "subtotal": 37.00
      }
    ],
    "amountInfo": {
      "totalAmount": 50.00,
      "discountAmount": 5.00,
      "payableAmount": 45.00,
      "paidAmount": 45.00
    },
    "coupon": {
      "couponId": 10,
      "couponName": "满40减5元"
    },
    "pointsInfo": {
      "gainedPoints": 45
    }
  }
}
```

### 5.4 模拟支付订单

```
POST /api/orders/{orderId}/pay
Authorization: Bearer <token>
```

**Response:**
```json
{
  "code": 0,
  "message": "支付成功",
  "data": null
}
```

### 5.5 取消未支付订单

```
POST /api/orders/{orderId}/cancel
Authorization: Bearer <token>
```

**Response:**
```json
{
  "code": 0,
  "message": "取消成功",
  "data": null
}
```

---

## 6. 积分接口

### 6.1 查询积分账户信息

```
GET /api/points/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "code": 0,
  "data": {
    "balance": 320,
    "totalEarned": 500,
    "totalSpent": 180
  }
}
```

### 6.2 查询积分流水

```
GET /api/points/history?page=1&size=10&type=order_gain
Authorization: Bearer <token>
```

**Response:**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "total": 2,
    "page": 1,
    "size": 10,
    "list": [
      {
        "id": 1,
        "changeAmount": 28,
        "type": "order_gain",
        "typeName": "完成订单获得",
        "orderId": 1001,
        "couponId": null,
        "description": "订单完成获得积分",
        "createdTime": "2025-11-23 11:00:00"
      }
    ]
  }
}
```

---

## 7. 优惠券接口

### 7.1 查询我的优惠券列表

```
GET /api/coupons/my?status=unused
Authorization: Bearer <token>
```

**Query Parameters:**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| status | string | 否 | unused/used/expired |

**Response:**
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": 10,
      "templateId": 3,
      "name": "满40减8元券",
      "type": "full_reduction",
      "thresholdAmount": 40.00,
      "discountAmount": 8.00,
      "status": "unused",
      "statusName": "未使用",
      "receiveTime": "2025-11-20 10:00:00",
      "expireTime": "2025-11-27 23:59:59",
      "description": "仅限饮品使用"
    }
  ]
}
```

### 7.2 查询可兑换优惠券模板

```
GET /api/points/coupon-templates
Authorization: Bearer <token>
```

**Response:**
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": 3,
      "name": "满40减8元券",
      "type": "full_reduction",
      "thresholdAmount": 40.00,
      "discountAmount": 8.00,
      "requiredPoints": 100,
      "validDays": 7,
      "status": 1
    }
  ]
}
```

### 7.3 积分兑换优惠券

```
POST /api/points/redeem-coupon
Authorization: Bearer <token>
```

**Request:**
```json
{
  "templateId": 3
}
```

**Response:**
```json
{
  "code": 0,
  "message": "兑换成功",
  "data": {
    "couponId": 10,
    "templateId": 3,
    "name": "满40减8元券",
    "thresholdAmount": 40.00,
    "discountAmount": 8.00,
    "status": "unused",
    "expireTime": "2025-12-01 23:59:59"
  }
}
```

---

## 8. 地址接口

### 8.1 查询地址列表

```
GET /api/user/addresses
Authorization: Bearer <token>
```

**Response:**
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": 1,
      "receiverName": "张三",
      "receiverPhone": "13800000000",
      "province": "浙江省",
      "city": "杭州市",
      "district": "西湖区",
      "detailAddress": "某路88号",
      "isDefault": 1
    }
  ]
}
```

### 8.2 新增收货地址

```
POST /api/user/addresses
Authorization: Bearer <token>
```

**Request:**
```json
{
  "receiverName": "张三",
  "receiverPhone": "13800000000",
  "province": "浙江省",
  "city": "杭州市",
  "district": "西湖区",
  "detailAddress": "某路88号",
  "isDefault": 1
}
```

**Response:**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 2,
    "receiverName": "张三",
    "receiverPhone": "13800000000",
    "province": "浙江省",
    "city": "杭州市",
    "district": "西湖区",
    "detailAddress": "某路88号",
    "isDefault": 1
  }
}
```

### 8.3 修改收货地址

```
PUT /api/user/addresses/{id}
Authorization: Bearer <token>
```

### 8.4 删除收货地址

```
DELETE /api/user/addresses/{id}
Authorization: Bearer <token>
```

---

## 9. 错误码参考

| 错误码 | 含义 | 前端处理 |
|--------|------|----------|
| 0 | 成功 | 正常处理 |
| 1001 | 用户名或密码错误 | 显示登录失败提示 |
| 2001 | 商品库存不足 | 显示库存不足提示 |
| 2002 | 订单状态不允许操作 | 显示状态冲突提示 |
| 3001 | 优惠券不可用 | 显示优惠券不可用原因 |
| 3002 | 积分不足 | 显示积分不足提示 |
| 4001 | 参数校验错误 | 显示 message |
| 4010 | 未登录或登录过期 | 跳转登录页 |
| 4030 | 无访问权限 | 显示权限不足 |
| 4040 | 资源不存在 | 显示 404 |
| 4090 | 业务冲突 | 显示 message |
| 5000 | 系统内部错误 | 显示通用错误 |
