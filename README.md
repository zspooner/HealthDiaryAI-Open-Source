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
   git clone <YOUR_GIT_URL>
   cd health-detective-ai-logs
   ```

2. **Install dependencies**
   ```sh
   npm install
   ```

3. **Set up environment variables**
   ```sh
   cp env.example .env
   ```
   
   Edit `.env` and add your credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url_here
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Set up Supabase**
   - Create a new Supabase project
   - Run the migrations in `supabase/migrations/`
   - Copy your project URL and anon key to `.env`

5. **Start the development server**
   ```sh
   npm run dev
   ```

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
