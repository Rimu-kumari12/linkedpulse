import { v4 as uuidv4 } from 'uuid'
import type { LinkedInPost } from '@/types'

const AVATAR_COLORS = [
  '#0055ff', '#ff3b00', '#00c986', '#ffb800',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316',
]

const MOCK_AUTHORS = [
  { name: 'Jessica Wang', title: 'Product Director at Synapse Labs', initials: 'JW' },
  { name: 'Marcus Reid', title: 'CTO at BuildFast Inc.', initials: 'MR' },
  { name: 'Sarah Chen', title: 'Engineering Manager at Vercel', initials: 'SC' },
  { name: 'Thomas Kovacs', title: 'Founder at LaunchPad AI', initials: 'TK' },
  { name: 'Priya Sharma', title: 'Head of Talent at DataCorp', initials: 'PS' },
  { name: 'Alex Müller', title: 'VP Engineering at CloudBase', initials: 'AM' },
  { name: 'Nina Okonkwo', title: 'Startup Advisor & Investor', initials: 'NO' },
  { name: 'Ryan Torres', title: 'Tech Lead at Stripe', initials: 'RT' },
]

// Posts with keywords embedded
const KEYWORD_POSTS = [
  {
    text: "We're officially growing the team 🚀 I am hiring a senior full-stack developer to lead our core product API. If you have Node.js + React expertise and love building at scale — let's talk. Drop a comment or DM me!",
    keywords: ['i am hiring'],
  },
  {
    text: "Looking for a developer who gets things done, not just someone who knows theory. We need hustle, curiosity, someone who ships fast. React + TypeScript experience a must. Interested? Reach out!",
    keywords: ['looking for developer'],
  },
  {
    text: "After 6 great years at my previous company, I'm officially open to work. Seeking senior product roles in fintech or developer tools. My DMs are open and I'd love to reconnect with old colleagues.",
    keywords: ['open to work'],
  },
  {
    text: "Exciting news — we are recruiting across our engineering team! We have 3 open roles: Backend Engineer, ML Engineer, and DevOps Lead. Come build the future of data infrastructure with us.",
    keywords: ['we are recruiting'],
  },
  {
    text: "I am hiring two frontend engineers for our new design system team. Must have deep React component library experience. Remote-friendly, competitive equity. Link to JD in comments.",
    keywords: ['i am hiring'],
  },
  {
    text: "We have a job opening for a Staff Engineer who wants to help shape our technical roadmap. This is a rare opportunity to join us pre-Series B. Happy to chat with anyone serious.",
    keywords: ['job opening'],
  },
  {
    text: "Looking for developer talent who can bridge product and engineering. If you understand both user empathy and system design, we'd love to talk to you about our growing team.",
    keywords: ['looking for developer'],
  },
]

// Non-matching posts (noise)
const REGULAR_POSTS = [
  "Just wrapped our Q3 planning sessions. Really energized by the roadmap ahead. Sometimes constraints unlock the best creative thinking.",
  "The future of AI isn't just about models — it's about the workflows we build around them. Sharing a thread on what I've learned this year.",
  "Reflecting on 10 years in tech: the biggest skill isn't coding or strategy. It's knowing how to ask better questions.",
  "We shipped a major feature today after 3 months of work. The team absolutely crushed it. Proud moment.",
  "Attended a great panel on ethical AI this morning. Still thinking about what 'responsible deployment' really means in practice.",
  "Hot take: most 'AI-native' products are just wrappers with good UX. The real moat is distribution, not the model.",
  "Quiet day. Reading. Thinking. Sometimes the best work happens away from the keyboard.",
  "Our design team just published a post on how we redesigned our onboarding flow and doubled activation. Worth a read.",
]

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Generate a fresh mock post - 40% chance of being a keyword post
export function generateMockPost(): LinkedInPost {
  const isKeywordPost = Math.random() < 0.4
  const author = randomFrom(MOCK_AUTHORS)
  const color = randomFrom(AVATAR_COLORS)

  if (isKeywordPost) {
    const kp = randomFrom(KEYWORD_POSTS)
    return {
      id: uuidv4(),
      urn: `URN:li:share:${randomInt(8000000, 9999999)}`,
      authorName: author.name,
      authorTitle: author.title,
      authorInitials: author.initials,
      authorColor: color,
      text: kp.text,
      postedAt: new Date().toISOString(),
      matchedKeywords: [],
      status: 'pending',
    }
  } else {
    return {
      id: uuidv4(),
      urn: `URN:li:share:${randomInt(8000000, 9999999)}`,
      authorName: author.name,
      authorTitle: author.title,
      authorInitials: author.initials,
      authorColor: color,
      text: randomFrom(REGULAR_POSTS),
      postedAt: new Date().toISOString(),
      matchedKeywords: [],
      status: 'pending',
    }
  }
}

// Simulates fetching a batch of posts from Unipile
export async function fetchLinkedInFeed(count = 5): Promise<LinkedInPost[]> {
  // Simulate API latency
  await new Promise(r => setTimeout(r, randomInt(400, 1200)))
  return Array.from({ length: count }, () => generateMockPost())
}

// Real Unipile API call (used when MOCK_MODE=false)
export async function fetchRealLinkedInFeed(
  accountId: string,
  apiKey: string,
  dsn: string
): Promise<LinkedInPost[]> {
  const res = await fetch(`https://${dsn}/api/v1/linkedin/timeline`, {
    headers: {
      'X-API-KEY': apiKey,
      'account-id': accountId,
      'Content-Type': 'application/json',
    },
  })
  if (!res.ok) throw new Error(`Unipile API error: ${res.statusText}`)
  const data = await res.json()

  // Map Unipile response to our LinkedInPost type
  return (data.items || []).map((item: Record<string, unknown>) => ({
    id: uuidv4(),
    urn: item.id as string,
    authorName: (item.author as Record<string, unknown>)?.full_name as string ?? 'Unknown',
    authorTitle: (item.author as Record<string, unknown>)?.headline as string ?? '',
    authorInitials: ((item.author as Record<string, unknown>)?.full_name as string ?? 'U')
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase(),
    authorColor: randomFrom(AVATAR_COLORS),
    text: item.text as string ?? '',
    postedAt: new Date().toISOString(),
    matchedKeywords: [],
    status: 'pending' as const,
  }))
}

// Post a comment via Unipile
export async function postLinkedInComment(
  postUrn: string,
  comment: string,
  accountId: string,
  apiKey: string,
  dsn: string
): Promise<boolean> {
  const res = await fetch(`https://${dsn}/api/v1/linkedin/posts/${encodeURIComponent(postUrn)}/comments`, {
    method: 'POST',
    headers: {
      'X-API-KEY': apiKey,
      'account-id': accountId,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text: comment }),
  })
  return res.ok
}
