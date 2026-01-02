# English - Spanish Vocabulary Manager

A modern, intuitive web application to manage, organize, and export English-Spanish vocabulary with beautiful PDF generation.

## ✨ Features

- **📚 Category Management** - Create, edit, and organize vocabulary by categories
- **🎨 Color Coding** - Assign custom colors to each category for visual organization
- **📝 Word Management** - Add, edit, and delete words with English and Spanish translations
- **🔄 Drag & Drop** - Reorder categories by dragging
- **📥 Download PDF** - Generate professional, visually appealing PDFs with your vocabulary
- **💾 Export/Import JSON** - Backup and restore your vocabulary data
- **🎯 Responsive Design** - Works on desktop and mobile devices
- **🌐 Fully in English** - Complete English interface

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/vocabulary-manager.git
cd vocabulary-manager
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

## 📖 Usage

### Creating a Category
1. Enter a category name (e.g., "Animals", "Food")
2. Select a color for visual identification
3. Click "Create"

### Adding Words
1. Select a category
2. Enter the English word
3. Enter the Spanish translation
4. Click "+ Add" or press Enter

### Editing
- **Edit Category**: Click the ✎ button next to a category name
- **Edit Word**: Click on any word card to open the edit dialog

### Organizing
- **Reorder Categories**: Drag and drop categories to change their order
- **Change Category Color**: Click the color picker in the category header

### Exporting
- **Download PDF**: Creates a professional PDF with all vocabulary organized by category
- **Download JSON**: Exports your data as JSON for backup

### Importing
- **Import JSON**: Upload a previously exported JSON file to restore your vocabulary

## 📁 Project Structure

```
vocabulary-manager/
├── server.js              # Express server and API routes
├── package.json           # Project dependencies
├── vocabulary.json        # Data storage (auto-generated)
├── README.md             # This file
└── public/
    ├── index.html        # Main HTML interface
    ├── app.js            # Frontend JavaScript
    └── styles.css        # Styling
```

## 🔧 API Endpoints

### Categories
- `GET /api/vocabulary` - Get all categories and words
- `POST /api/category` - Create a new category
- `PUT /api/category/:name` - Update category name
- `PUT /api/category/:name` - Update category color
- `DELETE /api/category/:name` - Delete a category
- `POST /api/reorder-categories` - Reorder categories

### Words
- `POST /api/word` - Add a word to a category
- `PUT /api/word/:category/:index` - Edit a word
- `DELETE /api/word/:category/:index` - Delete a word

### Export
- `GET /api/download-pdf` - Download vocabulary as PDF
- `POST /api/import-pdf` - Import from PDF (placeholder)

## 🎨 PDF Features

The generated PDF includes:
- **Category Headers** - With custom colors for each category
- **Organized Layout** - Words displayed in a clean, readable format
- **Visual Hierarchy** - English words in bold with category color, Spanish translations in regular text
- **Compact Design** - Maximizes words per page for efficiency
- **Professional Appearance** - Perfect for printing or sharing

## 💾 Data Format

### JSON Structure
```json
{
  "categories": {
    "Unit 1": {
      "words": [
        {
          "english": "such as",
          "spanish": "por ejemplo"
        }
      ],
      "color": "#667eea",
      "order": 0
    }
  }
}
```

## 🛠️ Technologies Used

- **Backend**: Node.js, Express.js
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **PDF Generation**: PDFKit
- **File Upload**: Multer
- **Data Storage**: JSON

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Feel free to:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📧 Support

For issues, questions, or suggestions, please open an issue on GitHub.

## 🎯 Future Enhancements

- [ ] User authentication
- [ ] Cloud synchronization
- [ ] Spaced repetition algorithm
- [ ] Audio pronunciation
- [ ] Quiz/test mode
- [ ] Multiple language pairs
- [ ] Dark mode
- [ ] Mobile app

---

**Happy Learning! 📚**
