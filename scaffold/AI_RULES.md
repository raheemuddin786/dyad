## React + TypeScript System Prompt (Non-Next.js)

### Tech Stack & Structure

- Use React + TypeScript (no Next.js).
- Next.js is strictly prohibited - do not import or use any Next.js-specific packages, components, or logic.
- Use @tanstack/react-router (v6+) for all routing - react-router-dom is prohibited.
  - @tanstack/react-router is pre-installed in the project
- Folder structure under src/:
  - pages/ - screens (route-level components)
  - components/ - reusable UI components
  - hooks/ - custom React hooks
  - contexts/ - global/shared state
  - utils/ - helper functions/utilities

### Routing

- **Required**: All routing must use @tanstack/react-router (minimum v6.4+)
- **Prohibited**: Any imports from next/navigation, next/router, or react-router-dom
- **Configuration**:
  - Create router instance using `createBrowserRouter`
  - Define routes using `createRoutesFromElements` for JSX syntax
  - Wrap app with `<RouterProvider router={router}>`
- **Type Safety**:
  - Define route types using `Route` type utilities
  - Use `RegisteredRouter` for full type inference
  - Create route object with `routeTree` for type-safe navigation
- **Required Components**:
  - All pages must include:
    - Navbar with type-safe links
    - MenuBar/Sidebar with route-aware highlighting
    - Breadcrumb using `useMatches()`
    - Auth session-based conditional rendering

### Styling & UI

- Use Tailwind CSS only. No external CSS or inline styles unless essential.
- Use shadcn/ui as the primary UI library.
  - All shadcn/ui components and dependencies are pre-installed.
  - Use prebuilt components by importing them directly - do not modify these files.
  - For customizations, create new or wrapper components in src/components/.
- All necessary Radix UI components are already installed.
- Use lucide-react (preferred) or react-icons for iconography.

### Theming

- Support light, dark, and system default themes.
- Use Tailwind's dark: class strategy (darkMode: 'class' in tailwind.config.js).
- Control theme using a global provider (src/contexts/ThemeContext.tsx).
- Validate all components and pages in each theme mode.

### Components & Pages

- All components must be:
  - Reusable
  - Type-safe (with strict TypeScript)
  - Theming-compatible
  - Modular and maintainable
- The root route (/) must render src/pages/Index.tsx.
  - New features or components should be linked/tested here for visibility.
- All pages must follow a consistent structure:
  - Include Navbar, MenuBar/Sidebar, Breadcrumb, and theme toggle.
  - Respect and react to auth session state.
  - Maintain consistency in:
    - UI design
    - Colors
    - Layout
    - Responsive behavior
    - Hook structure
    - Routing patterns
    - Validation and user feedback
    - Theme mode compatibility

### Safe Hook Usage

- Do not use router hooks (useNavigate, useLocation, etc.) outside components or before Router is mounted.
- In shared contexts (e.g., AuthContext), wrap navigation logic with guards.
- Prefer a custom wrapper like useSafeNavigate() when needed.
- For type-safe navigation:
  - Use `Link` component from @tanstack/react-router
  - Use `useNavigate` with typed route names
  - Create navigation utilities with route type constraints

### Validation Checklist

Area Requirement
Routing Uses @tanstack/react-router exclusively, no Next.js/react-router-dom
Router Hooks Used only within Router with proper guards and type safety
Type Safety Full route types defined using Route utilities
Navigation All links and navigation are type-checked against route config
Theme Switching Light, Dark, and System modes function correctly everywhere
Component Structure Typed, reusable, modular, maintainable
Breadcrumbs Dynamic and route-aware (useMatches)
Menu/Nav/Breadcrumb Present, consistent, and conditional on auth session
Responsiveness Layout and components adapt across device sizes
UI Consistency Unified style, color, theme, layout, routing, validation, component structure
Customizations shadcn/Radix components are extended, not modified in-place
