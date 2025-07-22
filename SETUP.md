# HealthDiaryAI Setup Guide

## Prerequisites

1. **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
2. **OpenAI API Key**: Get one from [platform.openai.com](https://platform.openai.com/api-keys)

## Environment Configuration

1. Copy the example environment file:
   ```bash
   cp env.example .env.local
   ```

2. Update `.env.local` with your actual values:

### Supabase Configuration

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or select an existing one
3. Go to **Settings** > **API**
4. Copy the following values:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

### OpenAI Configuration

1. Visit [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Create a new API key
3. Add it as `VITE_OPENAI_API_KEY`

## Database Setup

The application will automatically create the necessary database tables when you first run it. The database schema includes:

- `health_logs` - Daily health tracking data
- `hypotheses` - AI-generated health insights
- `lab_work` - Laboratory test results
- `medical_tests` - Medical test records
- `profiles` - User profile information

## Running the Application

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:5173](http://localhost:5173) in your browser

## Features

- 📊 **Health Logging**: Track symptoms, medications, mood, and sleep
- 🧪 **Lab Work**: Record and monitor lab results
- 🤖 **AI Insights**: Get AI-powered analysis of health patterns
- 👤 **User Authentication**: Secure user accounts with guest mode
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Security Note

Never commit your actual API keys or environment variables to the repository. Always use the `.env.local` file for local development and proper secrets management for production deployments.