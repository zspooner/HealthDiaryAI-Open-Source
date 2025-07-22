# Health Detective AI

A comprehensive health tracking and AI analysis application that helps users monitor their symptoms, lab work, and medical tests while providing AI-powered insights and hypotheses.

## Features

- **Health Logging**: Track daily symptoms, medications, mood, and sleep
- **Lab Work Management**: Store and organize medical test results
- **AI Analysis**: Get AI-powered insights and medical hypotheses
- **Reddit Integration**: Search for similar health experiences
- **Secure Authentication**: User accounts with Supabase
- **Responsive Design**: Works on desktop and mobile devices

## Project info

**URL**: https://lovable.dev/projects/c1772af3-65d8-43b5-a095-1c5f42e1e7b0

## Setup and Installation

### Prerequisites

- Node.js (v18 or higher) - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- npm or yarn
- Supabase account
- OpenAI API key (optional, for AI features)

### Environment Setup

1. **Clone the repository**
   ```sh
   git clone https://github.com/yourusername/health-detective-ai-logs.git
   cd health-detective-ai-logs
   ```

2. **Install dependencies**
   ```sh
   npm install
   ```

3. **Quick setup (optional)**
   ```sh
   ./setup.sh
   ```
   This will create your `.env` file and show next steps.

3. **Set up Supabase (Required)**
   
   **Create your own Supabase project:**
   - Go to [supabase.com](https://supabase.com) and create a free account
   - Create a new project
   - Go to Settings → API
   - Copy your project URL and anon key
   
   **Set up environment variables:**
   ```sh
   cp env.example .env
   ```
   
   Edit `.env` and add your credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_OPENAI_API_KEY=your_openai_api_key_here  # Optional for AI features
   ```

4. **Set up database tables**
   
   **Option A: Use Supabase CLI (recommended)**
   ```sh
   npx supabase link --project-ref your-project-ref
   npx supabase db push
   ```
   
   **Option B: Manual setup**
   - Go to your Supabase dashboard → SQL Editor
   - Run the SQL from `supabase/migrations/20250719130712-de816ac4-e395-4aa8-a83d-7b329eadb7cd.sql`
   - Run the SQL from `supabase/migrations/20250719135243-2529f93e-d886-4be1-9659-af5989c7169c.sql`

5. **Start the development server**
   ```sh
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:8080`

**Note:** Never commit your `.env` file. It's already in `.gitignore` to protect your API keys.

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/c1772af3-65d8-43b5-a095-1c5f42e1e7b0) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: shadcn/ui, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **AI Integration**: OpenAI GPT-4o-mini
- **Deployment**: Vercel/Netlify ready

## Troubleshooting

### Common Issues

**"Save Health Log button doesn't work"**
- Check that your `.env` file exists and has the correct Supabase credentials
- Verify your Supabase project URL and anon key are correct
- Check browser console (F12) for error messages
- Ensure database tables are created (run migrations)

**"AI Analysis not working"**
- OpenAI API key is optional - the app will work without AI features
- If you want AI features, add your OpenAI API key to `.env`
- Check that your Supabase Edge Functions are deployed

**"Authentication issues"**
- Verify your Supabase project has authentication enabled
- Check that your anon key has the correct permissions
- Ensure your Supabase project is not paused (free tier limitation)

**"Database connection errors"**
- Run the database migrations to create required tables
- Check your Supabase project status
- Verify your project URL is correct

### Getting Help

- Check the browser console (F12) for error messages
- Verify all environment variables are set correctly
- Ensure your Supabase project is active and not paused
- Check that database tables exist and have correct structure

## Security & Privacy

- All sensitive data is stored in environment variables
- Supabase handles authentication and data encryption
- No health data is stored by OpenAI (processed locally)
- Medical disclaimers are prominently displayed

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/c1772af3-65d8-43b5-a095-1c5f42e1e7b0) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Contributing

This project is open source! Feel free to:

- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Medical Disclaimer

⚠️ **Important**: This application is for informational purposes only and should not replace professional medical advice. Always consult with qualified healthcare providers about any health concerns.
