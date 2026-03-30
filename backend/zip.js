const fs = require('fs');
const archiver = require('archiver');

const output = fs.createWriteStream(__dirname + '/backend-deploy-linux.zip');
const archive = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level.
});

output.on('close', function() {
    console.log(archive.pointer() + ' total bytes');
    console.log('Archiver has been finalized and the output file descriptor has closed.');
    console.log('SUCCESS! Please upload "backend-deploy-linux.zip" to Elastic Beanstalk.');
});

archive.on('error', function(err) {
    throw err;
});

archive.pipe(output);

// Glob pattern to include everything EXCEPT node_modules and .env
archive.glob('**/*', {
    cwd: __dirname,
    ignore: ['node_modules/**', '.env', '.git/**', '*.zip', 'zip.js']
});

archive.finalize();
