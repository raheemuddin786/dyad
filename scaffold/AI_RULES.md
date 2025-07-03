## ✅ React + TypeScript System Prompt (Non-Next.js)

---

### 🔧 Tech Stack & Structure

- Use **React + TypeScript** (no Next.js).
- **Next.js is strictly prohibited**—do not import or use any Next.js-specific packages, components, or logic.
- Use **React Router v6+** for routing.
- Folder structure under `src/`:
  - `pages/` – screens (route-level components)
  - `components/` – reusable UI components
  - `hooks/` – custom React hooks
  - `contexts/` – global/shared state
  - `utils/` – helper functions/utilities

---

### 🚦 Routing

- Wrap the entire app with `<BrowserRouter>` in `main.tsx` or `index.tsx`.
- Define routes in `App.tsx` using `<Routes>` and `<Route>`.
- Use routing hooks (`useNavigate`, `useLocation`, `useParams`) only **inside** components wrapped with `<Router>`.
  - In context/global files, wrap usage in guards or delay until router is mounted.
- All pages must include:
  - `Navbar.tsx`
  - `MenuBar.tsx` or `Sidebar.tsx`
  - `Breadcrumb.tsx` (dynamic using `useLocation()` or `useMatches()`)
  - Auth session-based conditional rendering (e.g., menu visibility)

---

### 🎨 Styling & UI

- Use **Tailwind CSS** only. No external CSS or inline styles unless essential.
- Use **shadcn/ui** as the primary UI library.
  - All **shadcn/ui components and dependencies are pre-installed**.
  - Use prebuilt components by importing them directly—**do not modify these files**.
  - For customizations, create new or wrapper components in `src/components/`.
- All necessary **Radix UI components are already installed**.
- Use `lucide-react` (preferred) or `react-icons` for iconography.

- Use **Tailwind CSS** only. No external CSS or inline styles unless essential.
- Use **shadcn/ui** as the primary UI library.
  - Do **not** modify core shadcn/ui or Radix components directly.
  - For customizations, create wrapper or extended components under `src/components/`.
- Use `lucide-react` (preferred) or `react-icons` for iconography.

---

### 🌗 Theming

- Support **light**, **dark**, and **system default** themes.
- Use Tailwind’s `dark:` class strategy (`darkMode: 'class'` in `tailwind.config.js`).
- Control theme using a global provider (`src/contexts/ThemeContext.tsx`).
- Validate all components and pages in each theme mode.

---

### 🧩 Components & Pages

- All components must be:
  - Reusable
  - Type-safe (with strict TypeScript)
  - Theming-compatible
  - Modular and maintainable
- The root route (`/`) must render `src/pages/Index.tsx`.
  - New features or components should be linked/tested here for visibility.
- All pages must follow a consistent structure:
  - Include `Navbar`, `MenuBar/Sidebar`, `Breadcrumb`, and theme toggle.
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

---

### 🔐 Safe Hook Usage

- Do **not** use React Router hooks (`useNavigate`, `useLocation`, etc.) outside components or before `<BrowserRouter>` is mounted.
- In shared contexts (e.g., `AuthContext`), wrap navigation logic with guards.
- Prefer a custom wrapper like `useSafeNavigate()` when needed.

---

### 🧪 Validation Checklist

| Area                    | Requirement                                                                   |
| ----------------------- | ----------------------------------------------------------------------------- |
| **Routing**             | `<Routes>` structure defined in `App.tsx`, no Next.js routing                 |
| **Router Hooks**        | Used only within `<Router>` with proper guards                                |
| **Theme Switching**     | Light, Dark, and System modes function correctly everywhere                   |
| **Component Structure** | Typed, reusable, modular, maintainable                                        |
| **Breadcrumbs**         | Dynamic and route-aware (`useLocation` or `useMatches`)                       |
| **Menu/Nav/Breadcrumb** | Present, consistent, and conditional on auth session                          |
| **Responsiveness**      | Layout and components adapt across device sizes                               |
| **UI Consistency**      | Unified style, color, theme, layout, routing, validation, component structure |
| **Customizations**      | shadcn/Radix components are extended, not modified in-place                   |
