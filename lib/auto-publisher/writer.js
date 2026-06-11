import OpenAI from 'openai';

function getOpenRouter() {
  return new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY || 'dummy-key-build-only'
  });
}

const MODEL_CHAIN = [
  process.env.OPENROUTER_MODEL,
  'openai/gpt-4o-mini',
  'meta-llama/llama-3.3-70b-instruct',
  'mistralai/mistral-7b-instruct'
].filter(Boolean);

const WC_TOPICS = ['world cup', 'worldcup', 'wc2026', 'fifa', 'match', 'goal',
  'football', 'soccer', 'messi', 'ronaldo', 'mbappe', 'neymar',
  'argentina', 'brazil', 'france', 'england', 'germany', 'spain',
  'portugal', 'netherlands'];

const STADIUMS_DATA = [
  { name: 'Estadio Azteca', city: 'Mexico City', capacity: 83264 },
  { name: 'MetLife Stadium', city: 'New York/New Jersey', capacity: 82500 },
  { name: 'AT&T Stadium', city: 'Dallas', capacity: 80000 },
  { name: 'Arrowhead Stadium', city: 'Kansas City', capacity: 76416 },
  { name: 'NRG Stadium', city: 'Houston', capacity: 72220 },
  { name: 'Lumen Field', city: 'Seattle', capacity: 72000 },
  { name: 'Mercedes-Benz Stadium', city: 'Atlanta', capacity: 71000 },
  { name: 'SoFi Stadium', city: 'Los Angeles', capacity: 70000 },
  { name: 'Gillette Stadium', city: 'Boston', capacity: 68756 },
  { name: "Levi's Stadium", city: 'San Francisco', capacity: 68500 },
  { name: 'Lincoln Financial Field', city: 'Philadelphia', capacity: 67594 },
  { name: 'Hard Rock Stadium', city: 'Miami', capacity: 65326 },
  { name: 'BC Place', city: 'Vancouver', capacity: 54500 },
  { name: 'Estadio BBVA', city: 'Monterrey', capacity: 51000 },
  { name: 'Estadio Akron', city: 'Guadalajara', capacity: 46355 },
  { name: 'BMO Field', city: 'Toronto', capacity: 30000 },
];

function getSystemPrompt(trend) {
  const title = trend.title?.toLowerCase() || '';
  const isWc = WC_TOPICS.some(k => title.includes(k));
  if (isWc) {
    return `You are an expert football journalist and SEO strategist covering the FIFA World Cup 2026. You write for ESPN, BBC Sport, and The Athletic. You ONLY write facts that you are certain about — you NEVER fabricate match results, scores, or specific player statistics. If you don't know a specific fact, you write generally about the team's history, playing style, and tournament context instead. You cite specific dates, stadium names, host cities, and confirmed match fixtures. Your articles rank #1 on Google for relevant keywords.`;
  }
  return 'You are a senior SEO content writer and industry expert with 15+ years of experience. You write for Forbes, TechCrunch, and The Verge. You cite real data, statistics, and concrete examples. Every claim you make is verifiable. Your articles are authoritative, detailed, and rank #1 on Google. You NEVER use AI cliches or vague generalizations.';
}

function buildMatchDataSection(trend) {
  const md = trend.matchData;
  if (!md) return '';

  // Match preview (team1 vs team2 with date/venue)
  if (md.team1 && md.team2 && md.venue) {
    return `
## CONFIRMED MATCH DATA (USE THESE EXACT FACTS)
- Match: ${md.team1} vs ${md.team2}
- Date: ${new Date(md.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
- Venue: ${md.venue} (${md.city})
- Stadium Capacity: ${md.capacity?.toLocaleString() || 'TBA'} seats
- Tournament Stage: Group ${md.group || 'Stage'}
- Host Country: ${md.city?.includes('Mexico City') || md.city?.includes('Monterrey') || md.city?.includes('Guadalajara') ? 'Mexico' : md.city?.includes('Vancouver') || md.city?.includes('Toronto') ? 'Canada' : 'USA'}

CRITICAL RULES:
1. You MUST mention the exact date, venue, and city in your article
2. You MUST mention both teams' names multiple times
3. You MUST describe the venue and its significance
4. If this match has NOT happened yet, write it as a PREVIEW (not a recap)
5. If this match has already happened, you may briefly summarize but DO NOT fabricate scores or specific plays
6. Include match context: group standings implications, tournament stage
7. Use team-specific keywords naturally (e.g., "Morocco national team World Cup 2026", "Scotland vs Morocco fixture")
`;
  }

  // Team guide (schedule, opponents, venues)
  if (md.team && md.opponents) {
    return `
## CONFIRMED TEAM DATA (USE THESE EXACT FACTS)
- Team: ${md.team}
- Opponents: ${md.opponents}
- Venues: ${md.venues}
- Matches: ${md.matches.map(m => `${m.team1} vs ${m.team2} on ${new Date(m.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} at ${m.venue} (${m.city})`).join('; ')}

CRITICAL RULES:
1. List ALL confirmed matches with dates and venues
2. Describe each opponent's playing style and World Cup history
3. Analyze the group dynamics and qualification prospects
4. Mention the team's key players and their roles
5. Use long-tail keywords like "${md.team} World Cup 2026 schedule", "${md.team} group stage opponents", "where does ${md.team} play World Cup 2026"
`;
  }

  // General WC topic (stadiums, format, golden boot)
  if (md.template === 'stadiums') {
    return `
## CONFIRMED WORLD CUP 2026 DATA
- Host Nations: USA, Mexico, Canada
- Number of Stadiums: 16
- Number of Teams: 48
- Total Matches: 104
- Tournament Dates: June 11 - July 19, 2026
- Final Venue: MetLife Stadium, New York/New Jersey (82,500 capacity)
- Opening Match: Mexico vs Canada at Estadio Azteca, Mexico City (83,264 capacity)

STADIUMS:
${STADIUMS_DATA.map(s => `- ${s.name} (${s.city}): ${s.capacity.toLocaleString()} seats`).join('\n')}

CRITICAL RULES:
1. List all 16 stadiums with their capacities and host cities
2. Mention which teams play at each venue
3. Describe the unique features of each stadium
4. Use keywords like "World Cup 2026 stadiums list", "USA Mexico Canada World Cup venues"
`;
  }

  if (md.template === 'schedule') {
    return `
## CONFIRMED WORLD CUP 2026 DATA
- Tournament Dates: June 11 - July 19, 2026
- Group Stage: June 11-27, 2026 (12 groups of 4 teams)
- Round of 32: June 28 - July 3, 2026
- Round of 16: July 4-7, 2026
- Quarter-finals: July 9-11, 2026
- Semi-finals: July 14-15, 2026
- Third Place Play-off: July 18, 2026
- Final: July 19, 2026 at MetLife Stadium, New Jersey
- Host Nations: USA (11 stadiums), Mexico (3 stadiums), Canada (2 stadiums)
- Total: 104 matches across 16 venues

CRITICAL RULES:
1. Include the exact tournament date structure
2. Mention the expanded 48-team format
3. Describe the knockout stage progression
4. Use keywords like "World Cup 2026 match schedule", "World Cup 2026 fixtures", "when is World Cup 2026 final"
`;
  }

  return '';
}

function buildPrompt(trend) {
  const matchDataSection = buildMatchDataSection(trend);
  const isWcTopic = trend.isWorldCup || WC_TOPICS.some(k => trend.title?.toLowerCase().includes(k));

  return `Write a comprehensive, authoritative, SEO-optimized English article about the following topic. This is for a real website that ranks on Google — every fact must be accurate.

**Topic:** "${trend.title}"
**Source:** ${trend.source} (${trend.url || 'no URL'})
**Engagement score:** ${trend.score || 'unknown'}

${matchDataSection}

---
## ARTICLE REQUIREMENTS

### Length & Structure
- 1500-2000 words total (long-form, authoritative)
- Compelling hook introduction (3-4 sentences that grab attention with a bold statement or statistic)
- 6-8 H2 sections, each with 2-3 H3 sub-sections
- FAQ section with 4-6 questions (real search queries)
- Strong conclusion with prediction or takeaway
- Include at least one numbered list or comparison table

### SEO & Keywords
- Title: 50-60 characters, includes main keyword naturally at the beginning
- Slug: URL-friendly, lowercase, hyphens, include primary keyword
- Meta description: 150-155 characters, includes primary keyword + call to action
- Primary keyword in H1 (title) and first 100 words
- Use 3-5 related LSI keywords naturally throughout
- Include a "Key Takeaways" section with bullet points (great for featured snippets)
- Include relevant hashtags at the end: 5-7 hashtags like #WorldCup2026 #Morocco #FIFA

### CRITICAL: Anti-Fabrication Rules
- DO NOT invent specific match scores, goal times, or player statistics
- DO NOT claim a team "won" or "advanced" if you're not certain
- If writing about an upcoming match, frame it as a PREVIEW: "will face", "set to play", "expected to"
- Use verified data only: team names, dates, venues, tournament structure
- When in doubt, write generally about team history, playing style, or tournament context
- You CAN use well-known player names (Messi, Ronaldo, Mbappe, etc.) but do NOT attribute specific actions to them unless verified
- Better to be vague than wrong

### Content Style
- Professional, authoritative tone (like ESPN or BBC Sport for WC articles)
- Active voice, varied sentence length
- Reading level: 9th-11th grade (informational, not overly simplistic)
- Use data, statistics, and concrete examples where verified
- Short paragraphs (2-4 sentences)
- Use HTML tables for comparison data${isWcTopic ? `
- Include a "Match Details" box with: Date, Venue, City, Stadium Capacity, Tournament Stage` : ''}
- No AI cliches. Banned: "in today's fast-paced world", "dive into", "unleash", "harness the power", "game-changer", "revolutionize", "cutting-edge", "next-level", "unlock the potential", "navigate the landscape", "it's important to note", "it's worth noting", "delve into", "embark on a journey", "testament to"

### Tags & Category
- 4-6 relevant tags (include both broad and specific)
- Category from: Technology, Business, Finance, Health, Science, Entertainment, Sports, Marketing, AI, Crypto

### FAQ
- 4-6 questions people actually search for on Google
- Each answer: 3-5 sentences
- Include a "People Also Ask" style format

---
## OUTPUT FORMAT

Return ONLY valid JSON (no markdown code blocks):

{
  "title": "SEO-optimized title (50-60 chars)",
  "slug": "url-friendly-slug-with-primary-keyword",
  "metaDescription": "Compelling meta description (150-155 chars) with keyword + CTA",
  "content": "Full HTML content using <h2>, <h3>, <p>, <ul>, <ol>, <li>, <strong>, <em>, <table>, <tr>, <td> tags. MUST start with <p> tag. Minimum 1500 words.",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "category": "One of the categories above",
  "faqs": [
    {"question": "Real search query people ask?", "answer": "Detailed 3-5 sentence answer"}
  ],
  "keyFacts": ["fact 1", "fact 2", "fact 3"],
  "hashtags": "#Hashtag1 #Hashtag2 #Hashtag3 #Hashtag4 #Hashtag5",
  "imagePrompt": "Short description for generating a featured image, e.g. 'Morocco national football team celebrating with fans in a stadium'"
}`;
}

export async function writeArticle(trend) {
  const prompt = buildPrompt(trend);
  let lastError;

  for (const model of MODEL_CHAIN) {
    try {
      const openrouter = getOpenRouter();
      const completion = await openrouter.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: getSystemPrompt(trend)
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 8000
      });

      const raw = completion.choices[0].message.content;
      let article;

      try {
        const cleaned = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
        const braceEnd = cleaned.lastIndexOf('}');
        article = JSON.parse(braceEnd > 0 ? cleaned.slice(0, braceEnd + 1) : cleaned);
      } catch (err) {
        console.error(`Model ${model} returned invalid JSON:`, raw.slice(0, 200));
        lastError = new Error('AI returned invalid JSON');
        continue;
      }

      const required = ['title', 'slug', 'metaDescription', 'content', 'tags', 'category'];
      const missing = required.filter(f => !article[f]);
      if (missing.length) {
        console.error(`Model ${model} missing fields: ${missing.join(', ')}`);
        lastError = new Error(`AI response missing required field: ${missing[0]}`);
        continue;
      }

      article.wordCount = countWords(article.content);
      article.readingTime = Math.ceil(article.wordCount / 200);
      article.generatedAt = new Date().toISOString();
      article.sourceTrend = trend;
      article.model = model;

      return article;
    } catch (err) {
      console.warn(`Model ${model} failed:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error('All models failed');
}

function countWords(html) {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return text.split(' ').length;
}
