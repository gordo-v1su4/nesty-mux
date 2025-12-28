# Nestmux - Video Scrambler & Editor

A powerful Next.js application for video editing, scrambling, and timeline management with Mux integration.

## Features

- 🎬 **Video Timeline Editor** - Create and manage video projects with nested scenes and shots
- 🔀 **Video Scrambler** - Scramble video frames into chunks with customizable duration and variance
- 📹 **Mux Integration** - Upload and manage videos through Mux's video API
- 🎨 **Sequence Management** - Organize clips by sequences with color-coded timelines
- 📊 **Canvas View** - Visual node-based editing interface for scenes and shots
- ⏯️ **Video Playback** - Preview clips with HLS streaming support

## Prerequisites

- Bun (latest version recommended)
- Mux account with API credentials ([Get them here](https://dashboard.mux.com/settings/access-tokens))

## Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nesty-mux
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Configure environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   MUX_TOKEN_ID=your_mux_token_id_here
   MUX_TOKEN_SECRET=your_mux_token_secret_here
   ```
   
   Get your credentials from [Mux Dashboard](https://dashboard.mux.com/settings/access-tokens)

4. **Run the development server**
   ```bash
   bun run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Building for Production

```bash
bun run build
bun start
```

## Project Structure

```
├── app/
│   ├── api/mux/          # Mux API routes (upload, assets)
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Main application page
├── components/
│   ├── mux-player.tsx     # Mux video player component
│   ├── mux-thumbnail.tsx  # Thumbnail component
│   ├── video-library-panel.tsx  # Video library UI
│   ├── timeline-clip.tsx  # Timeline clip component
│   └── ui/                # Reusable UI components
├── lib/
│   ├── mux.ts            # Mux client initialization
│   └── mux-urls.ts       # Mux URL utilities
└── styles/
    └── globals.css       # Global styles and theme
```

## Usage

### Uploading Videos

1. Click the "Mux Library" button in the header
2. Click "Upload to Mux" in the video library panel
3. Select a video file to upload
4. Wait for processing (videos will appear when ready)

### Creating a Timeline

1. Navigate to a project (double-click to enter)
2. View scenes in the canvas view
3. Select clips from the timeline sidebar
4. Assign Mux videos to clips by selecting from the library

### Scrambling Videos

1. Upload a video using the video scrambler section
2. Adjust chunk duration (how long each segment is)
3. Set chunk variance (randomness in segment sizes)
4. Click "Scramble Video" to process
5. Download or add scrambled chunks to timeline

### Managing Sequences

1. Click "Add Sequence" in the timeline panel
2. Enter a sequence name
3. Select a color theme
4. Clips will be organized by sequence with color coding

## Technologies Used

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Mux** - Video hosting and streaming
- **HLS.js** - HLS video playback
- **Radix UI** - Accessible component primitives

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MUX_TOKEN_ID` | Mux API token ID | Yes |
| `MUX_TOKEN_SECRET` | Mux API token secret | Yes |

## License

MIT
