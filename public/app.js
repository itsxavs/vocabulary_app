let currentCategory = null;
let draggedCategory = null;

// Cargar datos al iniciar
document.addEventListener('DOMContentLoaded', loadVocabulary);

async function loadVocabulary() {
  try {
    const response = await fetch('/api/vocabulary');
    const categories = await response.json();
    renderCategories(categories);
  } catch (error) {
    console.error('Error cargando vocabulario:', error);
  }
}

function renderCategories(categories) {
  const list = document.getElementById('categoriesList');
  list.innerHTML = '';

  // Sort categories
  const sortedCategories = Object.entries(categories)
    .sort((a, b) => (a[1].order || 0) - (b[1].order || 0));

  if (sortedCategories.length === 0) {
    list.innerHTML = '<p style="color: #999; font-size: 0.9em; text-align: center; padding: 20px 0;">No categories</p>';
    return;
  }

  sortedCategories.forEach(([category, categoryData]) => {
    const item = document.createElement('div');
    item.className = `category-item ${category === currentCategory ? 'active' : ''}`;
    item.draggable = true;
    item.dataset.category = category;
    
    const color = categoryData.color || '#667eea';
    const wordCount = (categoryData.words || []).length;

    item.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0;">
        <div style="width: 14px; height: 14px; background: ${color}; border-radius: 3px; flex-shrink: 0;"></div>
        <span class="category-name" onclick="selectCategory('${category}')" style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 500;">${category}</span>
        <span style="font-size: 0.8em; color: ${category === currentCategory ? 'rgba(255,255,255,0.8)' : '#999'}; flex-shrink: 0; background: ${category === currentCategory ? 'rgba(255,255,255,0.2)' : '#f0f0f0'}; padding: 2px 6px; border-radius: 3px;">${wordCount}</span>
      </div>
      <div style="display: flex; gap: 4px;">
        <button class="category-edit" onclick="editCategory('${category}', event)" style="padding: 4px 6px; background: #667eea; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 0.75em;">✎</button>
        <button class="category-delete" onclick="deleteCategory('${category}', event)">✕</button>
      </div>
    `;

    // Drag and drop
    item.addEventListener('dragstart', (e) => {
      draggedCategory = category;
      item.classList.add('dragging');
    });

    item.addEventListener('dragend', () => {
      item.classList.remove('dragging');
      document.querySelectorAll('.category-item').forEach(el => el.classList.remove('drag-over'));
    });

    item.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (draggedCategory && draggedCategory !== category) {
        item.classList.add('drag-over');
      }
    });

    item.addEventListener('dragleave', () => {
      item.classList.remove('drag-over');
    });

    item.addEventListener('drop', (e) => {
      e.preventDefault();
      if (draggedCategory && draggedCategory !== category) {
        reorderCategories(draggedCategory, category);
      }
      item.classList.remove('drag-over');
    });

    list.appendChild(item);
  });
}

async function reorderCategories(from, to) {
  try {
    const response = await fetch('/api/vocabulary');
    const categories = await response.json();
    
    const sortedNames = Object.entries(categories)
      .sort((a, b) => (a[1].order || 0) - (b[1].order || 0))
      .map(([name]) => name);

    const fromIndex = sortedNames.indexOf(from);
    const toIndex = sortedNames.indexOf(to);

    if (fromIndex > -1 && toIndex > -1) {
      const [removed] = sortedNames.splice(fromIndex, 1);
      sortedNames.splice(toIndex, 0, removed);

      await fetch('/api/reorder-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: sortedNames })
      });

      loadVocabulary();
    }
  } catch (error) {
    console.error('Error reordenando:', error);
  }
}

async function addCategory() {
  const input = document.getElementById('categoryInput');
  const colorInput = document.getElementById('categoryColor');
  const name = input.value.trim();
  const color = colorInput.value;

  if (!name) {
    alert('Please enter a category name');
    return;
  }

  try {
    const response = await fetch('/api/category', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, color })
    });

    if (response.ok) {
      input.value = '';
      loadVocabulary();
      selectCategory(name);
    } else {
      const error = await response.json();
      alert(error.error);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

async function deleteCategory(name, event) {
  event.stopPropagation();
  if (!confirm(`Delete category "${name}" and all its words?`)) return;

  try {
    await fetch(`/api/category/${name}`, { method: 'DELETE' });
    if (currentCategory === name) {
      currentCategory = null;
      document.getElementById('mainArea').innerHTML = '<div class="empty-state"><p>👈 Select a category or create a new one</p></div>';
    }
    loadVocabulary();
  } catch (error) {
    console.error('Error:', error);
  }
}

async function editCategory(name, event) {
  event.stopPropagation();
  const newName = prompt('Edit category name:', name);
  
  if (!newName || newName === name) return;
  
  try {
    const response = await fetch(`/api/category/${name}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newName })
    });

    if (response.ok) {
      if (currentCategory === name) {
        currentCategory = newName;
      }
      loadVocabulary();
      selectCategory(newName);
    } else {
      const error = await response.json();
      alert(error.error);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

async function selectCategory(name) {
  currentCategory = name;
  loadVocabulary();

  try {
    const response = await fetch('/api/vocabulary');
    const categories = await response.json();
    const categoryData = categories[name] || { words: [], color: '#667eea' };
    const words = categoryData.words || [];
    const color = categoryData.color || '#667eea';

    const mainArea = document.getElementById('mainArea');
    mainArea.innerHTML = `
      <div class="category-header">
        <div style="display: flex; align-items: center; gap: 15px;">
          <h2>${name}</h2>
          <input type="color" id="categoryColorPicker" value="${color}" onchange="updateCategoryColor('${name}', this.value)" style="width: 50px; height: 40px; border: 1px solid #ddd; border-radius: 6px; cursor: pointer;">
        </div>
        <span style="color: #999;">${words.length} word${words.length !== 1 ? 's' : ''}</span>
      </div>

      <div class="add-word-form">
        <div class="form-row">
          <input type="text" id="englishInput" placeholder="English word" />
          <input type="text" id="spanishInput" placeholder="Spanish translation" />
          <button class="btn btn-primary btn-small" onclick="addWord('${name}')">+ Add</button>
        </div>
      </div>

      <div class="words-container" id="wordsList"></div>
    `;

    renderWords(name, words);

    // Allow Enter to add word
    document.getElementById('englishInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') addWord(name);
    });
    document.getElementById('spanishInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') addWord(name);
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

async function updateCategoryColor(category, color) {
  try {
    await fetch(`/api/category/${category}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ color })
    });
    loadVocabulary();
  } catch (error) {
    console.error('Error:', error);
  }
}

function renderWords(category, words) {
  const list = document.getElementById('wordsList');
  list.innerHTML = '';

  if (words.length === 0) {
    list.innerHTML = '<p style="text-align: center; color: #999;">No words in this category</p>';
    return;
  }

  words.forEach((word, index) => {
    const card = document.createElement('div');
    card.className = 'word-card';
    card.innerHTML = `
      <div class="word-content" onclick="openEditWordDialog('${category}', ${index}, '${word.english.replace(/'/g, "\\'")}', '${word.spanish.replace(/'/g, "\\'")}')" style="cursor: pointer; flex: 1;">
        <div class="word-english">${word.english}</div>
        <div class="word-spanish">${word.spanish}</div>
      </div>
      <div class="word-actions">
        <button class="btn btn-danger btn-small" onclick="deleteWord('${category}', ${index})">Delete</button>
      </div>
    `;
    list.appendChild(card);
  });
}

function openEditWordDialog(category, index, english, spanish) {
  const dialogId = 'edit-word-dialog-' + Date.now();
  
  let html = `
    <div id="${dialogId}" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;">
      <div style="background: white; padding: 30px; border-radius: 12px; max-width: 400px; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
        <h2>Edit Word</h2>
        
        <div style="margin: 20px 0;">
          <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">English Word:</label>
          <input type="text" id="editEnglish" value="${english}" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 1em; box-sizing: border-box;">
        </div>

        <div style="margin: 20px 0;">
          <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">Spanish Translation:</label>
          <input type="text" id="editSpanish" value="${spanish}" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 1em; box-sizing: border-box;">
        </div>

        <div style="display: flex; gap: 10px; margin-top: 25px;">
          <button onclick="document.getElementById('${dialogId}').remove();" style="flex: 1; padding: 10px; background: #ccc; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Cancel</button>
          <button onclick="saveEditWord('${category}', ${index}, '${dialogId}')" style="flex: 1; padding: 10px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Save</button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', html);
  document.getElementById('editEnglish').focus();
}

async function saveEditWord(category, index, dialogId) {
  const newEnglish = document.getElementById('editEnglish').value.trim();
  const newSpanish = document.getElementById('editSpanish').value.trim();

  if (!newEnglish || !newSpanish) {
    alert('Both fields are required');
    return;
  }

  try {
    const response = await fetch(`/api/word/${category}/${index}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ english: newEnglish, spanish: newSpanish })
    });

    if (response.ok) {
      document.getElementById(dialogId).remove();
      selectCategory(category);
    } else {
      const error = await response.json();
      alert(error.error);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error saving word');
  }
}

async function addWord(category) {
  const english = document.getElementById('englishInput').value.trim();
  const spanish = document.getElementById('spanishInput').value.trim();

  if (!english || !spanish) {
    alert('Please fill in both fields');
    return;
  }

  try {
    const response = await fetch('/api/word', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, english, spanish })
    });

    if (response.ok) {
      document.getElementById('englishInput').value = '';
      document.getElementById('spanishInput').value = '';
      selectCategory(category);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

async function deleteWord(category, index) {
  if (!confirm('Delete this word?')) return;

  try {
    await fetch(`/api/word/${category}/${index}`, { method: 'DELETE' });
    selectCategory(category);
  } catch (error) {
    console.error('Error:', error);
  }
}

async function downloadPDF() {
  try {
    const response = await fetch('/api/download-pdf');
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vocabulario_${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error descargando PDF:', error);
    alert('Error al descargar el PDF');
  }
}

async function downloadJSON() {
  try {
    const response = await fetch('/api/vocabulary');
    const data = await response.json();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vocabulario_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error descargando JSON:', error);
    alert('Error al descargar el JSON');
  }
}

async function importJSON(event) {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const text = await file.text();
    let data = JSON.parse(text);

    if (!data || typeof data !== 'object') {
      alert('Invalid JSON format');
      return;
    }

    // If it has structure { categories: {...} }, extract only categories
    if (data.categories && typeof data.categories === 'object') {
      data = data.categories;
    }

    // Count words to import
    let totalWords = 0;
    const categories = Object.keys(data);
    
    categories.forEach(cat => {
      const categoryData = data[cat];
      
      // Handle new structure: { words: [...], color: "...", order: ... }
      if (categoryData.words && Array.isArray(categoryData.words)) {
        totalWords += categoryData.words.length;
      }
      // Handle old structure: direct array
      else if (Array.isArray(categoryData)) {
        totalWords += categoryData.length;
      }
    });

    if (totalWords === 0) {
      alert('No words found in the JSON file');
      return;
    }

    showImportJSONDialog(data, totalWords);
  } catch (error) {
    console.error('Error:', error);
    alert('Error reading JSON file: ' + error.message);
  }
}

async function importPDF(event) {
  const file = event.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('/api/import-pdf', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();

    if (!response.ok) {
      alert('Error: ' + result.error);
      return;
    }

    if (result.categories) {
      showImportJSONDialog(result.categories, result.count);
    } else {
      alert(result.message);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error importing PDF: ' + error.message);
  }
}

let currentImportData = null;

function showImportJSONDialog(data, totalWords) {
  const categories = Object.keys(data);
  const dialogId = 'import-dialog-' + Date.now();
  
  // Save data in global variable
  currentImportData = data;
  
  let html = `
    <div id="${dialogId}" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;">
      <div style="background: white; padding: 30px; border-radius: 12px; max-width: 500px; max-height: 80vh; overflow-y: auto; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
        <h2>Import ${totalWords} words</h2>
        <p>The following categories will be imported:</p>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 15px 0; max-height: 200px; overflow-y: auto;">
          <ul style="margin: 10px 0; padding-left: 20px;">
  `;

  categories.forEach(cat => {
    const categoryData = data[cat];
    let count = 0;
    
    // Handle new structure
    if (categoryData.words && Array.isArray(categoryData.words)) {
      count = categoryData.words.length;
    }
    // Handle old structure
    else if (Array.isArray(categoryData)) {
      count = categoryData.length;
    }
    
    const color = categoryData.color || '#667eea';
    html += `<li><strong style="color: ${color};">●</strong> <strong>${cat}</strong> (${count} word${count !== 1 ? 's' : ''})</li>`;
  });

  html += `
          </ul>
        </div>

        <div style="display: flex; gap: 10px;">
          <button onclick="document.getElementById('${dialogId}').remove(); currentImportData = null;" style="flex: 1; padding: 10px; background: #ccc; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Cancel</button>
          <button onclick="confirmImportJSON()" style="flex: 1; padding: 10px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Import</button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', html);
}

async function confirmImportJSON() {
  if (!currentImportData) {
    alert('Error: No data to import');
    return;
  }

  const data = currentImportData;
  let imported = 0;
  let errors = 0;

  for (const [category, categoryData] of Object.entries(data)) {
    // Determine if old or new structure
    let words = [];
    let color = '#667eea';
    let order = Object.keys(data).indexOf(category);

    if (Array.isArray(categoryData)) {
      // Old structure: direct array
      words = categoryData;
    } else if (typeof categoryData === 'object' && categoryData !== null) {
      // New structure: object with words, color, order
      words = categoryData.words || [];
      color = categoryData.color || '#667eea';
      order = categoryData.order !== undefined ? categoryData.order : order;
    }

    if (words.length === 0) continue;

    // Create category if it doesn't exist
    try {
      await fetch('/api/category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: category, color })
      });
    } catch (e) {
      console.log('Category might already exist:', category);
    }

    // Import words
    for (const word of words) {
      try {
        if (!word.english || !word.spanish) {
          console.warn('Invalid word:', word);
          continue;
        }

        const response = await fetch('/api/word', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            category, 
            english: word.english.trim(), 
            spanish: word.spanish.trim()
          })
        });
        
        if (response.ok) {
          imported++;
        } else {
          const error = await response.json();
          console.error('Error in response:', error);
          errors++;
        }
      } catch (error) {
        console.error('Error importing word:', error);
        errors++;
      }
    }
  }

  // Remove dialog
  const dialog = document.querySelector('[id^="import-dialog-"]');
  if (dialog) dialog.remove();
  
  currentImportData = null;
  
  if (imported > 0) {
    alert(`✅ Successfully imported ${imported} words. ${errors > 0 ? `⚠️ ${errors} errors.` : ''}`);
    loadVocabulary();
  } else {
    alert(`❌ Could not import any words. ${errors} errors found.`);
  }
}
