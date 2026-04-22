import type { Keyword } from '@/types'

export interface MatchResult {
  keyword: Keyword
  confidence: number
  matchedPhrase: string
}

// Normalize text for comparison
function normalize(text: string): string {
  return text.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim()
}

// Exact / phrase match with confidence scoring
function phraseMatch(text: string, phrase: string): number {
  const normText = normalize(text)
  const normPhrase = normalize(phrase)

  // Direct substring match → highest confidence
  if (normText.includes(normPhrase)) return 0.98

  // All words present (non-contiguous) → medium confidence
  const words = normPhrase.split(' ')
  const allWords = words.every(w => normText.includes(w))
  if (allWords) return 0.78

  // Most words present (fuzzy) → lower confidence
  const matchedWords = words.filter(w => normText.includes(w))
  const ratio = matchedWords.length / words.length
  if (ratio >= 0.7) return ratio * 0.65

  return 0
}

// Run all active keywords against a post's text
export function detectKeywords(
  text: string,
  keywords: Keyword[],
  threshold = 0.65
): MatchResult[] {
  const matches: MatchResult[] = []
  const activeKeywords = keywords.filter(k => k.active)

  for (const keyword of activeKeywords) {
    const confidence = phraseMatch(text, keyword.phrase)
    if (confidence >= threshold) {
      matches.push({
        keyword,
        confidence,
        matchedPhrase: keyword.phrase,
      })
    }
  }

  // Sort by confidence descending
  return matches.sort((a, b) => b.confidence - a.confidence)
}

// Highlight keywords in text (returns HTML string)
export function highlightKeywords(text: string, keywords: string[]): string {
  let result = text
  for (const kw of keywords) {
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`(${escaped})`, 'gi')
    result = result.replace(regex, '<mark>$1</mark>')
  }
  return result
}
