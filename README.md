# Vocabulario Inglés - Español

Aplicación web intuitiva para gestionar vocabulario en inglés con traducciones al español, organizado por categorías, con descarga en PDF.

## Características

✅ **Gestión de Categorías**: Crea y organiza palabras por temas  
✅ **Añadir Palabras**: Agrega palabras en inglés con sus traducciones  
✅ **Descargar PDF**: Exporta todo el vocabulario en un PDF bien formateado  
✅ **Interfaz Intuitiva**: Diseño moderno y fácil de usar  
✅ **Almacenamiento Local**: Los datos se guardan en JSON

## Instalación

1. **Instalar dependencias**:
```bash
npm install
```

2. **Iniciar el servidor**:
```bash
npm start
```

3. **Abrir en el navegador**:
```
http://localhost:3000
```

## Uso

### Crear una Categoría
1. En el panel izquierdo, escribe el nombre de la categoría (ej: "Animales", "Comida")
2. Haz clic en "+ Categoría"

### Añadir Palabras
1. Selecciona una categoría de la lista
2. Escribe la palabra en inglés
3. Escribe la traducción en español
4. Haz clic en "+ Añadir" o presiona Enter

### Descargar PDF
1. Haz clic en "📥 Descargar PDF"
2. Se descargará un archivo con todas las palabras organizadas por categorías

### Eliminar
- **Palabra**: Haz clic en "Eliminar" en la tarjeta de la palabra
- **Categoría**: Haz clic en "✕" junto al nombre de la categoría

## Estructura del Proyecto

```
.
├── server.js              # Servidor Express
├── package.json           # Dependencias
├── vocabulary.json        # Base de datos (se crea automáticamente)
└── public/
    ├── index.html         # Interfaz HTML
    ├── styles.css         # Estilos
    └── app.js             # Lógica del cliente
```

## Tecnologías

- **Backend**: Node.js + Express
- **Frontend**: HTML5 + CSS3 + JavaScript
- **PDF**: pdfkit
- **Almacenamiento**: JSON

## Notas

- Los datos se guardan automáticamente en `vocabulary.json`
- La aplicación funciona sin necesidad de base de datos
- Responsive design para dispositivos móviles
