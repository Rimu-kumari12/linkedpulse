import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'mock-key',
})

const SYSTEM_PROMPT = `You are a professional LinkedIn engagement assistant. Your job is to write thoughtful, genuine comments on LinkedIn posts that:
- Are relevant and specific to the post content
- Sound natural and human, not robotic or spammy
- Are concise (2-4 sentences max)
- Add value to the conversation
- Do NOT use excessive emojis (0-1 max)
- Do NOT be overly promotional or salesy
- Do NOT use hollow phrases like "Great post!" or "Thanks for sharing!"
- Reflect genuine interest and expertise

Always respond with ONLY the comment text, nothing else.`

export async function generateComment(
  postText: string,
  matchedKeyword: string,
  authorName: string
): Promise<string> {
  // Mock mode fallback
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'mock-key' || process.env.MOCK_MODE === 'true') {
    return generateMockComment(matchedKeyword, authorName, postText)
  }

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 200,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Write a thoughtful LinkedIn comment for this post by ${authorName}:

"${postText}"

The post matched the keyword: "${matchedKeyword}"

Write a comment that's relevant to their specific situation.`,
        },
      ],
    })

    const text = message.content.find(b => b.type === 'text')
    return text?.text ?? generateMockComment(matchedKeyword, authorName, postText)
  } catch (err) {
    console.error('Claude API error:', err)
    return generateMockComment(matchedKeyword, authorName, postText)
  }
}

// Mock comment generation when no API key
function generateMockComment(
  keyword: string,
  authorName: string,
  postText: string
): string {
  const firstName = authorName.split(' ')[0]

  const templates: Record<string, string[]> = {
    'i am hiring': [
      `Exciting news, ${firstName}! What skills and qualities matter most to you for this role beyond the technical requirements?`,
      `Great that you're growing the team, ${firstName}. The combination of skills you're describing is rare — what's the culture like for the incoming person?`,
      `Congrats on the hiring push, ${firstName}! Would love to know more about the team they'd be joining and the problems they'd be solving.`,
    ],
    'looking for developer': [
      `The profile you're describing is exactly the kind of engineer who thrives in high-ownership environments. What does success look like in the first 90 days for this role, ${firstName}?`,
      `Love that you're prioritizing the execution mindset, ${firstName}. What tech stack will this developer be working with primarily?`,
      `Strong signal in how you framed this, ${firstName} — that kind of clarity about what you need usually means a great culture for the right person.`,
    ],
    'open to work': [
      `Best of luck with the search! The focus on fintech and developer tools makes a lot of sense given the market right now. Have you considered early-stage companies where product leadership shapes everything?`,
      `Your background sounds compelling for the roles you're targeting. The intersection of those two domains is underserved — you should find strong demand.`,
      `Wishing you a smooth search! Would be happy to make introductions if I come across anything aligned with your background.`,
    ],
    'we are recruiting': [
      `Great to see the team expanding, ${firstName}! Are these roles fully remote or is there a location preference?`,
      `Three roles at once is a bold signal — exciting growth stage. What's driving the hiring push right now?`,
      `Congrats on the growth, ${firstName}. The infrastructure space needs more teams like yours tackling this problem.`,
    ],
    'default': [
      `Really interesting perspective, ${firstName}. Thanks for sharing the context behind this — it adds a lot of nuance to the conversation.`,
      `Well said, ${firstName}. The framing here is something more people should be talking about.`,
      `Appreciate you sharing this, ${firstName}. It resonates with what a lot of people in the space are navigating right now.`,
    ],
  }

  const normalized = keyword.toLowerCase()
  const pool = templates[normalized] ?? templates['default']
  return pool[Math.floor(Math.random() * pool.length)]
}
