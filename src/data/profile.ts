// Core facts about me. Edit here to update the site.
// Anything marked TODO is a fact only you can supply. In development it shows as an amber
// TODO chip on the page; production builds hide it (see components/ui/Todo.tsx).

export const profile = {
  name: 'Uttam Patel',
  // how the hero streams the name, token by token
  nameTokens: ['Ut', 'tam', ' Pat', 'el'],
  role: 'AI Engineer & Data Scientist',
  tagline: 'I build AI that ships.',
  intro:
    'Machine learning models, LLM agents and automations, SaaS products and data-driven systems, taken from idea to production.',
  founder: 'Founder of Hunexture, a web & digital agency, and CliniqEase, a clinic management SaaS.',
  email: 'utampipaliya@gmail.com',
  address: 'Near L.D. Engineering College, University Road, Ahmedabad, Gujarat 380006',
  location: 'Ahmedabad, India',
  yearsExperience: '', // TODO: a number, e.g. '4' (shown in the hero as "4+ YRS")
  cvHref: '', // TODO: drop your CV into public/ (e.g. public/uttam-patel-cv.pdf) and set 'uttam-patel-cv.pdf'
}

// The four things I build, shown in the hero strip and the EMBEDDING layer.
export const outputs = [
  { k: 'ML models', v: 'Predictive modelling, deep learning and ensembles that hold up in production.' },
  { k: 'LLM agents', v: 'Agents, AI workflows and n8n + Gemini automations that do real work.' },
  { k: 'SaaS products', v: 'Full-stack products, from data model to deployed app, e.g. CliniqEase on Django.' },
  { k: 'Data systems', v: 'Pipelines, forecasting and quant systems, including trading on Indian markets.' },
]

export const about = [
  'I hold a B.Tech in Computer Science and work across data science, machine learning, deep learning and applied LLMs.',
  'A web development background sits alongside the data work, so what I build ends up in products people use: fast, clear and deployed. I also run a web & digital agency and build my own SaaS.',
]

export const services = [
  { title: 'Machine learning', text: 'Classification, regression and clustering. Predictive analytics, feature engineering and tuning.' },
  { title: 'Deep learning', text: 'CNNs, LSTMs and Transformers in PyTorch and TensorFlow, for vision, language and sequences.' },
  { title: 'LLMs & RAG', text: 'Retrieval over your own documents, chat interfaces, fine-tuning with LoRA / QLoRA when it pays off.' },
  { title: 'Agents & automation', text: 'LLM agents and n8n + Gemini pipelines that take repetitive work off a team’s plate.' },
  { title: 'Forecasting & quant', text: 'Time series forecasting, anomaly detection and algorithmic trading systems.' },
  { title: 'Data & dashboards', text: 'Statistical analysis, interactive dashboards and real-time monitoring.' },
  { title: 'SaaS & full-stack', text: 'Django, React and Node products, built end to end and put in front of users.' },
  { title: 'MLOps & deployment', text: 'Pipelines, versioning, containers and cloud deployment with monitoring.' },
  { title: 'Big data', text: 'Kafka and Spark pipelines for large-scale and real-time processing.' },
]

export const education = {
  degree: 'B.Tech in Computer Science',
  school: '', // TODO: your college / university
  years: '', // TODO: e.g. '2018 – 2022'
}

export const faq = [
  {
    q: 'What do you build?',
    a: 'Machine learning models, LLM agents and automations, SaaS products and data systems. Usually the whole path: data, model, the app around it, and deployment.',
  },
  {
    q: 'What is your expertise in deep learning?',
    a: 'CNNs for images, LSTMs and Transformers for sequences and text, graph neural networks and self-supervised learning. Mainly PyTorch and TensorFlow, with compression and distributed training when models need to run fast or at scale.',
  },
  {
    q: 'How do you approach generative AI projects?',
    a: 'From the task and the data, not the model. Most projects begin with retrieval (RAG) over your own documents, move to fine-tuning with LoRA or QLoRA only when prompting and retrieval aren’t enough, and include an evaluation set from day one so quality can be measured.',
  },
  {
    q: 'Do you take on client and agency work?',
    a: 'Yes. Through Hunexture, my web & digital agency, and directly for AI and data projects. The contact form at the end of the page is the fastest route.',
  },
  {
    q: 'How do you make sure a model holds up after launch?',
    a: 'Clean validation splits (time-based for time series), metrics chosen for the business problem rather than accuracy alone, error analysis on the cases the model gets wrong, and monitoring for drift once it is deployed.',
  },
]

// Empty links are hidden in production.
export const links = [
  { label: 'GitHub', href: '' }, // TODO
  { label: 'LinkedIn', href: '' }, // TODO
  { label: 'Hugging Face', href: 'https://huggingface.co/Uttampatel' },
]

// Where the contact form posts (JSON). Empty = the form opens a pre-filled email instead.
export const contactEndpoint = '' // TODO: e.g. a Formspree / Getform endpoint URL
