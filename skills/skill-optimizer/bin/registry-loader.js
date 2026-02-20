const fs = require('fs');
const path = require('path');

function loadRegistry() {
  const skillsDir = path.resolve(__dirname, '../../');
  const staticRegistryPath = path.resolve(__dirname, '../skill-registry.json');
  
  // 1. Load Static/Curated Registry (High quality metadata)
  let staticSkills = [];
  try {
    if (fs.existsSync(staticRegistryPath)) {
      const data = JSON.parse(fs.readFileSync(staticRegistryPath, 'utf8'));
      staticSkills = data.skills || [];
    }
  } catch (e) {
    console.warn('Warning: Could not load static registry:', e.message);
  }

  // 2. Dynamic Discovery
  let dynamicSkills = [];
  try {
    const entries = fs.readdirSync(skillsDir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      
      const skillName = entry.name;
      
      // Skip if already in static registry
      if (staticSkills.find(s => s.name === skillName)) continue;
      
      // Try to read package.json
      const packageJsonPath = path.join(skillsDir, skillName, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        try {
          const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
          
          // Construct skill object from package.json
          dynamicSkills.push({
            name: pkg.name || skillName,
            id: pkg.name || skillName,
            version: pkg.version || '0.0.0',
            description: pkg.description || 'No description provided',
            keywords: pkg.keywords || [skillName],
            cost: 'unknown', // Default for auto-discovered
            token_usage_estimate: 0,
            auto_discovered: true,
            path: path.join(skillsDir, skillName)
          });
        } catch (err) {
          // Ignore malformed package.json
        }
      }
    }
  } catch (e) {
    console.warn('Warning: Dynamic discovery failed:', e.message);
  }

  // 3. Merge
  return [...staticSkills, ...dynamicSkills];
}

module.exports = { loadRegistry };
