#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { format, isSameDay, parseISO, subDays, isAfter, isBefore } = require('date-fns');

// Relative path to memory storage
const CALENDAR_FILE = path.resolve(__dirname, '../../elite-longterm-memory/memory/calendar.json');

// Ensure calendar file exists
if (!fs.existsSync(CALENDAR_FILE)) {
  fs.mkdirSync(path.dirname(CALENDAR_FILE), { recursive: true });
  fs.writeFileSync(CALENDAR_FILE, JSON.stringify([], null, 2));
}

const command = process.argv[2];
const args = process.argv.slice(3);

function loadEvents() {
  try {
    return JSON.parse(fs.readFileSync(CALENDAR_FILE, 'utf8'));
  } catch (e) {
    return [];
  }
}

function saveEvents(events) {
  fs.writeFileSync(CALENDAR_FILE, JSON.stringify(events, null, 2));
}

function listEvents(dateStr) {
  const events = loadEvents();
  const targetDate = dateStr ? parseISO(dateStr) : new Date();
  
  const todaysEvents = events.filter(e => isSameDay(parseISO(e.start), targetDate));
  
  if (todaysEvents.length === 0) {
    console.log('No events scheduled for today.');
  } else {
    console.log(todaysEvents.map(e => `- [${format(parseISO(e.start), 'HH:mm')}] ${e.title}`).join('\n'));
  }
}

function generateWeeklyReport() {
  const events = loadEvents();
  const now = new Date();
  const oneWeekAgo = subDays(now, 7);
  
  const weeklyEvents = events.filter(e => {
    const eventDate = parseISO(e.start);
    return isAfter(eventDate, oneWeekAgo) && isBefore(eventDate, now);
  });
  
  if (weeklyEvents.length === 0) {
    console.log('No events found in the past week.');
  } else {
    console.log('Weekly Report Summary (Last 7 Days):');
    weeklyEvents.forEach(e => {
      console.log(`- [${format(parseISO(e.start), 'yyyy-MM-dd HH:mm')}] ${e.title}`);
    });
  }
}

function addEvent(title, timeStr) {
  const events = loadEvents();
  const today = new Date();
  // Assume time is HH:mm for today, or full ISO
  let start;
  if (timeStr.includes('T')) {
    start = timeStr;
  } else {
    // Simple HH:mm parser for "today"
    const [hours, minutes] = timeStr.split(':');
    today.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    start = today.toISOString();
  }
  
  const newEvent = {
    id: Date.now().toString(),
    title,
    start,
    created: new Date().toISOString()
  };
  
  events.push(newEvent);
  // Sort by time
  events.sort((a, b) => new Date(a.start) - new Date(b.start));
  
  saveEvents(events);
  console.log(`Event added: "${title}" at ${format(parseISO(start), 'yyyy-MM-dd HH:mm')}`);
}

switch (command) {
  case 'list':
    listEvents(args[0]); // optional date
    break;
  case 'add':
    if (args.length < 2) {
      console.log('Usage: calendar add <time HH:mm> <title>');
    } else {
      addEvent(args.slice(1).join(' '), args[0]);
    }
    break;
  case 'init':
    console.log('Calendar initialized at ' + CALENDAR_FILE);
    break;
  case 'report':
    generateWeeklyReport();
    break;
  default:
    console.log('Usage: calendar <list|add|report> [args]');
}
