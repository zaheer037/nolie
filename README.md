# NoLie AI - Content Analysis Platform

A comprehensive AI-powered platform for detecting plagiarism, document forgery, and privacy issues in digital content.

## 🚀 Features

- **Plagiarism Detection**: Advanced NLP-based text analysis
- **Document Forgery Detection**: Image and document manipulation detection
- **Privacy Protection**: PII (Personally Identifiable Information) detection
- **Comprehensive Reporting**: Detailed analysis reports with recommendations
- **User Authentication**: Secure user accounts with email verification
- **Analysis History**: Track and manage previous analyses

## 🛠️ Local Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- A Supabase account
- A Google AI API key

### 1. Clone and Install

\`\`\`bash
git clone <your-repo-url>
cd nolie-ai
npm install
\`\`\`

### 2. Environment Setup

1. Copy the environment template:
\`\`\`bash
cp .env.local.example .env.local
\`\`\`

2. Fill in your environment variables in `.env.local`:

\`\`\`env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google AI Configuration  
GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_api_key
\`\`\`

### 3. Supabase Setup

#### A. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the project to be ready

#### B. Get Your Keys
1. Go to Project Settings → API
2. Copy the Project URL and anon key to your `.env.local`
3. Copy the service_role key to your `.env.local`

#### C. Set Up Database
1. Go to SQL Editor in your Supabase dashboard
2. Run the following scripts in order:
   - Copy and run `scripts/01-setup-profiles.sql`
   - Copy and run `scripts/02-setup-analysis-reports.sql`
   - Copy and run `scripts/03-verify-setup.sql` to verify everything is working

#### D. Configure Authentication
1. Go to Authentication → Settings
2. Set **Site URL** to: `http://localhost:3000` (for development)
3. Add to **Redirect URLs**: `http://localhost:3000/auth/confirm`
4. Enable email confirmations if desired

### 5. **Storage Setup (for Profile Pictures)**
1. Go to Supabase Dashboard → Storage
2. Click "Create a new bucket"
3. Name it "avatars"
4. Set as Public: ✅ Yes
5. File size limit: 5MB
6. Allowed MIME types: `image/*`
7. After creating, go to Storage → Policies
8. Create these policies for the "avatars" bucket:
   - **Insert**: `(bucket_id = 'avatars'::text) AND (auth.uid()::text = (storage.foldername(name))[1])`
   - **Select**: `bucket_id = 'avatars'::text`
   - **Update**: `(bucket_id = 'avatars'::text) AND (auth.uid()::text = (storage.foldername(name))[1])`
   - **Delete**: `(bucket_id = 'avatars'::text) AND (auth.uid()::text = (storage.foldername(name))[1])`

### 4. Google AI Setup

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Add it to your `.env.local` file

### 5. Run the Application

\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000` to see the application.

## 🧪 Testing the Setup

1. **Sign up** with a new email address
2. **Verify email** (check spam folder if needed)
3. **Sign in** to your account
4. **Upload a test file** and run analysis
5. **Check the History tab** to see saved results

## 📁 Project Structure

\`\`\`
nolie-ai/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard page
│   └── ...
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── ui/               # UI components
│   └── ...
├── lib/                  # Utility libraries
├── scripts/              # Database setup scripts
└── ...
\`\`\`

## 🔧 Common Issues & Solutions

### Issue: "No profiles visible in database"
**Solution**: 
1. Run the database setup scripts in order
2. Make sure the trigger for automatic profile creation is working
3. Check that RLS policies are properly configured

### Issue: "Email confirmation not working"
**Solution**:
1. Check that your Site URL is correctly set in Supabase
2. Verify redirect URLs include your confirmation page
3. Make sure you're using the correct domain (localhost for development)

### Issue: "Analysis not saving to database"
**Solution**:
1. Verify your service role key is correct
2. Check that RLS policies allow authenticated users to insert
3. Run the verification script to check database setup

### Issue: "Google AI API errors"
**Solution**:
1. Verify your API key is correct
2. Check that you have sufficient quota
3. Ensure the API key has the necessary permissions

## 🚀 Deployment

### Vercel Deployment
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Update Supabase auth settings with your production URL

### Environment Variables for Production
Update these in your deployment platform:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` 
- `SUPABASE_SERVICE_ROLE_KEY`
- `GOOGLE_GENERATIVE_AI_API_KEY`

## 📝 API Endpoints

- `POST /api/analyze` - Analyze uploaded files
- `POST /api/save-report` - Save analysis results
- `GET /api/get-reports` - Retrieve user's analysis history
- `POST /api/generate-report` - Generate downloadable reports
- `GET /api/test-db` - Test database connection

## 🔒 Security Features

- Row Level Security (RLS) on all database tables
- JWT-based authentication
- Secure file upload handling
- Environment variable protection
- CORS protection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
