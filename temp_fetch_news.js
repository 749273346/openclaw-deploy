#!/usr/bin/env node

const Parser = require('rss-parser');
const axios = require('axios');
const { execSync } = require('child_process');
const parser = new Parser({
  timeout: 10000, // 10s timeout for RSS parser
});

// Configure Feeds
const FEEDS = [
  { name: 'Hacker News (Top)', url: 'https://news.ycombinator.com/rss' },
  { name: 'OpenAI Blog', url: 'https://openai.com/blog/rss.xml' },
  { name: 'Anthropic Blog', url: 'https://www.anthropic.com/rss.xml' },
  { name: 'Google AI Blog', url: 'https://blog.google/technology/ai/rss/' },
  { name: 'Microsoft AI Blog', url: 'https://blogs.microsoft.com/ai/feed/' },
  { name: 'ArXiv AI (cs.AI)', url: 'http://export.arxiv.org/rss/cs.AI' }
];

const WEATHER_FULL_URL = 'https://wttr.in/?0';

async function fetchWeather() {
  try {
    const response = await axios.get(WEATHER_FULL_URL, { 
      headers: { 'User-Agent': 'curl/7.64.1' },
      timeout: 5000 // 5s timeout
    });
    return response.data;
  } catch (error) {
    return 'Weather unavailable: ' + error.message;
  }
}

async function fetchFeed(feed) {
  try {
    // Wrap in a promise race to ensure strict timeout even if parser ignores it
    const feedPromise = parser.parseURL(feed.url);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 10000)
    );
    
    const feedData = await Promise.race([feedPromise, timeoutPromise]);
    
    const items = feedData.items.slice(0, 5).map(item => ({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
      snippet: item.contentSnippet ? item.contentSnippet.substring(0, 200) + '...' : ''
    }));
    return { name: feed.name, items };
  } catch (error) {
    return { name: feed.name, error: error.message, items: [] };
  }
}

async function main() {
  console.log('# 🌍 Daily Briefing Source Data\n');
  
  // 1. Weather
  console.log('## 🌦️ Weather Report');
  const weather = await fetchWeather();
  console.log('```');
  console.log(weather);
  console.log('```\n');

  // 2. Calendar
  console.log('## 📅 Calendar Events');
  try {
    const calendarOutput = execSync('node skills/local-calendar-skill/bin/calendar.js list', { timeout: 5000 }).toString();
    console.log(calendarOutput);
  } catch (e) {
    console.log('Error fetching calendar: ' + e.message);
  }
  console.log('');

  // 3. AI News
  console.log('## 🤖 AI & Tech News\n');
  
  const feedPromises = FEEDS.map(fetchFeed);
  const results = await Promise.all(feedPromises);

  results.forEach(feed => {
    console.log(`### ${feed.name}`);
    if (feed.error) {
      console.log(`*Error fetching feed: ${feed.error}*`);
    } else {
      feed.items.forEach(item => {
        console.log(`- **[${item.title}](${item.link})**`);
        if (item.pubDate) console.log(`  - *Date: ${item.pubDate}*`);
        if (item.snippet) console.log(`  - ${item.snippet}`);
      });
    }
    console.log('');
  });
}

main();
