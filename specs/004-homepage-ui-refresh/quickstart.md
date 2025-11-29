# Quickstart: Homepage UI Refresh Development

**Branch**: `004-homepage-ui-refresh`
**Feature**: Frontend Client Homepage UI Refresh for Dawn & Dusk V2.0

---

## Prerequisites

- Node.js 18+ and npm
- Backend API running on `http://localhost:8080` (Spring Boot)
- Git with branch `004-homepage-ui-refresh` checked out

## Setup

```bash
# Navigate to frontend-client
cd frontend-client

# Install dependencies
npm install

# Start development server (port 5174)
npm run dev
```

The app will be available at `http://localhost:5174`.

## Key Files to Know

### Theme System (Already Implemented)
- `src/stores/theme.ts` - Theme state management (dawn/dusk/auto modes)
- `src/style.css` - CSS variables for Dawn/Dusk colors
- `tailwind.config.js` - Tailwind theme extensions

### Homepage (To Be Modified)
- `src/views/HomeView.vue` - Main homepage view (complete redesign needed)
- `src/components/layout/MainLayout.vue` - Layout wrapper (needs conditional logic)

### New Components (To Create)
- `src/components/layout/HomeHeader.vue` - Glassmorphism top bar
- `src/components/layout/BottomNav.vue` - Mobile bottom navigation
- `src/components/home/HeroBanner.vue` - Hero recommendation section
- `src/components/home/CategoryTabs.vue` - Category pill tabs
- `src/components/home/RecommendedCard.vue` - Featured product cards
- `src/components/product/ProductCard.vue` - Glassmorphism product card

### API Layer (To Create)
- `src/api/products.ts` - Product & category API calls
- `src/api/user.ts` - User info API (points, level)
- `src/types/product.ts` - TypeScript types
- `src/stores/product.ts` - Products & categories store

## Theme Testing

To manually test Dawn vs Dusk themes:

```javascript
// In browser console
localStorage.setItem('dawn_dusk_theme_mode', 'dawn')  // Force Dawn
localStorage.setItem('dawn_dusk_theme_mode', 'dusk')  // Force Dusk
localStorage.removeItem('dawn_dusk_theme_mode')       // Reset to auto
location.reload()
```

Or use the theme toggle button in the top bar.

## API Endpoints (Backend)

| Endpoint | Purpose |
|----------|---------|
| `GET /api/products/recommend` | Time-slot recommendations |
| `GET /api/categories` | Category list |
| `GET /api/products?categoryId=X` | Products by category |
| `GET /api/user/me` | User info (points, avatar) |
| `POST /api/cart` | Add to cart |

## Design Reference

- Spec: `specs/004-homepage-ui-refresh/spec.md`
- V2.0 Design: `.specify/markdown/朝暮_品牌与UI视觉设计方案V2.0.md`

## Color Reference

### Dawn Mode (06:00-17:59)
- Primary: `#F5B041` (Amber Yellow)
- Background: `#FCF9F2` (Soufflé White)
- Text: `#5D4037` (Caramel Brown)
- Glass: `rgba(255, 255, 255, 0.7-0.85)`

### Dusk Mode (18:00-05:59)
- Primary: `#FAD7A0` (Pale Gold) or `#D5D8DC` (Moon Silver)
- Background: `#1A2530` (Indigo Blue)
- Text: `#ECF0F1` (Cloud White)
- Glass: `rgba(30, 41, 51, 0.7-0.85)`

## Testing

```bash
# Run unit tests
npm run test

# Type check
npm run build
```

## Common Issues

1. **API 401 errors**: Login first or run backend with test user
2. **Theme not switching**: Clear localStorage and refresh
3. **Backdrop blur not working**: Check browser support for `backdrop-filter`
