const fs = require('fs');
const path = require('path');

function checkFile(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      checkFile(fullPath);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const importRegex = /import\s+.*?from\s+['"](\..*?)['"]|import\s+['"](\..*?)['"]/g;
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1] || match[2];
        const currentDir = path.dirname(fullPath);
        const resolvedPath = path.resolve(currentDir, importPath);
        const resolvedDir = path.dirname(resolvedPath);
        const baseName = path.basename(resolvedPath);
        try {
          const dirContents = fs.readdirSync(resolvedDir);
          let found = false;
          for (const item of dirContents) {
            if (item === baseName || item === baseName + '.js' || item === baseName + '.jsx' || item === baseName + '.css') {
              found = true;
              break;
            }
          }
          if (!found) {
            console.log(`MISMATCH in ${fullPath}: imports '${importPath}' -> resolved to ${baseName} but exact case not found in ${resolvedDir}.`);
          }
        } catch(e) {
          console.log(`ERROR reading dir ${resolvedDir} for ${importPath} in ${fullPath}`);
        }
      }
    }
  }
}

checkFile('./my-store/src');
checkFile('./admin-dashboard/src');
