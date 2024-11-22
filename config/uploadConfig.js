const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Configuración del directorio de subidas
const uploadsPath = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
}

// Configuración de almacenamiento con multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsPath);
    },
    filename: function (req, file, cb) {
        const filename = `${Date.now()}${path.extname(file.originalname)}`;
        cb(null, filename);
    }
});

const upload = multer({ storage: storage });

module.exports = upload;
