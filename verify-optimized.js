const { execSync } = require('child_process');

console.log('Testing Optimized Skills...');

// Test 1: News Fetch
try {
  console.log('\nRunning News Fetch (with timeout)...');
  const start = Date.now();
  // We need to run from /programs/openclaw-deploy because fetch-news.js assumes relative path to calendar
  execSync('node skills/autonomous-daily-briefing/bin/fetch-news.js', { 
    cwd: '/programs/openclaw-deploy',
    stdio: 'inherit' 
  });
  const duration = (Date.now() - start) / 1000;
  console.log(`News fetch completed in ${duration.toFixed(2)}s`);
} catch (e) {
  console.error('News fetch failed:', e.message);
}

// Test 2: YouTube Summary
try {
  console.log('\nRunning YouTube Summary...');
  const videoUrl = 'https://www.youtube.com/watch?v=M7lc1UVf-VE'; // YouTube Data API Intro
  execSync(`node skills/universal-web-summarizer/bin/summarize.js "${videoUrl}"`, {
    cwd: '/programs/openclaw-deploy',
    stdio: 'inherit'
  });
} catch (e) {
  console.error('YouTube summary failed:', e.message);
}
