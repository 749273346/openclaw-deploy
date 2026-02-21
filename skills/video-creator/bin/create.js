#!/usr/bin/env node

const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffprobePath = require('@ffprobe-installer/ffprobe').path;
const path = require('path');
const fs = require('fs');

// Set FFmpeg paths
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

const args = process.argv.slice(2);
const command = args[0];

function showHelp() {
  console.log(`
🎥 OpenClaw Video Creator Skill

Usage: openclaw video <command> [args]

Commands:
  check        Verify FFmpeg installation and environment
  create       [Placeholder] Create a video from script/assets
  help         Show this help message
`);
}

function checkEnvironment() {
  console.log('🔍 Checking Video Creation Environment...');
  console.log(`✅ FFmpeg Path: ${ffmpegPath}`);
  console.log(`✅ FFprobe Path: ${ffprobePath}`);
  
  ffmpeg.getAvailableFormats(function(err, formats) {
    if (err) {
      console.error('❌ Error querying FFmpeg:', err.message);
    } else {
      console.log('✅ FFmpeg is functional!');
      console.log(`ℹ️  Available formats: ${Object.keys(formats).length}`);
      console.log('🎉 You are ready to create videos!');
    }
  });
}

if (!command || command === 'help') {
  showHelp();
} else if (command === 'check') {
  checkEnvironment();
} else if (command === 'create') {
  console.log('🚧 Video creation logic is under development.');
  console.log('   Please provide API keys for image/video generation services first.');
} else {
  console.error(`Unknown command: ${command}`);
  showHelp();
}
