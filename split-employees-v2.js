import fs from 'fs';

// Read the large JSON file
const data = JSON.parse(fs.readFileSync('./src/data/phonetool-all-employees.json', 'utf8'));
const employees = data.employees;

console.log(`Total employees: ${employees.length}`);

// Define categories based on job titles
const categories = {
  'executives': {
    keywords: ['CEO', 'President', 'SVP', 'Senior Vice President', 'Chief'],
    employees: []
  },
  'vps': {
    keywords: ['VP', 'Vice President'],
    employees: []
  },
  'directors': {
    keywords: ['Director'],
    employees: []
  },
  'managers': {
    keywords: ['Manager', 'Mgr', 'SDM', 'Senior Development Manager'],
    employees: []
  },
  'engineers': {
    keywords: ['Engineer', 'SDE', 'Software Development Engineer', 'Developer', 'Dev'],
    employees: []
  },
  'tpm': {
    keywords: ['TPM', 'Technical Program Manager'],
    employees: []
  },
  'pm': {
    keywords: ['PM', 'Product Manager', 'Program Manager'],
    employees: []
  },
  'designers': {
    keywords: ['Designer', 'UX', 'UI', 'Design'],
    employees: []
  },
  'data': {
    keywords: ['Data', 'Analyst', 'Scientist', 'ML', 'Machine Learning'],
    employees: []
  },
  'operations': {
    keywords: ['Operations', 'Ops', 'Support', 'Customer'],
    employees: []
  },
  'sales': {
    keywords: ['Sales', 'Account', 'Business Development'],
    employees: []
  },
  'marketing': {
    keywords: ['Marketing', 'Growth', 'Brand'],
    employees: []
  },
  'hr': {
    keywords: ['HR', 'People', 'Recruiting', 'Talent'],
    employees: []
  },
  'finance': {
    keywords: ['Finance', 'Accounting', 'CFO', 'Financial'],
    employees: []
  },
  'legal': {
    keywords: ['Legal', 'Counsel', 'Attorney'],
    employees: []
  },
  'other': {
    keywords: [],
    employees: []
  }
};

// Categorize employees
employees.forEach(emp => {
  const title = (emp.job_title || '').toLowerCase();
  let categorized = false;

  // Check each category
  for (const [catName, cat] of Object.entries(categories)) {
    if (catName === 'other') continue;

    // Check if any keyword matches
    if (cat.keywords.some(keyword => title.includes(keyword.toLowerCase()))) {
      cat.employees.push(emp);
      categorized = true;
      break;
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
    keywords: cat.keywords
  })),
  total_employees: employees.length,
  generated_at: new Date().toISOString()
};

fs.writeFileSync(`${publicDir}/index.json`, JSON.stringify(indexData, null, 2));
console.log(`\nIndex file created: ${publicDir}/index.json`);
console.log(`Total categorized: ${Object.values(categories).reduce((sum, cat) => sum + cat.employees.length, 0)}`);


