const config = require('./backend/config/config');
console.log('Max File Size:', config.maxFileSize);
console.log('Max File Size (MB):', config.maxFileSize / 1024 / 1024);
