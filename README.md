<div align="center">

# ☁️ Platinum Drive

### Modern Cloud Storage Platform with Enterprise-Grade Security

[![Next.js](https://img.shields.io/badge/Next.js-16.x-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.17.1-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**A feature-rich, self-hosted cloud storage solution with advanced security, user management, and comprehensive admin controls.**

[Features](#-features) •
[Screenshots](#-screenshots) •
[Installation](#-quick-start) •
[Documentation](#-documentation) •
[License](#-license)

</div>

---

## 🌟 Overview

Platinum Drive is an open-source cloud storage platform built with modern technologies, offering enterprise-level features for individuals and organizations. With a beautiful RTL interface, robust security features, and comprehensive admin controls, it's perfect for teams looking for a self-hosted storage solution.

> **⚠️ Language Notice:** This project is currently available **only in Arabic language** with full RTL (Right-to-Left) support and Hijri calendar integration.
> **⚠️ For Demo:** Email: user@platinum-app.com Password: 123456, I have Disabled some of the Settings in the user side, for the ADmin Side and FULLY FUNCATIONAL Version Contact me to Send the Deatils to you.

## 📸 Screenshots

<div align="center">

| Home Dashboard | Admin Panel | File Upload |
|:---:|:---:|:---:|
| ![Home](docs/screenshots/home.png) | ![Admin](docs/screenshots/admin-panel-home.png) | ![Upload](docs/screenshots/upload-page.png) |

</div>

**[View Full Screenshots Gallery →](SCREENSHOTS.md)**

## ✨ Key Features

<table>
<tr>
<td width="50%">

### 🔐 Security & Authentication
- **Clerk Authentication** for secure sign-in/sign-up
- **Email Verification** with 6-digit codes via Clerk
- **Password Policies**: History tracking, expiry, complexity rules
- **Account Protection**: Login attempt tracking & lockout
- **Session Management** with Clerk (@clerk/nextjs)
- **Role-Based Access Control** with Prisma user roles

</td>
<td width="50%">

### 📁 File Management
- **Drag & Drop Upload** with progress tracking
- **File Type Policies** with size limits per type
- **Folder Organization** with nested structures
- **Favorites System** for quick access
- **Trash/Recycle Bin** with 30-day retention
- **File Sharing** with password protection & expiry

</td>
</tr>
<tr>
<td width="50%">

### 👥 User Management
- **Role-Based Access Control** (Admin/User/Guest)
- **Storage Quotas** per user
- **Login History** tracking
- **Profile Customization** with avatar upload
- **User Analytics** and activity monitoring

</td>
<td width="50%">

### 🎛️ Admin Panel
- **Dashboard Analytics** with visual charts
- **System Settings**: 8 configuration tabs
- **User Management**: Status, roles, quotas
- **File Type Policies**: 16 default types
- **Email Configuration**: SMTP settings
- **Security Controls**: Global 2FA enforcement

</td>
</tr>
</table>

### 🎨 Modern UI/UX
- ✅ **RTL Support** for Arabic language
- ✅ **Dark Mode** with system preference detection
- ✅ **Responsive Design** for all devices
- ✅ **Live Arabic Clock** with Hijri calendar
- ✅ **Toast Notifications** for user feedback
- ✅ **Tab Navigation** with active indicators

## 🛠️ Technology Stack

<table>
<tr>
<td align="center" width="33%">

### Frontend
- Next.js 16.x (App Router)
- React 19
- TypeScript 5.0
- Tailwind CSS
- Shadcn/ui Components
- Lucide React Icons

</td>
<td align="center" width="33%">

### Backend
- Next.js API Routes
- Clerk Authentication (@clerk/nextjs v7)
- Prisma ORM
- PostgreSQL Database
- Bcryptjs Hashing
- Nodemailer SMTP

</td>
<td align="center" width="33%">

### DevOps
- Docker Support
- Google Cloud Run Ready
- Environment-based Config
- Database Migrations
- Automated Seeding

</td>
</tr>
</table>

## 🚀 Quick Start

### Prerequisites

- Node.js 20.x or higher
- PostgreSQL 14.x or higher
- npm or yarn package manager

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/youssef509/Platinum-Drive.git
cd Platinum-Drive

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# 4. Set up the database
npx prisma migrate dev
npx prisma db seed

# 5. Run the development server
npm run dev
```

Visit `http://localhost:3000` 🎉

### Default Admin Account
After seeding the database, you can log in with:
- **Email**: (check your seed file)
- **Password**: (check your seed file)

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/platinum_drive"

# Clerk Authentication (required)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Email (Optional - for notifications)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM="noreply@platinumdrive.com"
```

### System Settings

After installation, navigate to **Admin Panel → System Settings** to configure:

- **General**: Site name, maintenance mode, language
- **Security**: 2FA enforcement, password policies, login limits
- **Email**: SMTP server configuration
- **Upload**: File size limits, virus scanning
- **Storage**: User quotas, auto-cleanup policies
- **Appearance**: Theme, logo, branding
- **Notifications**: Alert preferences
- **Advanced**: System-level configurations

## 📚 Documentation

### Database Schema

**Core Tables:**
- `Users` - User accounts with roles and quotas
- `Files` - Uploaded files with metadata
- `Folders` - Folder hierarchy
- `Shares` - Secure file sharing
- `SystemSettings` - Application config
- `FileTypePolicy` - File validation rules
- `Notifications` - User notifications
- `LoginHistory` - Login tracking
- `PasswordHistory` - Password changes
- `VerificationCode` - Email codes
- `TwoFactorCode` - 2FA OTP codes

See [`prisma/schema.prisma`](prisma/schema.prisma) for the complete schema.

### API Endpoints

<details>
<summary>Click to expand API documentation</summary>

#### Authentication
```
POST /api/auth/register           - Register new user
POST /api/auth/verify-credentials - Verify login credentials
POST /api/auth/verify             - Verify email code
POST /api/auth/request-2fa        - Request 2FA code
POST /api/auth/verify-2fa         - Verify 2FA code
```

#### Files
```
POST   /api/files/upload              - Upload files
GET    /api/files                     - List user files
GET    /api/files/[id]/download       - Download file
DELETE /api/files/[id]                - Delete file
POST   /api/files/[id]/favorite       - Toggle favorite
```

#### Sharing
```
POST /api/share                    - Create share link
GET  /api/share/public/[token]     - Access shared file
GET  /api/share/download/[token]   - Download shared file
```

#### Admin
```
GET  /api/admin/users              - List all users
PUT  /api/admin/users/[id]/status  - Update user status
PUT  /api/admin/users/[id]/quota   - Update storage quota
GET  /api/admin/settings           - Get system settings
PUT  /api/admin/settings/[key]     - Update setting
GET  /api/admin/file-types         - List file type policies
POST /api/admin/file-types         - Create file type policy
```

</details>

### File Type Policies

The system includes 16 default file types out of the box:

| Category | Types | Max Size |
|----------|-------|----------|
| **Images** | jpg, png, gif, webp | 10 MB |
| **Documents** | pdf, doc, docx, xls, xlsx, txt | 50 MB |
| **Audio** | mp3, wav | 50-100 MB |
| **Video** | mp4, mpeg | 500 MB |
| **Archives** | zip, rar | 500 MB |

Admins can customize these limits or add new types via the admin panel.

## 🔒 Security Features

### Authentication & Access Control
- ✅ Strong password requirements (8+ chars, mixed case, numbers, symbols)
- ✅ Account lockout after failed login attempts
- ✅ Session management with HTTP-only cookies
- ✅ Role-based access control (RBAC)

### Two-Factor Authentication
- ✅ Admin-controlled global enforcement
- ✅ Time-based OTP codes (10-minute expiry)
- ✅ Email delivery with resend functionality
- ✅ Visual countdown timer

### Email Verification
- ✅ 6-digit verification codes
- ✅ 15-minute code expiry
- ✅ Required for account activation

### Password Security
- ✅ Password history (prevents reuse)
- ✅ Configurable expiry policies
- ✅ Bcrypt hashing algorithm
- ✅ Complexity enforcement

### File Security
- ✅ File type validation
- ✅ Size limit enforcement
- ✅ Virus scanning capability (configurable)
- ✅ Access control per file
- ✅ Secure share tokens

## 🚢 Deployment

### Docker Deployment

```bash
# Build the image
docker build -t platinum-drive .

# Run the container
docker run -p 3000:3000 \
  -e DATABASE_URL="your-db-url" \
  -e NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..." \
  -e CLERK_SECRET_KEY="sk_..." \
  platinum-drive
```

### Google Cloud Run

```bash
# Set your project
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable cloudbuild.googleapis.com run.googleapis.com

# Build and push the image
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/platinum-drive

# Deploy to Cloud Run
gcloud run deploy platinum-drive \
  --image gcr.io/YOUR_PROJECT_ID/platinum-drive \
  --platform managed \
  --region europe-west1 \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars DATABASE_URL="your-db-url",CLERK_SECRET_KEY="your-clerk-secret"
```

### Production Environment Variables

```yaml
DATABASE_URL=postgresql://user:pass@host:5432/dbname
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
NODE_ENV=production
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@your-domain.com
```

## 📜 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server

# Database
npx prisma migrate dev       # Run migrations (dev)
npx prisma migrate deploy    # Run migrations (prod)
npx prisma generate          # Generate Prisma Client
npx prisma studio            # Open Prisma Studio GUI
npx prisma db seed           # Seed database with initial data

# Type Checking & Linting
npm run type-check   # Run TypeScript compiler check
npm run lint         # Run ESLint
```

## 📁 Project Structure

```
platinum-drive/
├── prisma/
│   ├── schema.prisma           # Database schema
│   ├── seed.ts                 # Database seeding script
│   └── migrations/             # Database migrations
├── public/
│   └── uploads/                # User uploaded files
│       ├── avatars/            # User avatars
│       └── files/              # Uploaded files
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Auth pages (login, register, verify)
│   │   ├── admin/              # Admin panel pages
│   │   ├── api/                # API routes
│   │   ├── files/              # File management pages
│   │   ├── profile/            # User profile pages
│   │   └── settings/           # User settings pages
│   ├── components/             # React components
│   │   ├── ui/                 # Shadcn UI components
│   │   ├── shared/             # Shared components
│   │   └── layout/             # Layout components
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utility libraries
│   │   ├── auth/               # Authentication logic
│   │   ├── db/                 # Database utilities
│   │   ├── security/           # Security utilities
│   │   └── utils/              # General utilities
│   └── types/                  # TypeScript type definitions
├── Dockerfile                  # Docker configuration
├── docker-compose.yml          # Docker Compose setup
├── .env.example                # Environment variables template
└── package.json                # Dependencies and scripts
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🐛 Bug Reports

If you discover a bug, please create an issue on GitHub with:
- Description of the bug
- Steps to reproduce
- Expected behavior
- Screenshots (if applicable)
- Your environment (OS, Node version, etc.)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 Youssef Ahmed

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

## 👨‍💻 Author

**Youssef Ahmed**

- GitHub: [@youssef509](https://github.com/youssef509)
- Email: youssef201.dev@gmail.com
- LinkedIn: [Connect with me](https://linkedin.com/in/youssef-ahmed)

## 🙏 Acknowledgments

Built with amazing open-source technologies:

- [Next.js](https://nextjs.org/) - The React Framework for Production
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [Clerk](https://clerk.com/) - Authentication & User Management
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Shadcn/ui](https://ui.shadcn.com/) - Re-usable component library
- [Lucide Icons](https://lucide.dev/) - Beautiful & consistent icons
- [PostgreSQL](https://www.postgresql.org/) - Advanced open-source database

## ⭐ Show Your Support

If you find this project useful, please consider giving it a star on GitHub! It helps others discover the project and motivates continued development.

---

<div align="center">

**Made with ❤️ by Youssef Ahmed**

*Platinum Drive - Your files, secure and accessible* ☁️

[⬆ Back to Top](#️-platinum-drive)

</div>
