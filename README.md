# RETELL - Podcast Discovery Platform

RETELL is a podcast discovery platform that connects podcast creators with audiences worldwide. It allows authors to upload their content and provides a curated catalog for listeners to discover new podcasts.

## 🚀 Features

### For Authors
- **Upload & Manage Content**: Upload podcasts and episodes with metadata
- **Content Management**: Organize your podcast library with episodes
- **Content Approval**: Submit content for admin review and approval
- **Analytics Dashboard**: View podcast performance and engagement

### For Listeners
- **Browse Catalog**: Search and filter available podcast content
- **Discover Content**: Find new podcasts from creators worldwide
- **Quality Curation**: Access only approved, high-quality content
- **Detailed Information**: View comprehensive podcast and episode details

### For Admins
- **Content Moderation**: Review and approve/reject podcast submissions
- **User Management**: Manage author accounts and roles
- **Platform Analytics**: Monitor platform-wide activity and metrics
- **Quality Control**: Ensure content meets platform standards

## 🛠 Tech Stack

- **Frontend**: Next.js 15 with App Router, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Authentication**: Supabase Auth with role-based access control
- **File Storage**: Supabase Storage for audio files and scripts
- **UI Components**: Custom components with Tailwind CSS
- **Database**: PostgreSQL with Row Level Security (RLS)

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

## 🔧 Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd retell
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Copy `.env.example` to `.env.local` and fill in your values:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=RETELL
```

### 4. Set up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor in your Supabase dashboard
3. Run the database schema from `database-schema.sql`
4. Run the cleanup script from `remove-licensing-tables.sql` to remove licensing functionality
5. Enable Row Level Security (RLS) on all tables
6. Configure Storage buckets for audio files and scripts

### 5. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📊 Database Schema

The application uses the following main tables:

- **user_profiles**: User information and roles (admin, author)
- **podcasts**: Podcast metadata and approval status
- **episodes**: Individual episode information
- **agencies**: Partner agencies (optional)
- **uploads**: File metadata and tracking

## 🔐 Authentication & Authorization

### User Roles
- **Admin**: Full platform access, content moderation, user management
- **Author**: Upload content, manage podcasts, view analytics

### Row Level Security (RLS)
All database tables have RLS policies that enforce:
- Users can only access their own data
- Admins have full access to all data
- Public content is available to all users
- Only approved content is visible in the catalog

## 🎨 UI Components

The platform uses a custom design system built with Tailwind CSS:
- Responsive design for all screen sizes
- Consistent color scheme and typography
- Accessible form components
- Interactive dashboards with real-time data

## 📱 Pages & Routes

### Public Routes
- `/` - Landing page
- `/catalog` - Browse available podcasts
- `/podcast/[id]` - Individual podcast details
- `/auth/login` - User login
- `/auth/signup` - User registration

### Protected Routes
- `/admin` - Admin dashboard
- `/author` - Author dashboard
- `/admin/podcasts` - Admin podcast management
- `/admin/users` - Admin user management
- `/author/podcasts` - Author podcast management
- `/author/upload` - Author upload page

## 🔄 Development Workflow

### Code Structure
```
src/
├── app/                 # Next.js app router pages
├── components/          # Reusable UI components
├── lib/                 # Utility functions and configurations
├── types/              # TypeScript type definitions
└── styles/             # Global styles
```

### Key Files
- `src/lib/supabase.ts` - Supabase client configuration
- `src/lib/auth.ts` - Authentication helpers
- `src/lib/utils.ts` - Utility functions
- `src/types/database.ts` - Database type definitions
- `database-schema.sql` - Complete database schema
- `remove-licensing-tables.sql` - Script to remove licensing functionality

## 📈 Features Status

### Core Features (Ready)
- ✅ User authentication and authorization
- ✅ Role-based dashboards
- ✅ Podcast catalog and detail pages
- ✅ Content moderation system
- ✅ Database schema with RLS
- ✅ File upload system
- ✅ Admin and author management

### Planned Features
- 📅 Enhanced search and filtering
- 📅 Audio player integration
- 📅 Analytics and reporting
- 📅 Email notifications
- 📅 API endpoints
- 📅 Mobile app support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For support and questions:
- Check the documentation
- Review the database schema
- Ensure environment variables are correctly configured
