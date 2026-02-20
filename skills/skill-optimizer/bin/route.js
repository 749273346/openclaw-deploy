#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const { loadRegistry } = require('./registry-loader');

let registrySkills;
try {
  registrySkills = loadRegistry();
} catch (e) {
  console.error('Error loading registry:', e.message);
  process.exit(1);
}

function route(taskDescription) {
  if (!taskDescription) return null;
  const task = taskDescription.toLowerCase();
  const candidates = [];

  for (const skill of registrySkills) {
    let score = 0;
    
    // Keyword matching
    if (skill.keywords) {
      for (const kw of skill.keywords) {
        if (task.includes(kw)) {
          score += 10;
        }
      }
    }

    // Description matching
    if (skill.description && skill.description.toLowerCase().includes(task)) {
      score += 5;
    }

    if (score > 0) {
      candidates.push({ ...skill, score });
    }
  }

  if (candidates.length === 0) {
    return {
      recommended: null,
      reason: "No matching skill found."
    };
  }

  // Sort by score (desc), then by cost (low to high)
  candidates.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score; // Higher score first
    }
    const costMap = { 'low': 1, 'medium': 2, 'high': 3 };
    return (costMap[a.cost] || 2) - (costMap[b.cost] || 2);
  });

  const best = candidates[0];
  
  return {
    recommended: best,
    alternatives: candidates.slice(1),
    reason: `Selected ${best.name} because it has the highest relevance score (${best.score}) and lowest cost (${best.cost}).`
  };
}

// CLI usage
if (require.main === module) {
  const task = process.argv.slice(2).join(' ');
  if (!task) {
    console.error('Please provide a task description.');
    process.exit(1);
  }
  
  const result = route(task);
  console.log(JSON.stringify(result, null, 2));
}

module.exports = { route };
