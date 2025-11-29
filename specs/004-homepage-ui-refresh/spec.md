# Feature Specification: Frontend Client Homepage UI Refresh for Dawn & Dusk V2.0

**Feature Branch**: `004-homepage-ui-refresh`
**Created**: 2025-11-29
**Status**: Draft
**Input**: UI/UX refresh of the member-facing homepage to match the V2.0 brand and glassmorphism design document

---

## 1. Feature Overview

### 1.1 Feature Name

**Frontend Client Homepage UI Refresh for Dawn & Dusk V2.0 Glassmorphism Design**

### 1.2 Business Goal

Update the member-facing homepage of the `frontend-client` SPA so that it visually matches the V2.0 brand and UI design document. This refresh preserves all existing business flows (browsing products, adding to cart, accessing orders, viewing points, etc.) while delivering a completely redesigned visual experience based on the "glassmorphism over real-world café background" concept.

### 1.3 Why This Redesign Matters

1. **Brand Consistency and Thesis/Demo Presentation**: The homepage is the first screen users see when opening the app. A visually polished, brand-aligned homepage is essential for thesis defense demonstrations and creates a strong first impression that reflects the "Dawn & Dusk" (朝暮) brand identity.

2. **Better First Impression**: The glassmorphism design with time-based themes (Dawn for daytime warmth, Dusk for evening relaxation) creates an immersive "ordering inside a real café" experience that differentiates this system from generic ordering apps.

3. **Showcasing the Dual Theme Concept**: The Dawn (day) / Dusk (night) dual theme is a core innovation of the "朝暮" brand. The homepage refresh must clearly demonstrate this time-aware visual switching to highlight the system's unique value proposition during presentations.

---

## 2. Scope

### 2.1 In Scope

#### Homepage Screen Components

The member homepage screen of `frontend-client`, including:

- **Top Status & Navigation Bar**: Brand logo ("朝暮 Dawn & Dusk"), current 光阴值 (points) display with hourglass icon, user avatar, and theme toggle (sun/moon icon)
- **Hero / Recommendation Section**: Time-of-day themed hero banner with title (e.g., "朝·醒神推荐" or "暮·微醺推荐"), slogan, and featured product cards with add-to-cart buttons
- **Category Tabs**: Pill-style horizontal tabs (e.g., 人气 / 醒神早餐 / 微醺夜饮 / 咖啡 / 甜点) with selected state styling
- **Product Grid**: Glassmorphism product cards displaying image, Chinese name, English name, price, and special tags (e.g., "晚霞" membership tag)
- **Bottom Navigation Bar**: Four-tab navigation (首页 / 点餐 / 订单 / 我的) with active state indicator

#### Theme System

- **Dawn Mode Theme**: Warm amber/golden color palette with bright café interior background imagery, white glassmorphism cards with warm tint
- **Dusk Mode Theme**: Cool blue/silver color palette with night café with city lights background imagery, dark glassmorphism cards with cool tint
- **Theme Switching Behavior**: Auto-selection based on time of day AND manual toggle via sun/moon control
- **Theme Persistence**: Remember user's manual theme choice via local storage

#### Shared Layout Components

Any shared layout components used by the homepage (e.g., shared header, bottom nav component), ensuring changes are backward compatible with other screens in the application.

### 2.2 Out of Scope

- **Backend Changes**: No changes to backend APIs, data contracts, or database schema
- **Other Screen Business Logic**: No reworking of cart, checkout, orders, profile, or other screens' business logic
- **Navigation Structure Changes**: No changes to routes, URL structure, or navigation hierarchy that would break existing flows
- **Admin/Staff Frontends**: No changes to `frontend-admin` or staff console interfaces
- **New Features**: No new business features; this is purely a visual refresh of existing functionality

---

## 3. User Personas and Scenarios

### 3.1 Primary Persona: Mobile-First Coffee Shop Member

A typical member user is a young professional or student who:
- Primarily accesses the app via mobile device
- Values aesthetic design and immersive experiences
- Orders coffee and snacks throughout the day at different times
- Appreciates the emotional/lifestyle branding of "spending time at Dawn & Dusk"

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Morning Homepage Experience (Priority: P1)

A member opens the app in the morning (06:00-11:59) and sees a warm, inviting homepage with the "朝·醒神" (Morning Awake) theme. The bright café background with sunlight streaming through windows, amber-gold accent colors, and breakfast/coffee recommendations create an energizing start-of-day atmosphere.

**Why this priority**: The Dawn theme is the foundational visual mode that demonstrates the core glassmorphism design and brand identity. It is essential for thesis demos and represents the primary daytime experience.

**Independent Test**: Can be fully tested by opening the homepage during morning hours (or forcing Dawn mode) and verifying all visual elements match V2.0 design specifications. Delivers complete daytime user experience.

**Acceptance Scenarios**:

1. **Given** the user opens the app between 06:00-17:59 with auto theme mode enabled, **When** the homepage loads, **Then** the Dawn theme is displayed with warm amber primary color (#F5B041), bright café background, and white glassmorphism cards.

2. **Given** the user is on the homepage in Dawn mode, **When** they view the hero banner, **Then** they see "朝·醒神推荐（Morning Awake）" title, the brand slogan "把时间，浪费在美好的朝暮里", and 3 recommended morning products.

3. **Given** the user is on the homepage in Dawn mode, **When** they view the category tabs, **Then** they see categories including "人气", "醒神早餐", "咖啡", "甜点" with the selected tab highlighted in amber.

---

### User Story 2 - Evening Homepage Experience (Priority: P1)

A member opens the app in the evening (18:00-05:59) and sees a calm, relaxing homepage with the "暮·微醺" (Evening Tipsy) theme. The night café background with city lights, silver/gold accent colors, and evening drink recommendations create a wind-down atmosphere.

**Why this priority**: The Dusk theme is equally essential as it demonstrates the dual-theme innovation and time-awareness that differentiates this system. Required for complete thesis demonstration.

**Independent Test**: Can be fully tested by opening the homepage during evening hours (or forcing Dusk mode) and verifying all visual elements match V2.0 design specifications. Delivers complete nighttime user experience.

**Acceptance Scenarios**:

1. **Given** the user opens the app between 18:00-05:59 with auto theme mode enabled, **When** the homepage loads, **Then** the Dusk theme is displayed with moon silver/gold primary color (#D5D8DC or #FAD7A0), night café background, and dark glassmorphism cards.

2. **Given** the user is on the homepage in Dusk mode, **When** they view the hero banner, **Then** they see "暮·微醺推荐（Evening Tipsy）" title, the brand slogan, and 3 recommended evening products (e.g., sparkling water, non-alcoholic cocktails, warm milk).

3. **Given** the user is on the homepage in Dusk mode, **When** they view the category tabs, **Then** they see categories including "人气", "微醺夜饮", "咖啡", "甜点" with the selected tab highlighted in gold/silver.

---

### User Story 3 - Manual Theme Toggle (Priority: P2)

A member wants to switch between Dawn and Dusk themes manually, regardless of the current time of day, for personal preference or to preview both themes during a demo.

**Why this priority**: Manual theme control is essential for thesis demonstrations and user preference. The toggle must be visible and functional, but it builds on the foundation of both themes being implemented.

**Independent Test**: Can be tested by clicking the theme toggle button in the top bar and observing the theme switch with smooth transition animation.

**Acceptance Scenarios**:

1. **Given** the user is on the homepage in Dawn mode, **When** they tap the moon icon (🌙) in the top bar, **Then** the homepage smoothly transitions to Dusk mode with all colors, backgrounds, and card styles changing accordingly.

2. **Given** the user is on the homepage in Dusk mode, **When** they tap the sun icon (☀️) in the top bar, **Then** the homepage smoothly transitions to Dawn mode with all colors, backgrounds, and card styles changing accordingly.

3. **Given** the user manually switches to Dusk mode during daytime, **When** they close and reopen the app, **Then** the homepage displays Dusk mode (persisted preference) rather than auto-switching to Dawn.

---

### User Story 4 - Browse Products via Category Tabs (Priority: P2)

A member browses products by tapping different category tabs on the homepage, filtering the product grid by category while maintaining the current theme's visual style.

**Why this priority**: Product browsing is the primary functionality that leads to ordering. The visual design must work correctly with category filtering.

**Independent Test**: Can be tested by tapping different category tabs and verifying the product grid updates while maintaining glassmorphism styling.

**Acceptance Scenarios**:

1. **Given** the user is on the homepage with the product grid visible, **When** they tap a category tab (e.g., "咖啡"), **Then** the product grid filters to show only products in that category, and the selected tab becomes visually highlighted.

2. **Given** the user has selected a category, **When** they tap a different category, **Then** the product grid smoothly updates to show the new category's products.

---

### User Story 5 - View Points and Membership Status (Priority: P3)

A member can see their current 光阴值 (points) balance and understand their membership growth at a glance from the homepage top bar.

**Why this priority**: Points display is a secondary but important feature for the loyalty system. It must be visible but doesn't affect core homepage functionality.

**Independent Test**: Can be tested by logging in as a member with known points balance and verifying the display in the top bar.

**Acceptance Scenarios**:

1. **Given** a logged-in member with 320 光阴值, **When** they view the homepage top bar, **Then** they see "光阴值 320" displayed with a hourglass icon in theme-appropriate colors.

2. **Given** a member with "烈阳" (Lv2) membership level, **When** they view the homepage, **Then** their avatar is displayed in the top bar and tapping it navigates to their profile.

---

### User Story 6 - Navigate via Bottom Navigation Bar (Priority: P2)

A member uses the bottom navigation bar to move between Home, Order, Orders, and My Profile pages while maintaining consistent visual styling.

**Why this priority**: Navigation is essential for app usability. The bottom nav must be styled consistently with the current theme.

**Independent Test**: Can be tested by tapping each navigation item and verifying navigation works and the current page indicator updates.

**Acceptance Scenarios**:

1. **Given** the user is on the homepage, **When** they view the bottom navigation bar, **Then** they see four items (首页, 点餐, 订单, 我的) with "首页" highlighted as the current page.

2. **Given** the user is on the homepage, **When** they tap "订单" in the bottom navigation, **Then** they are navigated to the orders list page, and the bottom nav updates to highlight "订单".

---

### User Story 7 - Add Product to Cart from Homepage (Priority: P3)

A member can add a recommended product to their cart directly from the hero section or product grid on the homepage.

**Why this priority**: Add-to-cart is a critical flow but is existing functionality. The focus is on ensuring it works correctly with the new visual design.

**Independent Test**: Can be tested by tapping "add to cart" button on a product card and verifying the cart updates.

**Acceptance Scenarios**:

1. **Given** the user is on the homepage viewing the hero section, **When** they tap the "加入购物车" button on a recommended product card, **Then** the product is added to their cart and visual feedback confirms the action.

2. **Given** the user is on the homepage viewing the product grid, **When** they tap a product card's add-to-cart button, **Then** the product is added to their cart.

---

### Edge Cases

- **What happens when the user's device time is incorrect?** The system should gracefully handle edge time cases (e.g., 05:59 vs 06:00) and not flicker between themes.
- **What happens when theme assets fail to load?** The system should display a reasonable fallback background color rather than broken images.
- **What happens when the user rapidly toggles the theme?** The transition animation should complete before a new toggle takes effect, or queue transitions smoothly.
- **What happens when API returns empty recommendations?** The hero section should display a graceful empty state or fallback to popular products.
- **What happens when the user is not logged in?** The top bar should hide points display and show login prompt instead of avatar.

---

## 4. Homepage Layout and Content (Dawn & Dusk)

### 4.1 Top Status & Navigation Bar

**Structure**:
- Left side: Brand logo/text "朝暮 Dawn & Dusk"
- Right side (from left to right):
  - "光阴值 [number]" with hourglass icon
  - User avatar (circular, 32px)
  - Theme toggle (capsule-shaped button with sun/moon icons)

**Dawn Mode**:
- Background: Semi-transparent white glassmorphism bar
- Text color: Roasted brown (#5D4037)
- Points text: Roasted brown with amber accent
- Sun icon: Highlighted in amber (#F5B041)
- Moon icon: Gray (inactive)

**Dusk Mode**:
- Background: Semi-transparent dark blue glassmorphism bar
- Text color: Off-white (#ECF0F1)
- Points text: Off-white with gold accent
- Moon icon: Highlighted in pale gold (#FAD7A0)
- Sun icon: Gray (inactive)

### 4.2 Hero Banner / Recommendation Section

**Structure**:
- Large horizontal glassmorphism card occupying visual center
- Left side: Title, slogan text
- Right side: 3 vertical product recommendation cards with images and add-to-cart buttons

**Dawn Mode**:
- Title: "朝·醒神推荐（Morning Awake）"
- Slogan: "把时间，浪费在美好的朝暮里"
- Card background: White glassmorphism with warm light tint
- Add-to-cart buttons: Amber (#F5B041)
- Recommended products: Coffee, breakfast items, refreshing beverages

**Dusk Mode**:
- Title: "暮·微醺推荐（Evening Tipsy）"
- Slogan: "把时间，浪费在美好的朝暮里"
- Card background: Dark blue glassmorphism with cool tint
- Add-to-cart buttons: Pale gold/silver (#FAD7A0 or #D5D8DC)
- Recommended products: Sparkling water, non-alcoholic cocktails, warm milk, evening desserts

### 4.3 Category Tabs

**Structure**:
- Horizontal scrollable pill-style buttons
- Categories adapt based on theme context but maintain consistent structure

**Dawn Mode**:
- Example categories: 人气 / 醒神早餐 / 咖啡 / 甜点
- Selected tab: Amber background highlight, dark text
- Unselected tabs: Neutral gray background, medium gray text

**Dusk Mode**:
- Example categories: 人气 / 微醺夜饮 / 咖啡 / 甜点
- Selected tab: Gold background highlight, dark text
- Unselected tabs: Dark glassmorphism background, light gray text

### 4.4 Product Grid

**Structure**:
- Two-column grid layout on mobile
- Adaptive columns on larger screens (up to 4 columns)
- Each card contains: Product image, Chinese name, English name, price, optional special tag

**Card Composition**:
- Left portion: Large product image (square, rounded corners)
- Right portion: Product name (Chinese primary, English secondary), price (bold, accent color), special tag badge (e.g., "晚霞" for Sunset level exclusive items)

**Dawn Mode**:
- Card background: White glassmorphism with soft shadow and warm glow border
- Text: Roasted brown for names, amber for prices
- Hover/tap state: Slight scale-up, deeper shadow
- Special tags: Soft pink/orange badge

**Dusk Mode**:
- Card background: Dark blue glassmorphism with subtle shadow
- Text: Off-white for names, pale gold for prices
- Hover/tap state: Slight scale-up, softer deeper shadow
- Special tags: Blue-purple badge

### 4.5 Bottom Navigation Bar

**Structure**:
- Full-width glassmorphism horizontal bar fixed at bottom
- Four navigation items: 首页 (Home), 点餐 (Order), 订单 (Orders), 我的 (My Profile)
- Each item: Icon above, label below
- Current page indicator: Short horizontal line above the active icon

**Dawn Mode**:
- Bar background: Semi-transparent white glassmorphism
- Active item: Amber icon and text, horizontal indicator line
- Inactive items: Gray icons and text

**Dusk Mode**:
- Bar background: Semi-transparent dark glassmorphism
- Active item: Pale gold icon and text, horizontal indicator line
- Inactive items: Light gray icons and text

---

## 5. Theme Behavior (Dawn vs Dusk)

### 5.0 Time Slots vs UI Themes (Dawn / Dusk)

This feature uses two related but distinct concepts:

1. **UI Themes (visual skins)**  
   - The homepage only has **two visual themes**:
     - **Dawn theme (daytime)** – bright, warm, café-in-daylight look.
     - **Dusk theme (nighttime)** – dark, deep, café-at-night look.
   - Theme selection is based on the current hour:
     - **Dawn theme**: `06:00–17:59` (hour `>= 6 && < 18`)
     - **Dusk theme**: `18:00–05:59` (hour `>= 18 || < 6`)
   - All layout, glassmorphism styling, and color palettes follow this 2-theme model.

2. **Time-based recommendation slots (business logic)**  
   - Product recommendations and hero banner copy can still use **three time-of-day slots**:
     - **Morning Awake (朝·醒)** – e.g. 06:00–11:00
     - **Noon Break (午·憩)** – e.g. 11:00–17:00
     - **Evening Tipsy (暮·微醺)** – e.g. 17:00–24:00
   - These slots are used by the backend (or configuration) to decide:
     - which products to recommend,
     - which title/text is shown in the `HeroBanner`.

**Relationship between the two:**

- The **UI theme** is always either **Dawn** or **Dusk** (2 skins total).
- The **time slots** for recommendations may be more granular (2–3 buckets) and are mapped onto the two themes:
  - Morning Awake + Noon Break → **Dawn theme** (daytime skin)
  - Evening Tipsy → **Dusk theme** (nighttime skin)
- Frontend should:
  - Use the theme rules above to choose Dawn vs Dusk for visuals, and
  - Use the backend-provided time slot / labels (e.g. "朝·醒", "午·憩", "暮·微醺") to render hero banner titles and copy.

This means there is **no third visual theme** for “Noon Break”; it is represented as a different recommendation slot and text **within the Dawn visual theme**.


### 5.1 Auto Mode

When in auto mode (default), the system selects the theme based on time of day:

- **Dawn Mode (06:00 - 17:59)**: Warm, bright, energizing visuals
  - Sub-periods for recommendations:
    - 06:00-11:00 "朝·醒" (Morning Awake): Breakfast and wake-up drinks
    - 11:00-17:59 "午·憩" (Noon Break): Afternoon coffee and desserts
- **Dusk Mode (18:00 - 05:59)**: Cool, calm, relaxing visuals
  - 17:00-24:00 "暮·微醺" (Evening Tipsy): Evening drinks and wind-down options

The time source should be the user's local device time for immediate responsiveness.

### 5.2 Manual Mode

A capsule-shaped toggle button in the top bar allows users to manually switch themes:
- Tap the sun icon (☀️) to switch to Dawn mode
- Tap the moon icon (🌙) to switch to Dusk mode

When manually selected, the theme remains fixed until:
- The user toggles again, OR
- The user clears their preference (e.g., clearing browser storage)

### 5.3 Preference Persistence

- Manual theme selection is persisted to browser local storage
- On app load, check for stored preference:
  - If preference exists, apply that theme
  - If no preference, use auto mode based on current time
- A "reset to auto" option may be provided in settings (out of scope for this spec)

### 5.4 Transition Animation

Theme switches (whether auto or manual) should include smooth CSS transitions:
- Background images crossfade (approximately 300-500ms)
- Color variables transition smoothly
- No jarring visual jumps or flashes

---

## 6. Visual and Interaction Guidelines

### 6.1 Brand Colors

**Dawn Mode Palette**:
- Primary (Amber Yellow): #F5B041 - Buttons, price highlights, active icons
- Background (Soufflé White): #FCF9F2 - Overall page background base
- Text (Caramel Brown): #5D4037 - Primary text, headings
- Card Background: rgba(255, 255, 255, 0.7-0.85) with backdrop blur

**Dusk Mode Palette**:
- Primary (Pale Gold/Moon Silver): #FAD7A0 or #D5D8DC - Buttons, highlights, active icons
- Background (Indigo Blue): #1A2530 - Overall page background base
- Text (Cloud White): #ECF0F1 - Primary text, headings
- Card Background: rgba(30, 41, 51, 0.7-0.85) with backdrop blur

### 6.2 Glassmorphism Properties

All glassmorphism cards should have:
- **Opacity**: 70-85% transparency for card backgrounds
- **Blur**: `backdrop-filter: blur(10-20px)` for frosted glass effect
- **Border radius**: 12-16px for rounded corners
- **Border**: Subtle 1px border with semi-transparent white (Dawn) or dark (Dusk)
- **Shadow**: Soft box-shadow for depth (4-8px blur, low opacity)

### 6.3 Typography Hierarchy

- **Hero Title**: Large, bold, Chinese characters prominent
- **Product Name Chinese**: Medium-large, semi-bold
- **Product Name English**: Small, light weight, secondary color
- **Price**: Medium, bold, accent color
- **Labels/Tags**: Small, semi-bold, badge styling
- **Body Text**: Regular weight, comfortable line height

### 6.4 Interaction Expectations

**Tap/Hover Feedback**:
- Product cards: Scale up slightly (1.02-1.05x), shadow deepens
- Buttons: Background color darkens/lightens slightly, brief haptic-style feedback
- Category tabs: Background fill transition for selection state

**Add to Cart**:
- Tap the add button on a product card
- Button shows brief loading/success state
- Optional: Small toast notification "已加入购物车" appears briefly

**Navigation**:
- Bottom nav items highlight immediately on tap
- Page transition should be smooth (handled by router)

### 6.5 Responsiveness

- **Mobile (primary target)**: Full-width layout, 2-column product grid
- **Tablet**: Slightly wider cards, 3-column product grid possible
- **Desktop**: Maximum content width with centered layout, up to 4-column product grid
- Touch targets: Minimum 44x44px for all interactive elements

### 6.6 Copy and Labels

All copy must be consistent with design and requirements documents:
- Points: Always "光阴值" (never just "积分" or "points")
- Membership levels: 晨曦(Lv1), 烈阳(Lv2), 晚霞(Lv3), 繁星(Lv4)
- Time-based recommendations: "朝·醒推荐", "午·憩推荐", "暮·微醺推荐"
- Brand slogan: "把时间，浪费在美好的朝暮里"

---

## 7. Dependencies and Integration

### 7.1 Existing APIs to Consume

The homepage refresh relies on these existing backend APIs (no changes required):

1. **User Info** (`GET /api/user/me`): Provides current user's points balance, avatar, and level for the top bar display
2. **Recommended Products** (`GET /api/products/recommend`): Returns time-slot-based recommendations with `timeSlotCode`, `timeSlotName`, and `products` array for the hero section
3. **Category List** (`GET /api/categories`): Returns product categories for the category tabs
4. **Product List** (`GET /api/products?categoryId=X`): Returns products filtered by category for the product grid
5. **Cart Add** (`POST /api/cart`): Adds product to cart when user taps add-to-cart button

### 7.2 Data Mapping

- Hero section title derives from `timeSlotName` returned by `/api/products/recommend`
- Category tabs populate from `/api/categories` response
- Product grid populates from `/api/products` filtered by selected category
- Top bar points display uses `balance` from `/api/points/me` (or cached from `/api/user/me` if extended)

### 7.3 Existing Components to Reuse/Adapt

The refresh should adapt existing components where possible:
- Bottom navigation component (update styling, maintain navigation logic)
- Product card component (update styling, maintain data binding and actions)
- Theme store/context (update with new color variables and backgrounds)

---

## 8. Risks, Constraints, and Non-Goals

### 8.1 Constraints

1. **No Breaking API Changes**: All existing backend APIs must continue to work without modification. The frontend adapts to existing response structures.

2. **Performance**: The glassmorphism effects (blur, transparency) must not significantly degrade performance on typical student-grade hardware (mid-range mobile devices from 2020+).

3. **Existing Architecture**: Implementation must work within the existing `frontend-client` Vue 3 + Vite architecture without requiring framework migration or major restructuring.

4. **Browser Compatibility**: Must support modern browsers that support `backdrop-filter` (Safari, Chrome, Firefox, Edge). Graceful fallback for older browsers.

5. **Asset Size**: Background images and any new assets should be optimized for fast loading (< 500KB per large image, use appropriate compression).

### 8.2 Non-Goals

1. **Admin UI Redesign**: No changes to `frontend-admin` or any administrative interfaces
2. **Backend Changes**: No database schema changes, no API contract changes, no new endpoints
3. **Framework Migration**: No migration to a different frontend framework or major library changes
4. **New Business Features**: No new features like social sharing, notifications, etc.
5. **Internationalization**: No multi-language support changes; all text remains in Chinese with English brand names
6. **Accessibility Audit**: While reasonable accessibility should be maintained, a comprehensive WCAG audit is not in scope

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Homepage MUST display a glassmorphism-styled top bar with brand logo, points display, user avatar, and theme toggle
- **FR-002**: Homepage MUST display a hero banner section with time-based recommendation title, brand slogan, and 3 featured product cards
- **FR-003**: Homepage MUST display horizontal scrollable category tabs that filter the product grid
- **FR-004**: Homepage MUST display a two-column product grid with glassmorphism cards showing image, names, price, and optional tags
- **FR-005**: Homepage MUST display a fixed bottom navigation bar with four items (首页/点餐/订单/我的)
- **FR-006**: System MUST automatically select Dawn theme (06:00-17:59) or Dusk theme (18:00-05:59) based on local time
- **FR-007**: System MUST allow manual theme switching via the sun/moon toggle in the top bar
- **FR-008**: System MUST persist manual theme preference to local storage and respect it on subsequent visits
- **FR-009**: Theme transitions MUST include smooth CSS transitions (300-500ms) without jarring visual changes
- **FR-010**: Dawn theme MUST use amber primary color (#F5B041), warm white background, and bright café imagery
- **FR-011**: Dusk theme MUST use pale gold/silver primary color, dark blue background, and night café imagery
- **FR-012**: Product cards MUST respond to tap/hover with scale and shadow feedback
- **FR-013**: Add-to-cart buttons MUST be functional and add products to the user's cart via existing API
- **FR-014**: All text labels MUST use brand terminology (光阴值, membership level names, theme titles)
- **FR-015**: Homepage MUST work correctly for both logged-in users (showing points/avatar) and guests (showing login prompt)

### Key Entities

- **Theme State**: Current theme mode (dawn/dusk), manual override flag, persisted preference
- **Recommended Products**: Time-slot-aware product recommendations from backend API
- **Category**: Product category for filtering, sourced from backend API
- **Product**: Item displayed in grid, containing name, image, price, category, optional membership tag

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Homepage visual appearance matches V2.0 design document specifications for both Dawn and Dusk themes, validated by visual comparison
- **SC-002**: Theme auto-switching correctly applies Dawn theme during 06:00-17:59 and Dusk theme during 18:00-05:59 based on device local time
- **SC-003**: Manual theme toggle switches themes in under 500ms with smooth transition animation
- **SC-004**: User's manual theme preference persists across browser sessions (close and reopen app)
- **SC-005**: Existing flows (add to cart, navigate to cart/checkout/orders/profile) continue to function correctly from the homepage
- **SC-006**: Homepage loads completely (all visible content) in under 3 seconds on a typical 4G mobile connection
- **SC-007**: No backend API changes are required; existing APIs return compatible data
- **SC-008**: All brand terminology (光阴值, 晨曦/烈阳/晚霞/繁星, 朝·醒/暮·微醺) appears correctly per design document
- **SC-009**: Glassmorphism effects render correctly on iOS Safari, Android Chrome, and desktop Chrome/Firefox/Edge
- **SC-010**: The homepage can be demonstrated in thesis defense with clear Dawn/Dusk switching showing brand differentiation

---

## 9. Acceptance Criteria Checklist

For QA and manual testing:

- [ ] Opening the homepage during daytime (06:00-17:59) displays Dawn theme with correct colors and imagery
- [ ] Opening the homepage during nighttime (18:00-05:59) displays Dusk theme with correct colors and imagery
- [ ] Top bar shows brand logo "朝暮 Dawn & Dusk" on the left
- [ ] Top bar shows "光阴值 [number]" with hourglass icon for logged-in users
- [ ] Top bar shows user avatar (circular) that navigates to profile when tapped
- [ ] Top bar shows theme toggle that switches between sun (Dawn) and moon (Dusk) states
- [ ] Tapping theme toggle switches the entire homepage theme with smooth transition
- [ ] Hero banner displays correct time-based title ("朝·醒神推荐" or "暮·微醺推荐")
- [ ] Hero banner displays brand slogan "把时间，浪费在美好的朝暮里"
- [ ] Hero banner shows 3 recommended product cards with images and add-to-cart buttons
- [ ] Category tabs are displayed as horizontal scrollable pills
- [ ] Tapping a category tab filters the product grid to that category
- [ ] Selected category tab has visual highlight (amber/gold depending on theme)
- [ ] Product grid displays products in two columns on mobile
- [ ] Product cards show image, Chinese name, English name, and price
- [ ] Product cards have glassmorphism styling (transparent background, blur, rounded corners)
- [ ] Product cards respond to tap with scale/shadow feedback
- [ ] Add-to-cart buttons on product cards successfully add items to cart
- [ ] Bottom navigation bar displays four items: 首页, 点餐, 订单, 我的
- [ ] Current page (首页) is highlighted in bottom navigation
- [ ] Tapping other navigation items navigates to correct pages
- [ ] Theme preference persists after closing and reopening the app
- [ ] Glassmorphism blur effect renders correctly (no solid backgrounds on supported browsers)
- [ ] All images and backgrounds load without broken image icons
- [ ] Page performs acceptably without significant lag or jank on mobile devices
