import type { CategoryId } from '../design/tokens'

// Every project is a "model". `metric` must be a real number you can stand behind; leave it
// out and the card shows a TODO chip in development (hidden in production).
// `status` / `role`: fill in as you confirm them. Empty = TODO.
export type Project = {
  id: string
  title: string
  category: CategoryId
  summary: string
  stack: string[]
  status?: 'deployed' | 'in production' | 'live' | 'research' | 'prototype' | 'archived'
  role?: string
  metric?: { value: string; label: string }
  href?: string
  featured?: boolean
}

export const projects: Project[] = [
  // ── LLM Agents & Automation ──────────────────────────────────────────────
  {
    id: 'n8n-gemini',
    title: 'n8n + Gemini automation pipelines',
    category: 'llm',
    summary: 'AI workflows that chain n8n with Gemini to automate multi-step work end to end.',
    stack: ['n8n', 'Gemini', 'Webhooks', 'REST APIs'],
    // TODO: status, role, a real metric (e.g. runs per week, hours saved)
    featured: true,
  },
  {
    id: 'multimodal-agent',
    title: 'Multimodal AI agent system',
    category: 'llm',
    summary:
      'An autonomous agent that handles text, images, audio and video together, combining GPT-4V, DALL-E and Whisper with fine-tuned models for multi-step reasoning.',
    stack: ['LangChain', 'AutoGPT', 'GPT-4V', 'Whisper', 'Vector databases'],
    featured: true,
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
    id: 'trading-bot',
    title: 'Algorithmic trading bot, Indian markets',
    category: 'quant',
    summary:
      'A trading system built on Deep Q-Networks and PPO, with multi-asset portfolio optimisation and risk management.',
    stack: ['PyTorch', 'Stable-Baselines3', 'Ray RLlib', 'Redis'], // TODO: add the broker / market-data API you use
    metric: { value: '23%', label: 'annual return · Sharpe 1.8' },
    featured: true,
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
