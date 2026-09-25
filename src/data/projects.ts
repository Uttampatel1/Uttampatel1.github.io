import type { CategoryId } from '../design/tokens'

// Every project is a "model". `metric` must be a real number you can stand behind; leave it
// out and the card shows a TODO chip in development (hidden in production).
// Repos marked `open source` are public on github.com/Uttampatel1; their metrics are the key
// results reported in each repo's README (most run on synthetic data, and the label says so).
export type Project = {
  id: string
  title: string
  category: CategoryId
  summary: string
  stack: string[]
  status?: 'deployed' | 'in production' | 'live' | 'open source' | 'research' | 'prototype' | 'archived'
  role?: string
  metric?: { value: string; label: string }
  href?: string
  featured?: boolean
}

const gh = (repo: string) => `https://github.com/Uttampatel1/${repo}`

export const projects: Project[] = [
  // ── LLM Agents & Automation ──────────────────────────────────────────────
  {
    id: 'multi-agent',
    title: 'Multi-agent task automation',
    category: 'llm',
    summary:
      'Planner, Researcher, Writer and Reviewer agents turn one goal into a cited brief, with tool use, a bounded revision loop, a grounding audit and a claim-level fact-checker.',
    stack: ['Gemini', 'FastAPI', 'Pydantic', 'Docker', 'GitHub Actions'],
    status: 'open source',
    metric: { value: '4', label: 'agents in the loop, every step auditable' },
    href: gh('multi-agent-task-automation'),
    featured: true,
  },
  {
    id: 'rag-assistant',
    title: 'RAG knowledge assistant',
    category: 'llm',
    summary:
      'Document Q&A grounded in your own PDFs, with inline citations. Hybrid dense + BM25 retrieval fused with Reciprocal Rank Fusion, optional MMR re-ranking.',
    stack: ['Gemini', 'sentence-transformers', 'FastAPI', 'Streamlit', 'pypdf'],
    status: 'open source',
    metric: { value: '28', label: 'pytest tests across retrieval and pipeline' },
    href: gh('rag-knowledge-assistant'),
    featured: true,
  },
  {
    id: 'support-bot',
    title: 'LLM support chatbot with function calling',
    category: 'llm',
    summary:
      'A support assistant that takes real actions (order status, returns, cancellations) against a SQLite backend, with memory, identity guardrails and human handoff.',
    stack: ['Gemini', 'FastAPI', 'Streamlit', 'SQLite'],
    status: 'open source',
    metric: { value: '7', label: 'callable tools, cross-account access blocked' },
    href: gh('llm-support-chatbot'),
  },
  {
    id: 'n8n-gemini',
    title: 'n8n + Gemini automation pipelines',
    category: 'llm',
    summary: 'AI workflows that chain n8n with Gemini to automate multi-step work end to end.',
    stack: ['n8n', 'Gemini', 'Webhooks', 'REST APIs'],
    // TODO: status, a real metric (e.g. runs per week, hours saved)
  },
  {
    id: 'multimodal-agent',
    title: 'Multimodal AI agent system',
    category: 'llm',
    summary:
      'An autonomous agent that handles text, images, audio and video together, combining GPT-4V, DALL-E and Whisper with fine-tuned models for multi-step reasoning.',
    stack: ['LangChain', 'AutoGPT', 'GPT-4V', 'Whisper', 'Vector databases'],
  },
  {
    id: 'llm-finetune',
    title: 'LLM fine-tuning platform',
    category: 'llm',
    summary: 'Distributed fine-tuning with LoRA and QLoRA: multi-GPU training, gradient checkpointing and mixed precision.',
    stack: ['PyTorch', 'Transformers', 'PEFT', 'DeepSpeed', 'Weights & Biases'],
  },
  {
    id: 'dense-retrieval',
    title: 'Neural retrieval with dense passages',
    category: 'llm',
    summary: 'Dense passage retrieval with cross-encoder reranking and custom embeddings trained with hard negative mining.',
    stack: ['Sentence Transformers', 'FAISS', 'ColBERT', 'Elasticsearch', 'Haystack'],
    metric: { value: '92%', label: 'recall@10 on MS MARCO' },
  },

  // ── SaaS Products ────────────────────────────────────────────────────────
  {
    id: 'cliniqease',
    title: 'CliniqEase',
    category: 'saas',
    summary: 'Clinic management SaaS: the day-to-day running of a clinic in one product. Built with Django.',
    stack: ['Django', 'Python'], // TODO: add the rest of the stack
    role: 'Founder',
    // TODO: status, a real metric (e.g. clinics onboarded, active users)
    featured: true,
  },

  // ── Quant & Data Systems ─────────────────────────────────────────────────
  {
    id: 'nse-backtester',
    title: 'NSE trading strategy backtester',
    category: 'quant',
    summary:
      'A vectorised backtester for Indian large-caps: trend and mean-reversion rules against buy-and-hold, net of trading costs, with walk-forward optimisation to avoid look-ahead bias.',
    stack: ['Python', 'pandas', 'NumPy', 'yfinance', 'Streamlit'],
    status: 'open source',
    metric: { value: '−11.5%', label: 'max drawdown vs −33.8% buy-and-hold (backtest, synthetic data)' },
    href: gh('nse-trading-backtester'),
    featured: true,
  },
  {
    id: 'trading-bot',
    title: 'Autonomous trading bot with reinforcement learning',
    category: 'quant',
    summary:
      'A trading system built on Deep Q-Networks and PPO, with multi-asset portfolio optimisation and risk management.',
    stack: ['PyTorch', 'Stable-Baselines3', 'Ray RLlib', 'Alpaca API', 'Redis'],
    metric: { value: '23%', label: 'annual return · Sharpe 1.8' },
  },
  {
    id: 'demand-forecasting',
    title: 'Demand forecasting',
    category: 'quant',
    summary: 'SARIMA, Holt-Winters, LightGBM and Prophet against a seasonal-naive baseline, with rolling-origin backtests.',
    stack: ['statsmodels', 'LightGBM', 'Prophet', 'scikit-learn', 'Streamlit'],
    status: 'open source',
    metric: { value: '3.27%', label: 'MAPE on a 28-day hold-out (synthetic data)' },
    href: gh('demand-forecasting'),
  },
  {
    id: 'ab-testing',
    title: 'A/B testing toolkit',
    category: 'quant',
    summary: 'Frequentist and Bayesian tests, power analysis and sample sizing, so an experiment is sized before it is read.',
    stack: ['SciPy', 'pandas', 'NumPy', 'Streamlit'],
    status: 'open source',
    metric: { value: '99.8%', label: 'P(treatment > control), Bayesian (synthetic experiment)' },
    href: gh('ab-testing-toolkit'),
  },
  {
    id: 'rfm-segmentation',
    title: 'Customer segmentation (RFM + clustering)',
    category: 'quant',
    summary: 'RFM scoring and clustering into segments with a marketing action each, plus customer lifetime value.',
    stack: ['scikit-learn', 'pandas', 'Plotly', 'Streamlit'],
    status: 'open source',
    metric: { value: '63%', label: 'of revenue from ~31% of customers (synthetic data)' },
    href: gh('customer-segmentation-rfm'),
  },
  {
    id: 'fraud-gnn',
    title: 'Real-time fraud detection with GNNs',
    category: 'quant',
    summary: 'Graph Attention Networks and temporal graph analysis over 1M+ transactions per minute.',
    stack: ['PyTorch Geometric', 'Kafka', 'Neo4j', 'Kubernetes', 'MLflow'],
    metric: { value: '99.2%', label: 'precision at < 50 ms latency' },
  },
  {
    id: 'ts-attention',
    title: 'Time series forecasting with attention',
    category: 'quant',
    summary: 'Temporal Fusion Transformers and Neural ODEs, with custom attention for irregularly sampled series.',
    stack: ['Temporal Fusion Transformer', 'Neural ODEs', 'Darts', 'GluonTS', 'Optuna'],
    metric: { value: '35%', label: 'more accurate than classical baselines' },
  },

  // ── Web3 ─────────────────────────────────────────────────────────────────
  {
    id: 'credential-chain',
    title: 'Blockchain academic credential verification',
    category: 'web3',
    summary: 'Academic credentials issued and verified on a blockchain, so a degree can be checked without calling the institution.',
    stack: ['Blockchain'], // TODO: chain, contract language, frontend
    // TODO: status, role, a real metric
    featured: true,
  },

  // ── Agency & Client Work ─────────────────────────────────────────────────
  {
    id: 'hunexture',
    title: 'Hunexture',
    category: 'agency',
    summary: 'My web & digital agency: websites and digital products for clients, designed, built and shipped.',
    stack: [], // TODO: the stack the agency builds with
    role: 'Founder',
    // TODO: status, a real metric (e.g. sites shipped), and the agency URL in `href`
    featured: true,
  },

  // ── AI / ML Models ───────────────────────────────────────────────────────
  {
    id: 'churn-shap',
    title: 'Churn prediction with SHAP explanations',
    category: 'ml',
    summary:
      'Scores which customers are about to leave, explains why with SHAP, and turns scores into a contact list at a budget-driven threshold.',
    stack: ['scikit-learn', 'XGBoost', 'SHAP', 'FastAPI', 'Streamlit'],
    status: 'open source',
    metric: { value: '0.826', label: 'ROC-AUC (synthetic data)' },
    href: gh('churn-prediction-shap'),
  },
  {
    id: 'hybrid-recsys',
    title: 'Hybrid recommendation engine',
    category: 'ml',
    summary: 'Collaborative filtering, content-based and matrix factorisation compared beyond accuracy: coverage, novelty and diversity.',
    stack: ['scikit-learn', 'NumPy', 'pandas', 'Streamlit'],
    status: 'open source',
    metric: { value: '~3×', label: 'hit rate@10 over the popularity baseline (synthetic data)' },
    href: gh('hybrid-recommendation-engine'),
  },
  {
    id: 'vision-api',
    title: 'Real-time vision analytics API',
    category: 'ml',
    summary: 'A computer-vision microservice that detects and tracks objects in video, with speed estimates and Prometheus / Grafana observability.',
    stack: ['YOLO', 'DeepSORT', 'OpenCV', 'FastAPI', 'Prometheus'],
    status: 'open source',
    href: gh('realtime-vision-analytics-api'),
  },
  {
    id: 'edge-compression',
    title: 'Edge AI with model compression',
    category: 'ml',
    summary: 'Lightweight models for mobile and edge devices using quantisation, pruning and knowledge distillation.',
    stack: ['TensorFlow Lite', 'ONNX Runtime', 'TensorRT', 'Apache TVM', 'OpenVINO'],
    metric: { value: '95%', label: 'smaller, 97% accuracy kept' },
  },
  {
    id: 'nas',
    title: 'Neural architecture search framework',
    category: 'ml',
    summary: 'Automated architecture search using evolutionary algorithms and performance prediction.',
    stack: ['PyTorch', 'DEAP', 'Optuna', 'Ray Tune', 'TensorBoard'],
    metric: { value: '15%', label: 'over hand-designed models on ImageNet' },
  },
  {
    id: 'ssl',
    title: 'Self-supervised learning framework',
    category: 'ml',
    summary: 'Contrastive learning with SimCLR, BYOL and SwAV to learn useful representations from unlabelled data.',
    stack: ['PyTorch', 'SimCLR', 'BYOL', 'SwAV', 'Lightly'],
    metric: { value: '10×', label: 'less labelled data on ImageNet' },
  },
  {
    id: 'federated',
    title: 'Federated learning for private analytics',
    category: 'ml',
    summary: 'Lets several organisations train one model together without sharing their data.',
    stack: ['PySyft', 'TensorFlow Federated', 'Differential Privacy', 'Docker Swarm', 'gRPC'],
    metric: { value: '94%', label: 'accuracy with differential privacy' },
  },
  {
    id: 'distributed',
    title: 'Distributed training across clouds',
    category: 'ml',
    summary: 'Fault-tolerant training across AWS, GCP and Azure with gradient compression and dynamic load balancing.',
    stack: ['Horovod', 'Ray', 'Terraform', 'Kubernetes', 'NCCL'],
    metric: { value: '70%', label: 'less training time' },
  },
  {
    id: 'causal',
    title: 'Causal inference for individual effects',
    category: 'ml',
    summary: 'Double ML, meta-learners and causal forests to estimate how the effect of an intervention differs between individuals.',
    stack: ['EconML', 'DoWhy', 'CausalML', 'Uplift modelling', 'DAGs'],
    metric: { value: '89%', label: 'precision in recommendations' },
  },
  {
    id: 'molecular',
    title: 'Generative models for molecular design',
    category: 'ml',
    summary: 'Graph neural networks and variational autoencoders that generate new candidate molecules.',
    stack: ['RDKit', 'DGL', 'VAE', 'Molecular dynamics', 'JAX'],
    metric: { value: '85%', label: 'higher binding affinity than baselines' },
  },
  {
    id: 'quantum',
    title: 'Quantum machine learning research',
    category: 'ml',
    summary: 'Quantum-classical hybrid algorithms for optimisation: variational quantum eigensolvers (VQE) and QAOA.',
    stack: ['Qiskit', 'Cirq', 'PennyLane', 'IBM Quantum', 'PyTorch'],
    metric: { value: '40%', label: 'speedup over classical methods' },
  },
]
