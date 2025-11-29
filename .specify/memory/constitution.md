<!-- 
SYNC IMPACT REPORT
Version Change: N/A → 1.0.0
Status: Initial Constitution for Frontend-Client

Modified Principles:
- Established Principles I through IX covering Backend Integrity, Specs, Brand, Architecture, Auth, API, Quality, Performance, and Governance.

Added Sections:
- All sections are new for this scope.

Templates Requiring Updates (⚠ Pending):
- .specify/templates/plan-template.md (Check for alignment with Vue/Vite/Pinia stack and backend-first rules)
- .specify/templates/spec-template.md (Ensure UI/UX sections align with Brand/Theme specs)
- .specify/templates/tasks-template.md (Add tasks for "light testing" and theme verification)
- .specify/templates/commands/*.md (Review for obsolete references)

Follow-up:
- Ensure all future agent runs for this repo respect the "frontend-client ONLY" scope.
-->

# Dawn & Dusk Frontend-Client Constitution

## Core Principles

### I. Backend-First Integrity
- The backend REST APIs (Spring Boot + Spring Security + JWT + MyBatis-Plus + MySQL/Redis) already exist and are the source of truth for all business rules: ordering, payments, loyalty (光阴值), membership levels, time-slot based recommendations, cart behavior, coupons, etc.
- The front end MUST NOT re-implement complex business logic that already lives on the server (e.g., discount calculation, points accrual rules). It may only mirror simple rules needed for UX (e.g., client-side validation hints).
- If the API design doc or OpenAPI/Knife4j spec changes, those changes must be reflected in the `frontend-client` TypeScript models and API layer, not patched ad hoc in components.
- Any ambiguity or mismatch between backend behavior and the API/requirements docs must be recorded as “open questions”, not silently fixed in the browser.

### II. Specification Authority & Scope
- Primary sources of truth for behavior and content:
  - Requirements specification (SRS).
  - Page & module structure design for the front-end member/guest flows.
  - API design docs for public/guest/member endpoints (products, recommendations, cart, orders, points, coupons, profile, etc.).
  - Brand & UI visual design for “Dawn & Dusk / 朝暮” with dynamic themes, 光阴值, and membership levels.
- Precedence in case of conflict:
  1. Requirements + API design.
  2. Page/module structure.
  3. Brand copy and visual suggestions.
- Scope rules:
  - `frontend-client` serves guests (not logged in) and members (logged in users placing orders and using loyalty features).
  - Admin/staff flows (back-office management, staff order board, etc.) belong to `frontend-admin` and must not be implemented here.
  - Shared concepts (e.g., 光阴值, membership level names, product/time slots) must remain consistent with the admin side but are presented with user-centric UX.

### III. Brand, Experience, and Copy (Guest/Member Context)
- The client app is the primary brand touchpoint and must embody the “time, warmth, companionship” identity of “朝暮 / Dawn & Dusk”.
- Core brand elements for the client app:
  - Use “光阴值” as the term for points in all user-visible text.
  - Use the membership levels metaphor (晨曦 / 烈阳 / 晚霞 / 繁星) wherever membership level is shown (profile, points center, order completion, etc.).
  - Implement the dynamic dawn/dusk theme using CSS variables as described in the brand spec: time-based auto mode + explicit toggle (☀️ / 🌙).
  - Highlight time-based recommendations on the home page (朝·醒 / 午·憩 / 暮·微醺) based on backend recommendation endpoints and product time slots.
- Microcopy guidelines:
  - Prioritize warm, accessible, non-technical language, appropriate for a cafe brand.
  - Guide users gently through ordering, payment, pickup, and loyalty flows (e.g., clear CTAs, confirmations, and reassuring error states).
  - Use slogans like “朝暮与共，不止咖啡。” and secondary lines sparingly but strategically (e.g., landing hero, empty states, order success).

### IV. Front-End Architecture & Tech Stack
- Tech stack:
  - Vue 3 with Composition API.
  - Vite for dev/build; `frontend-client` dev server runs on port 5174 by default.
  - Vue Router 4 for SPA navigation (`/`, `/menu`, `/product/:id`, `/cart`, `/checkout`, `/orders`, `/points`, `/profile`, etc. according to the page structure doc).
  - Pinia for state management: current user, theme, cart, current order, points summary, etc.
  - Naive UI as the main component library, combined with Tailwind CSS + custom global styles for layout and dynamic theming.
- Structure guidelines for the client app:
  - `/views` for route-level pages (Home, Menu, ProductDetail, Cart, Checkout, Orders, PointsCenter, Profile, etc.).
  - `/components` for reusable presentation components (product cards, recommendation sections, points badges, etc.).
  - `/stores` for Pinia stores (auth/member, cart, theme, orders, points, etc.).
  - `/api` for typed API client modules that wrap HTTP calls to `/api/products`, `/api/products/recommend`, `/api/cart`, `/api/orders`, `/api/points`, `/api/coupons`, etc.
  - `/styles` (or equivalent) for global CSS variables and theme tokens.
- Prefer composables (e.g., `useTheme`, `useCart`, `usePagination`, `useQueryState`) for shared logic rather than duplicating in components.

### V. Authentication, Roles, and Flows
- Recognized user states:
  - Guest (未登录): can browse products, see time-based recommendations, and build a temporary cart (according to requirements).
  - Member (会员): can maintain a persistent cart, place orders, view order history, manage profile, and use loyalty features (points, coupons).
- Authentication:
  - Use documented auth endpoints (`/api/auth/**`) and JWT-based flow; persist tokens appropriately (e.g., memory + localStorage).
  - The client app must gracefully handle:
    - Anonymous usage transitioning to login/registration at checkout.
    - Token expiration and 401/403 responses (e.g., prompt login again without losing cart data).
- Authorization:
  - The client app must never show admin/staff-only options; those belong to separate apps.
  - Server-side checks remain mandatory; front-end visibility is a convenience, not security.

### VI. API Integration Principles (Client Side)
- All integrations must be derived from the API design doc and real responses (e.g., `/api/products`, `/api/products/recommend`, `/api/cart`, `/api/orders`, `/api/points`, `/api/coupons`).
- Implement a shared HTTP client module:
  - Base URL and timeout from environment.
  - JWT injection when a member is logged in.
  - Consistent handling of the `{ code, message, data }` pattern; expose a clean abstraction to views.
- For each major feature (menu browsing, product detail, cart, checkout, orders, points center, coupons), define explicit UI states:
  - Loading: skeletons/spinners, on-brand but unobtrusive.
  - Empty: meaningful messaging and suggestions (e.g., “购物车还是空的，去看看今日推荐吧。”).
  - Error: actionable and friendly, never raw stack traces or codes.
- Respect pagination and filters as defined in the API (e.g., `/api/products` with categoryId, keyword, page, size).

### VII. Quality, Testing, and Consistency
- Use TypeScript throughout the client app; avoid `any` unless strictly necessary and document why.
- Keep components small and focused; avoid God components, especially for complex flows like checkout.
- Apply consistent formatting and lint rules (ESLint + Prettier + TypeScript).
- Testing priorities:
  - Add at least light tests (unit or component) for:
    - Time-based recommendation rendering (correct labels for dawn/midday/dusk, correct handling of API data).
    - Cart and checkout happy path (from menu to order success).
    - Points display and membership level mapping (光阴值 + 等级名称).
- Prefer incremental refactors guided by this constitution rather than large rewrites.

### VIII. Performance, Responsiveness, and Accessibility
- Optimize for mobile-first usage; many users will order on phones.
- Use code splitting for large or less-frequent views (e.g., order history, points center) to keep the initial bundle small.
- Accessibility:
  - Semantic HTML for forms, lists, and navigation.
  - Proper labels, focus management, and keyboard navigation for critical flows (search, add to cart, checkout).
  - Theme colors must maintain sufficient contrast in both dawn and dusk modes, especially on small screens.

## Governance

### IX. Governance and Evolution
- Any new patterns (e.g., new composables, layout primitives, API helpers) must be documented briefly in a developer-facing README or notes file.
- Changes that affect shared concepts (time-slot codes, membership levels, points terminology) must stay aligned with the core specs and with `frontend-admin`, to keep the overall product coherent.
- When AI-generated code or plans conflict with this constitution or with `.specify/markdown`, the docs and constitution win; the AI output must be revised.
- Future expansions (e.g., multi-store, third-party payments, campaigns) should be added as new spec versions, not silently grafted onto the current behavior.

**Summary Reminder for Future Agent Runs**:
- The backend contracts and `.specify/markdown` documents are the non-negotiable source of truth.
- The `frontend-client` app is the primary brand experience for guests and members; it must emphasize time, warmth, and companionship through dynamic themes, 光阴值, membership levels, and time-based recommendations.
- Work in this repository is strictly limited to the `frontend-client` SPA; admin/staff features are handled by `frontend-admin` in a separate codebase.
- The main goal is a polished, mobile-friendly, demo-ready member-facing experience that integrates cleanly with the existing backend APIs.

**Version**: 1.0.0 | **Ratified**: 2025-11-27 | **Last Amended**: 2025-11-27