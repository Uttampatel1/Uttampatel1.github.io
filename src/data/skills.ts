import type { CategoryId } from '../design/tokens'

// Skills as clusters in an embedding space. `color` borrows a category hue so a cluster and
// the projects it powers read as the same thing. Only tools from the site's own content and the public GitHub repos are listed.
export type SkillCluster = { id: string; label: string; color: CategoryId; items: string[] }

export const skillClusters: SkillCluster[] = [
  {
    id: 'aiml',
    label: 'AI / ML',
    color: 'ml',
    items: ['Python', 'PyTorch', 'TensorFlow', 'Keras', 'scikit-learn', 'XGBoost', 'SHAP', 'CNNs', 'LSTMs', 'Transformers', 'YOLO', 'OpenCV', 'MLflow'],
  },
  {
    id: 'llm',
    label: 'LLMs & Agents',
    color: 'llm',
    items: ['LangChain', 'Gemini', 'RAG', 'Function calling', 'Multi-agent systems', 'LoRA / QLoRA', 'PEFT', 'FAISS', 'Sentence Transformers', 'BM25 hybrid search'],
  },
  {
    id: 'auto',
    label: 'Automation',
    color: 'agency',
    items: ['n8n', 'AI workflows', 'Webhooks', 'FastAPI', 'Docker', 'GitHub Actions'],
  },
  {
    id: 'web',
    label: 'Full-Stack & SaaS',
    color: 'saas',
    items: ['Django', 'Django REST Framework', 'Flask', 'Streamlit', 'React', 'Angular', 'Node.js', 'JavaScript', 'PHP', 'MySQL', 'MongoDB', 'SQLite', 'Kubernetes'],
  },
  {
    id: 'data',
    label: 'Data & Quant',
    color: 'quant',
    items: ['Pandas', 'NumPy', 'SQL', 'R', 'SciPy', 'statsmodels', 'LightGBM', 'Prophet', 'Spark', 'Kafka', 'Hadoop', 'Plotly', 'yfinance', 'Backtesting'],
  },
  {
    id: 'web3',
    label: 'Web3',
    color: 'web3',
    items: ['Blockchain', 'Credential verification'], // TODO: the chain / contract tooling you used
  },
]
