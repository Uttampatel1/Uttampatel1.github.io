import type { CategoryId } from '../design/tokens'

// Skills as clusters in an embedding space. `color` borrows a category hue so a cluster and
// the projects it powers read as the same thing. Only tools already on the site are listed.
export type SkillCluster = { id: string; label: string; color: CategoryId; items: string[] }

export const skillClusters: SkillCluster[] = [
  {
    id: 'aiml',
    label: 'AI / ML',
    color: 'ml',
    items: ['Python', 'PyTorch', 'TensorFlow', 'Keras', 'scikit-learn', 'CNNs', 'LSTMs', 'Transformers', 'Optuna', 'MLflow'],
  },
  {
    id: 'llm',
    label: 'LLMs & Agents',
    color: 'llm',
    items: ['LangChain', 'Gemini', 'RAG', 'LoRA / QLoRA', 'PEFT', 'FAISS', 'Sentence Transformers', 'Whisper'],
  },
  {
    id: 'auto',
    label: 'Automation',
    color: 'agency',
    items: ['n8n', 'AI workflows', 'Webhooks', 'FastAPI', 'Docker'],
  },
  {
    id: 'web',
    label: 'Full-Stack & SaaS',
    color: 'saas',
    items: ['Django', 'React', 'Angular', 'Node.js', 'JavaScript', 'PHP', 'MySQL', 'MongoDB', 'Kubernetes'],
  },
  {
    id: 'data',
    label: 'Data & Quant',
    color: 'quant',
    items: ['Pandas', 'NumPy', 'SQL', 'R', 'Spark', 'Kafka', 'Hadoop', 'Plotly', 'Stable-Baselines3', 'Redis'],
  },
  {
    id: 'web3',
    label: 'Web3',
    color: 'web3',
    items: ['Blockchain', 'Credential verification'], // TODO: the chain / contract tooling you used
  },
]
