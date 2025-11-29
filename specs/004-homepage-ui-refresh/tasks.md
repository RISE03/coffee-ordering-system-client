# Tasks: Frontend Client Homepage UI Refresh for Dawn & Dusk V2.0

**Input**: Design documents from `/specs/004-homepage-ui-refresh/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)
**Branch**: `004-homepage-ui-refresh`

**Tests**: Not explicitly requested in the feature specification. Focus on manual QA and visual verification.

**Organization**: Tasks are grouped by the 7 phases defined in plan.md, with user stories mapped to their implementation tasks.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task contributes to (US1-US7)
- Include exact file paths in descriptions

---

## Phase 1: Foundation & Theme Enhancement

**Purpose**: Audit current implementation, enhance theme system with glassmorphism support, and prepare background assets

### 1.1 Baseline Review and Design Gap Analysis

- [ ] T001 Audit current HomeView.vue structure and identify sections to replace in `src/views/HomeView.vue`
- [ ] T002 [P] Audit current theme CSS variables in `src/style.css` against V2.0 Dawn/Dusk palettes
- [ ] T003 [P] Verify theme store supports auto/manual/persistence behaviors in `src/stores/theme.ts`
- [ ] T004 [P] Identify missing API modules for products and user points in `src/api/`

### 1.2 Theme System Enhancement

- [ ] T005 Add glassmorphism CSS utility classes (glass-card, glass-nav, blur levels) in `src/style.css`
- [ ] T006 [P] Define Dawn-specific glassmorphism variables (white glass, warm tint, soft shadow) in `src/style.css`
- [ ] T007 [P] Define Dusk-specific glassmorphism variables (dark glass, cool tint, subtle shadow) in `src/style.css`
- [ ] T008 Add CSS transition rules for smooth theme switching (300-500ms) in `src/style.css`
- [ ] T009 [P] Extend Tailwind config with glassmorphism utilities if needed in `tailwind.config.js`
- [ ] T010 Update theme store time ranges to 06:00-17:59 Dawn, 18:00-05:59 Dusk in `src/stores/theme.ts`

### 1.3 Background Assets Preparation

- [ ] T011 [P] Add Dawn mode background image (bright cafe interior) to `public/images/backgrounds/dawn-bg.webp`
- [ ] T012 [P] Add Dusk mode background image (night cafe, city lights) to `public/images/backgrounds/dusk-bg.webp`
- [ ] T013 Create fallback solid colors for browsers without image support in `src/style.css`

**Checkpoint**: Theme foundation ready - glassmorphism utilities and backgrounds available

---

## Phase 2: API & Data Layer

**Purpose**: Create API modules and Pinia store for products, categories, and recommendations

### 2.1 TypeScript Types

- [ ] T014 Define TypeScript types for Product, Category, Recommendation, TimeSlot in `src/types/product.ts`

### 2.2 Product API Module

- [ ] T015 [P] Create products API module with getRecommendations, getCategories, getProductsByCategory in `src/api/products.ts`
- [ ] T016 [P] Create user API module for getUserPoints (光阴值 display) in `src/api/user.ts`

### 2.3 Product Store

- [ ] T017 Create product store with state: recommendations, categories, selectedCategory, products in `src/stores/product.ts`
- [ ] T018 Implement fetchRecommendations action (calls /api/products/recommend) in `src/stores/product.ts`
- [ ] T019 Implement fetchCategories action (calls /api/categories) in `src/stores/product.ts`
- [ ] T020 Implement fetchProductsByCategory action (calls /api/products?categoryId=X) in `src/stores/product.ts`
- [ ] T021 Add computed for current timeSlotName from recommendations response in `src/stores/product.ts`

**Checkpoint**: Data layer ready - API calls and store available for components

---

## Phase 3: Homepage Layout & Components

**Purpose**: Build all new Vue components for the glassmorphism homepage design

### 3.1 Top Status Bar (HomeHeader) - US1, US2, US3, US5

- [ ] T022 [P] [US1] Create HomeHeader component structure with glassmorphism styling in `src/components/layout/HomeHeader.vue`
- [ ] T023 [US1] Add brand logo/text "朝暮 Dawn & Dusk" on left side in `src/components/layout/HomeHeader.vue`
- [ ] T024 [US5] Add "光阴值 [number]" display with hourglass icon (for logged-in users) in `src/components/layout/HomeHeader.vue`
- [ ] T025 [US5] Add circular user avatar that links to profile in `src/components/layout/HomeHeader.vue`
- [ ] T026 [US3] Add capsule-shaped theme toggle (sun/moon icons) in `src/components/layout/HomeHeader.vue`
- [ ] T027 [US1] Implement Dawn styling: white glass, roasted brown text, amber sun icon in `src/components/layout/HomeHeader.vue`
- [ ] T028 [US2] Implement Dusk styling: dark glass, off-white text, pale gold moon icon in `src/components/layout/HomeHeader.vue`
- [ ] T029 Handle guest state (hide points, show login prompt) in `src/components/layout/HomeHeader.vue`

### 3.2 Hero Banner Section - US1, US2, US7

- [ ] T030 [P] [US1] Create HeroBanner component as large horizontal glassmorphism card in `src/components/home/HeroBanner.vue`
- [ ] T031 [US1] Add left section: time-based title ("朝·醒神推荐" or "暮·微醺推荐") in `src/components/home/HeroBanner.vue`
- [ ] T032 [US1] Add left section: brand slogan "把时间，浪费在美好的朝暮里" in `src/components/home/HeroBanner.vue`
- [ ] T033 [P] [US7] Create RecommendedCard sub-component for featured products in `src/components/home/RecommendedCard.vue`
- [ ] T034 [US1] Add right section: 3 vertical product cards with images in `src/components/home/HeroBanner.vue`
- [ ] T035 [US7] Add "加入购物车" buttons with add-to-cart functionality in `src/components/home/RecommendedCard.vue`
- [ ] T036 [US1] Implement Dawn styling: white glass, amber buttons in `src/components/home/HeroBanner.vue`
- [ ] T037 [US2] Implement Dusk styling: dark glass, pale gold buttons in `src/components/home/HeroBanner.vue`
- [ ] T038 Handle empty recommendations state (fallback message or popular products) in `src/components/home/HeroBanner.vue`

### 3.3 Category Tabs - US4

- [ ] T039 [P] [US4] Create CategoryTabs component with horizontal scroll in `src/components/home/CategoryTabs.vue`
- [ ] T040 [US4] Render pill-style buttons for each category from API in `src/components/home/CategoryTabs.vue`
- [ ] T041 [US4] Implement selected state: amber (Dawn) / gold (Dusk) background highlight in `src/components/home/CategoryTabs.vue`
- [ ] T042 [US4] Implement unselected state: neutral gray (Dawn) / dark glass (Dusk) in `src/components/home/CategoryTabs.vue`
- [ ] T043 [US4] Emit category selection events to parent for filtering product grid in `src/components/home/CategoryTabs.vue`
- [ ] T044 [US4] Add hover/tap states with smooth transitions in `src/components/home/CategoryTabs.vue`

### 3.4 Product Grid - US4, US7

- [ ] T045 [P] [US4] Create ProductCard component with glassmorphism styling in `src/components/product/ProductCard.vue`
- [ ] T046 [US4] Add product image (square, rounded corners) in `src/components/product/ProductCard.vue`
- [ ] T047 [US4] Add product name (Chinese primary, English secondary) in `src/components/product/ProductCard.vue`
- [ ] T048 [US4] Add price with accent color (amber Dawn / pale gold Dusk) in `src/components/product/ProductCard.vue`
- [ ] T049 [US4] Add optional special tags (e.g., "晚霞" membership tag) in `src/components/product/ProductCard.vue`
- [ ] T050 [US4] Implement hover/tap state: scale up (1.02-1.05x), shadow deepens in `src/components/product/ProductCard.vue`
- [ ] T051 [US7] Add add-to-cart button with loading/success feedback in `src/components/product/ProductCard.vue`
- [ ] T052 [US1] Implement Dawn styling: white glass, warm glow border, roasted brown text in `src/components/product/ProductCard.vue`
- [ ] T053 [US2] Implement Dusk styling: dark glass, subtle shadow, off-white text in `src/components/product/ProductCard.vue`

### 3.5 Bottom Navigation Bar - US6

- [ ] T054 [P] [US6] Create BottomNav component as full-width glassmorphism bar in `src/components/layout/BottomNav.vue`
- [ ] T055 [US6] Add four nav items: 首页, 点餐, 订单, 我的 in `src/components/layout/BottomNav.vue`
- [ ] T056 [US6] Each item has icon above, label below in `src/components/layout/BottomNav.vue`
- [ ] T057 [US6] Add current page indicator (horizontal line above active icon) in `src/components/layout/BottomNav.vue`
- [ ] T058 [US1] Implement Dawn styling: white glass, amber active, gray inactive in `src/components/layout/BottomNav.vue`
- [ ] T059 [US2] Implement Dusk styling: dark glass, pale gold active, light gray inactive in `src/components/layout/BottomNav.vue`
- [ ] T060 [US6] Wire navigation to Vue Router in `src/components/layout/BottomNav.vue`
- [ ] T061 [US6] Ensure bottom nav is only visible on mobile (hide on desktop where header nav exists) in `src/components/layout/BottomNav.vue`

**Checkpoint**: All homepage components built - ready for view integration

---

## Phase 4: Homepage View Integration

**Purpose**: Assemble all components into the redesigned HomeView and adjust shared layout

### 4.1 HomeView Complete Redesign

- [ ] T062 Replace current HomeView content with new component structure in `src/views/HomeView.vue`
- [ ] T063 [US1] Add full-screen background layer with theme-aware cafe image in `src/views/HomeView.vue`
- [ ] T064 Integrate HomeHeader at top in `src/views/HomeView.vue`
- [ ] T065 Integrate HeroBanner below header in `src/views/HomeView.vue`
- [ ] T066 Integrate CategoryTabs below hero in `src/views/HomeView.vue`
- [ ] T067 Integrate ProductCard grid below tabs in `src/views/HomeView.vue`
- [ ] T068 Integrate BottomNav at bottom (mobile only) in `src/views/HomeView.vue`
- [ ] T069 Add loading states (skeletons) while data fetches in `src/views/HomeView.vue`
- [ ] T070 Add error states with retry functionality in `src/views/HomeView.vue`
- [ ] T071 [US4] Wire category selection to filter product grid in `src/views/HomeView.vue`
- [ ] T072 [US7] Wire add-to-cart buttons to cart store in `src/views/HomeView.vue`

### 4.2 Layout Adjustments

- [ ] T073 Conditionally hide AppHeader on homepage (HomeHeader is used instead) in `src/components/layout/MainLayout.vue`
- [ ] T074 Conditionally hide AppFooter on homepage (BottomNav is used instead on mobile) in `src/components/layout/MainLayout.vue`
- [ ] T075 Ensure other pages still use AppHeader and AppFooter normally in `src/components/layout/MainLayout.vue`

**Checkpoint**: HomeView fully integrated - all components assembled and data flows correctly

---

## Phase 5: Dawn vs Dusk Behavior

**Purpose**: Ensure automatic and manual theme switching works correctly with proper persistence

### 5.1 Time-Based Theme Logic - US1, US2

- [ ] T076 [US1] Verify theme store calculateTheme uses 06:00-17:59 Dawn, 18:00-05:59 Dusk in `src/stores/theme.ts`
- [ ] T077 [US1] Ensure auto-mode interval (60s) is active when mode is 'auto' in `src/stores/theme.ts`
- [ ] T078 Handle edge cases: prevent flickering at 05:59/06:00 boundary in `src/stores/theme.ts`

### 5.2 Manual Theme Toggle - US3

- [ ] T079 [US3] Verify HomeHeader theme toggle updates store mode to 'dawn' or 'dusk' in `src/components/layout/HomeHeader.vue`
- [ ] T080 [US3] Ensure manual selection persists to localStorage in `src/stores/theme.ts`
- [ ] T081 [US3] On app load, check for stored preference before applying auto in `src/stores/theme.ts`
- [ ] T082 [US3] Add smooth CSS transition for theme switch (300-500ms) in `src/style.css`

### 5.3 Theme-Aware Content - US1, US2

- [ ] T083 [US1] HeroBanner displays "朝·醒神推荐" in Dawn mode in `src/components/home/HeroBanner.vue`
- [ ] T084 [US2] HeroBanner displays "暮·微醺推荐" in Dusk mode in `src/components/home/HeroBanner.vue`
- [ ] T085 [US4] Category tabs adjust visible categories based on theme context if backend supports in `src/components/home/CategoryTabs.vue`

**Checkpoint**: Theme behavior complete - auto/manual switching works with persistence

---

## Phase 6: Integration & Regression Safety

**Purpose**: Verify existing flows work correctly with new UI and ensure no regressions

### 6.1 Core Flow Verification - US7

- [ ] T086 [US7] Test add-to-cart from hero section product cards (manual verification)
- [ ] T087 [US7] Test add-to-cart from product grid cards (manual verification)
- [ ] T088 [US6] Verify navigation to cart via BottomNav "点餐" or cart icon (manual verification)
- [ ] T089 [US6] Verify navigation to orders via BottomNav "订单" (manual verification)
- [ ] T090 [US5] Verify navigation to profile via BottomNav "我的" or avatar (manual verification)
- [ ] T091 Test checkout flow from cart is unaffected by homepage changes (manual verification)

### 6.2 Shared Component Compatibility

- [ ] T092 Verify /menu page still uses AppHeader (not HomeHeader) in `src/views/MenuView.vue`
- [ ] T093 Verify /cart, /checkout, /orders pages use normal layout (manual verification)
- [ ] T094 Verify /profile page uses normal layout in `src/views/ProfileView.vue`
- [ ] T095 Verify theme changes apply consistently across all screens (manual verification)

### 6.3 Edge Case Handling

- [ ] T096 Test behavior when recommendations API returns empty in `src/components/home/HeroBanner.vue`
- [ ] T097 Test behavior when background images fail to load (fallback color) in `src/views/HomeView.vue`
- [ ] T098 Test rapid theme toggle (queue transitions, no glitching) in `src/stores/theme.ts` and `src/style.css`
- [ ] T099 Test behavior for not-logged-in users (hide points, show login prompt) in `src/components/layout/HomeHeader.vue`
- [ ] T100 Verify glassmorphism fallback on browsers without backdrop-filter support in `src/style.css`

**Checkpoint**: Integration verified - existing flows work, no regressions

---

## Phase 7: Polish & QA

**Purpose**: Refine micro-interactions, verify responsiveness, and validate against spec acceptance criteria

### 7.1 Micro-Interactions

- [ ] T101 Add hover scale + shadow on product cards in `src/components/product/ProductCard.vue`
- [ ] T102 [P] Add button press feedback (color change, haptic-style) across all buttons
- [ ] T103 Add loading spinner or skeleton for product grid while fetching in `src/views/HomeView.vue`
- [ ] T104 Add brief toast notification "已加入购物车" on add-to-cart success (cart integration)
- [ ] T105 Ensure touch targets are minimum 44x44px across all interactive elements

### 7.2 Responsiveness

- [ ] T106 Test homepage on mobile (320px - 480px): 2-column grid, bottom nav visible
- [ ] T107 Test homepage on tablet (768px): 3-column grid possible
- [ ] T108 Test homepage on desktop (1024px+): 4-column grid, AppHeader visible, BottomNav hidden
- [ ] T109 Verify hero banner adapts to smaller screens (stack layout if needed) in `src/components/home/HeroBanner.vue`

### 7.3 Performance Verification

- [ ] T110 Measure initial load time on 4G (target: <3s)
- [ ] T111 Verify theme transition completes in <500ms
- [ ] T112 Ensure backdrop-filter blur doesn't cause jank on mid-range devices
- [ ] T113 Optimize background images if load time is impacted in `public/images/backgrounds/`

### 7.4 Manual QA Checklist (from spec.md)

- [ ] T114 Verify: Opening homepage 06:00-17:59 displays Dawn theme (amber, bright cafe, white glass)
- [ ] T115 Verify: Opening homepage 18:00-05:59 displays Dusk theme (pale gold, night cafe, dark glass)
- [ ] T116 Verify: Top bar shows brand logo "朝暮 Dawn & Dusk" on left
- [ ] T117 Verify: Top bar shows "光阴值 [number]" with hourglass icon (logged-in users)
- [ ] T118 Verify: Top bar shows circular avatar that navigates to profile
- [ ] T119 Verify: Theme toggle switches between sun (Dawn) and moon (Dusk) states
- [ ] T120 Verify: Theme switch has smooth transition (no jarring jumps)
- [ ] T121 Verify: Hero banner displays correct time-based title
- [ ] T122 Verify: Hero banner displays slogan "把时间，浪费在美好的朝暮里"
- [ ] T123 Verify: Hero banner shows 3 recommended products with add-to-cart buttons
- [ ] T124 Verify: Category tabs are horizontal scrollable pills
- [ ] T125 Verify: Tapping category tab filters product grid
- [ ] T126 Verify: Selected tab has theme-appropriate highlight
- [ ] T127 Verify: Product grid displays two columns on mobile
- [ ] T128 Verify: Product cards show image, Chinese name, English name, price
- [ ] T129 Verify: Product cards have glassmorphism styling
- [ ] T130 Verify: Product cards respond to tap with scale/shadow feedback
- [ ] T131 Verify: Add-to-cart buttons add items to cart successfully
- [ ] T132 Verify: Bottom nav displays: 首页, 点餐, 订单, 我的
- [ ] T133 Verify: Current page highlighted in bottom nav
- [ ] T134 Verify: Other nav items navigate correctly
- [ ] T135 Verify: Theme preference persists after app reload
- [ ] T136 Verify: Glassmorphism blur renders correctly on supported browsers
- [ ] T137 Verify: All images load without broken icons
- [ ] T138 Verify: No significant lag or jank on mobile devices

**Checkpoint**: Polish complete - all acceptance criteria validated

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Foundation)**: No dependencies - can start immediately
- **Phase 2 (API & Data)**: Depends on T014 (types) completing first
- **Phase 3 (Components)**: Depends on Phase 1 (glassmorphism CSS) and Phase 2 (store/types)
- **Phase 4 (Integration)**: Depends on Phase 3 (all components built)
- **Phase 5 (Theme Behavior)**: Can run in parallel with Phase 4 for theme.ts tasks
- **Phase 6 (Regression)**: Depends on Phase 4 and Phase 5 completing
- **Phase 7 (Polish & QA)**: Depends on Phase 6 completing

### User Story Dependencies

| User Story | Description | Priority | Can Start After |
|------------|-------------|----------|-----------------|
| US1 | Morning Homepage Experience (Dawn theme) | P1 | Phase 2 complete |
| US2 | Evening Homepage Experience (Dusk theme) | P1 | Phase 2 complete |
| US3 | Manual Theme Toggle | P2 | US1 + US2 (both themes needed) |
| US4 | Browse Products via Category Tabs | P2 | Phase 2 complete |
| US5 | View Points and Membership Status | P3 | Phase 2 complete |
| US6 | Navigate via Bottom Navigation Bar | P2 | Phase 2 complete |
| US7 | Add Product to Cart from Homepage | P3 | Phase 2 complete + cart store |

### Within Each Phase

- CSS utilities (T005-T009) before component styling
- Types (T014) before API modules (T015-T016)
- API modules before store (T017-T021)
- Store before components
- Components before view integration (Phase 4)

### Parallel Opportunities

**Phase 1:**
- T002, T003, T004 can run in parallel (auditing tasks)
- T006, T007 can run in parallel (Dawn/Dusk CSS)
- T011, T012 can run in parallel (background images)

**Phase 2:**
- T015, T016 can run in parallel (API modules)

**Phase 3:**
- T022, T030, T039, T045, T054 can run in parallel (component scaffolding)

---

## Parallel Example: Component Scaffolding

```bash
# Launch all component scaffolds together (after Phase 2 complete):
Task: "Create HomeHeader component structure in src/components/layout/HomeHeader.vue"
Task: "Create HeroBanner component in src/components/home/HeroBanner.vue"
Task: "Create CategoryTabs component in src/components/home/CategoryTabs.vue"
Task: "Create ProductCard component in src/components/product/ProductCard.vue"
Task: "Create BottomNav component in src/components/layout/BottomNav.vue"
```

---

## Implementation Strategy

### MVP First (User Story 1 + 2 Only)

1. Complete Phase 1: Foundation & Theme (T001-T013)
2. Complete Phase 2: API & Data Layer (T014-T021)
3. Complete Phase 3: Build components for US1 + US2 (Dawn/Dusk themes)
4. Complete Phase 4: Integrate HomeView (T062-T075)
5. Complete Phase 5: Theme behavior (T076-T085)
6. **STOP and VALIDATE**: Both Dawn and Dusk themes display correctly
7. Demo/thesis presentation ready

### Incremental Delivery

1. Foundation + API → Data layer ready
2. Add Dawn theme (US1) → Test → First visual milestone
3. Add Dusk theme (US2) → Test → Dual theme working
4. Add Theme Toggle (US3) → Test → Manual switching works
5. Add Category Filtering (US4) → Test → Product browsing works
6. Add Points/Avatar (US5) → Test → Member info visible
7. Add Bottom Nav (US6) → Test → Mobile navigation works
8. Add Cart Integration (US7) → Test → Full functionality
9. Polish phase → Final QA

---

## Summary

| Phase | Task Count | Key Deliverables |
|-------|------------|------------------|
| Phase 1 | 13 | Glassmorphism CSS, background images, theme store updates |
| Phase 2 | 8 | TypeScript types, API modules, product store |
| Phase 3 | 40 | HomeHeader, HeroBanner, CategoryTabs, ProductCard, BottomNav |
| Phase 4 | 14 | HomeView integration, MainLayout adjustments |
| Phase 5 | 10 | Auto/manual theme switching, persistence |
| Phase 6 | 15 | Core flow verification, edge case handling |
| Phase 7 | 38 | Micro-interactions, responsiveness, QA checklist |
| **Total** | **138** | Complete homepage UI refresh |

### Tasks by User Story

| Story | Tasks | Description |
|-------|-------|-------------|
| US1 | 20 | Dawn theme visual implementation |
| US2 | 11 | Dusk theme visual implementation |
| US3 | 5 | Manual theme toggle |
| US4 | 13 | Category tabs and product browsing |
| US5 | 4 | Points display and avatar |
| US6 | 10 | Bottom navigation |
| US7 | 8 | Add to cart functionality |

### Suggested MVP Scope

**Minimum for thesis demo**: Complete Phases 1-5 (87 tasks)
- Delivers: Full Dawn/Dusk glassmorphism homepage with auto/manual theme switching
- Excludes: Extensive regression testing, all polish items, full QA checklist

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- All CSS changes should respect existing theme variable structure
- Background images should be WebP format with JPEG fallback, <500KB each
- Commit after each logical group of tasks
- Stop at any checkpoint to validate progress
