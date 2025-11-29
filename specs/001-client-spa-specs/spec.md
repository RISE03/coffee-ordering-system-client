# Feature Specification: Frontend Client SPA (Guest/Member Portal)

**Feature Branch**: `001-client-spa-specs`
**Created**: 2025-11-27
**Status**: Draft
**Input**: User description: "Create a functional specification for the `frontend-client` SPA..."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browsing & Discovery (Priority: P1)

As a guest or member, I want to browse the menu and see time-relevant recommendations so that I can easily find products that match the current time of day ("Dawn" or "Dusk").

**Why this priority**: This is the entry point for all users and establishes the unique brand identity (time, warmth). Without this, users cannot discover products to buy.

**Independent Test**: Can be fully tested by opening the app at different simulated times (e.g., 8 AM vs 8 PM) and verifying the theme and recommendations change, then navigating to the full menu.

**Acceptance Scenarios**:

1. **Given** the current time is "Morning" (Dawn), **When** I open the home page, **Then** I see the "Dawn" (light/vitality) visual theme and breakfast-appropriate product recommendations.
2. **Given** the current time is "Evening" (Dusk), **When** I open the home page, **Then** I see the "Dusk" (dark/quiet) visual theme and evening-appropriate product recommendations.
3. **Given** I am on the home page, **When** I tap "Menu", **Then** I see a list of products filtered by category (e.g., Coffee, Tea, Bakery) and a search bar.
4. **Given** I am browsing the menu, **When** I select a specific product, **Then** I see the product detail page with name, description, price, tags, and time-slot labels.

---

### User Story 2 - Cart & Checkout (Priority: P1)

As a user, I want to add items to my cart and complete the checkout process so that I can place an order for pickup.

**Why this priority**: This is the core revenue-generating flow.

**Independent Test**: Can be tested by adding items as a guest, proceeding to checkout, and successfully creating an order (simulated backend).

**Acceptance Scenarios**:

1. **Given** I am viewing a product, **When** I click "Add to Cart", **Then** the item is added to my global cart, and I see a confirmation.
2. **Given** I have items in my cart, **When** I view the cart page, **Then** I can update quantities or remove items.
3. **Given** I am a guest with items in my cart, **When** I proceed to checkout, **Then** I am prompted to login or register, but I can also choose to proceed (transitioning to member if registration is completed).
4. **Given** I am at the checkout summary, **When** I confirm the order, **Then** the order is submitted to the backend, and I see a success confirmation with the order ID.

---

### User Story 3 - Authentication & Account (Priority: P1)

As a member, I want to login or register so that I can access my loyalty benefits and order history.

**Why this priority**: Necessary for membership features, points accumulation, and order history retention.

**Independent Test**: Can be tested by registering a new account, logging out, and logging back in.

**Acceptance Scenarios**:

1. **Given** I am a guest, **When** I visit the Login page, **Then** I can enter my credentials to log in.
2. **Given** I am a guest, **When** I visit the Register page, **Then** I can create a new account by providing required details (e.g., phone/email, password).
3. **Given** I am a logged-in member, **When** I click "Logout" from the profile, **Then** my session is ended, and my sensitive data is cleared from the view.

---

### User Story 4 - Loyalty System (Points & Coupons) (Priority: P1)

As a member, I want to view my "Dawn & Dusk" points (光阴值) and apply coupons so that I can benefit from being a loyal customer.

**Why this priority**: Key differentiator for the brand and incentivizes repeat visits.

**Independent Test**: Can be tested by a member viewing their profile to see points, and applying a valid coupon during checkout.

**Acceptance Scenarios**:

1. **Given** I am a logged-in member, **When** I visit the "Points Center", **Then** I see my current "光阴值" balance and my membership level (e.g., 晨曦, 烈阳).
2. **Given** I am a logged-in member, **When** I view "My Coupons", **Then** I see a list of available coupons with their conditions and expiry dates.
3. **Given** I am at checkout with a valid coupon, **When** I select the coupon, **Then** the order total is discounted accordingly.
4. **Given** I try to apply an invalid coupon, **When** I select it, **Then** I see a clear error message explaining why it cannot be used.

---

### User Story 5 - Order History (Priority: P1)

As a member, I want to view my past orders so that I can recall what I bought or check the status of a current order.

**Why this priority**: Basic account management requirement for trust and convenience.

**Independent Test**: Can be tested by placing an order and then verifying it appears in the "Orders" list.

**Acceptance Scenarios**:

1. **Given** I am a logged-in member, **When** I navigate to "Orders", **Then** I see a list of my past and current orders sorted by date.
2. **Given** I am viewing the order list, **When** I click on a specific order, **Then** I see the full details including items, prices, pickup info, and payment status.

### Edge Cases

- **Network Failure**: If the API is unreachable during checkout, the user should see a "Network Error, please try again" toast, and the cart should be preserved.
- **Token Expiry**: If a member's session expires while browsing, they should be gracefully prompted to re-login when attempting a secure action (like checkout or profile view) without losing their current context/cart if possible.
- **Empty States**: 
    - Empty Cart: Show a "Your cart is empty" message with a "Go to Menu" button.
    - No Orders: Show "No orders yet" with a suggestion to order.
    - No Coupons: Show "No available coupons".

## Requirements *(mandatory)*

### Functional Requirements

#### General & Brand
- **FR-001**: System MUST automatically switch the visual theme between "Dawn" (light) and "Dusk" (dark) based on the client's local time or a manual toggle.
- **FR-002**: System MUST display time-relevant product recommendations on the Home page (e.g., breakfast items in the morning).
- **FR-003**: System MUST use the brand-specific terms "光阴值" (Points) and membership levels (晨曦, 烈阳, 晚霞, 繁星) throughout the UI.

#### Browsing
- **FR-004**: System MUST allow users (Guest/Member) to view the full product menu filtered by category.
- **FR-005**: System MUST allow users to search for products by name.
- **FR-006**: System MUST display product details including image, name, description, price, and availability tags.

#### Cart & Checkout
- **FR-007**: System MUST allow users to add items to a shopping cart, update quantities, and remove items.
- **FR-008**: System MUST allow Guests to initiate checkout, prompting for Login/Registration but allowing transition to Member flow.
- **FR-009**: System MUST calculate order totals including item prices and applied coupons.
- **FR-010**: System MUST submit the final order to the backend API.

#### Auth & Profile
- **FR-011**: System MUST allow new users to Register with required fields (Phone/Email, Password).
- **FR-012**: System MUST allow existing members to Login and maintain a session (via JWT).
- **FR-013**: System MUST display the Member's Profile page with nickname, contact info, and links to loyalty sections.

#### Loyalty
- **FR-014**: System MUST display the member's current Point balance ("光阴值") and Membership Level.
- **FR-015**: System MUST display a list of available coupons with status (valid, used, expired).
- **FR-016**: System MUST allow members to select and apply a valid coupon during the checkout process.

#### Orders
- **FR-017**: System MUST display a list of historical orders for the logged-in member.
- **FR-018**: System MUST display detailed information for a specific order (items, pickup info, breakdown).

### Key Entities

- **User**: Can be a Guest (anonymous) or Member (authenticated with ID, Profile, Points).
- **Product**: A menu item with price, category, and time-slot suitability.
- **Cart**: A collection of Product selections and quantities.
- **Order**: A confirmed transaction record containing Cart items, Total Price, and Status.
- **Coupon**: A discount rule that can be applied to an Order.
- **Points (光阴值)**: An integer balance associated with a Member.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A Guest user can successfully browse the menu, add an item, register, and place an order in a single session.
- **SC-002**: The application loads the correct "Dawn" or "Dusk" theme based on system time 100% of the time upon initial load.
- **SC-003**: Members can access their Point balance and Coupon list within 2 clicks from the Home page.
- **SC-004**: 100% of P1 flows (Browsing, Checkout, Auth) handle API errors gracefully by displaying user-friendly error messages instead of crashing.