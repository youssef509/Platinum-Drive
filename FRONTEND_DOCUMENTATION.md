# Platinum Drive — Frontend Documentation

> Copy-paste this file into any project's context to give an AI a complete picture of the UI design system, component library, pages, and interaction patterns used in **Platinum Drive**.

---

## Table of Contents

1. [Technology Stack](#1-technology-stack)
2. [Directory Structure](#2-directory-structure)
3. [Design System](#3-design-system)
4. [Pages & Routes](#4-pages--routes)
5. [Component Library](#5-component-library)
6. [State Management](#6-state-management)
7. [Navigation & Routing](#7-navigation--routing)
8. [Special UI Patterns & Concepts](#8-special-ui-patterns--concepts)
9. [Form Handling & Validation](#9-form-handling--validation)
10. [API Integration Patterns](#10-api-integration-patterns)
11. [Authentication UI Flow](#11-authentication-ui-flow)
12. [Responsive Design](#12-responsive-design)
13. [Summary of Key Frontend Characteristics](#13-summary-of-key-frontend-characteristics)

---

## 1. Technology Stack

### Framework & Core

| Library | Version | Purpose |
|---------|---------|---------|
| **Next.js** | 15.5.5 | React meta-framework, App Router (RSC) |
| **React** | 19.1.0 | UI library |
| **TypeScript** | 5 | Type safety across the codebase |

### UI & Styling

| Library | Version | Purpose |
|---------|---------|---------|
| **Tailwind CSS** | 4 | Utility-first CSS framework |
| **Shadcn/ui** | latest | High-quality component library (40+ components) |
| **Radix UI** | latest | Headless UI primitives underlying Shadcn |
| **Lucide React** | 0.545 | SVG icon set (500+ icons) |
| **Class Variance Authority (CVA)** | 0.7.1 | Component variant management |
| **tailwind-merge** | 3.3.1 | Intelligent Tailwind class merging |
| **tw-animate-css** | 1.4.0 | Advanced CSS animations |

### Authentication & Database

| Library | Version | Purpose |
|---------|---------|---------|
| **NextAuth.js** | 5.0.0-beta.29 | Full-stack authentication |
| **@auth/prisma-adapter** | 2.11.0 | Auth ↔ database adapter |
| **bcryptjs** | 3.0.2 | Password hashing |
| **Prisma** | 6.17.1 | ORM (PostgreSQL / MySQL / SQLite) |

### Forms, Validation & File Handling

| Library | Version | Purpose |
|---------|---------|---------|
| **Zod** | 4.1.12 | TypeScript-first schema validation |
| **react-dropzone** | 14.3.8 | Drag-and-drop file uploads |
| **sharp** | 0.34.4 | Image processing & optimization |
| **mime-types** | 3.0.1 | MIME type detection |

### Media Viewers

| Library | Version | Purpose |
|---------|---------|---------|
| **react-syntax-highlighter** | 15.6.6 | Syntax highlighting for code/text files |

### UI Feedback & Notifications

| Library | Version | Purpose |
|---------|---------|---------|
| **sonner** | 2.0.7 | Toast notification system |
| **input-otp** | 1.4.2 | OTP / 2FA input component |

### Fonts & Localisation

| Font | Source | Weights | Purpose |
|------|--------|---------|---------|
| **Almarai** | Google Fonts | 300, 400, 700, 800 | Arabic typography |
| **Geist** | Vercel | Variable | Latin/English typography |

- Full **RTL (Right-to-Left)** support for Arabic
- Gregorian **and** Hijri calendar display
- Date format options: DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD
- Time format: 12-hour / 24-hour

### Other Utilities

| Library | Version | Purpose |
|---------|---------|---------|
| **next-themes** | 0.4.6 | Light / Dark / System theme management |
| **clsx** | 2.1.1 | Conditional class names |
| **nodemailer** | 6.10.1 | Sending transactional emails |

---

## 2. Directory Structure

```
src/
├── app/                              # Next.js 15 App Router pages
│   ├── (auth)/                       # Authentication route group
│   │   ├── sign-in/                  # Login page
│   │   ├── sign-up/                  # Registration page
│   │   ├── verify/                   # Email verification page
│   │   └── layout.tsx                # Auth layout (full-screen, centred)
│   ├── admin/                        # Admin dashboard & management
│   │   ├── page.tsx                  # Admin dashboard entry point
│   │   ├── admin-wrapper.tsx         # Client wrapper
│   │   ├── admin-dashboard.tsx       # Dashboard stats component
│   │   ├── users-management.tsx      # User management panel
│   │   ├── file-types-management.tsx # Allowed file types config
│   │   └── system-settings.tsx       # System configuration panel
│   ├── files/                        # File browser
│   │   ├── page.tsx                  # Files page (server)
│   │   └── files-client.tsx          # Files client (grid / list)
│   ├── favorites/                    # Starred items
│   ├── shared/                       # Files shared with the user
│   ├── trash/                        # Trash / recycle bin
│   ├── upload/                       # Dedicated upload page
│   ├── search/                       # Search results
│   ├── profile/                      # User profile & password
│   ├── settings/                     # User preferences
│   ├── notifications/                # Notification history
│   ├── help/                         # Help centre & documentation
│   ├── share/[token]/                # Public share-link pages
│   ├── maintenance/                  # Maintenance page
│   ├── unauthorized/                 # 403 page
│   ├── not-found.tsx                 # 404 page
│   ├── page.tsx                      # Home / Dashboard
│   ├── layout.tsx                    # Root layout (providers)
│   ├── globals.css                   # Tailwind theme & global styles
│   └── api/                          # API route handlers
│
├── components/
│   ├── layout/                       # Application layout shells
│   │   ├── main-layout.tsx           # Sidebar + header + content wrapper
│   │   ├── app-sidebar.tsx           # Navigation sidebar (RTL)
│   │   ├── folder-breadcrumb.tsx     # Breadcrumb for folder hierarchy
│   │   └── client-layout.tsx         # Client-side layout wrapper
│   │
│   ├── cards/                        # Data display cards
│   │   ├── file-card.tsx             # File item (grid / list)
│   │   ├── folder-card.tsx           # Folder item (grid / list)
│   │   ├── storage-stats-card.tsx    # Circular storage usage chart
│   │   ├── stats-overview-card.tsx   # Statistics summary card
│   │   ├── recent-files-card.tsx     # Recently accessed files widget
│   │   └── trash-file-card.tsx       # Deleted file item
│   │
│   ├── dialogs/                      # Modal dialogs
│   │   ├── create-folder-dialog.tsx
│   │   ├── rename-folder-dialog.tsx
│   │   ├── delete-folder-dialog.tsx
│   │   ├── delete-file-dialog.tsx
│   │   ├── restore-file-dialog.tsx
│   │   ├── permanent-delete-dialog.tsx
│   │   ├── share-file-dialog.tsx
│   │   └── file-preview-dialog.tsx
│   │
│   ├── media/                        # Media viewers & players
│   │   ├── image-preview.tsx         # Image viewer (zoom / rotate)
│   │   ├── pdf-viewer.tsx            # PDF preview
│   │   ├── video-player.tsx          # Video player
│   │   ├── audio-player.tsx          # Audio player
│   │   └── text-code-viewer.tsx      # Text / code syntax viewer
│   │
│   ├── shared/                       # Reusable utility components
│   │   ├── file-upload-zone.tsx      # Drag-and-drop upload area
│   │   ├── search-bar.tsx            # Global debounced search bar
│   │   ├── user-profile-menu.tsx     # User avatar dropdown
│   │   ├── theme-switcher.tsx        # Light / Dark / System toggle
│   │   ├── notification-menu.tsx     # Notifications dropdown
│   │   └── maintenance-checker.tsx   # Detects & redirects maintenance mode
│   │
│   ├── providers/                    # React context providers
│   │   ├── session-provider.tsx      # NextAuth session context
│   │   └── theme-provider.tsx        # Dark / light theme context
│   │
│   └── ui/                           # Shadcn/ui primitives (40+ components)
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       ├── select.tsx
│       ├── tabs.tsx
│       ├── badge.tsx
│       ├── avatar.tsx
│       ├── progress.tsx
│       ├── radio-group.tsx
│       ├── switch.tsx
│       ├── input-otp.tsx
│       ├── scroll-area.tsx
│       ├── separator.tsx
│       ├── sidebar.tsx
│       ├── sheet.tsx
│       ├── table.tsx
│       ├── alert.tsx
│       ├── alert-dialog.tsx
│       ├── breadcrumb.tsx
│       ├── label.tsx
│       ├── textarea.tsx
│       ├── tooltip.tsx
│       ├── skeleton.tsx
│       └── sonner.tsx
│
├── hooks/
│   ├── use-date-formatter.ts         # Date + Hijri calendar formatting
│   └── use-mobile.ts                 # Mobile breakpoint hook
│
├── lib/
│   ├── auth/                         # Authentication helpers
│   ├── db/                           # Database client (Prisma)
│   ├── api/                          # Typed API client utilities
│   ├── security/                     # Security utilities
│   ├── services/                     # Business logic
│   ├── utils/                        # Helpers: cn(), formatFileSize(), etc.
│   └── validations/                  # Zod schemas
│
├── types/
│   └── next-auth.d.ts               # NextAuth type augmentation
│
└── middleware.ts                     # Auth checks & route protection
```

---

## 3. Design System

### Color Palette — OKLCH Format (Perceptually Uniform)

CSS custom properties are defined in `src/app/globals.css` and switch automatically between `:root` (light) and `.dark` (dark mode).

#### Light Mode

```css
:root {
  --background:      oklch(1 0 0);          /* Pure white */
  --foreground:      oklch(0.145 0 0);      /* Almost black */
  --card:            oklch(1 0 0);          /* White card surface */
  --card-foreground: oklch(0.145 0 0);
  --primary:         oklch(0.205 0 0);      /* Dark gray / near-black */
  --primary-foreground: oklch(0.985 0 0);  /* Near-white */
  --secondary:       oklch(0.97 0 0);       /* Very light gray */
  --secondary-foreground: oklch(0.205 0 0);
  --muted:           oklch(0.97 0 0);       /* Muted background */
  --muted-foreground: oklch(0.556 0 0);    /* Gray text */
  --accent:          oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive:     oklch(0.577 0.245 27.325); /* Red */
  --border:          oklch(0.922 0 0);      /* Light gray border */
  --input:           oklch(0.922 0 0);
  --ring:            oklch(0.708 0 0);      /* Focus ring */
  --radius:          0.625rem;              /* 10px base radius */
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
}
```

#### Dark Mode

```css
.dark {
  --background:      oklch(0.145 0 0);      /* Very dark */
  --foreground:      oklch(0.985 0 0);      /* Near-white */
  --card:            oklch(0.205 0 0);
  --primary:         oklch(0.922 0 0);      /* Light primary */
  --primary-foreground: oklch(0.205 0 0);
  --secondary:       oklch(0.269 0 0);
  --muted:           oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent:          oklch(0.269 0 0);
  --destructive:     oklch(0.704 0.191 22.216);
  --border:          oklch(1 0 0 / 10%);
  --input:           oklch(1 0 0 / 15%);
  --ring:            oklch(0.556 0 0);
}
```

### Typography

| Role | Font Family | Weight | Usage |
|------|-------------|--------|-------|
| Arabic body | Almarai | 400 | All Arabic text |
| Arabic headings | Almarai | 700, 800 | Page titles, section headings |
| Arabic light | Almarai | 300 | Captions, metadata |
| Latin body | Geist Sans | Variable | English text |
| Latin mono | Geist Mono | Variable | Code, technical content |

### Border Radius

```css
--radius: 0.625rem;          /* Base = 10px */

/* Derived */
--radius-sm: calc(var(--radius) - 4px)    /* 6px  */
--radius-md: calc(var(--radius) - 2px)    /* 8px  */
--radius-lg: var(--radius)                /* 10px */
--radius-xl: calc(var(--radius) + 4px)    /* 14px */
```

### Spacing

Tailwind's default spacing scale, commonly used classes:
- `p-3 sm:p-4` — Small/medium padding
- `gap-2 gap-4 gap-6` — Gaps in flex/grid layouts
- `space-y-4` — Vertical stacking

### Shadows

| Use | Class |
|-----|-------|
| Default card | none (border only) |
| Hover card | `hover:shadow-md` |
| Dialog | Built-in Radix shadow |

---

## 4. Pages & Routes

### Auth Pages (`/sign-in`, `/sign-up`, `/verify`)

- **Layout:** Centred card (max-w-md) on a plain background, no sidebar
- **Shared elements:** App logo / name at top, bottom link to alternate auth page
- Form elements are RTL with Arabic labels

#### `/sign-in` — Login

```
┌──────────────────────────────────────────┐
│  🔵 Platinum Drive                        │
│  تسجيل الدخول إلى حسابك                   │
│                                            │
│  [Error alert — red bg if any]             │
│                                            │
│  البريد الإلكتروني                         │
│  ┌──────────────────────────────────────┐ │
│  │ user@example.com                     │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  كلمة المرور                               │
│  ┌──────────────────────────────────────┐ │
│  │ ••••••••                             │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  [IF 2FA enabled]                          │
│  رمز التحقق (MM:SS timer)                  │
│  ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐           │
│  │  │ │  │ │  │ │  │ │  │ │  │           │
│  └──┘ └──┘ └──┘ └──┘ └──┘ └──┘           │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │         تسجيل الدخول          [spin] │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  ليس لديك حساب؟  إنشاء حساب              │
└──────────────────────────────────────────┘
```

#### `/sign-up` — Registration

- Same card layout
- Fields: Name, Email, Password, Confirm Password
- Admin-controlled: If registration is disabled, an info alert is shown instead of the form

#### `/verify` — Email Verification

- Same card layout
- Email parameter read from query string
- 6-digit OTP input, resend button with 120-second countdown

---

### Main App Pages (after login)

All main app pages share the **MainLayout** which includes:
- A fixed sidebar on the right (RTL)
- A top header bar with breadcrumb, search, notification bell, theme switcher, and user avatar menu
- A `<main>` content area

---

#### `/` — Home / Dashboard

```
┌─── Sidebar ───┬────────────────────────── Main Content ─────────────────────────┐
│               │                                                                   │
│               │  مرحباً [User Name] 👋        [Clock]         [Date]             │
│               │  إليك نظرة عامة على مساحتك التخزينية                            │
│               │                                                                   │
│               │  Quick Actions (2×4 responsive grid)                              │
│               │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                           │
│               │  │Upload│ │Files │ │Search│ │Shared│                            │
│               │  └──────┘ └──────┘ └──────┘ └──────┘                           │
│               │                                                                   │
│               │  Storage + Stats (1 col mobile / 4 col desktop: 3:1 ratio)       │
│               │  ┌──────────────────────────────┐  ┌─────────────┐              │
│               │  │  StorageStatsCard             │  │StatsOverview│              │
│               │  │  Circular SVG progress        │  │ Total files │              │
│               │  │  Used / Available / Total      │  │ Folders     │              │
│               │  └──────────────────────────────┘  └─────────────┘              │
│               │                                                                   │
│               │  Recent Files                                                     │
│               │  ┌────────────────────────────────────────────────────────────┐  │
│               │  │ RecentFilesCard — icon | name | size | date | actions       │  │
│               │  └────────────────────────────────────────────────────────────┘  │
│               │                                                                   │
└───────────────┴───────────────────────────────────────────────────────────────────┘
```

---

#### `/files` — File Browser

- Toolbar: Breadcrumb, View toggle (grid ⬜/list ≡), Sort dropdown, Filter by type, Create Folder button, Upload button
- Content: FileCard or FolderCard components, rendered in a responsive grid (grid mode) or stacked list (list mode)
- Empty state: Illustrated empty-folder message with upload CTA

---

#### `/upload` — File Upload

- Full-width drag-and-drop zone (`FileUploadZone`)
- File queue with individual progress bars
- Status indicators: queued, uploading, done, error
- Cancel / retry per file

---

#### `/search?q=query` — Search Results

- Search input with 300ms debounce
- File-type filter dropdown
- Sort options (date, name, size)
- Results in grid/list (same cards as `/files`)
- Pagination controls

---

#### `/favorites` — Starred Items

- Same grid/list view as `/files`
- Only shows files and folders the user has starred (⭐)

---

#### `/shared` — Shared Files

- Two sub-sections: "Shared with me" and "Shared by me"
- Shows share details: permissions, expiry date, password-protected badge

---

#### `/share/[token]` — Public Share Link (no auth required)

- Standalone page (no sidebar)
- File preview or download button
- Optional password prompt if the link is protected
- File metadata: name, size, expiry

---

#### `/trash` — Recycle Bin

- Trash-specific cards (`TrashFileCard`)
- Per-item: Restore button, Permanent delete button
- Global: Empty Trash button (with confirmation dialog)

---

#### `/profile` — User Profile

Three tabs:

| Tab | Fields |
|-----|--------|
| **General** | Name (editable), Email (read-only), Avatar/profile picture, Save |
| **Security** | Current password, New password, Confirm password, Change button |
| **History** | Table: Login attempts — Date, Device, IP, Status |

---

#### `/settings` — User Preferences

Grouped sections:

| Section | Controls |
|---------|---------|
| **General** | Theme (Light/Dark/System), Language, Calendar type (Gregorian/Hijri), Date format, Time format (12h/24h), Timezone |
| **Notifications** | Email notification toggles, In-app preferences |
| **Privacy** | Profile visibility, Default sharing options |
| **Security** | 2FA toggle, Password change, Active sessions |
| **File Management** | Default view (Grid/List), Default sort, Auto-delete trash (days) |
| **Upload** | File size limits, Allowed types |

---

#### `/notifications` — Notification History

- Chronological list: icon, message, date
- Mark as read/unread per notification
- "Clear all" button with confirmation
- Filter by notification type

---

#### `/help` — Help Centre

Sidebar with anchored sections:

- Introduction & getting started
- Login & authentication
- File upload guide
- File management
- Sharing guide
- Search functionality
- Notifications
- Media previews
- Profile management
- Settings
- Admin guide
- Favorites & Trash
- Tips & tricks
- Security guide

---

#### `/admin` — Admin Dashboard (Admin role only)

**Tab 1 — Dashboard:**
- Stat cards: Total users, Active users, Inactive users, Total files, Total storage
- System storage utilisation chart

**Tab 2 — Users Management:**
- Searchable / filterable user table
- Columns: Name, Email, Role, Status, Actions
- Actions: Edit role, Enable/Disable, Delete

**Tab 3 — File Types Management:**
- Allowed extensions & MIME types list
- Add / Remove file types

**Tab 4 — System Settings:**
- App name & description
- Registration enabled/disabled toggle
- 2FA requirement toggle
- Maintenance mode toggle
- Storage quotas

---

#### `/unauthorized` — 403 Page

Simple centered message for non-admin users attempting to access admin routes.

---

#### `/maintenance` — Maintenance Mode

Full-screen page shown when an admin enables maintenance mode. Displayed to all non-admin users.

---

## 5. Component Library

### Layout Components

| Component | Purpose |
|-----------|---------|
| `MainLayout` | Top-level wrapper: sidebar + header + `<main>` |
| `AppSidebar` | RTL navigation sidebar; shows live clock/date in footer |
| `FolderBreadcrumb` | Folder hierarchy navigation (clickable path) |
| `ClientLayout` | Client-side hydration wrapper |

**AppSidebar structure:**

```
┌──────────────────────────┐
│ 🔵 Platinum Drive         │   ← logo + hover scale animation
│   منصة إدارة الملفات      │
├──────────────────────────┤
│ [Admin section if admin] │   ← highlighted: border-l-4 border-primary
│  🛡️ لوحة الإدارة         │
├──────────────────────────┤
│ Navigation               │
│  🏠 الرئيسية              │
│  📁 الملفات               │
│  🔍 البحث                 │
│  🔗 المشاركة              │
│  ⭐ المفضلة               │
│  📤 رفع الملفات           │
│  🗑️ سلة المهملات          │
├──────────────────────────┤
│ Account                  │
│  👤 الملف الشخصي          │
│  ⚙️ الإعدادات             │
│  ❓ المساعدة              │
├──────────────────────────┤
│ ┌────────────────────┐   │   ← glassmorphism card
│ │  [Time]  [Date]    │   │
│ │  HH:MM   DD/MM/YY  │   │
│ └────────────────────┘   │
└──────────────────────────┘
```

Active sidebar item: `bg-primary/10 text-primary border-r-4 border-primary font-bold`

---

### Card Components

#### FileCard — Grid View

```
┌──────────────────────────────┐
│ [⋮ menu]          [★ star]   │
│                               │
│        🔵 [file icon]         │  ← 12×12 (mobile) / 16×16 (desktop)
│        document.pdf           │  ← truncate with ellipsis
│         2.4 MB                │  ← muted foreground color
│                               │
├──────────────────────────────┤
│ 2 days ago                    │  ← separated by border
└──────────────────────────────┘
```

Classes: `border rounded-lg p-3 sm:p-4 hover:shadow-md bg-card transition-all`

#### FileCard — List View

```
┌────────��─────────────────────────────────────────────────┐
│ 🔵 [icon]  document.pdf      2.4 MB      2 days ago  [⋮] │
└──────────────────────────────────────────────────────────┘
```

Classes: `flex items-center gap-4 p-3 sm:p-4 border rounded-lg`

#### FolderCard

- Same layout as FileCard
- Icon: Blue folder (`bg-blue-50 dark:bg-blue-950/20`)
- Shows item count instead of file size

#### StorageStatsCard

```
       ┌─────────────────────────────────┐
       │                                  │
       │       ⭕ SVG Circle (180×180px)   │
       │         Centre: 67%              │  ← color changes with usage level
       │         (in matching color)      │
       │                                  │
       │ ┌──────┬──────────┬──────────┐  │
       │ │Used  │Available │ Total    │  │
       │ │12 GB │  4 GB    │  16 GB   │  │
       │ └──────┴──────────┴──────────┘  │
       │                                  │
       │ [⚠️ Warning if usage > 75%]      │
       └─────────────────────────────────┘
```

Circle color thresholds:
- `≤ 50 %` → green
- `≤ 75 %` → yellow
- `≤ 90 %` → orange
- `> 90 %` → red

Transition: `transition-all duration-1000 ease-out`

---

### Dialog Components

All dialogs follow this structure:

```tsx
<Dialog open={open} onOpenChange={onOpenChange}>
  <DialogContent className="sm:max-w-[500px]">
    <div dir="rtl" className="space-y-4">
      <DialogHeader className="text-right">
        <DialogTitle>…</DialogTitle>
        <DialogDescription>…</DialogDescription>
      </DialogHeader>

      {/* Form or info content */}

      <DialogFooter className="flex-row-reverse">
        <Button>Confirm action</Button>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          إلغاء
        </Button>
      </DialogFooter>
    </div>
  </DialogContent>
</Dialog>
```

| Dialog | Type | Fields |
|--------|------|--------|
| `CreateFolderDialog` | Form | Folder name |
| `RenameFolderDialog` | Form | New folder name (pre-filled) |
| `DeleteFolderDialog` | Confirm | None |
| `DeleteFileDialog` | Confirm | None |
| `RestoreFileDialog` | Confirm | None |
| `PermanentDeleteDialog` | Confirm | None |
| `ShareFileDialog` | Form | Expiry, Password (optional), Permission (view/download) |
| `FilePreviewDialog` | Media | Routes internally to media viewer component |

---

### Media Viewer Components

| Component | Accepted MIME / Extensions | Key Features |
|-----------|---------------------------|--------------|
| `ImagePreview` | JPEG, PNG, WebP, GIF, SVG | Zoom 25–300%, Rotate 90°, Fullscreen, Download, Prev/Next navigation |
| `PDFViewer` | PDF | Page navigation (prev/next), Download |
| `VideoPlayer` | MP4, WebM, Ogg | Play/pause, Volume, Seek, Fullscreen |
| `AudioPlayer` | MP3, WAV, Ogg | Play/pause, Volume, Seek timeline |
| `TextCodeViewer` | TXT, JSON, JS, TS, PY, etc. | Syntax highlighting, Copy code, Line numbers |

**FilePreviewDialog** is the outer wrapper that chooses which viewer to render based on MIME type.

---

### Shared Utility Components

| Component | Key Behaviour |
|-----------|--------------|
| `FileUploadZone` | Drag-and-drop area using react-dropzone; shows per-file progress bars, status badges (queued / uploading / done / error), retry button |
| `SearchBar` | Controlled input with 300ms debounce; clear (×) button; fires router navigation to `/search?q=…` |
| `UserProfileMenu` | Avatar dropdown: Profile, Settings, Logout links |
| `ThemeSwitcher` | Three-way toggle: Light ☀️, Dark 🌙, System 💻; persists choice to user settings |
| `NotificationMenu` | Bell icon with unread count badge; dropdown list of recent notifications |
| `MaintenanceChecker` | Polls admin maintenance flag; redirects non-admin users to `/maintenance` |

---

### UI Primitive Components (Shadcn/ui)

#### Button Variants

| Variant | Styling | Typical Use |
|---------|---------|-------------|
| `default` | `bg-primary text-primary-foreground hover:bg-primary/90` | Primary CTA |
| `destructive` | `bg-destructive text-white hover:bg-destructive/90` | Delete actions |
| `outline` | `border border-input bg-background hover:bg-accent` | Secondary actions |
| `secondary` | `bg-secondary text-secondary-foreground` | Alternative actions |
| `ghost` | `hover:bg-accent hover:text-accent-foreground` | Icon buttons |
| `link` | `text-primary underline-offset-4 hover:underline` | Text links |

#### Button Sizes

| Size | Height | Use |
|------|--------|-----|
| `default` | h-9 | Standard buttons |
| `sm` | h-8 | Compact / dropdown items |
| `lg` | h-10 | Prominent CTAs |
| `icon` | h-9 w-9 | Icon-only buttons |

#### Sonner Toast Variants

```tsx
toast.success("Operation successful")
toast.error("Something went wrong", { description: "More details here" })
toast.warning("This may cause issues")
toast.info("Informational message")
```

#### Common Lucide Icons Used

| Context | Icons |
|---------|-------|
| Navigation | `Home`, `Folder`, `FolderOpen`, `Settings`, `User`, `HelpCircle`, `Shield` |
| Actions | `Upload`, `Download`, `Share2`, `Trash2`, `Edit`, `Eye`, `MoreVertical`, `Copy` |
| Status | `CheckCircle`, `AlertCircle`, `Loader2`, `Clock` |
| UI chrome | `ChevronLeft`, `ChevronRight`, `X`, `Search`, `Menu`, `Monitor`, `Sun`, `Moon` |
| File types | `File`, `FileText`, `Image`, `Video`, `Music`, `Archive` |
| Misc | `Star`, `Lock`, `TrendingUp`, `HardDrive` |

Standard icon sizes: `h-4 w-4` (compact), `h-5 w-5` (sidebar/header), `h-6 w-6` / `h-8 w-8` (featured).

---

## 6. State Management

No centralised state library (Redux / Zustand / Jotai). State is managed through:

| Mechanism | Used For |
|-----------|---------|
| `useState` | Local component state: files list, folders, UI flags (loading, error, modal open) |
| `useEffect` | Side effects: data fetching on mount, auto-save, cleanup |
| `useCallback` | Memoised callbacks: file-drop handler, search handler |
| `useRef` | DOM references: URL change tracking, media player refs |
| `useSearchParams()` | URL query state: search query, pagination |
| NextAuth session context | Authenticated user object (`session.user`) |
| `next-themes` context | Active theme (light / dark / system) |
| Zod + controlled `useState` | Complex form state with validation |

---

## 7. Navigation & Routing

**Router:** Next.js 15 App Router (file-based)

| Route | Auth Required | Role |
|-------|--------------|------|
| `/` | Yes | Any |
| `/sign-in` | No | — |
| `/sign-up` | No | — |
| `/verify?email=x` | No | — |
| `/files` | Yes | Any |
| `/upload` | Yes | Any |
| `/search?q=x` | Yes | Any |
| `/favorites` | Yes | Any |
| `/shared` | Yes | Any |
| `/share/[token]` | No | — |
| `/trash` | Yes | Any |
| `/profile` | Yes | Any |
| `/settings` | Yes | Any |
| `/notifications` | Yes | Any |
| `/help` | Yes | Any |
| `/admin` | Yes | Admin only |
| `/unauthorized` | Yes | Any |
| `/maintenance` | No (conditional) | — |
| `/*` | — | 404 |

**Navigation methods:**
1. Sidebar links — primary navigation
2. Header search bar — triggers `/search?q=…`
3. Breadcrumb clicks — folder drill-down
4. `router.push()` — programmatic (post-form-submit, etc.)
5. `<Link>` — standard anchor links

**Protection mechanism:** `auth()` in `MainLayout` (server); role check in admin pages.

---

## 8. Special UI Patterns & Concepts

### Glassmorphism — Sidebar Footer

```tsx
className="
  bg-gradient-to-br from-primary/10 via-primary/5 to-transparent
  dark:from-primary/20 dark:via-primary/10
  border border-primary/20
  rounded-xl p-4
  backdrop-blur-sm
"
```

A live clock + date widget sits inside this card with real-time updates.

---

### Dark / Light Mode

```
1. CSS custom properties defined for :root (light) and .dark (dark)
2. next-themes adds/removes the .dark class on <html>
3. ThemeProvider wraps the app (disableTransitionOnChange prevents flash)
4. User preference: Light ☀️ | Dark 🌙 | System 💻
5. Persisted to user settings (DB) and localStorage
```

---

### Animations & Transitions

| Element | Animation |
|---------|-----------|
| Buttons | `transition-all` — hover/focus colour change |
| Cards | `transition-all hover:shadow-md` |
| Sidebar logo | `group-hover:scale-110 transition-transform` |
| Storage circle | `transition-all duration-1000 ease-out` |
| Sidebar active item | Background + border smooth transition |
| Action menu reveal | `sm:opacity-0 sm:group-hover:opacity-100 transition-opacity` |
| Loading spinner | `animate-spin` on `Loader2` icon |
| Sheet / drawer | Slide-in from side |

---

### File Icon Colour Coding

| File Type | Icon Colour |
|-----------|------------|
| Image | Purple |
| Video | Red |
| Audio | Orange |
| PDF | Red |
| Archive | Yellow |
| Code / Text | Blue |
| Other / generic | Gray |

---

### Grid Layout System

```tsx
// Quick actions (home)
"grid grid-cols-2 md:grid-cols-4"

// Storage section (home)
"grid grid-cols-1 lg:grid-cols-4 gap-6"
// → StorageStatsCard spans 3 cols: "lg:col-span-3"
// → StatsOverviewCard spans 1 col: "lg:col-span-1"

// Generic two-column
"grid grid-cols-1 md:grid-cols-2"
```

---

### Error / Alert Colours

```tsx
// Info
<div className="bg-blue-50 dark:bg-blue-900/10 text-blue-700 …">

// Success
<div className="bg-green-50 dark:bg-green-900/10 text-green-700 …">

// Warning
<div className="bg-orange-50 dark:bg-orange-950/20 text-orange-700 …">

// Error
<div className="bg-red-50 dark:bg-red-900/10 text-red-500 …">
```

---

## 9. Form Handling & Validation

### Validation Library

**Zod 4** — all schemas defined in `src/lib/validations/`.

### Patterns

**Simple uncontrolled form:**
```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  const formData = new FormData(e.currentTarget as HTMLFormElement)
  const name = formData.get("name") as string
  // validate & submit
}
```

**Complex controlled form:**
```tsx
const [settings, setSettings] = useState({ theme: "light", … })

const handleChange = (key: string, value: string) =>
  setSettings(prev => ({ ...prev, [key]: value }))

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  await fetch("/api/user/settings", { method: "PUT", body: JSON.stringify(settings) })
  toast.success("Saved")
}
```

### Validation Rules (Key Forms)

| Form | Field | Rule |
|------|-------|------|
| Sign in | Email | Required, valid email |
| Sign in | Password | Required, min 8 chars |
| Sign in | 2FA Code | Required when 2FA active, 6 digits |
| Sign up | Name | Required |
| Sign up | Email | Required, unique, valid format |
| Sign up | Password | Required, min 8 chars, strength check |
| Sign up | Confirm | Must match password |
| Create Folder | Name | Required, non-empty after trim |

### Inline Error Display

```tsx
{error && (
  <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/10 rounded-md">
    {error}
  </div>
)}
```

### Field Types Used

| Component | Use Case |
|-----------|---------|
| `<Input type="email">` | Email fields |
| `<Input type="password">` | Password fields |
| `<Input type="text">` | Names, folder names |
| `<Select>` + `<SelectItem>` | Dropdowns (theme, date format, etc.) |
| `<RadioGroup>` + `<RadioGroupItem>` | Share permissions (view / download) |
| `<Switch>` | Boolean toggles (2FA, notifications) |
| `<InputOTP maxLength={6}>` | 2FA / email verification codes |
| `<Textarea>` | Multi-line text |

---

## 10. API Integration Patterns

### API Endpoint Groups

| Prefix | Scope |
|--------|-------|
| `/api/files/**` | File CRUD, upload, download, preview |
| `/api/folders/**` | Folder CRUD, hierarchy |
| `/api/user/**` | Profile, settings, history |
| `/api/auth/**` | NextAuth, 2FA, verification |
| `/api/share/**` | Create / manage share links |
| `/api/search/**` | Full-text search |
| `/api/notifications/**` | Notification list & read state |
| `/api/admin/**` | Admin-only operations |

### Standard Fetch Pattern

```typescript
try {
  const response = await fetch("/api/endpoint", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const { message } = await response.json()
    throw new Error(message)
  }

  return await response.json()
} catch (err) {
  console.error(err)
  toast.error("حدث خطأ ما")  // "Something went wrong"
}
```

### File Upload

```typescript
const formData = new FormData()
formData.append("file", file)
formData.append("folderId", folderId ?? "")

const response = await fetch("/api/files/upload", {
  method: "POST",
  body: formData,
})
```

### Loading State Pattern

```typescript
const [loading, setLoading] = useState(true)

useEffect(() => {
  setLoading(true)
  fetchData()
    .then(setData)
    .catch(console.error)
    .finally(() => setLoading(false))
}, [dependency])

if (loading) return <Loader2 className="h-6 w-6 animate-spin" />
```

### Search Debounce

```typescript
useEffect(() => {
  const timer = setTimeout(() => setDebouncedQuery(query), 300)
  return () => clearTimeout(timer)
}, [query])
```

---

## 11. Authentication UI Flow

### Login

```
1. /sign-in  → enter email + password
2. Validate credentials
   ├── Invalid → red alert: "البريد الإلكتروني أو كلمة المرور غير صحيحة"
   ├── Disabled → "هذا الحساب معطل"
   ├── Locked → "حسابك مقفل مؤقتاً" + lock duration shown
   └── Email unverified → redirect to /verify?email=…
3. If 2FA required (global admin setting):
   a. Credentials valid → POST /api/auth/request-2fa
   b. Show 6-digit OTP input + 120-second countdown timer
   c. User enters code → POST /api/auth/verify-2fa
   d. Valid → NextAuth.signIn() → redirect to /
4. No 2FA → NextAuth.signIn() directly → redirect to /
```

### Registration

```
1. /sign-up → enter name, email, password, confirm
2. Validate (Zod schema)
3. Create account via API
4. Send verification email
5. Redirect to /verify?email=… or /sign-in
```

### 2FA Resend Logic

- Timer: 120 seconds
- Resend button disabled until timer reaches 0
- Hint text: "يمكنك طلب رمز جديد بعد انتهاء الوقت"

---

## 12. Responsive Design

### Breakpoints (Tailwind defaults)

| Prefix | Viewport |
|--------|---------|
| (default) | < 640px — mobile |
| `sm:` | ≥ 640px |
| `md:` | ≥ 768px |
| `lg:` | ≥ 1024px |

### Mobile vs. Desktop Behaviour

| Element | Mobile | Desktop |
|---------|--------|---------|
| Sidebar | Hidden, slide-out Sheet | Always visible (right side, RTL) |
| File cards | 12×12 icon, text-xs | 16×16 icon, text-sm |
| Action buttons | Hidden → shown in `DropdownMenu` | Visible inline |
| Grid columns | 1–2 | 3–4 |
| Header breadcrumb | Truncated | Full path |
| Padding | `p-3` | `p-4` |
| Storage section | Single column | 3:1 split |

### Common Responsive Patterns

```tsx
// Show on desktop, hide on mobile
className="hidden sm:flex"

// Responsive padding
className="p-3 sm:p-4"

// Responsive grid
className="grid grid-cols-2 md:grid-cols-4"

// Responsive text size
className="text-sm sm:text-base"

// Truncate overflow text
className="truncate"
```

---

## 13. Summary of Key Frontend Characteristics

### Design System

- **Colors:** OKLCH perceptually uniform color space
- **Base radius:** 10px, with sm (6px) / md (8px) / lg (10px) / xl (14px) variants
- **Fonts:** Almarai (Arabic), Geist (Latin)
- **Two themes:** Complete light and dark color schemes

### Visual Style

- Clean, modern, professional
- Minimal shadows — borders define structure
- Generous white-space
- Glassmorphism used selectively (sidebar footer card only)
- **RTL-first** design for Arabic; everything from layouts to dialogs is right-to-left

### Interactions

- Transitions: 150–300ms for hover/focus; 1000ms for data-driven (storage circle)
- Loading: spinner icon (`Loader2 animate-spin`) or `Skeleton` placeholders
- Feedback: Sonner toasts (success / error / warning / info)
- Keyboard shortcuts in image viewer: arrow keys, `+/-` zoom, `r` rotate

### Accessibility

- ARIA labels on all interactive elements
- Semantic HTML (`<header>`, `<main>`, `<nav>`, `<section>`)
- Visible focus rings: `focus-visible:ring-ring/50 focus-visible:ring-[3px]`
- Keyboard-navigable dropdowns, dialogs, and tabs (via Radix UI)

### Localisation

- Full Arabic support with `dir="rtl"`
- Gregorian and Hijri calendar display
- 12h / 24h time; multiple timezone support
- English localisation planned (UI skeleton present)

### Security UI

- 2FA (TOTP via email) with OTP component
- Account lock detection with duration display
- Email verification gate
- Password strength indicator
- Session history table

---

*This document was auto-generated from the Platinum Drive source code and describes the frontend as it exists in the repository. Update it whenever significant UI changes are made.*
