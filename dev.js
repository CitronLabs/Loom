const { spawn, execSync } = require('child_process');
const browserSync = require('browser-sync').create();
const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, 'src');
const distDir = path.resolve(__dirname, 'dist');
const projectRoot = path.resolve(__dirname);

if (!fs.existsSync(distDir)) fs.mkdirSync(distDir);

/**
 * Find all page.typ files, ignoring directories starting with '_'
 */
function findPages(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            if (!file.startsWith('_') && file !== 'components') {
                results = results.concat(findPages(filePath));
            }
        } else if (file === 'page.typ') {
            results.push(filePath);
        }
    });
    return results;
}

/**
 * Advanced Multi-Stage WASM Compiler
 * Automatically generates command: [compiler] [sources] [flags] [output_flags] [dist/name_logic.js]
 */
/**
 * Advanced WASM Compiler with Environment Sanitization
 */
function compileWasm(dir) {
    const localConfigPath = path.join(dir, 'build.json');
    const globalConfigPath = path.join(srcDir, 'build.json');

    if (fs.existsSync(localConfigPath) && fs.existsSync(globalConfigPath)) {
        try {
            const globalConfig = JSON.parse(fs.readFileSync(globalConfigPath, 'utf8'));
            const localConfig = JSON.parse(fs.readFileSync(localConfigPath, 'utf8'));

            if (localConfig.wasm_sources && localConfig.wasm_sources.length > 0) {
                const folderName = path.basename(dir);
                const outputFileName = `${folderName}_logic.js`;
                const outputPath = path.join(distDir, outputFileName);

                const sources = localConfig.wasm_sources.map(s => `"${path.join(dir, s)}"`).join(' ');
                
                const finalCommand = [
                    globalConfig.compiler,
                    sources,
                    globalConfig.flags,
                    globalConfig.output_flags,
                    `"${outputPath}"`
                ].join(' ');

                console.log(`🦀 Building WASM for ${folderName}...`);

                // CLEAN ENVIRONMENT: Force Emscripten to ignore MSYS64/MinGW paths
                const cleanEnv = { ...process.env };
                delete cleanEnv.CPATH;
                delete cleanEnv.C_INCLUDE_PATH;
                delete cleanEnv.CPLUS_INCLUDE_PATH;
                delete cleanEnv.INCLUDE;

                execSync(finalCommand, { 
                    cwd: projectRoot, 
                    stdio: 'inherit', 
                    shell: true,
                    env: cleanEnv 
                });
                
                return outputFileName;
            }
        } catch (e) {
            console.error(`❌ WASM Build Error in ${dir}: ${e.message}`);
        }
    }
    return null;
}
/**
 * Orchestrates Page Compilation (JS + WASM + Typst)
 */
/*/**
 * Orchestrates Page Compilation (JS + WASM + Typst)
 */
function compilePage(pagePath) {
    const pageDir = path.dirname(pagePath);
    const folderName = path.basename(pageDir);
    const outputBase = folderName === 'home' ? 'index' : folderName;
    const outFile = path.join(distDir, `${outputBase}.html`);

    console.log(`🔨 Building Page: ${folderName}`);

    // 1. Compile WASM for the page itself
    compileWasm(pageDir);

    // 2. Handle Dependencies (WASM + Script Copying)
    const localConfigPath = path.join(pageDir, 'build.json');
    if (fs.existsSync(localConfigPath)) {
        try {
            const buildData = JSON.parse(fs.readFileSync(localConfigPath, 'utf8'));
            if (buildData.dependencies) {
                buildData.dependencies.forEach(dep => {
                    const depDir = path.join(srcDir, 'components', dep);
                    if (fs.existsSync(depDir)) {
                        // Build the WASM for the component
                        compileWasm(depDir);
                        
                        // COPY COMPONENT SCRIPT: e.g., components/button/script.js -> dist/button.js
                        const compScript = path.join(depDir, 'script.js');
                        if (fs.existsSync(compScript)) {
                            fs.copyFileSync(compScript, path.join(distDir, `${dep}.js`));
                            console.log(`📜 Component logic linked: ${dep}.js`);
                        }
                    }
                });
            }
        } catch (e) {
            console.error(`⚠️ JSON Error in ${folderName}: ${e.message}`);
        }
    }

    // 3. Copy Page-Specific Script (e.g., home/script.js -> dist/index.js)
    const scriptSrc = path.join(pageDir, 'script.js');
    if (fs.existsSync(scriptSrc)) {
        fs.copyFileSync(scriptSrc, path.join(distDir, `${outputBase}.js`));
    }

    // 4. Run Typst
    const { exec } = require('child_process');
    const typstCmd = `typst compile "${pagePath}" "${outFile}" --format html --root "${projectRoot}"`;

    exec(typstCmd, { env: { ...process.env, TYPST_FEATURES: 'html' } }, (error, stdout, stderr) => {
        if (error) {
            console.error(`❌ Typst Error: ${stderr}`);
            return;
        }
        console.log(`✅ Success: ${outputBase}.html`);
        browserSync.reload();
    });
}
 /*
 * Dependency Tracking for Watcher
 */
function getPagesDependingOn(componentName) {
    const pages = findPages(path.join(srcDir, 'pages'));
    return pages.filter(pagePath => {
        const configPath = path.join(path.dirname(pagePath), 'build.json');
        if (fs.existsSync(configPath)) {
            try {
                const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                return config.dependencies && config.dependencies.includes(componentName);
            } catch (e) { return false; }
        }
        return false;
    });
}

/**
 * Watcher Logic
 */
const timers = new Map();
const lastChange = new Map();

function debounce(id, callback, delay = 200) {
    if (timers.has(id)) clearTimeout(timers.get(id));
    timers.set(id, setTimeout(() => {
        callback();
        timers.delete(id);
    }, delay));
}

fs.watch(srcDir, { recursive: true }, (eventType, filename) => {
    if (!filename) return;
    const fullPath = path.join(srcDir, filename);

    if (!fs.existsSync(fullPath)) return;
    const stats = fs.statSync(fullPath);
    if (stats.isDirectory()) return;

    const mtime = stats.mtimeMs;
    if (lastChange.get(fullPath) === mtime) return;
    lastChange.set(fullPath, mtime);

    debounce(filename, () => {
        if (filename.includes('_global') || filename.includes('_utils') || filename.endsWith('.css') || filename === 'build.json') {
            console.log(`🌐 Global change in ${filename}. Rebuilding...`);
            findPages(path.join(srcDir, 'pages')).forEach(compilePage);
        } 
        else if (filename.startsWith('components')) {
            const componentName = filename.split(path.sep)[1];
            getPagesDependingOn(componentName).forEach(compilePage);
        } 
        else {
            // Find nearest page.typ
            let currentDir = path.dirname(fullPath);
            while (currentDir.includes('src')) {
                const pageFile = path.join(currentDir, 'page.typ');
                if (fs.existsSync(pageFile)) {
                    compilePage(pageFile);
                    break;
                }
                currentDir = path.dirname(currentDir);
            }
        }
    });
});

// Initial Build
findPages(path.join(srcDir, 'pages')).forEach(compilePage);

browserSync.init({
    server: { baseDir: distDir },
    port: 3000,
    open: true,
    notify: false
});
