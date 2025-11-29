# Feature Specification: Member Cart, Checkout & Orders

**Feature Branch**: `003-cart-checkout-orders`  
**Created**: 2025-11-27  
**Status**: Draft  
**Input**: User description: "Member-facing cart, checkout, simulated payment confirmation, coupon use, order list/detail, and cancel pending payment flows for Dawn & Dusk cafe members."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - From Cart to Paid Order (Priority: P1)

A logged-in member reviews their cart, fixes quantities, proceeds to checkout, sees price/time-credit breakdown, and confirms payment to place the order.

**Why this priority**: Core revenue path; must be reliable and fast for daily orders.

**Independent Test**: Start with a cart containing items; complete checkout and simulated payment; verify order created with correct totals and time credits.

**Acceptance Scenarios**:

1. **Given** the cart has valid items and saved contact details, **When** the member goes to checkout and taps Pay now, **Then** the order is created as paid with the displayed payable amount and time credits, and the user lands on confirmation/order detail.
2. **Given** the cart changes after the last preview (price/stock/quantity), **When** the user tries to pay, **Then** the UI blocks submission, refreshes the preview, and only allows payment after showing the updated totals.
3. **Given** a coupon is selected, **When** payment succeeds, **Then** the discount appears in the breakdown and the earned time credits reflect the discounted payable amount.

---

### User Story 2 - Buy Now Shortcut (Priority: P1)

From a product page, the member selects Buy now to checkout a single item without touching the cart; they can still return to browsing without losing their original cart.

**Why this priority**: Speeds single-item purchases and reduces drop-off.

**Independent Test**: From product detail, start Buy now, finish payment, then reopen cart and confirm original cart contents are unchanged.

**Acceptance Scenarios**:

1. **Given** a product detail page, **When** the member taps Buy now, **Then** checkout is prefilled with that item/quantity and cart contents remain intact.
2. **Given** the member backs out of checkout to browse or cart, **When** they reopen checkout, **Then** the Buy now snapshot is retained until they submit or abandon.

---

### User Story 3 - Coupon Choice & Repricing (Priority: P1)

During checkout the member views usable and unusable coupons, selects one, and immediately sees recalculated totals and estimated time credits.

**Why this priority**: Discounts and loyalty visibility drive conversion and repeat purchases.

**Independent Test**: Apply and switch coupons on the same basket; verify preview updates totals, eligibility messaging, and time credits each time.

**Acceptance Scenarios**:

1. **Given** coupons with different thresholds, **When** the member picks a usable coupon, **Then** the discount and payable amount update and the coupon is marked as applied.
2. **Given** a coupon becomes ineligible after quantity changes, **When** the preview reruns, **Then** the coupon is auto-removed, a reason is shown, and the member can pick another.

---

### User Story 4 - Order List with Next Actions (Priority: P2)

The member opens their order list, filters by status, sees concise order cards, and can jump to pay pending orders or open details.

**Why this priority**: Reduces support and keeps payments moving by surfacing next actions.

**Independent Test**: Load the list with mixed-status orders; switch tabs; trigger Pay now on a pending order and confirm it proceeds to payment/confirmation.

**Acceptance Scenarios**:

1. **Given** multiple orders across statuses, **When** the member switches between All/Pending payment/In progress/Completed/Canceled/Refunding/Refunded, **Then** the list updates with correct counts and cards.
2. **Given** an order in pending payment, **When** the member uses Pay now from the list, **Then** they are taken to payment confirmation with that order and status updates on success.

---

### User Story 5 - Order Detail & Cancellation (Priority: P3)

The member opens an order detail to view fulfillment info, timeline, coupon/price breakdown, earned time credits, and can cancel if still pending payment.

**Why this priority**: Transparency builds trust; cancellation reduces accidental charges and customer support load.

**Independent Test**: Open a pending-payment order, review timeline and price breakdown, cancel it, and confirm status and available actions refresh correctly.

**Acceptance Scenarios**:

1. **Given** an order with delivery, **When** the member opens details, **Then** they see address snapshot, items, price breakdown, coupon info, and status timeline with timestamps.
2. **Given** an order in pending payment, **When** the member taps Cancel and confirms, **Then** the order status changes to canceled, pay actions disappear, and a success toast explains that reserved benefits are released.
3. **Given** a paid or in-progress order, **When** the member views actions, **Then** cancel is hidden or disabled with a note that the order has progressed.

### Edge Cases

- Cart is empty: show friendly dawn/dusk-themed empty state with CTA to return to product browsing.
- Quantity input out of 1-99 or non-numeric: revert to last valid value and show inline helper text.
- Stock/price change between preview and payment: block submission, refresh data, and show guidance to retry or adjust cart.
- Coupon auto-invalidates after totals drop: remove it, explain the threshold, and keep the order payable without the discount.
- Session expired: prompt re-login, keep cart/checkout data client-side, and retry preview after authentication.
- API failure (preview, payment, cancel, list fetch): show non-technical error copy, allow retry, and do not clear user input unless confirmed outdated.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The cart page displays each item with image, name, options (if any), unit price, quantity, per-item subtotal, and cart total updated in real time.
- **FR-002**: Quantity controls support +/- and direct numeric entry; enforce 1-99; invalid input reverts to last valid value with inline feedback.
- **FR-003**: Removing an item requires a confirmation step; after removal the cart and totals refresh instantly.
- **FR-004**: Cart contents persist for logged-in members across sessions; reopening `/member/cart` reloads the saved cart from backend and reconciles local edits.
- **FR-005**: Empty cart state shows brand-aligned message and a clear action to return to browsing/menu.
- **FR-006**: Checkout shows a read-only snapshot of items being purchased (from cart or Buy now) so later cart changes do not mutate the in-progress order.
- **FR-007**: Checkout collects fulfillment choice: pickup (name + phone) or delivery (select saved address or add new). Required fields must be validated before payment is enabled.
- **FR-008**: Members can add an optional order remark (e.g., "less sweet"), limited to 120 characters and displayed in the order record.
- **FR-009**: Checkout triggers a pricing preview when opened and whenever coupon selection, fulfillment choice, or item quantities change; preview returns item total, discounts, payable amount, and estimated time credits, and is timestamped/locked for payment submission.
- **FR-010**: Coupon panel separates usable and unusable coupons; each shows name, rule/threshold, discount value, and expiry; unusable coupons show a specific reason tied to the current basket.
- **FR-011**: Only one coupon can be active; selecting or removing a coupon forces a new preview; if a previously applied coupon becomes invalid, it is auto-removed with a notice.
- **FR-012**: Price breakdown is always visible in checkout and confirmation: item total, discount, payable amount highlighted, and "You'll earn +X time credits" messaging.
- **FR-013**: Pay now performs simulated payment against the latest preview; on success the order status moves to paid/waiting for preparation and the member is shown a confirmation or order detail page.
- **FR-014**: Payment failure states (stock/price change, invalid coupon, expired session) present friendly explanations and the next action (refresh cart, re-select coupon, re-login) without losing entered info.
- **FR-015**: Buy now creates a one-time checkout snapshot that does not overwrite the saved cart; returning to the cart shows original contents unchanged.
- **FR-016**: Order list (`/member/orders`) supports status tabs (All, Pending payment, In progress, Completed, Canceled, Refunding, Refunded); cards show order number, short item summary, order time, payment amount, and status badge.
- **FR-017**: Order list supports pagination or incremental loading; network errors show retry; empty state gives guidance to place a first order.
- **FR-018**: Order detail shows order number, creation and payment times, status; fulfillment info (pickup/delivery, contact, address/pickup code), item snapshot, coupon info, price breakdown (item total, discount, payable, paid), and earned time credits when available.
- **FR-019**: Order detail includes a simple status timeline (e.g., Created -> Paid -> In preparation -> Ready for pickup -> Completed or Canceled/Refunded) with timestamps when provided.
- **FR-020**: Pending payment orders expose Pay now and Cancel actions from both list and detail views; actions are hidden/disabled for other statuses with contextual messaging.
- **FR-021**: Cancel order flow requires confirmation copy explaining effects (e.g., releasing coupon locks); after success, status updates to canceled and actions refresh accordingly; if cancellation is rejected because the order progressed, show that reason.
- **FR-022**: All views present loading and error states without technical jargon; brand tone remains warm and time-themed ("You've just earned more time to enjoy").
- **FR-023**: UI layouts remain readable on mobile and desktop; primary actions (Pay now, Go to checkout, Cancel) stay prominent above the fold where possible.

### Key Entities *(include if feature involves data)*

- **Cart Item Snapshot**: Product id/name/image, selected quantity, unit price, per-item subtotal captured at cart/checkout time.
- **Checkout Preview**: Immutable snapshot containing item summary, fulfillment choice, applied coupon (optional), discount amount, payable amount, estimated time credits, and validation flags.
- **Coupon**: Identifier, display name, discount rule (e.g., fixed/percentage), threshold, expiry, applicability status, and ineligibility reason relative to the current basket.
- **Order Summary**: Order number, status, creation time, payment time (if paid), fulfillment mode and contact details, price figures (item total, discount, payable, paid), and short item summary.
- **Order Detail Timeline Entry**: Status label and timestamp to plot the lifecycle (Created, Paid, In preparation, Ready, Completed, Canceled, Refunding/Refunded).
- **Time Credits**: Loyalty metric showing estimated credits at checkout and earned credits on paid/completed orders, formatted as "time credits".
- **Address**: Saved delivery address with recipient name, phone, and full address string used as a snapshot on the order.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 95% of members with a valid cart can complete cart-to-payment in under 3 minutes without support.
- **SC-002**: 100% of paid orders show a matching payable amount between checkout breakdown and recorded order totals.
- **SC-003**: 90% of coupon-eligible checkouts display the correct usable coupon list, and 100% of unusable coupons show a specific reason.
- **SC-004**: 95% of members can locate and open a target order from the list within 10 seconds for orders placed in the last 30 days.
- **SC-005**: 90% of cancellation attempts on pending payment orders either succeed or return a clear "cannot cancel because ..." reason within one page refresh.
