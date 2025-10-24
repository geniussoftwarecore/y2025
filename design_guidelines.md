# Design Guidelines: Yemen Hybrid Workshop Management Platform

## Design Approach

**Primary Framework**: Material Design 3 with custom refinements for enterprise workflow optimization

**Rationale**: This is a multi-role, data-intensive workshop management system requiring:
- Exceptional information hierarchy for complex workflows
- Robust RTL/LTR bilingual support
- Professional credibility for B2B context
- Consistent patterns across dense feature set

**Inspiration References**:
- **Linear**: Clean work order tracking, status management, keyboard shortcuts
- **Notion**: Flexible data tables, inline editing, smooth transitions
- **Intercom**: Customer chat interface, conversation threading
- **Stripe Dashboard**: Reports and analytics visualization

---

## Core Design Elements

### A. Typography

**Font Families** (via Google Fonts):
- **Primary (Latin)**: Inter (400, 500, 600, 700)
- **Arabic Support**: Noto Sans Arabic (400, 500, 600, 700)
- **Monospace (data/codes)**: JetBrains Mono (400, 500)

**Scale & Hierarchy**:
- **Display/Hero**: 3xl (30px) / 4xl (36px) - Bold (700)
- **Page Headers**: 2xl (24px) - Semibold (600)
- **Section Headers**: xl (20px) - Semibold (600)
- **Card Titles**: lg (18px) - Medium (500)
- **Body Text**: base (16px) - Regular (400)
- **Labels/Captions**: sm (14px) - Medium (500)
- **Metadata/Hints**: xs (12px) - Regular (400)

**RTL/LTR Considerations**:
- Maintain identical hierarchy in both directions
- Arabic text may need slightly larger base size (17px instead of 16px) for readability
- Adjust line-height: 1.6 for Arabic, 1.5 for English

---

### B. Layout System

**Spacing Primitives** (Tailwind units):
- **Micro spacing**: 1, 2 (4px, 8px) - Component internal padding, icon gaps
- **Standard spacing**: 4, 6, 8 (16px, 24px, 32px) - Card padding, section gaps
- **Macro spacing**: 12, 16 (48px, 64px) - Page sections, major divisions

**Grid & Containers**:
- **Max content width**: 7xl (1280px) for dashboard layouts
- **Sidebar width**: 64 (256px) fixed on desktop, collapsible on tablet
- **Main content**: Fluid with max-w-6xl for comfortable reading
- **Card grids**: 12-column system
  - Desktop: 3-4 columns for service cards, 2 columns for work orders
  - Tablet: 2 columns max
  - Mobile: Single column stack

**Dashboard Structure**:
```
[Fixed Sidebar - 256px] [Main Content Area - Fluid]
                        [Header Bar - 64px height]
                        [Content - Scrollable]
                        [No sticky footer]
```

---

### C. Component Library

#### 1. Navigation & Layout

**Top Header** (64px height):
- Left: Yemen Hybrid logo (32px height) + breadcrumb navigation
- Center: Global search bar (max-w-md, rounded-lg with icon)
- Right: Language toggle (AR/EN pill toggle), notifications bell, user avatar dropdown

**Sidebar Navigation**:
- Collapsible on mobile/tablet
- Icon + label format
- Active state: Filled background (subtle), left border accent
- Grouping: Dividers between sections (Dashboard / Work / Management / Reports)
- Role-based visibility: Hide restricted routes entirely

**Breadcrumbs**:
- Gray text with chevron separators (auto-flip for RTL)
- Last item semibold, clickable ancestors

#### 2. Data Display

**Tables** (Work Orders, Users, Service Catalog):
- Sticky header row with sort indicators
- Alternating row backgrounds (very subtle)
- Row hover: Elevated shadow + background change
- Inline actions: Show on hover (edit/delete icons)
- Pagination: Bottom-aligned, showing "X-Y of Z results"
- Responsive: Convert to card list on mobile

**Cards** (Service Cards, Engineer Dashboards):
- Rounded corners (rounded-lg / 12px)
- Subtle shadow (shadow-sm), elevate on hover (shadow-md)
- Internal padding: p-6
- Header: Title + metadata row
- Body: Description/details with comfortable spacing
- Footer: Actions/status badges aligned right

**Status Badges**:
- Pill shape (rounded-full)
- Semantic colors: 
  - Pending: Amber background, darker text
  - In Progress: Blue background
  - Completed: Green background
  - Cancelled: Gray background
- Size: px-3 py-1, text-sm, font-medium

**Data Visualization** (Reports Dashboard):
- Use Recharts/Chart.js
- Chart cards: White background, shadow-sm, p-6
- Consistent color palette across all charts
- Tooltips on hover with precise values
- Export button (top-right corner of each chart)

#### 3. Forms & Inputs

**Input Fields**:
- Height: h-12 (48px) for comfortable touch targets
- Border: 1.5px solid, rounded-lg
- Focus state: Border accent color, subtle glow shadow
- Label: Above field, text-sm, semibold, mb-2
- Helper text: Below field, text-xs, gray
- Error state: Red border + red helper text

**Buttons**:
- **Primary**: Filled, semibold text, h-12, px-6, rounded-lg
- **Secondary**: Outlined (2px border), same dimensions
- **Ghost/Tertiary**: Text-only, hover background
- **Icon buttons**: Square (h-10 w-10), rounded-md
- Loading state: Spinner replaces text, button disabled
- Disabled: Reduced opacity (0.5), cursor-not-allowed

**Dropdowns/Selects**:
- Match input field styling
- Chevron icon (auto-flip for RTL)
- Dropdown menu: shadow-lg, rounded-lg, max-h-60 scrollable
- Menu items: px-4 py-2, hover background

**Multi-step Forms** (Work Order Creation):
- Step indicator at top: Circles with connecting lines
- Active step: Filled circle, semibold label
- Progress bar below steps
- Previous/Next buttons at bottom-right

#### 4. Chat Interface

**Internal Chat** (Team Communication):
- **Layout**: 3-column
  - Left (240px): Channel list with unread counts
  - Center (fluid): Message thread
  - Right (280px, collapsible): Thread details/file attachments
- **Messages**: 
  - Own messages: Aligned right, filled background
  - Others: Aligned left, bordered background
  - Timestamp: Below message, text-xs, gray
  - Avatar: 32px circle next to message
- **Input**: Fixed bottom bar, h-16, auto-expanding textarea

**Customer Chat** (Sales Interface):
- **Customer View**: Floating widget (bottom-right), expandable overlay
  - Collapsed: Chat bubble icon with unread badge
  - Expanded: 380px x 600px card, shadow-xl
- **Sales Dashboard View**: Full-page with customer list (left) + active chat (right)
- **Queue System**: Visual indicator of waiting customers with color coding

#### 5. Work Order Tracking

**Status Timeline** (Vehicle Service Progress):
- Horizontal stepper showing: Received → Diagnosed → In Progress → Quality Check → Completed
- Icons for each stage
- Active stage: Highlighted with timestamp
- Completed stages: Checkmark icon, muted

**Work Order Card**:
- Top: Vehicle info (Make/Model/VIN/Plate) with small vehicle icon
- Middle: Service list with checkboxes, assigned engineer avatar
- Bottom: Status badge + estimated completion time
- Action buttons: Update Status, Add Notes, View History

#### 6. Modals & Overlays

**Modal Dialogs**:
- Backdrop: Semi-transparent dark (bg-black/50)
- Modal: Centered, max-w-2xl, rounded-xl, shadow-2xl
- Header: p-6, border-bottom, with close icon (top-right)
- Body: p-6, scrollable if needed
- Footer: p-6, border-top, buttons aligned right

**Toast Notifications**:
- Position: Top-right (top-left for RTL)
- Auto-dismiss after 4s
- Types: Success (green), Error (red), Warning (amber), Info (blue)
- Include close button

---

### D. Animations

**Minimal, Purposeful Motion**:
- **Page transitions**: Fade in (150ms)
- **Modal open/close**: Scale + fade (200ms)
- **Dropdown menus**: Slide down (150ms)
- **Button hover**: Shadow elevation change (100ms)
- **Loading states**: Skeleton screens (shimmer effect), no spinners unless inline
- **Chat messages**: Slide in from bottom (200ms)

**No animations for**:
- Table sorting/filtering
- Form validation
- Chart rendering (data should appear instantly)

---

## Bilingual (AR/EN) Implementation

**Language Switcher**:
- Pill toggle in header: "EN | AR"
- Active language: Filled background
- Switches entire app direction + content

**RTL Adaptations**:
- Mirror all layouts: Sidebar flips to right, text alignment reverses
- Icons with directional meaning: Flip (chevrons, arrows)
- Numbers/dates: Keep LTR even in RTL context (standard Arabic practice)
- Forms: Labels and inputs align right, validation icons flip sides

**Testing Requirements**:
- Every screen must be tested in both AR and EN
- Long Arabic text should not break layouts
- Mixed content (English product names in Arabic UI) should be handled gracefully

---

## Role-Specific Dashboards

**Admin Dashboard**:
- Metrics grid (4 cards): Total Users, Active Work Orders, Monthly Revenue, Pending Tasks
- Quick actions: Add User, Create Service, View Reports
- Recent activity feed

**Engineer Dashboard**:
- Assigned work orders (kanban board or list)
- Today's schedule timeline
- Quick clock-in/out

**Customer Dashboard**:
- Active services (card list)
- Service history table
- Quick book service button

**Sales Dashboard**:
- Pending customer inquiries
- Active chat threads (priority sorted)
- Conversion metrics

---

## Images

**Hero Images**: Not applicable for this enterprise application. No marketing hero sections needed.

**Product/Service Images**:
- **Service Catalog**: Each service card should have a representative image (280px x 180px, rounded corners)
  - Example: Engine service shows engine bay, battery service shows battery, etc.
- **Spare Parts**: Thumbnail images (64px x 64px) in catalog listings

**Avatars**:
- User avatars throughout (32px, 40px, or 48px depending on context)
- Engineer profile photos in work order assignments
- Fallback: Colored circles with initials

**Dashboard Empty States**:
- Illustration when no data (e.g., "No active work orders" with small wrench icon illustration)

---

## Critical Quality Notes

- **Information Density**: Balance data richness with whitespace—don't cram, but don't waste space
- **Keyboard Navigation**: All forms and tables must be fully keyboard-accessible
- **Loading States**: Every async action shows clear feedback
- **Error Handling**: Friendly, bilingual error messages with recovery actions
- **Responsive Breakpoints**: Desktop (1280px+), Tablet (768px-1279px), Mobile (<768px)
- **Print Styles**: Reports must have clean print CSS for PDF export