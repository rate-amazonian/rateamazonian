import fs from 'fs';
import path from 'path';

// Read the large JSON file
const data = JSON.parse(fs.readFileSync('./src/data/phonetool-all-employees.json', 'utf8'));
const employees = data.employees;

console.log(`Total employees: ${employees.length}`);

// Define categories
const categories = {
  'svp': {
    keywords: ['SVP', 'Senior Vice President'],
    level: [1],
    employees: []
  },
  'vp': {
    keywords: ['VP', 'Vice President'],
    level: [2],
    employees: []
  },
  'director': {
    keywords: ['Director'],
    level: [3],
    employees: []
  },
  'sdm': {
    keywords: ['SDM', 'Senior Development Manager', 'Senior Manager'],
    level: [4, 5],
    employees: []
  },
  'manager': {
    keywords: ['Manager', 'Mgr'],
    level: [4, 5, 6],
    employees: []
  },
  'sde': {
    keywords: ['SDE', 'Senior Software Development Engineer', 'Software Development Engineer'],
    level: [5, 6],
    employees: []
  },
  'tpm': {
    keywords: ['TPM', 'Technical Program Manager'],
    level: [5, 6],
    employees: []
  },
  'pm': {
    keywords: ['PM', 'Product Manager', 'Program Manager'],
    level: [5, 6],
    employees: []
  },
  'l4': {
    keywords: [],
    level: [4],
    employees: []
  },
  'l5': {
    keywords: [],
    level: [5],
    employees: []
  },
  'l6': {
    keywords: [],
    level: [6],
    employees: []
  },
  'l7': {
    keywords: [],
    level: [7],
    employees: []
  },
  'other': {
    keywords: [],
    level: [],
    employees: []
  }
};

// Categorize employees
employees.forEach(emp => {
  const title = (emp.job_title || '').toLowerCase();
  const level = emp.level;
  let categorized = false;

  // Check each category
  for (const [catName, cat] of Object.entries(categories)) {
    if (catName === 'other') continue;

    // For level-only categories (l4, l5, l6, l7)
    if (cat.keywords.length === 0 && cat.level.length > 0) {
      if (cat.level.includes(level)) {
        cat.employees.push(emp);
        categorized = true;
        break;
      }
    }
    // For keyword-based categories
    else if (cat.keywords.length > 0) {
      const hasKeyword = cat.keywords.some(keyword => 
        title.includes(keyword.toLowerCase())
      );
      const hasLevel = cat.level.length === 0 || cat.level.includes(level);
      
      if (hasKeyword && hasLevel) {
        cat.employees.push(emp);
        categorized = true;
        break;
      }
    }
  }

  // If not categorized, add to other
  if (!categorized) {
    categories.other.employees.push(emp);
  }
});

// Create public directory if it doesn't exist
const publicDir = './public/employees';
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Write category files
Object.entries(categories).forEach(([catName, cat]) => {
  const filename = `${publicDir}/${catName}.json`;
  const categoryData = {
    category: catName,
    total_count: cat.employees.length,
    generated_at: new Date().toISOString(),
    employees: cat.employees
  };
  
  fs.writeFileSync(filename, JSON.stringify(categoryData, null, 2));
  console.log(`${catName}: ${cat.employees.length} employees -> ${filename}`);
});

// Create an index file with all categories
const indexData = {
  categories: Object.entries(categories).map(([name, cat]) => ({
    name,
    count: cat.employees.length,
    keywords: cat.keywords,
    levels: cat.level
  })),
  total_employees: employees.length,
  generated_at: new Date().toISOString()
};

fs.writeFileSync(`${publicDir}/index.json`, JSON.stringify(indexData, null, 2));
console.log(`\nIndex file created: ${publicDir}/index.json`);
console.log(`Total categorized: ${Object.values(categories).reduce((sum, cat) => sum + cat.employees.length, 0)}`);
