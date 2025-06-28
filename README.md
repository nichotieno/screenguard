# Screen Guardian

Screen Guardian is a web application that demonstrates real-time content monitoring and blocking using AI. It simulates a system service that protects users from harmful text by analyzing on-screen content and displaying an overlay when objectionable material is detected.

## ✨ Features

- **Real-Time Content Analysis:** Type or paste text into the simulator to see it analyzed in real-time.
- **AI-Powered Smart Analysis:** Leverages Google's Gemini model via Genkit to intelligently categorize harmful content (e.g., Hate Speech, Violence) and explain *why* it was flagged.
- **Dynamic Blocking Overlay:** When harmful content is detected, a non-intrusive overlay appears, blocking the content and showing the analysis results.
- **Activity Dashboard:** A comprehensive dashboard that visualizes blocked content categories with a bar chart and lists recent blocking events in a detailed log.
- **Permission-Based Simulation:** Simulates the process of granting necessary system permissions (like Accessibility and Overlay) required for such an app to function on a real device.
- **Local History:** All blocking activity is saved in the browser's local storage for persistence across sessions.

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (with App Router)
- **UI:** [React](https://react.dev/) & [TypeScript](https://www.typescriptlang.org/)
- **AI:** [Firebase Genkit](https://firebase.google.com/docs/genkit) with [Google's Gemini API](https://ai.google.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [ShadCN UI](https://ui.shadcn.com/)
- **Charts:** [Recharts](https://recharts.org/)

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [npm](https://www.npmjs.com/) or a compatible package manager

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/screen-guardian.git
    cd screen-guardian
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project by copying the example file:
    ```bash
    cp .env.example .env
    ```
    Now, open the `.env` file and add your Google AI API key. You can get a free key from [Google AI Studio](https://aistudio.google.com/app/apikey).
    ```dotenv
    # .env
    GOOGLE_API_KEY="YOUR_API_KEY_HERE"
    ```

4.  **Run the development server:**
    This command starts the Next.js application.
    ```bash
    npm run dev
    ```
    Open [http://localhost:9002](http://localhost:9002) in your browser to see the app.

5.  **(Optional) Run the Genkit Developer UI:**
    To inspect, run, and debug your AI flows, open a separate terminal and run:
    ```bash
    npm run genkit:dev
    ```
    This will start the Genkit UI, typically on [http://localhost:4000](http://localhost:4000).

## 📁 Project Structure

Here's a high-level overview of the key directories in the project:

```
.
├── src
│   ├── ai/                  # Genkit AI configuration and flows
│   │   ├── flows/           # AI flow definitions (e.g., content-check.ts)
│   │   └── genkit.ts        # Genkit initialization
│   ├── app/                 # Next.js App Router pages and server actions
│   │   ├── dashboard/       # The activity dashboard page
│   │   ├── page.tsx         # The main application page
│   │   └── actions.ts       # Server actions callable from the client
│   ├── components/          # Reusable React components
│   │   └── ui/              # ShadCN UI components
│   └── lib/                 # Utility functions
└── public/                  # Static assets like images and JSON files
```

## 🤔 How It Works

1.  **Permissions:** The user first "enables" simulated permissions for accessibility and overlay drawing. This state is saved in local storage.
2.  **Text Input:** On the main page, the user types into a textarea.
3.  **Debounced Check:** As the user types, the input is debounced. A local check is performed against a simple blocklist (`public/blocked-words.json`) to see if a more expensive AI analysis is warranted.
4.  **AI Analysis:** If a potential match is found, the text is sent to a Next.js Server Action (`checkContent`).
5.  **Genkit Flow:** The server action invokes the `contentAnalysisFlow` Genkit flow. This flow sends the text to the Gemini API with a structured prompt, asking for a classification and reason.
6.  **Response & UI Update:** The AI's analysis is returned to the client. If the content is flagged (`isObjectionable: true`), the `BlockingOverlay` component is displayed with the category and reason.
7.  **History Logging:** Every time content is blocked, the event details (category, reason, timestamp) are saved to the browser's local storage.
8.  **Dashboard:** The `/dashboard` page reads the history from local storage to render the activity charts and logs.

## API and Function Reference

This section provides a detailed breakdown of the key functions, components, and APIs used throughout the Screen Guardian application.

### Frontend Components & Hooks

#### `src/app/page.tsx` - Main Application Page

This is the primary user-facing component for content analysis.

| Function / Hook        | Description                                                                                                                                                             |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ScreenGuardianPage()` | The main functional component. Manages state for permissions, user input text, and AI analysis results.                                                                 |
| `handlePermissionToggle(permission)` | Toggles the state of a given permission (`accessibility` or `overlay`), updates `localStorage`, and shows a confirmation toast.                                 |
| `handleClear()`        | Resets the application state by clearing the text area content and the previous analysis result.                                                                          |
| `handleTextChange(e)`  | Triggered on text area input. It debounces the input, performs a quick local check against a blocklist, and if a potential match is found, calls the `checkContent` server action. |
| `useEffect()`          | On initial component mount, it loads permission states from `localStorage` and fetches the `blocked-words.json` blocklist.                                             |
| `useMemo()`            | Used to derive `allPermissionsGranted` and `isBlocking` states from component state, optimizing re-renders.                                                              |
| `renderPermissionsSetup()` | A function that returns the JSX for the initial permission setup card.                                                                                              |
| `renderMonitoringInterface()` | A function that returns the JSX for the main content monitoring interface, including the text area and blocking overlay.                                            |

---

#### `src/app/dashboard/page.tsx` - Activity Dashboard

This component displays analytics about blocked content.

| Function / Hook   | Description                                                                                                    |
| ----------------- | -------------------------------------------------------------------------------------------------------------- |
| `DashboardPage()` | The main functional component for the dashboard. Fetches and displays data from `localStorage`.                |
| `clearHistory()`  | Clears the `blockingHistory` item from `localStorage` and resets the component's state.                          |
| `useEffect()`     | On mount, sets a flag `isClient` to `true` to avoid server-side rendering issues with `localStorage`. It then loads the history. |
| `useMemo()`       | Used to calculate `chartData` (aggregating counts per category) and `sortedHistory` from the history state. This avoids re-calculating on every render. |

---

#### `src/components/blocking-overlay.tsx` - Blocking Overlay

A reusable component that appears over the UI to block content.

| Prop      | Type                  | Description                                                              |
| --------- | --------------------- | ------------------------------------------------------------------------ |
| `result`  | `ContentAnalysis` \| `null` | The analysis result from the AI. The overlay is shown if `result.isObjectionable` is `true`. |
| `onClear` | `() => void`          | A callback function that is invoked when the "Clear and Continue" button is clicked. |

---

### Backend (Server Actions & AI Flows)

#### `src/app/actions.ts` - Server Actions

These are functions that run exclusively on the server but can be called directly from client components.

| Function           | Parameters       | Returns                 | Description                                                                                                                                             |
| ------------------ | ---------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `checkContent()`   | `text: string`   | `Promise<ContentAnalysis>` | The primary server action. It validates the input text and calls the `analyzeContent` Genkit flow to perform AI analysis. Includes error handling for AI service failures. |

---

#### `src/ai/flows/content-check.ts` - Genkit AI Flow

This file defines the core AI logic for content analysis.

| Function / Definition       | Description                                                                                                                                                               |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ContentAnalysisSchema`     | A `zod` schema that defines the expected structure of the JSON output from the AI model. It ensures type safety for the AI's response.                                       |
| `analyzeContent(text)`      | The exported wrapper function that the server action calls. It invokes the `contentAnalysisFlow` with the provided text and returns the result.                             |
| `contentAnalysisFlow`       | The main Genkit flow, defined with `ai.defineFlow`. It orchestrates the AI call by taking a string input, passing it to the prompt, and returning the structured output.     |
| `contentAnalysisPrompt`     | A Genkit prompt definition, created with `ai.definePrompt`. It contains the actual instruction string sent to the Gemini model and specifies the input and output schemas. |

---

### Utility Functions

#### `src/lib/utils.ts`

| Function | Description                                                                                               |
| -------- | --------------------------------------------------------------------------------------------------------- |
| `cn()`   | A helper function that combines `clsx` and `tailwind-merge` for robustly merging and managing CSS classes. |
