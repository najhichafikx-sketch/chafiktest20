// lib/auto-publisher/ai-tech.js
// AI & Technology article topic pool. Rotates daily to keep content fresh.

const AI_TOPICS = [
  // ChatGPT / OpenAI
  { title: 'ChatGPT vs Gemini vs Claude: Best AI Assistant for 2026 Compared', traffic: 95000, weight: 2.5, category: 'AI', source: 'ai-comparison' },
  { title: 'ChatGPT-5 Release: Everything You Need to Know About OpenAI Latest Model', traffic: 120000, weight: 2.8, category: 'AI', source: 'ai-news' },
  { title: 'How to Write Better ChatGPT Prompts: Advanced Prompt Engineering Guide 2026', traffic: 85000, weight: 2.3, category: 'AI', source: 'ai-tutorial' },
  { title: 'OpenAI o3 Model Explained: Reasoning, Capabilities & How It Compares to GPT-5', traffic: 90000, weight: 2.5, category: 'AI', source: 'ai-news' },
  { title: 'Best AI Tools for Content Creators in 2026: Save Hours Every Week', traffic: 78000, weight: 2.2, category: 'AI', source: 'ai-tools' },
  { title: 'Midjourney V7 vs DALL-E 4 vs Stable Diffusion 4: Best AI Image Generator 2026', traffic: 82000, weight: 2.4, category: 'AI', source: 'ai-comparison' },
  { title: 'DeepSeek vs ChatGPT: Chinese AI Model That Challenges OpenAI', traffic: 110000, weight: 2.7, category: 'AI', source: 'ai-comparison' },
  { title: 'Claude 4 vs GPT-5: Which AI Writes Better Code & Content?', traffic: 88000, weight: 2.4, category: 'AI', source: 'ai-comparison' },
  { title: 'Google Gemini 3.0: New Features, Availability & What Changed', traffic: 95000, weight: 2.5, category: 'AI', source: 'ai-news' },
  { title: 'Perplexity AI vs Google Search: Is AI Search Replacing Traditional Engines?', traffic: 75000, weight: 2.2, category: 'AI', source: 'ai-comparison' },
  { title: 'How to Make Money with AI in 2026: Side Hustles That Actually Pay', traffic: 130000, weight: 3.0, category: 'Business', source: 'ai-money' },
  { title: 'AI Video Generators: Sora, Runway & Pika Compared for Content Creation', traffic: 80000, weight: 2.3, category: 'AI', source: 'ai-tools' },
  { title: 'Best Free AI Tools for Small Business Owners in 2026', traffic: 70000, weight: 2.1, category: 'Business', source: 'ai-tools' },
  { title: 'Will AI Replace Programmers? The Truth About Software Engineering in 2026', traffic: 105000, weight: 2.6, category: 'Technology', source: 'ai-opinion' },
  { title: 'Copilot vs Cursor vs Windsurf: Best AI Code Editor for Developers 2026', traffic: 85000, weight: 2.4, category: 'Technology', source: 'ai-tools' },
  { title: 'AI Voice Cloning: How It Works, Best Tools & Ethical Concerns', traffic: 72000, weight: 2.1, category: 'Technology', source: 'ai-tutorial' },
  { title: 'What is Agentic AI? Autonomous Agents Explained for Beginners', traffic: 78000, weight: 2.3, category: 'AI', source: 'ai-tutorial' },
  { title: 'Top 10 AI Chrome Extensions That Boost Productivity in 2026', traffic: 65000, weight: 2.0, category: 'Technology', source: 'ai-tools' },
  { title: 'AI in Healthcare: How Machine Learning Is Saving Lives in 2026', traffic: 70000, weight: 2.1, category: 'Health', source: 'ai-trend' },
  { title: 'Notion AI vs Google Bard vs Microsoft Copilot: Best Workplace AI 2026', traffic: 68000, weight: 2.0, category: 'Technology', source: 'ai-comparison' },
];

let currentIndex = 0;

export function getNextAITopic() {
  const topic = AI_TOPICS[currentIndex % AI_TOPICS.length];
  currentIndex++;
  return {
    ...topic,
    pubDate: new Date().toISOString(),
    region: 'global',
    score: topic.traffic * topic.weight,
    isAITech: true,
    matchData: null
  };
}

export function getAITopicPool() {
  return AI_TOPICS;
}