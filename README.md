# AI Image Generator MVP

A complete, production-ready mobile-first AI Image Generation & Editing app built with Next.js, TypeScript, and Tailwind CSS.

## Features

### Core Functionality
- **Text-to-Image Generation** - Generate images from text prompts
- **Image Editing & Inpainting** - Upload images and edit with AI using mask brush
- **Progressive Previews** - Low-res → mid-res → final image progression
- **Multiple Generation Modes** - "Add my girlfriend", "Studio portrait", "Cartoonize"
- **Real-time Job Management** - Track generation progress with cancellation support

### Mobile-First Design
- **Responsive Layout** - Optimized for mobile, tablet, and desktop
- **Touch Gestures** - Pinch-to-zoom, pan, and touch-friendly controls
- **Bottom Sheet UI** - Native mobile experience with swipe gestures
- **Progressive Web App** - Installable with offline capabilities

### Technical Features
- **Modular Backend** - Adapter pattern for multiple AI providers
- **Design Token System** - Consistent styling with JSON-based tokens
- **Accessibility** - WCAG compliant with keyboard navigation
- **TypeScript** - Full type safety throughout the application

## Quick Start

### Installation
\`\`\`bash
npm install
\`\`\`

### Development
\`\`\`bash
npm run dev
\`\`\`

The app will start at `http://localhost:3000` using the LocalMockAdapter for development.

### Environment Variables

For production use with real AI providers, set these environment variables in `.env.local`:

\`\`\`bash
# Gemini AI (Google)
GEMINI_API_KEY=your_gemini_api_key

# Banana (Stable Diffusion)
BANANA_API_KEY=your_banana_api_key
BANANA_MODEL_KEY=stable-diffusion-xl

# Storage (for production)
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-bucket-name
\`\`\`

## Architecture

### Model Registry
The app uses an adapter pattern to support multiple AI providers:

- **LocalMockAdapter** - Development/testing with placeholder images
- **GeminiAdapter** - Google's Gemini Pro Vision API
- **BananaAdapter** - Banana's Stable Diffusion XL API

### File Structure
\`\`\`
src/
├── app/                    # Next.js app router
├── components/             # React components
│   ├── ui/                # Base UI components
│   ├── Canvas.tsx         # Image display with zoom/pan
│   ├── PromptInput.tsx    # Prompt interface
│   ├── MaskBrush.tsx      # Masking tool
│   └── ...
├── design/tokens/         # Design system tokens
├── config/                # App configuration
├── lib/                   # Core business logic
│   ├── adapters/          # AI provider adapters
│   ├── modelRegistry.ts   # Model management
│   └── jobStore.ts        # Job persistence
├── hooks/                 # React hooks
├── pages/api/             # API routes
├── styles/                # Global styles
└── types/                 # TypeScript definitions
\`\`\`

### API Endpoints

- `POST /api/generate` - Start image generation
- `POST /api/edit` - Start image editing
- `GET /api/job/[id]` - Get job status
- `DELETE /api/job/[id]` - Cancel job
- `POST /api/upload-url` - Get signed upload URL
- `GET /api/models` - List available models

## Customization

### Adding New Generation Modes
Edit `src/config/modes.json`:
\`\`\`json
{
  "id": "new-mode",
  "name": "New Mode",
  "description": "Description of the mode",
  "promptTemplate": "Your template with {userPrompt}",
  "preserveFaces": true,
  "defaultAspect": "1:1",
  "recommendedSize": "1024x1024",
  "strengthDefault": 0.8,
  "category": "style"
}
\`\`\`

### Modifying Design Tokens
Update files in `src/design/tokens/`:
- `colors.json` - Color palette
- `typography.json` - Font settings
- `spacing.json` - Layout spacing
- `radii.json` - Border radius values
- `shadows.json` - Shadow definitions

### Adding New AI Providers
1. Create adapter in `src/lib/adapters/YourAdapter.ts`
2. Implement the `ModelAdapter` interface
3. Register in `src/lib/modelRegistry.ts`

## Production Deployment

### Database Setup
Replace in-memory job storage with PostgreSQL:
\`\`\`sql
CREATE TABLE jobs (
  id VARCHAR(255) PRIMARY KEY,
  status VARCHAR(50) NOT NULL,
  progress INTEGER DEFAULT 0,
  preview_urls TEXT[],
  final_url TEXT,
  model_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  error_message TEXT,
  eta INTEGER
);
\`\`\`

### Storage Integration
Replace mock upload URLs with real storage (S3, CloudFlare R2, etc.) in `src/pages/api/upload-url.ts`.

### Real-time Updates
Consider implementing WebSocket or Server-Sent Events for real-time job updates instead of polling.

## Performance Targets

- **Lighthouse Mobile Performance**: ≥70
- **Lighthouse Accessibility**: ≥90
- **First Contentful Paint**: <2s
- **Time to Interactive**: <3s

## Browser Support

- **Mobile**: iOS Safari 14+, Chrome Mobile 90+
- **Desktop**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

## Development Roadmap

### Phase 1 (Current MVP)
- ✅ Core generation and editing
- ✅ Mobile-first responsive design
- ✅ Mock adapters for development

### Phase 2 (Production Ready)
- 🔄 Real AI provider integration
- 🔄 PostgreSQL persistence
- 🔄 S3/CloudFlare R2 storage
- 🔄 WebSocket real-time updates

### Phase 3 (Advanced Features)
- 📋 User accounts and authentication
- 📋 Image history and favorites
- 📋 Batch processing
- 📋 Advanced editing tools
- 📋 Social sharing

## License

MIT License - see LICENSE file for details.

## Support

For issues and feature requests, please create an issue in the repository.
