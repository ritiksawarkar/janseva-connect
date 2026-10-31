import { query } from '../config/db.js';

const departmentRules = [
  {
    code: 'SANITATION',
    name: 'Sanitation & Solid Waste Management',
    categories: ['Sanitation', 'Waste Management', 'Cleanliness', 'Garbage'],
    keywords: [
      // English
      'garbage', 'waste', 'trash', 'dustbin', 'dump', 'dumping', 'litter', 'smell', 'stench', 'foul', 'sweep', 'sweeper', 'sanitation', 'cleanliness',
      // Hindi
      'kachra', 'kachara', 'kuda', 'gandagi', 'badbu', 'safai', 'swachh', 'swachhta', 'कूड़ा', 'कचरा', 'गंदगी', 'सफाई', 'बदबू', 'डस्टबिन',
      // Marathi
      'ghan', 'kachra', 'kachara', 'ghani', 'swachhata', 'durgandhi', 'घाण', 'कचरा', 'घाण पाणी', 'दुर्गंधी', 'स्वच्छता', 'झाडलोट'
    ]
  },
  {
    code: 'PWD',
    name: 'Public Works Department (PWD)',
    categories: ['Public Works', 'Roads', 'Infrastructure', 'Footpath', 'Bridges'],
    keywords: [
      // English
      'pothole', 'potholes', 'road', 'street', 'asphalt', 'tar', 'damaged road', 'crater', 'footpath', 'pavement', 'sidewalk', 'bridge', 'speed breaker', 'divider', 'manhole cover',
      // Hindi
      'khadda', 'khadde', 'sadak', 'rasta', 'footpath', 'pool', 'सड़क', 'रास्ता', 'खड्डा', 'खड्डे', 'फुटपाथ', 'पुल', 'टूटी सड़क',
      // Marathi
      'khadda', 'khadde', 'rasta', 'raste', 'kambha', 'footpath', 'pul', 'खड्डे', 'खड्डा', 'रस्ता', 'रस्ते', 'फूटपाथ', 'पूल', 'डांबरीकरण'
    ]
  },
  {
    code: 'ELECTRICAL',
    name: 'Electrical & Power Supply',
    categories: ['Electrical', 'Streetlight', 'Power Supply', 'Electricity'],
    keywords: [
      // English
      'streetlight', 'street light', 'lamp', 'bulb', 'light pole', 'dark', 'blackout', 'power cut', 'electricity', 'wire', 'hanging wire', 'transformer', 'sparking',
      // Hindi
      'bijli', 'batti', 'andhera', 'light', 'khamba', 'taar', 'तार', 'बिजली', 'अंधेरा', 'बत्ती', 'स्ट्रीट लाइट', 'ट्रांसफॉर्मर',
      // Marathi
      'veej', 'vij', 'pathdiva', 'diva', 'andhar', 'kham', 'vidyut', 'वीज', 'पथदिवा', 'दिवा', 'अंधार', 'खांब', 'विद्युत', 'स्ट्रीटलाईट'
    ]
  },
  {
    code: 'WATER',
    name: 'Water Supply & Sewerage',
    categories: ['Water Supply', 'Drinking Water', 'Water Pipeline'],
    keywords: [
      // English
      'water', 'leakage', 'leaking', 'burst pipe', 'pipe', 'pipeline', 'tap', 'contamination', 'dirty water', 'water supply', 'low pressure', 'no water',
      // Hindi
      'paani', 'pani', 'nal', 'pipe', 'ganda paani', 'leakage', 'galati', 'पानी', 'नल', 'पाइप', 'गंदा पानी', 'पानी का रिसाव', 'पानी नहीं',
      // Marathi
      'pani', 'galati', 'nal', 'pipeline', 'pipe', 'dushit pani', 'पाणी', 'गळती', 'नळ', 'पाईप', 'पाईपलाईन', 'दूषित पाणी', 'पाणीपुरवठा'
    ]
  },
  {
    code: 'DRAINAGE',
    name: 'Drainage & Stormwater Management',
    categories: ['Drainage', 'Sewage', 'Gutter', 'Stormwater'],
    keywords: [
      // English
      'drainage', 'drain', 'sewer', 'sewage', 'gutter', 'overflow', 'clogged', 'blocked drain', 'choked', 'stagnant water', 'flooding', 'nullah',
      // Hindi
      'nali', 'naala', 'gutter', 'ganda paani', 'choke', 'over flow', 'नाली', 'नाला', 'गटर', 'जलभराव', 'गंदा नाला',
      // Marathi
      'gatari', 'gatar', 'nala', 'sandpani', 'chokup', 'tumbale', 'गटार', 'गटारे', 'नाला', 'सांडपाणी', 'तुंबलेले पाणी'
    ]
  },
  {
    code: 'HEALTH',
    name: 'Public Health & Environment',
    categories: ['Public Health', 'Environment', 'Pest Control'],
    keywords: [
      // English
      'mosquito', 'dengue', 'malaria', 'pest', 'fogging', 'fumigation', 'stagnant', 'epidemic', 'disease', 'hospital', 'clinic', 'dead animal',
      // Hindi
      'machhar', 'dengue', 'malaria', 'bimari', 'dawa chhidkaw', 'मच्छर', 'डेंगू', 'मलेरिया', 'बीमारी', 'दवा का छिड़काव', 'मरा हुआ जानवर',
      // Marathi
      'das', 'hivtap', 'aarogya', 'fowarni', 'rograi', 'डास', 'हिवताप', 'साथीचे आजार', 'फवारणी', 'आरोग्य', 'मृत प्राणी'
    ]
  }
];

export const suggestDepartment = async (category = '', title = '', description = '') => {
  const combinedText = `${category} ${title} ${description}`.toLowerCase();
  let bestMatch = null;
  let highestScore = 0;
  let matchedKeywords = [];

  for (const rule of departmentRules) {
    let score = 0;
    const currentMatched = [];

    // Category exact or partial match gets high weight
    for (const cat of rule.categories) {
      if (category.toLowerCase().includes(cat.toLowerCase())) {
        score += 15;
        currentMatched.push(`Category: ${cat}`);
      }
    }

    // Keyword matches
    for (const kw of rule.keywords) {
      const lowerKw = kw.toLowerCase();
      if (combinedText.includes(lowerKw)) {
        score += 3;
        currentMatched.push(kw);
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = rule;
      matchedKeywords = currentMatched;
    }
  }

  // Lookup in DB
  const targetCode = bestMatch ? bestMatch.code : 'GENERAL';
  const deptRes = await query(
    'SELECT id, name, code, contact_email, contact_phone FROM departments WHERE code = $1 AND is_active = TRUE',
    [targetCode]
  );

  const dept = deptRes.rows[0] || null;

  return {
    suggestedDepartmentId: dept ? dept.id : null,
    departmentName: dept ? dept.name : (bestMatch ? bestMatch.name : 'General Administration'),
    departmentCode: targetCode,
    confidence: highestScore > 10 ? 'HIGH' : highestScore > 0 ? 'MEDIUM' : 'LOW',
    score: highestScore,
    matchedKeywords: [...new Set(matchedKeywords)].slice(0, 5),
    explanation: bestMatch
      ? `Suggested based on matched keywords: ${[...new Set(matchedKeywords)].slice(0, 3).join(', ')}.`
      : 'No specialized department matched; routed for General Administration manual review.'
  };
};

export default {
  suggestDepartment
};

