#!/bin/bash

echo "🚀 Health Detective AI - Setup Script"
echo "====================================="
echo ""

# Check if .env file exists
if [ -f ".env" ]; then
    echo "⚠️  .env file already exists. Skipping creation."
else
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "✅ .env file created!"
fi

echo ""
echo "🔧 Next Steps:"
echo "1. Edit .env file and add your Supabase credentials:"
echo "   - VITE_SUPABASE_URL=your_supabase_project_url"
echo "   - VITE_SUPABASE_ANON_KEY=your_supabase_anon_key"
echo ""
echo "2. Set up your Supabase project:"
echo "   - Go to https://supabase.com"
echo "   - Create a new project"
echo "   - Copy your project URL and anon key"
echo ""
echo "3. Run database migrations:"
echo "   - npx supabase db push"
echo "   - Or manually run the SQL files in supabase/migrations/"
echo ""
echo "4. Start the development server:"
echo "   - npm run dev"
echo ""
echo "📖 For detailed instructions, see README.md"
echo ""
echo "🔒 Remember: Never commit your .env file to version control!" 