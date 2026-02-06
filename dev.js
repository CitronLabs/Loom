const { spawn } = require('child_process');
const browserSync = require('browser-sync').create();
const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, 'src');
const distDir = path.resolve(__dirname, 'dist');
const projectRoot = path.resolve(__dirname);

if (!fs.existsSync(distDir)) fs.mkdirSync(distDir);

function findPages(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            if (!file.startsWith('_') && file !== 'components') {
                results = results.concat(findPages(filePath));
            }
        } else if (file === 'page.typ') {
            results.push(filePath);
        }
    });
    return results;
}

function compilePage(pagePath) {
    const pageDir = path.dirname(pagePath);
    const folderName = path.basename(pageDir);
    const outputName = folderName === 'home' ? 'index.html' : `${folderName}.html`;
    const outFile = path.join(distDir, outputName);

    console.log(`🔨 Building: ${folderName} -> ${outputName}`);
    
    const typst = spawn('typst', [
        'compile', pagePath, outFile, 
        '--format', 'html', 
        '--root', projectRoot
    ], {
        env: { ...process.env, TYPST_FEATURES: 'html' },
        shell: true 
    });

    typst.stderr.on('data', (data) => {
        const msg = data.toString();
        if (!msg.includes('warning: html export') && !msg.includes('hint:')) {
            console.error(`Typst Error: ${msg}`);
        }
    });

    typst.on('close', (code) => {
        if (code === 0) {
            console.log(`✅ Success: ${outputName}`);
            browserSync.reload();
        }
    });
}

function getPagesDependingOn(componentName) {
    const pages = findPages(path.join(srcDir, 'pages'));
    return pages.filter(pagePath => {
        const importPath = path.join(path.dirname(pagePath), 'imports.json');
        if (fs.existsSync(importPath)) {
            try {
                const config = JSON.parse(fs.readFileSync(importPath, 'utf8'));
                return config.dependencies && config.dependencies.includes(componentName);
            } catch (e) { return false; }
        }
        return false;
    });
}

// Watcher
// ... top of your dev.js ...
const timers = new Map();

function debounce(id, callback, delay = 100) {
    if (timers.has(id)) clearTimeout(timers.get(id));
    timers.set(id, setTimeout(() => {
        callback();
        timers.delete(id);
    }, delay));
}

// WATCHER
const lastChange = new Map();

fs.watch(srcDir, { recursive: true }, (eventType, filename) => {
    if (!filename) return;

    const fullPath = path.join(srcDir, filename);

    // Neovim fix: Only proceed if the file actually exists (ignores temp swap files)
    if (!fs.existsSync(fullPath)) return;

    // Check actual file stats to see if it's a real modification
    const stats = fs.statSync(fullPath);
    const mtime = stats.mtimeMs;

    // If the timestamp is the same as the last time we saw this file, skip it
    if (lastChange.get(fullPath) === mtime) return;
    lastChange.set(fullPath, mtime);

    debounce(filename, () => {
        // 1. Global Change
        if (filename.includes('_global') || filename.includes('_utils') || filename.endsWith('.css')) {
            console.log(`🌐 Global update [${filename}]: Rebuilding all...`);
            findPages(path.join(srcDir, 'pages')).forEach(compilePage);
        } 
        // 2. Component Change
        else if (filename.startsWith('components')) {
            const componentName = filename.split(path.sep)[1];
            console.log(`🧩 Component '${componentName}' changed.`);
            getPagesDependingOn(componentName).forEach(compilePage);
        } 
        // 3. Page Change
        else if (filename.endsWith('page.typ')) {
            compilePage(fullPath);
        }
    }, 200); // Increased slightly to 200ms for Neovim's swap logic
})

const allPages = findPages(path.join(srcDir, 'pages'));
allPages.forEach(compilePage);

browserSync.init({
    server: { baseDir: distDir },
    port: 3000,
    open: true
});
