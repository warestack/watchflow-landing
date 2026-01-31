# Watchflow Landing Page

Modern React/TypeScript implementation of the Watchflow landing page with improved UX, better state management, and type safety.

## Features

- ✅ **Repository Analysis**: Analyze any GitHub repository and get agentic guardrail recommendations
- ✅ **Rule Feasibility Check**: Validate if natural language rules can be implemented
- ✅ **Token Management**: Optional GitHub token for higher rate limits and private repos
- ✅ **PR Creation**: One-click PR creation with generated rules
- ✅ **Mock Analysis**: Example analysis for demonstration
- ✅ **Responsive Design**: Works on all screen sizes

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast builds and HMR
- **Tailwind CSS** for styling
- **Lucide Icons** for consistent iconography
- **shadcn/ui** components

## Development

### Prerequisites

- Node.js 20+ 
- npm or bun

### Setup

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will be available at `http://localhost:8080`

## API Configuration

The app automatically detects the environment:

- **localhost/127.0.0.1**: Uses `http://localhost:8000/api/v1` (default for local dev)
- **Production**: Uses `https://api.watchflow.dev/api/v1` (when not on localhost)
- **Custom**: Override with `VITE_API_BASE` environment variable

### Using .env file

Create a `.env` file in the root directory to set a custom backend URL:

```bash
# .env
VITE_API_BASE=http://localhost:8000/api/v1
```

Or for different ports or ngrok:
```bash
# .env
VITE_API_BASE=http://localhost:3000/api/v1
# or
VITE_API_BASE=https://your-ngrok-url.ngrok-free.app/api/v1
```

**Note**: Vite only exposes environment variables prefixed with `VITE_` to the client. See `.env.example` for a template.

## Deployment

The project includes a Helm chart for Kubernetes deployment and a GitHub Actions workflow for automated deployment to EKS.

### Quick Deploy

```bash
# Build Docker image
docker build -t watchflow-landing:latest .

# Test locally
docker run -p 8080:80 watchflow-landing:latest

# Deploy to EKS (see helm-chart/ directory)
```

## Project Structure

```
watchflow-landing/
├── src/
│   ├── components/       # React components
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Page components
│   ├── utils/           # Utility functions
│   └── lib/             # Shared libraries
├── public/              # Static assets
├── helm-chart/          # Kubernetes Helm chart
├── .github/workflows/   # CI/CD workflows
└── Dockerfile           # Multi-stage Docker build
```

## License

See parent repository for license information.
