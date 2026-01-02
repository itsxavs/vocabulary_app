const express = require('express');
const multer = require('multer');
const PDFDocument = require('pdfkit');
const pdfjs = require('pdfjs-dist/legacy/build/pdf');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });
const DATA_FILE = 'vocabulary.json';

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Initialize data file
function initializeData() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ categories: {} }, null, 2));
  }
}

function readData() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// API Routes

// Get all categories and words
app.get('/api/vocabulary', (req, res) => {
  const data = readData();
  res.json(data.categories);
});

// Add category with color
app.post('/api/category', (req, res) => {
  const { name, color } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });

  const data = readData();
  if (data.categories[name]) {
    return res.status(400).json({ error: 'Category already exists' });
  }

  data.categories[name] = {
    words: [],
    color: color || '#667eea',
    order: Object.keys(data.categories).length
  };
  writeData(data);
  res.json({ success: true, category: name });
});

// Update category name
app.put('/api/category/:oldName', (req, res) => {
  const { oldName } = req.params;
  const { newName } = req.body;

  const data = readData();
  if (!data.categories[oldName]) {
    return res.status(400).json({ error: 'Category does not exist' });
  }

  if (newName && newName !== oldName) {
    if (data.categories[newName]) {
      return res.status(400).json({ error: 'Category name already exists' });
    }
    data.categories[newName] = data.categories[oldName];
    delete data.categories[oldName];
  }

  writeData(data);
  res.json({ success: true });
});

// Update word in category
app.put('/api/word/:category/:index', (req, res) => {
  const { category, index } = req.params;
  const { english, spanish } = req.body;

  const data = readData();
  if (!data.categories[category]) {
    return res.status(400).json({ error: 'Category does not exist' });
  }

  if (!data.categories[category].words[index]) {
    return res.status(400).json({ error: 'Word does not exist' });
  }

  data.categories[category].words[index] = { english, spanish };
  writeData(data);
  res.json({ success: true });
});

// Reorder categories
app.post('/api/reorder-categories', (req, res) => {
  const { order } = req.body;
  const data = readData();

  order.forEach((name, index) => {
    if (data.categories[name]) {
      data.categories[name].order = index;
    }
  });

  writeData(data);
  res.json({ success: true });
});

// Add word to category
app.post('/api/word', (req, res) => {
  const { category, english, spanish } = req.body;
  if (!category || !english || !spanish) {
    return res.status(400).json({ error: 'Required fields' });
  }

  const data = readData();
  if (!data.categories[category]) {
    return res.status(400).json({ error: 'Category does not exist' });
  }

  data.categories[category].words.push({ english, spanish });
  writeData(data);
  res.json({ success: true });
});

// Delete word
app.delete('/api/word/:category/:index', (req, res) => {
  const { category, index } = req.params;
  const data = readData();

  if (!data.categories[category]) {
    return res.status(400).json({ error: 'Category does not exist' });
  }

  data.categories[category].words.splice(index, 1);
  writeData(data);
  res.json({ success: true });
});

// Delete category
app.delete('/api/category/:name', (req, res) => {
  const { name } = req.params;
  const data = readData();

  delete data.categories[name];
  writeData(data);
  res.json({ success: true });
});

// Download PDF
app.get('/api/download-pdf', (req, res) => {
  const data = readData();
  const doc = new PDFDocument({ margin: 30, size: 'A4' });
  const filename = `vocabulary_${Date.now()}.pdf`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  doc.pipe(res);

  const sortedCategories = Object.entries(data.categories)
    .sort((a, b) => (a[1].order || 0) - (b[1].order || 0));

  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  let isFirstPage = true;

  // Content by category
  sortedCategories.forEach(([category, categoryData]) => {
    const words = categoryData.words || [];
    const color = categoryData.color || '#667eea';
    
    if (words.length === 0) return;

    // Add new page if not first
    if (!isFirstPage) {
      doc.addPage();
    }
    isFirstPage = false;

    // Category header with color background
    doc.rect(30, doc.y, pageWidth - 60, 35).fill(color);
    
    // Title in white
    doc.fontSize(18).font('Helvetica-Bold').fillColor('white');
    doc.text(category, 40, doc.y + 7, { width: pageWidth - 100 });
    
    doc.moveDown(2);

    // Words in compact list format
    words.forEach((word, wordIndex) => {
      const yPosition = doc.y;
      const lineHeight = 20;
      
      // Check if we need a new page
      if (yPosition + lineHeight > pageHeight - 30) {
        doc.addPage();
        // Repeat category header on new page
        doc.rect(30, doc.y, pageWidth - 60, 35).fill(color);
        doc.fontSize(18).font('Helvetica-Bold').fillColor('white');
        doc.text(category, 40, doc.y + 7, { width: pageWidth - 100 });
        doc.moveDown(2);
      }
      
      // Left colored border
      doc.rect(30, doc.y, 3, lineHeight).fill(color);
      
      // Light background for row
      doc.rect(33, doc.y, pageWidth - 63, lineHeight).fill('#fafafa').stroke('#e8e8e8');
      
      // Word number (small, left)
      doc.fontSize(8).fillColor('#bbb').font('Helvetica');
      doc.text(`${wordIndex + 1}`, 38, doc.y + 4, { continued: true });
      
      // English word (bold and colored)
      doc.fontSize(12).font('Helvetica-Bold').fillColor(color);
      doc.text(`  ${word.english}  `, { continued: true });
      
      // Arrow separator in category color
      doc.fontSize(11).fillColor(color).font('Helvetica');
      doc.text('  :  ', { continued: true });
      
      // Spanish translation (regular, not bold, black)
      doc.fontSize(12).font('Helvetica').fillColor('#333');
      doc.text(word.spanish);
      
      doc.moveDown(1.3);
    });
  });

  doc.end();
});

// Función auxiliar para convertir hex a RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 102, g: 126, b: 234 };
}

// Import PDF and extract text
app.post('/api/import-pdf', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'File required' });
  }

  try {
    fs.unlinkSync(req.file.path);
  } catch (e) {}
  
  res.status(400).json({ error: 'Please use the JSON import option instead' });
});

// Alternative route: Import PDF generated by our app (simpler)
app.post('/api/import-pdf-simple', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'File required' });
  }

  try {
    fs.unlinkSync(req.file.path);
  } catch (e) {}
  
  res.status(400).json({ error: 'Please use the JSON import option instead' });
});

initializeData();

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
