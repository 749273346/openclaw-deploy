#!/usr/bin/env node

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const url = process.argv[2];

if (!url) {
  console.error('Usage: summarize <url>');
  process.exit(1);
}

async function handleYouTube(url) {
  console.log('📹 Processing YouTube URL...');
  try {
    const { YoutubeTranscript } = require('youtube-transcript');
    const transcript = await YoutubeTranscript.fetchTranscript(url);
    const text = transcript.map(t => t.text).join(' ');
    console.log('# YouTube Video Transcript\n');
    console.log(text.substring(0, 8000));
    if (text.length > 8000) console.log('\n...[Transcript Truncated]...');
    return true; // Success
  } catch (e) {
    console.error('⚠️ Failed to fetch transcript via API:', e.message);
    return false; // Failed, fallback to web page
  }
}

async function handleWebPage(url) {
  console.log('🌐 Fetching web page content...');
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });
  
    const page = await browser.newPage();
    
    // Block images/fonts/media for speed
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())) {
        req.abort();
      } else {
        req.continue();
      }
    });

    // Use domcontentloaded for faster return, networkidle2 is too strict for video sites
    const waitUntil = url.includes('youtube.com') || url.includes('youtu.be') 
      ? 'domcontentloaded' 
      : 'networkidle2';
      
    await page.goto(url, { waitUntil, timeout: 30000 });

    // Extract Metadata
    const title = await page.title();
    
    // Extract Description (Meta tag)
    const description = await page.evaluate(() => {
        const meta = document.querySelector('meta[name="description"]');
        return meta ? meta.content : '';
    });

    // Extract Text Content
    const content = await page.evaluate(() => {
      const scripts = document.querySelectorAll('script, style, noscript, iframe, svg');
      scripts.forEach(s => s.remove());
      return document.body.innerText;
    });
    
    console.log('# ' + title);
    if (description) console.log(`\n> ${description}\n`);

    console.log('\n## Page Content (Snippet)\n');
    // Clean up excessive whitespace
    const cleanContent = content.replace(/\s+/g, ' ').trim();
    console.log(cleanContent.substring(0, 5000));
    if (cleanContent.length > 5000) console.log('\n...[Content Truncated]...');
    
  } catch (e) {
    console.error('❌ Error fetching page:', e.message);
  } finally {
    if (browser) await browser.close();
  }
}

async function main() {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const transcriptSuccess = await handleYouTube(url);
    if (!transcriptSuccess) {
      console.log('⚠️ Falling back to web scraping for video metadata...');
      await handleWebPage(url);
    }
  } else {
    await handleWebPage(url);
  }
}

main();
