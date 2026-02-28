# Tars Connect

Tars Connect is a real-time chat application built for fast and smooth communication. It features a modern interface inspired by WhatsApp, providing a familiar and premium user experience.

## Architecture

The application is built using a modern full-stack web architecture:

- **Frontend**: Next.js 15 with the App Router. It uses Tailwind CSS for styling and responsive design.
- **Backend and Database**: Convex. This provides real-time data syncing, serverless functions, and a document-based database.
- **Authentication**: Clerk. This handles user login, registration, and provides profile information like names and images directly from Google.
- **Hosting**: Designed for easy deployment on Vercel.

## Key Features

- **Real-time Messaging**: Messages appear instantly for all users in a conversation without needing to refresh the page.
- **WhatsApp-Style UI**: A clean, indigo-themed design with profile images, message alignment, and classic chat backgrounds.
- **One-on-One Chat**: Private direct messages between users.
- **Group chats**: Create groups, invite other users, and manage group members.
- **Group Invites**: Users receive invitations to join groups which they can accept or reject.
- **Message Reactions**: React to any message with emojis like 👍, ❤️, 😂, 😮, and 😢.
- **Message Deletion**: Users can delete their own messages. Deleted messages show a "This message was deleted" placeholder.
- **User Presence**: See who is online or when they were last active.
- **Typing Indicators**: Real-time feedback when someone is typing a message.
- **Loading Skeletons**: Smooth pulsing animations while data is loading to improve perceived performance.
- **Reliable Sending**: Handles network errors gracefully with retry options if a message fails to send.

## Project Structure

- `app/`: Contains the Next.js pages and UI components.
  - `chat/`: The main chat interface.
  - `components/`: Reusable UI elements like Sidebar, Message Bubbles, and Modals.
- `convex/`: Contains the backend logic, including database schemas and serverless functions (queries and mutations).
- `public/`: Static assets like images and icons.

## Setup Instructions

### Prerequisites

- Node.js installed on your machine.
- A Clerk account for authentication.
- A Convex account for the backend.

### Local Development

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd tars-connect
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env.local` file in the root directory and add your Clerk and Convex keys:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
   CLERK_SECRET_KEY=your_secret_key
   NEXT_PUBLIC_CONVEX_URL=your_convex_url
   ```

4. **Run the Convex development server**:
   In a separate terminal, start the Convex backend:
   ```bash
   npx convex dev
   ```

5. **Run the Next.js development server**:
   ```bash
   npm run dev
   ```

6. **Open the app**:
   Navigate to `http://localhost:3000` in your browser.

## Deployment

To deploy on Vercel:
1. Push your code to a GitHub repository.
2. Connect the repository to Vercel.
3. Add the environment variables in the Vercel dashboard.
4. Enable the Convex integration on Vercel for automatic backend deployment.
