export const categories = [
  "All stories",
  "Software Development",
  "Artificial Intelligence & Machine Learning",
  "Web and Mobile App Development",
  "Technology & Innovation",
  "Cybersecurity",
  "Cloud Computing",
  "Industry Insights"
];

export const demoArticles = [
  {
    _id: "demo-1",
    slug: "building-ai-that-works-for-people",
    title: "Building AI that works for people, not the other way around",
    excerpt: "The most useful AI isn't the loudest. It's the kind that quietly makes everyday work feel a little more human.",
    content: `## Technology should feel more human\n\nWe have never had more powerful tools at our fingertips. But the real measure of progress isn't how clever the technology is — it's how much better it makes the work and lives around it.\n\n### Start with the problem\n\nThe teams seeing the greatest returns from AI begin with a very human question: **what is getting in the way?** From there, small and focused experiments can make a meaningful difference.\n\n> Good technology doesn't ask for attention. It gives people more of it.\n\n### Design for trust\n\nUseful AI is transparent about its limits. It keeps people in control, makes it easy to understand where a result came from, and leaves room for judgment. That's how adoption grows: one good, dependable experience at a time.\n\n| Principle | What it looks like |\n| --- | --- |\n| Start small | Solve one real workflow problem |\n| Stay transparent | Explain how a recommendation was made |\n| Keep people involved | Make review and override easy |\n\nThe future isn't about replacing the best of what people do. It's about making more room for it.`,
    author: "Softrate Editorial",
    category: "Artificial Intelligence & Machine Learning",
    tags: ["AI", "Responsible technology", "Innovation"],
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1400&q=85",
    publishedAt: "2025-03-18T10:00:00.000Z",
    featured: true,
    readTime: 5
  },
  {
    _id: "demo-2",
    slug: "the-craft-of-software-that-scales",
    title: "The craft of building software that scales",
    excerpt: "Good foundations make room for big ideas. A practical look at the decisions that help products grow gracefully.",
    content: `## Scale starts with clarity\n\nScalable software is less about predicting the future and more about making today's decisions easy to revisit. Clear boundaries and thoughtful defaults give teams room to grow.\n\n### Make the simple path the easy path\n\nShared conventions, small deploys, and meaningful observability make complexity easier to understand as it arrives.\n\n\`\`\`js\nconst result = await service.run({ signal, timeout: 5000 });\nif (!result.ok) logger.warn({ id: result.id }, "Service returned an error");\n\`\`\`\n\nA little care at the beginning saves a lot of guesswork later.`,
    author: "Nina Patel",
    category: "Software Development",
    tags: ["Engineering", "Architecture"],
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=85",
    publishedAt: "2025-03-12T10:00:00.000Z",
    featured: false,
    readTime: 4
  },
  {
    _id: "demo-3",
    slug: "a-better-mobile-experience-begins-with-listening",
    title: "A better mobile experience begins with listening",
    excerpt: "The best mobile products meet people where they are. That takes more than shrinking a desktop screen.",
    content: `## Designed around real life\n\nMobile experiences are used in between everything else. Thoughtful products respect that context, keeping the important things easy to reach and the distractions out of the way.\n\n### Fewer steps, more confidence\n\nClear language, accessible touch targets, and useful feedback turn small interactions into experiences people trust.`,
    author: "Arjun Mehta",
    category: "Web and Mobile App Development",
    tags: ["Mobile", "Product design"],
    image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=1200&q=85",
    publishedAt: "2025-03-05T10:00:00.000Z",
    featured: false,
    readTime: 3
  },
  {
    _id: "demo-4",
    slug: "security-is-a-team-sport",
    title: "Security is a team sport",
    excerpt: "A practical security culture is built into the everyday habits of every team, not left to one final checklist.",
    content: `## A shared responsibility\n\nThe strongest security programs make the safe choice a natural part of the work. That begins with clear ownership, approachable guidance, and learning from near misses.\n\n### Small habits matter\n\nRegular updates, least-privilege access, and a thoughtful review of dependencies add up to stronger systems.`,
    author: "Softrate Security Team",
    category: "Cybersecurity",
    tags: ["Security", "Best practices"],
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=85",
    publishedAt: "2025-02-26T10:00:00.000Z",
    featured: false,
    readTime: 4
  },
  {
    _id: "demo-5",
    slug: "cloud-choices-with-a-clear-purpose",
    title: "Making cloud choices with a clear purpose",
    excerpt: "Cloud strategy works best when it's shaped by the people and outcomes it needs to support.",
    content: `## Cloud with intention\n\nMoving to the cloud isn't a goal by itself. A strong strategy connects the platform to a real outcome: more resilience, faster learning, or a better experience for customers.\n\nMeasure what matters, keep architectures understandable, and make room to adapt.`,
    author: "Daniel Chen",
    category: "Cloud Computing",
    tags: ["Cloud", "Strategy"],
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=85",
    publishedAt: "2025-02-19T10:00:00.000Z",
    featured: false,
    readTime: 4
  },
  {
    _id: "demo-6",
    slug: "small-steps-big-innovation",
    title: "Small steps, big innovation",
    excerpt: "Innovation doesn't always arrive as a breakthrough. Often, it's a series of thoughtful improvements.",
    content: `## Make progress visible\n\nThe best ideas can come from anywhere in an organization. Creating space to test them — and sharing what was learned — helps good ideas travel.\n\nCuriosity is a practice. Keep asking better questions, and keep the first experiment small.`,
    author: "Maya Reddy",
    category: "Technology & Innovation",
    tags: ["Innovation", "Culture"],
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=85",
    publishedAt: "2025-02-11T10:00:00.000Z",
    featured: false,
    readTime: 3
  },
  {
    _id: "demo-7",
    slug: "what-technology-leaders-are-thinking-about",
    title: "What technology leaders are thinking about this year",
    excerpt: "A few themes keep surfacing in conversations about the next chapter of digital business.",
    content: `## The questions shaping the year\n\nLeaders are balancing new possibilities with a renewed focus on durable fundamentals: trusted data, resilient platforms, and teams that can keep learning.\n\nThe opportunity isn't choosing between speed and care. It's building the habits that help an organization do both.`,
    author: "Softrate Research",
    category: "Industry Insights",
    tags: ["Leadership", "Trends"],
    image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=85",
    publishedAt: "2025-02-03T10:00:00.000Z",
    featured: false,
    readTime: 4
  }
];

export function formatDate(date) {
  if (!date) return "Recently";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(date));
}

export function estimateReadTime(content = "") {
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}
