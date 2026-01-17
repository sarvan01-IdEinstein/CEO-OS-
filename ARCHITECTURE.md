# CEO Personal OS - Architecture Overview

## Project Structure

```
ceo-os-app/
├── app/                    # Next.js App Router pages
│   ├── api/               # API Routes (server-side)
│   │   ├── ai/           # AI chat completions
│   │   └── files/        # File CRUD operations
│   ├── components/        # Shared React components
│   ├── flow/             # Deep Work / Focus Timer
│   ├── frameworks/        # Life frameworks tools
│   ├── goals/            # OKR tracking
│   ├── library/          # Document library
│   ├── reviews/          # Daily/Weekly/Quarterly reviews
│   ├── settings/         # User settings
│   └── tools/            # Thinking tools (Decision, Premortem, etc.)
├── lib/                   # Shared utilities
│   ├── api.ts            # Core file operations
│   ├── ai.ts             # AI provider configuration
│   ├── ai-client.ts      # Client-side AI helper
│   ├── export/           # Data export utilities
│   │   ├── backup.ts     # JSON backup/restore
│   │   └── pdf.ts        # PDF generation
│   ├── supabase.ts       # Client-side Supabase
│   ├── supabase-server.ts # Server-side Supabase
│   ├── types.ts          # TypeScript types
│   └── utils/            
│       └── date.ts       # Date utilities
├── data/                  # Local file storage (development)
└── public/               # Static assets
```

## Key Components

### State Management
- **SidebarContext** - Sidebar open/close state
- **ToastContext** - Toast notification system

### Core Features
| Feature | Page | Description |
|---------|------|-------------|
| Dashboard | `/` | OKR progress, daily cycle, quick actions |
| Reviews | `/reviews` | Daily/Weekly/Quarterly journal entries |
| Deep Work | `/flow` | Focus timer with Pomodoro mode |
| Life Map | `/frameworks/life_map` | Life balance wheel |
| Life Usage | `/frameworks/life_usage` | Timeline visualization |
| Leverage Lab | `/frameworks/leverage` | Priority matrix |
| Board Room | `/frameworks/board` | AI advisor personas |

### AI Integration
- **ChiefOfStaff** - Floating AI chat assistant
- **Server-side API** - `/api/ai/route.ts` for secure OpenAI/Ollama calls
- **Client helper** - `lib/ai-client.ts` for type-safe AI requests

### Data Storage
- **Supabase** - User authentication and cloud storage (production)
- **Local files** - `/data` directory (development)

## Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS with custom glassmorphism theme
- **Animation**: Framer Motion
- **AI**: OpenAI GPT-4o / Ollama (local)
- **Database**: Supabase (PostgreSQL)
- **Testing**: Jest, React Testing Library, Playwright

## Design Principles

1. **Glassmorphism UI** - Premium translucent aesthetics
2. **Mobile-First** - Responsive design for all devices
3. **Accessibility** - ARIA labels, keyboard navigation
4. **Progressive Enhancement** - Works offline with local storage fallback
