// The training log. Each role is an EPOCH, each milestone a CHECKPOINT (newest epoch last,
// like a real run). Only facts already on the site are filled in; the rest is TODO.
export type Epoch = { role: string; org: string; years: string; checkpoints: string[] }

export const epochs: Epoch[] = [
  {
    role: 'B.Tech, Computer Science',
    org: '', // TODO: college / university
    years: '', // TODO: e.g. '2018 – 2022'
    checkpoints: ['Data science, machine learning and deep learning foundations', 'Web development alongside the data work'],
  },
  {
    role: 'Founder',
    org: 'Hunexture',
    years: '', // TODO
    checkpoints: ['Started a web & digital agency', 'Client websites and digital products, designed, built and shipped'],
  },
  {
    role: 'Founder',
    org: 'CliniqEase',
    years: '', // TODO
    checkpoints: ['Built a clinic management SaaS on Django'],
  },
  {
    role: 'AI Engineer & Data Scientist',
    org: '', // employer intentionally not shown on the site
    years: '', // TODO: e.g. '2023 – present'
    checkpoints: ['Machine learning models, LLM agents and data systems taken to production'], // TODO: 2–4 real milestones
  },
]
