import { categories } from '../design/tokens'
import { profile } from './profile'
import { projects } from './projects'
import { skillClusters } from './skills'

// "Ask my portfolio": no backend. Each answer lists the keywords that route to it; the one with
// the most keyword hits wins, and anything that matches nothing falls back to the contact route.
export type Answer = {
  id: string
  keywords: string[]
  answer: string
  action?: { label: string; href: string }
}

const featured = projects.filter((p) => p.featured).map((p) => p.title)

export const suggestions = ['what do you build?', 'tech stack?', 'hire you?', 'best projects?']

export const answers: Answer[] = [
  {
    id: 'build',
    keywords: ['build', 'do', 'what', 'work', 'services', 'offer', 'make', 'about', 'who'],
    answer: `${profile.name}, ${profile.role}. I build AI that ships: machine learning models, LLM agents and automations, SaaS products and data-driven systems, from idea to production. ${profile.founder}`,
    action: { label: 'See the work', href: '#work' },
  },
  {
    id: 'stack',
    keywords: ['stack', 'tech', 'tools', 'skills', 'languages', 'framework', 'python', 'pytorch', 'use'],
    answer: skillClusters.map((c) => `${c.label}: ${c.items.slice(0, 5).join(', ')}`).join('. ') + '.',
    action: { label: 'Explore the embedding space', href: '#skills' },
  },
  {
    id: 'hire',
    keywords: ['hire', 'available', 'availability', 'freelance', 'contract', 'job', 'role', 'work with', 'rate', 'price', 'cost', 'contact', 'email', 'reach'],
    answer: `Yes, I take on AI, data and product work, as a hire or through my agency. Send a request from the contact layer or email ${profile.email}. I aim to reply within 24 hours.`,
    action: { label: 'POST /collaborate', href: '#contact' },
  },
  {
    id: 'projects',
    keywords: ['projects', 'project', 'best', 'portfolio', 'examples', 'shipped', 'case', 'models'],
    answer: `Start with: ${featured.join(' · ')}. Each card flips into an inference readout with the stack and a metric.`,
    action: { label: 'Open the models', href: '#work' },
  },
  {
    id: 'llm',
    keywords: ['llm', 'agent', 'agents', 'gpt', 'gemini', 'rag', 'chatbot', 'n8n', 'automation', 'automate', 'workflow', 'genai', 'generative'],
    answer:
      'LLM agents and automations: a four-agent Planner → Researcher → Writer → Reviewer system with a claim-level fact-checker, a RAG assistant with hybrid dense + BM25 retrieval and citations, a support bot that takes real actions through function calling, and n8n + Gemini pipelines. All on Gemini, all open source on GitHub.',
    action: { label: `Filter: ${categories.llm.label}`, href: '#work?cat=llm' },
  },
  {
    id: 'saas',
    keywords: ['saas', 'cliniqease', 'product', 'django', 'startup', 'founder', 'hunexture', 'agency', 'website', 'web'],
    answer: profile.founder + ' CliniqEase is built with Django; Hunexture ships websites and digital products for clients.',
    action: { label: `Filter: ${categories.saas.label}`, href: '#work?cat=saas' },
  },
  {
    id: 'quant',
    keywords: ['trading', 'quant', 'market', 'markets', 'stock', 'finance', 'forecast', 'forecasting', 'time series', 'fraud'],
    answer:
      'An NSE trading-strategy backtester for Indian large-caps (net of costs, walk-forward tested), a reinforcement-learning trading bot, demand forecasting at ~3% MAPE, an A/B testing toolkit and customer segmentation.',
    action: { label: `Filter: ${categories.quant.label}`, href: '#work?cat=quant' },
  },
  {
    id: 'web3',
    keywords: ['web3', 'blockchain', 'crypto', 'credential', 'verification', 'chain'],
    answer: 'Blockchain-based academic credential verification: a degree can be checked without calling the institution.',
    action: { label: `Filter: ${categories.web3.label}`, href: '#work?cat=web3' },
  },
  {
    id: 'cv',
    keywords: ['cv', 'resume', 'résumé', 'experience', 'education', 'degree', 'background', 'history'],
    answer: 'B.Tech in Computer Science, then data science and AI engineering alongside founding an agency and a SaaS. The training log has the epochs.',
    action: { label: 'Read the training log', href: '#log' },
  },
  {
    id: 'social',
    keywords: ['github', 'linkedin', 'twitter', 'x', 'social', 'code', 'repo', 'repos', 'open source', 'huggingface', 'hugging face'],
    answer: 'GitHub: github.com/Uttampatel1 · LinkedIn: linkedin.com/in/uttam-pipaliya · X: @Utam_Pipaliya · Hugging Face: huggingface.co/Uttampatel. The open-source projects on the cards link straight to their repos.',
    action: { label: 'Contact links', href: '#contact' },
  },
  {
    id: 'location',
    keywords: ['where', 'location', 'based', 'city', 'india', 'ahmedabad', 'remote', 'timezone'],
    answer: `Based in ${profile.location} (IST, UTC+5:30). Remote collaboration is fine.`,
  },
]

export const fallback: Answer = {
  id: 'fallback',
  keywords: [],
  answer: 'No confident match in my weights for that one. The contact layer routes straight to me, and a human answer beats a hallucinated one.',
  action: { label: 'POST /collaborate', href: '#contact' },
}

const STOP = new Set(['what', 'do', 'who', 'use', 'about', 'make', 'work', 'where', 'role'])

export function ask(query: string): Answer {
  const q = ` ${query.toLowerCase().replace(/[^\p{L}\p{N}\s/]/gu, ' ').replace(/\s+/g, ' ')} `
  let best: Answer = fallback
  let bestScore = 0
  for (const a of answers) {
    let score = 0
    for (const k of a.keywords) if (q.includes(` ${k} `) || (k.length > 4 && q.includes(k))) score += STOP.has(k) ? 1 : 2
    if (score > bestScore) {
      best = a
      bestScore = score
    }
  }
  // a lone stop-word hit ("what", "do") is not a match
  return bestScore >= 2 ? best : fallback
}
