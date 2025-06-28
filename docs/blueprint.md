# **App Name**: Screen Guardian

## Core Features:

- Accessibility Monitoring: Accessibility Service: Continuously monitor on-screen text using AccessibilityService to detect blocked keywords from any app using TYPE_WINDOW_CONTENT_CHANGED and TYPE_WINDOW_STATE_CHANGED events.
- Content Blocking Overlay: Content Blocking: Display a semi-transparent, full-screen overlay to block user interaction when blocked keywords are detected. The overlay disappears automatically when the blocked content is no longer visible.
- Remote Blocklist: Blocked Words Management: Load the list of blocked keywords from a remote .txt or .json file. Store a local cached copy for offline use and instant loading.
- Permissions Management: Permissions Handling: Request and manage Accessibility and Overlay permissions using clear UI prompts within the MainActivity, guiding users through the setup.
- Contextual Analysis and Blocking: List matching: An efficient matching algorithm using Trie will flag potential matches of objectionable content. An LLM as tool will decide if it warrants the app taking action (by overlaying a transparent UI and blocking the content)

## Style Guidelines:

- Primary color: Deep blue (#3F51B5) to convey security and trust.
- Background color: Light gray (#F5F5F5) for a clean and unobtrusive interface.
- Accent color: Orange (#FF9800) for important alerts and prompts.
- Body and headline font: 'Inter', a sans-serif font, for a clean, readable UI.
- Use clear and recognizable icons for settings and permissions. The style is modern and minimalistic.
- The layout in MainActivity includes clear, step-by-step instructions for setting up the Accessibility Service and Overlay permissions.
- Subtle animations when the overlay appears and disappears for a smoother user experience.