# Product Requirements Document (PRD)

## Project Overview
We are building a Reddit Analytics Platform where users can gain insights into different subreddits. Users can view top posts and categorize posts based on specific themes. The platform will be developed using Next.js 14, shadcn/ui, Tailwind CSS, and Lucide Icons.

## Technologies
- Next.js 14: Framework for building React applications with server-side rendering.
- shadcn/ui: A collection of accessible and customizable components.
- Tailwind CSS: Utility-first CSS framework for rapid UI development.
- Lucide Icons: Icon library for consistent and visually appealing icons.

## Core Functionalities

### 1. Subreddit Management

#### 1.1 View Available Subreddits
- Display Subreddit List: Users can see a list of subreddits they've added, displayed as cards.
- Default Subreddits: Common subreddits like r/ollama, r/openai, etc., are pre-populated for first-time users.

#### 1.2 Add New Subreddit
- Add Subreddit Button: An "Add Subreddit" button is prominently displayed.
- Add Subreddit Modal:
  - Opens when the button is clicked.
  - Allows users to input a Reddit URL or subreddit name.
  - Validates the input to ensure the subreddit exists.
- Post-Addition:
  - A new card representing the subreddit is added to the list.
  - The card includes the subreddit name and a "Remove" button.

#### 1.3 Remove Subreddit
- Remove Button: Each subreddit card has a "Remove" button.
- Removal Process:
  - Upon clicking, prompts the user for confirmation.
  - Removes the subreddit from the list upon confirmation.

### 2. Subreddit Detail Page

#### 2.1 Navigation
- Clickable Cards: Subreddit cards are clickable.
- Dynamic Routing: Clicking a card navigates to /subreddit/[subredditName], a dynamic route based on the subreddit name.

#### 2.2 Tabs Implementation
- Tabs: Two tabs are present—"Top Posts" and "Themes".
- Tab Behavior:
  - Switching tabs updates the content without reloading the page.
  - Active tab is visually distinguished.

### 3. Top Posts Section

#### 3.1 Fetch Reddit Posts Data
- Data Retrieval:
  - Fetch posts from the past 24 hours using Snoowrap.
  - Fetch up to 100 posts per subreddit.
- Required Fields:
  - title
  - url
  - author
  - created_utc
  - num_comments
  - score
  - thumbnail

#### 3.2 Display Posts
- Table Component:
  - Displays fetched posts in a tabular format.
  - Columns correspond to the required fields.
- Sorting:
  - Default sorting is by score in descending order.
  - Users can click on column headers to sort by other fields.

### 4. Themes Section

#### 4.1 Analyze Posts Data
- Categories:
  - Solution Requests: Posts asking for solutions to a problem.
  - Pain & Anger: Posts expressing pain or anger.
  - Advice Requests: Posts asking for advice.
  - Money Talk: Posts talking about money.
- OpenAI Integration:
  - Use OpenAI's API to analyze each post.
  - Categorize posts based on the above themes.
- Concurrent Processing:
  - Analyze posts concurrently to improve performance.
  - Handle rate limits and API quotas appropriately.

#### 4.2 Display Themes
- Theme Cards:
  - Each theme is represented as a card.
  - Includes title, description, and count of posts in that category.
- Interactive Elements:
  - Clicking a theme card opens a side panel.
  - Side panel lists all posts under that category.
  - Posts in the panel link to the original Reddit post.

### 5. Custom Themes

#### 5.1 Add New Theme Category
- Add Theme Button: An option to add a new theme is available.
- Add Theme Modal:
  - Users can define a new category with a title and description.
  - Optionally specify keywords or criteria for the category.

#### 5.2 Re-analysis
- Trigger Analysis:
  - Adding a new category triggers re-analysis of all posts.
  - Ensures new category includes relevant posts.

## File Structure
```
reddit-platform/
├── README.md
├── .env
├── app
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   └── subreddit
│       └── [subredditName]
│           ├── page.tsx
│           └── components
│               ├── Tabs.tsx
│               ├── TopPostsTable.tsx
│               ├── ThemesSection.tsx
│               └── PostSidePanel.tsx
├── components
│   ├── AddSubredditModal.tsx
│   ├── SubredditCard.tsx
│   └── ThemeCard.tsx
├── lib
│   ├── openai.ts
│   ├── reddit.ts
│   └── types.ts
├── next-env.d.ts
├── next.config.mjs
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## Description
- app/: Contains Next.js pages and related components.
- layout.tsx: Defines the layout of the application.
- page.tsx: Home page displaying subreddit cards.
- subreddit/[subredditName]/page.tsx: Subreddit detail page with tabs.
- components/:
  - Tabs.tsx: Handles tab switching logic.
  - TopPostsTable.tsx: Renders the table of top posts.
  - ThemesSection.tsx: Manages theme analysis and display.
  - PostSidePanel.tsx: Side panel showing posts under a theme.
- components/: Shared UI components.
  - AddSubredditModal.tsx: Modal for adding subreddits.
  - SubredditCard.tsx: Displays subreddit info and remove option.
  - ThemeCard.tsx: Represents a theme category.
- lib/: Utility functions and API integrations.
  - openai.ts: Functions for interacting with OpenAI API.
  - reddit.ts: Functions for fetching Reddit data via Snoowrap.
  - types.ts: TypeScript interfaces and types.
- .env: Environment variables for API keys and secrets.

## Documentation

### Using Snoowrap to Fetch Reddit Posts Data
Snoowrap is a Node.js wrapper for the Reddit API, allowing easy data retrieval.

Setup:
- Install Snoowrap: npm install snoowrap dotenv.
- Reddit API Credentials:
  - Register an app on Reddit to get clientId and clientSecret.
  - Add credentials to the .env file.

Code Example:
```typescript
import snoowrap from 'snoowrap';
import dotenv from 'dotenv';

dotenv.config();

// Configure the Snoowrap client
const r = new snoowrap({
  userAgent: 'reddit-analytics-platform',
  clientId: process.env.REDDIT_CLIENT_ID,
  clientSecret: process.env.REDDIT_CLIENT_SECRET,
  username: process.env.REDDIT_USERNAME,
  password: process.env.REDDIT_PASSWORD,
});

interface RedditPost {
  title: string;
  content: string;
  score: number;
  numComments: number;
  date: Date;
  url: string;
  author: string;
}

export async function fetchRecentPosts(subreddit: string): Promise<RedditPost[]> {
  const oneDayAgo = Math.floor(Date.now() / 1000) - 24 * 60 * 60;

  try {
    const posts = await r.getSubreddit(subreddit).getNew({ limit: 100 });
    
    const recentPosts = posts
      .filter((post) => post.created_utc > oneDayAgo)
      .map((post) => ({
        title: post.title,
        content: post.selftext,
        score: post.score,
        numComments: post.num_comments,
        date: new Date(post.created_utc * 1000),
        url: post.url,
        author: post.author.name,
      }));

    return recentPosts;
  } catch (error) {
    console.error('Error fetching Reddit posts:', error);
    return [];
  }
}
```

Notes:
- User Agent: Must be unique and descriptive.
- Rate Limiting: Be mindful of Reddit's API rate limits.
- Error Handling: Implement robust error handling for network or API errors.

### Using OpenAI to Analyze Reddit Posts Data
OpenAI's API can categorize text based on specified themes.

Setup:
- Install OpenAI SDK: npm install openai zod dotenv.
- OpenAI API Key: Add your API key to the .env file.

Code Example:
```typescript
import OpenAI from 'openai';
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';
import dotenv from 'dotenv';

dotenv.config();

interface RedditPost {
  title: string;
  content: string;
}

// Zod schema for the analysis
const PostCategoryAnalysisSchema = z.object({
  solutionRequests: z.boolean().describe("Posts where people are seeking solutions to problems"),
  painAndAnger: z.boolean().describe("Posts where people express pain or anger"),
  adviceRequests: z.boolean().describe("Posts where people are seeking advice"),
  moneyTalk: z.boolean().describe("Posts where people talk about spending money"),
});

type PostCategoryAnalysisType = z.infer<typeof PostCategoryAnalysisSchema>;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function generateCategoryPrompt(): string {
  return Object.entries(PostCategoryAnalysisSchema.shape).map(([key, value]) => {
    return `${key}: ${value.description}`;
  }).join('\n');
}

async function analyzeRedditPost(post: RedditPost): Promise<PostCategoryAnalysisType | null> {
  const categoryPrompt = generateCategoryPrompt();

  const prompt = `Analyze the following Reddit post:
  Title: ${post.title}
  Content: ${post.content}
  
  Categorize the post according to these categories:
  ${categoryPrompt}
  `;

  const completion = await openai.beta.chat.completions.parse({
    model: "gpt-4", // Use a compatible model
    messages: [
      { 
        role: "system", 
        content: "You are an expert in analyzing Reddit content. You will analyze posts and categorize them according to specific criteria."
      },
      { 
        role: "user", 
        content: prompt,
      },
    ],
    response_format: zodResponseFormat(PostCategoryAnalysisSchema, "categorize_post"),
  });

  return completion.choices[0].message.parsed;
}
```

Example Response:
```json
{
  "solutionRequests": false,
  "painAndAnger": false,
  "adviceRequests": false,
  "moneyTalk": true
}
```

Notes:
- Concurrent Processing: Use Promise.all to analyze multiple posts concurrently.
- Rate Limits: Be aware of OpenAI's rate limits and implement retries or backoffs as necessary.
- Error Handling: Catch and handle errors from the API gracefully.

## Additional Details for Developers

### Concurrency in Analysis
Implementation:
- Use asynchronous functions to process posts.
- Limit the number of concurrent requests if necessary to avoid rate limiting.

Example:
```typescript
const analyzePostsConcurrently = async (posts: RedditPost[]) => {
  const analysisPromises = posts.map(post => analyzeRedditPost(post));
  const analysisResults = await Promise.all(analysisPromises);
  return analysisResults;
};
```

### Adding New Themes
User Input:
- When users add a new theme, collect a title, description, and optional keywords or criteria.

Re-analysis:
- Update the PostCategoryAnalysisSchema dynamically if possible.
- Re-run the analysis on existing posts to include the new category.

Constraints:
- Ensure that dynamic schema updates don't conflict with TypeScript typings.
- Alternatively, store custom themes separately and handle them in the application logic.

### State Management
Local State: Use React's useState and useEffect hooks for component state.
Global State:
- If needed, use the Context API to pass data down the component tree.
- For more complex state, consider using a state management library like Redux or Zustand.

### Styling and UI Components
Consistent Design:
- Follow a consistent design language throughout the app.
- Utilize shadcn/ui components and Tailwind CSS for styling.

Responsive Design:
- Ensure the app is mobile-friendly.
- Test components on different screen sizes.

### Accessibility
- ARIA Attributes: Use appropriate ARIA attributes for screen readers.
- Keyboard Navigation: Ensure all interactive elements can be accessed via keyboard.

### Testing
Unit Tests:
- Write tests for utility functions in lib/.
- Use testing frameworks like Jest.

Integration Tests:
- Test API integrations with mocked responses.
- Ensure components render correctly with various states.

### Environment Variables
Security:
- Never commit the .env file to version control.
- Use .env.example to indicate required environment variables.

Variables Needed:
- REDDIT_CLIENT_ID
- REDDIT_CLIENT_SECRET
- REDDIT_USERNAME
- REDDIT_PASSWORD
- OPENAI_API_KEY

### Error Handling and Logging
User Feedback:
- Display user-friendly error messages for API failures.
- Use toasts or modal dialogs to inform users of issues.

Logging:
- Log errors to the console for debugging.
- Consider integrating a logging service for production.

### API Rate Limits
Reddit API:
- Monitor API usage to stay within Reddit's rate limits.

OpenAI API:
- Implement request throttling if approaching rate limits.
- Handle 429 Too Many Requests responses appropriately.

## Conclusion
This document provides a comprehensive overview and detailed specifications for the Reddit Analytics Platform. Developers should use this PRD as a roadmap to align on the project's goals, functionalities, and implementation strategies. All provided code examples and documentation serve as crucial context for building a robust and efficient application.

Note: For any questions or clarifications, please refer to the project manager or lead developer.