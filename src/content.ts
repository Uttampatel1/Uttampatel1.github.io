// All the words on the site live here. Edit this file to update the portfolio.
// Anything marked TODO is a fact only you can supply. In development it shows as an amber
// TODO chip on the page; production builds hide it (see components/ui/Todo.tsx).

export const profile = {
  name: 'Uttam Patel',
  title: 'Data Scientist & AI Engineer',
  intro:
    'I turn complex data into models that hold up outside the notebook, and build machine learning, deep learning and generative AI into applications people use.',
  email: 'utampipaliya@gmail.com',
  address: 'Near L.D. Engineering College, University Road, Ahmedabad, Gujarat 380006',
  // From the redesign brief.
  tagline: 'I teach machines to read the brain.',
  yearsExperience: '', // TODO: a number, e.g. '4' — shown in the hero strip as "4+ Years"
}

export const about = [
  'I hold a B.Tech in Computer Science and work across data science, machine learning, deep learning and AI research.',
  'A background in web development sits alongside the data work, so the models I build end up in applications people can actually use: fast, clear and easy to put in front of a user.',
]

// `visual` picks the live animation drawn above each service (see ServiceCanvas.jsx).
export const services = [
  {
    title: 'Machine learning solutions',
    visual: 'scatter',
    text: 'Custom models for classification, regression and clustering. Predictive analytics for business forecasting. Automated feature engineering and hyperparameter tuning.',
  },
  {
    title: 'Data analytics & visualisation',
    visual: 'bars',
    text: 'Advanced statistical analysis and data exploration. Interactive dashboards and real-time monitoring. Business intelligence with actionable insights.',
  },
  {
    title: 'Deep learning & AI',
    visual: 'network',
    text: 'Neural networks for computer vision and NLP. LSTM and Transformer models for sequence prediction. Custom AI solutions in TensorFlow and PyTorch.',
  },
  {
    title: 'Natural language processing',
    visual: 'attention',
    text: 'Sentiment analysis and text classification. Chatbots with RAG and LLM integration. Document processing and information extraction.',
  },
  {
    title: 'Computer vision',
    visual: 'detect',
    text: 'Image classification and object detection. OCR for document digitisation. Medical imaging analysis and quality control automation.',
  },
  {
    title: 'Anomaly detection',
    visual: 'anomaly',
    text: 'Fraud detection and cybersecurity analytics. Quality control and fault prediction. Real-time monitoring with automated alerts.',
  },
  {
    title: 'Time series forecasting',
    visual: 'forecast',
    text: 'Sales and demand forecasting. Financial market prediction. Energy consumption and resource planning analytics.',
  },
  {
    title: 'MLOps & deployment',
    visual: 'pipeline',
    text: 'End-to-end ML pipelines. Model versioning and continuous integration. Cloud deployment with monitoring and scaling.',
  },
  {
    title: 'Big data analytics',
    visual: 'stream',
    text: 'Real-time processing with Kafka and Spark. Large-scale data pipeline architecture. Distributed and cloud-based computing.',
  },
]

export const projectCategories = [
  'Language models',
  'Vision & healthcare',
  'Finance & forecasting',
  'Systems & deployment',
  'Research',
]

// `metric` is the headline number shown large beside each project (optional).
// `visual` picks the live animation on the card (ServiceCanvas.jsx + projectScenes.js).
export type Project = { title: string; visual: string; category: string; metric?: { value: string; label: string }; summary: string; stack: string[] }

export const projects: Project[] = [
  {
    title: 'Autonomous trading bot with reinforcement learning',
    visual: 'equity',
    category: 'Finance & forecasting',
    metric: { value: '23%', label: 'annual return, Sharpe ratio 1.8' },
    summary:
      'A trading system built on Deep Q-Networks and PPO, with multi-asset portfolio optimisation and risk management.',
    stack: ['PyTorch', 'Stable-Baselines3', 'Ray RLlib', 'Alpaca API', 'Redis'],
  },
  {
    title: 'Multi-modal medical AI diagnostic system',
    visual: 'detect',
    category: 'Vision & healthcare',
    metric: { value: '97.8%', label: 'diagnostic accuracy' },
    summary:
      'Combines computer vision, NLP and time-series analysis to process medical images, patient reports and vital signs with ensemble deep learning models.',
    stack: ['PyTorch', 'Transformers', 'Vision Transformer', 'DICOM', 'FastAPI'],
  },
  {
    title: 'Real-time fraud detection with graph neural networks',
    visual: 'graph',
    category: 'Finance & forecasting',
    metric: { value: '99.2%', label: 'precision at under 50 ms latency' },
    summary:
      'Graph Attention Networks and temporal graph analysis over 1M+ transactions per minute.',
    stack: ['PyTorch Geometric', 'Apache Kafka', 'Neo4j', 'Kubernetes', 'MLflow'],
  },
  {
    title: 'Large language model fine-tuning platform',
    visual: 'loss',
    // TODO: add a real metric if you have one (shown large on the card)
    category: 'Language models',
    summary:
      'Distributed platform for fine-tuning LLMs with LoRA and QLoRA. Multi-GPU training with gradient checkpointing and automatic mixed precision.',
    stack: ['PyTorch', 'Transformers', 'PEFT', 'DeepSpeed', 'Weights & Biases'],
  },
  {
    title: 'Federated learning for privacy-preserving analytics',
    visual: 'federated',
    category: 'Systems & deployment',
    metric: { value: '94%', label: 'accuracy with differential privacy' },
    summary:
      'Lets several organisations train a model together without sharing their data.',
    stack: ['PySyft', 'TensorFlow Federated', 'Differential Privacy', 'Docker Swarm', 'gRPC'],
  },
  {
    title: 'Neural architecture search framework',
    visual: 'network',
    category: 'Research',
    metric: { value: '15%', label: 'better than human-designed models on ImageNet' },
    summary:
      'Automated architecture search using evolutionary algorithms and performance prediction.',
    stack: ['PyTorch', 'DEAP', 'Optuna', 'Ray Tune', 'TensorBoard'],
  },
  {
    title: 'Quantum machine learning research platform',
    visual: 'qubits',
    category: 'Research',
    metric: { value: '40%', label: 'speedup over classical methods' },
    summary:
      'Quantum-classical hybrid algorithms for optimisation: variational quantum eigensolvers (VQE) and QAOA.',
    stack: ['Qiskit', 'Cirq', 'PennyLane', 'IBM Quantum', 'PyTorch'],
  },
  {
    title: 'Multimodal AI agent system',
    visual: 'attention',
    // TODO: add a real metric if you have one (shown large on the card)
    category: 'Language models',
    summary:
      'An autonomous agent that handles text, images, audio and video together, combining GPT-4V, DALL-E and Whisper with custom fine-tuned models for complex reasoning.',
    stack: ['LangChain', 'AutoGPT', 'OpenAI GPT-4V', 'Whisper', 'Vector databases'],
  },
  {
    title: 'Edge AI deployment with model compression',
    visual: 'prune',
    category: 'Systems & deployment',
    metric: { value: '95%', label: 'smaller models, 97% accuracy kept' },
    summary:
      'Ultra-lightweight models for mobile and edge devices using quantisation, pruning and knowledge distillation.',
    stack: ['TensorFlow Lite', 'ONNX Runtime', 'TensorRT', 'Apache TVM', 'OpenVINO'],
  },
  {
    title: 'Distributed training on multi-cloud infrastructure',
    visual: 'stream',
    category: 'Systems & deployment',
    metric: { value: '70%', label: 'less training time' },
    summary:
      'Fault-tolerant training across AWS, GCP and Azure with custom gradient compression and dynamic load balancing.',
    stack: ['Horovod', 'Ray', 'Terraform', 'Kubernetes', 'NCCL'],
  },
  {
    title: 'Generative AI for scientific discovery',
    visual: 'molecule',
    category: 'Research',
    metric: { value: '85%', label: 'higher binding affinity than existing compounds' },
    summary:
      'Molecular design with graph neural networks and variational autoencoders to generate new drug candidates.',
    stack: ['RDKit', 'DGL', 'VAE', 'Molecular dynamics', 'JAX'],
  },
  {
    title: 'Neural information retrieval with dense passage retrieval',
    visual: 'retrieval',
    category: 'Language models',
    metric: { value: '92%', label: 'recall@10 on MS MARCO' },
    summary:
      'Dense passage retrieval with cross-encoder reranking and custom embeddings trained with hard negative mining.',
    stack: ['Sentence Transformers', 'FAISS', 'ColBERT', 'Elasticsearch', 'Haystack'],
  },
  {
    title: 'Causal inference for personalised treatment effects',
    visual: 'bars',
    category: 'Vision & healthcare',
    metric: { value: '89%', label: 'precision in treatment recommendation' },
    summary:
      'Double ML, meta-learners and causal forests to estimate how treatment effects differ between patients.',
    stack: ['EconML', 'DoWhy', 'CausalML', 'Uplift modelling', 'DAGs'],
  },
  {
    title: 'Self-supervised learning framework',
    visual: 'contrastive',
    category: 'Vision & healthcare',
    metric: { value: '10×', label: 'less labelled data on ImageNet' },
    summary: 'Contrastive learning with SimCLR, BYOL and SwAV, reaching state-of-the-art results.',
    stack: ['PyTorch', 'SimCLR', 'BYOL', 'SwAV', 'Lightly'],
  },
  {
    title: 'Time series forecasting with attention',
    visual: 'forecast',
    category: 'Finance & forecasting',
    metric: { value: '35%', label: 'better accuracy than traditional methods' },
    summary:
      'Temporal Fusion Transformers and Neural ODEs, with custom attention for irregularly sampled series.',
    stack: ['Temporal Fusion Transformer', 'Neural ODEs', 'Darts', 'GluonTS', 'Optuna'],
  },
]

export const skills = [
  { group: 'Programming languages', items: ['Python', 'R', 'SQL', 'Java'] },
  { group: 'Data analysis & visualisation', items: ['Pandas', 'NumPy', 'Matplotlib', 'Seaborn', 'Plotly'] },
  { group: 'Machine learning', items: ['scikit-learn', 'TensorFlow', 'Keras', 'PyTorch'] },
  { group: 'Deep learning', items: ['Neural networks', 'CNNs', 'RNNs', 'LSTMs', 'Transformers'] },
  { group: 'Big data', items: ['Hadoop', 'Spark', 'Kafka'] },
  { group: 'MLOps', items: ['Docker', 'Kubernetes', 'MLflow', 'FastAPI'] },
  {
    group: 'Web development',
    items: ['HTML5', 'CSS3', 'JavaScript', 'React', 'Angular', 'Node.js', 'PHP', 'MySQL', 'MongoDB'],
  },
]

export const education: { degree: string; school: string; years: string }[] = [
  {
    degree: 'B.Tech in Computer Science',
    school: '', // TODO: your college / university
    years: '', // TODO: e.g. '2018 – 2022'
  },
]

export const faq = [
  {
    q: 'What services do you offer as a data scientist?',
    a: 'Machine learning models, data analysis and dashboards, deep learning for vision and language, NLP and RAG chatbots, anomaly detection, time series forecasting, big data pipelines, and deploying all of it to production with MLOps.',
  },
  {
    q: 'What is your expertise in deep learning?',
    a: 'CNNs and Vision Transformers for images, LSTMs and Transformers for sequences and text, graph neural networks, and self-supervised learning. I work mainly in PyTorch and TensorFlow, and handle compression and distributed training when models need to run fast or at scale.',
  },
  {
    q: 'How do you approach generative AI projects?',
    a: 'I start from the task and the data, not the model. Most projects begin with retrieval (RAG) over your own documents, move to fine-tuning with LoRA or QLoRA only when prompting and retrieval aren’t enough, and include an evaluation set from day one so quality can be measured.',
  },
  {
    q: 'Can you explain your experience with data visualisation?',
    a: 'I use Matplotlib, Seaborn and Plotly for analysis, and build interactive dashboards and real-time monitoring views for teams who need to act on the numbers rather than read a report.',
  },
  {
    q: 'What programming languages are essential for a data scientist?',
    a: 'Python first, for its libraries across data, ML and deployment. SQL for getting data out of where it lives. R is useful for statistics, and JavaScript helps when the result needs to become a web application.',
  },
  {
    q: 'How do you ensure the accuracy of machine learning models?',
    a: 'Clean validation splits (time-based for time series), cross-validation and hyperparameter tuning, metrics chosen for the business problem rather than accuracy alone, error analysis on the cases the model gets wrong, and monitoring for drift after deployment.',
  },
]

// Empty links are hidden.
export const links = [
  { label: 'GitHub', href: '' }, // TODO
  { label: 'LinkedIn', href: '' }, // TODO
  { label: 'Hugging Face', href: 'https://huggingface.co/Uttampatel' },
]

// ─── Added for the redesign ────────────────────────────────────────────────────────────
// Only facts given in the redesign brief are filled in. Everything else is a TODO.


// Rendered as the FINDINGS of the scan report. Add real roles here.
export const experience: { role: string; org: string; years: string; notes: string[] }[] = [
  {
    role: '', // TODO: job title
    org: '', // TODO: company
    years: '', // TODO: e.g. '2023 – present'
    notes: [], // TODO: 2–4 short lines of what you did
  },
]

// Skill clusters for the 3D point cloud. `groups` pull from `skills` above by group name.
// Medical Imaging uses only terms already on this site or in the brief;
// TODO: extend it with the actual imaging tools you use.
export const skillClusters = [
  { id: 'imaging', label: 'Medical Imaging', color: 'teal', groups: [], extra: ['Brain MRI segmentation', 'DICOM', 'Medical imaging analysis'] },
  { id: 'mldl', label: 'ML / DL', color: 'amber', groups: ['Machine learning', 'Deep learning', 'Data analysis & visualisation'], extra: [] },
  { id: 'eng', label: 'Engineering', color: 'azure', groups: ['Programming languages', 'MLOps', 'Big data', 'Web development'], extra: [] },
] as const

// Where the consult form posts. Empty = the form opens a pre-filled email instead.
export const contactEndpoint = '' // TODO: e.g. a Formspree / Getform endpoint URL
