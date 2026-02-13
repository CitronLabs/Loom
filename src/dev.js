const { spawn, execSync, exec } = require('child_process');
const browserSync = require('browser-sync').create();
const fs = require('fs');
const path = require('path');

// --- CLI Argument Parsing ---
const args = process.argv.slice(2);
const projectRoot = process.cwd();
const srcDir = (!args[0] || args[0].startsWith('-')) ? path.join(projectRoot, 'src') : path.resolve(args[0]);
const distDir = args.includes('-o') ? path.resolve(args[args.indexOf('-o') + 1]) : path.join(projectRoot, 'dist');

if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });

// --- Helper Functions ---

function getNamespace(depName) {
    return depName.replace(/\//g, '_').replace(/\\/g, '_');
}

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

function compileWasm(dir, namespace) {
    const localConfigPath = path.join(dir, 'build.json');
    const globalConfigPath = path.join(srcDir, 'build.json');

    if (fs.existsSync(localConfigPath) && fs.existsSync(globalConfigPath)) {
        try {
            const globalConfig = JSON.parse(fs.readFileSync(globalConfigPath, 'utf8'));
            const localConfig = JSON.parse(fs.readFileSync(localConfigPath, 'utf8'));

            if (localConfig.wasm_sources && localConfig.wasm_sources.length > 0) {
                const outBase = `${namespace}_logic`;
                const sources = localConfig.wasm_sources.map(s => `"${path.join(dir, s)}"`).join(' ');
                
                const cmd = [
                    globalConfig.compiler,
                    sources,
                    globalConfig.flags,
                    globalConfig.output_flags,
                    `"${path.join(distDir, outBase + '.js')}"`
                ].join(' ');

                console.log(`🦀 Compiling WASM: ${namespace}`);
                const cleanEnv = { ...process.env };
                delete cleanEnv.CPATH; delete cleanEnv.C_INCLUDE_PATH;
                delete cleanEnv.CPLUS_INCLUDE_PATH; delete cleanEnv.INCLUDE;

                execSync(cmd, { cwd: projectRoot, stdio: 'inherit', shell: true, env: cleanEnv });
            }
        } catch (e) { console.error(`❌ WASM Error in ${namespace}: ${e.message}`); }
    }
}

function compilePage(pagePath) {
    const pageDir = path.dirname(pagePath);
    const folderName = path.basename(pageDir);
    const outputBase = folderName === 'home' ? 'index' : folderName;
    const pageNamespace = folderName; // Use the folder name for namespacing page assets
    
    console.log(`\n🔨 Building Page: ${folderName}`);

    // 1. Copy Global Assets (everything except .typ)
    const globalPath = path.join(srcDir, 'global');
    if (fs.existsSync(globalPath)) {
        fs.readdirSync(globalPath).forEach(file => {
            if (!file.endsWith('.typ')) {
                fs.copyFileSync(path.join(globalPath, file), path.join(distDir, file));
                console.log(`  🌎 Linked Global Asset: ${file}`);
            }
        });
    }

    // 2. Copy Page-Specific Assets with Namespacing
    fs.readdirSync(pageDir).forEach(file => {
        const fullPath = path.join(pageDir, file);
        if (fs.statSync(fullPath).isFile() && !file.endsWith('.typ') && file !== 'build.json') {
            const destName = `${pageNamespace}_${file}`;
            fs.copyFileSync(fullPath, path.join(distDir, destName));
            console.log(`  📄 Linked Page Asset: ${destName}`);
        }
    });

    let imports = `import { loadWasmModule } from './wasm_manager.js';\n`;
    let setupLogic = `document.addEventListener('DOMContentLoaded', async () => {\n`;

    const configPath = path.join(pageDir, 'build.json');
    if (fs.existsSync(configPath)) {
        const buildData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        
        (buildData.dependencies || []).forEach(dep => {
            const namespace = getNamespace(dep);
            const depDir = path.join(srcDir, 'components', dep);
            if (!fs.existsSync(depDir)) return;

            compileWasm(depDir, namespace);
            
            // 3. Component Asset Linking
            const depFiles = fs.readdirSync(depDir);
            depFiles.forEach(file => {
                const fullPath = path.join(depDir, file);
                if (file.endsWith('.css')) {
                    const destName = `${namespace}.css`;
                    fs.copyFileSync(fullPath, path.join(distDir, destName));
                    console.log(`  🎨 Linked Component CSS: ${destName}`);
                }
                if (file === 'script.js') {
                    fs.copyFileSync(fullPath, path.join(distDir, `${namespace}.js`));
                    console.log(`  📜 Linked Component JS: ${namespace}.js`);
                }
            });

            const depConfigPath = path.join(depDir, 'build.json');
            if (fs.existsSync(depConfigPath)) {
                const depConfig = JSON.parse(fs.readFileSync(depConfigPath, 'utf8'));
		if (depConfig.controllers) {
		    depConfig.controllers.forEach(ctrl => {
		        imports += `import { ${ctrl.class} } from './${namespace}.js';\n`;
		        setupLogic += `  try {\n`;
		        
		        // ONLY add the WASM loader if there are actually WASM sources
		        if (depConfig.wasm_sources && depConfig.wasm_sources.length > 0) {
		            setupLogic += `    const ${namespace}_wasm = await loadWasmModule('${namespace}_logic');\n`;
		            setupLogic += `    document.querySelectorAll('${ctrl.selector}').forEach(el => {\n`;
		            setupLogic += `      const inst = new ${ctrl.class}(el, ${namespace}_wasm);\n`;
		        } else {
		            // Pure JS Controller
		            setupLogic += `    document.querySelectorAll('${ctrl.selector}').forEach(el => {\n`;
		            setupLogic += `      const inst = new ${ctrl.class}(el);\n`;
		        }
		
		        Object.entries(ctrl.events).forEach(([evt, func]) => {
		            setupLogic += `      el.addEventListener('${evt}', (e) => inst.${func}(e));\n`;
		        });
		        setupLogic += `    });\n  } catch(e) { console.warn('Controller load failed for ${namespace}', e); }\n`;
		    });
		}
            }
        });
    }

    setupLogic += `});`;
    fs.writeFileSync(path.join(distDir, `${outputBase}_bootstrap.js`), imports + setupLogic);
    
    const managerPath = path.join(srcDir, '_utils', 'wasm_manager.js');
    if (fs.existsSync(managerPath)) fs.copyFileSync(managerPath, path.join(distDir, 'wasm_manager.js'));

    const outFile = path.join(distDir, `${outputBase}.html`);
    const typstCmd = `typst compile "${pagePath}" "${outFile}" --format html --root "${srcDir}"`;
    
    exec(typstCmd, { env: { ...process.env, TYPST_FEATURES: 'html' } }, (error, stdout, stderr) => {
        if (error) console.error(`❌ Typst Error: ${stderr}`);
        else {
            console.log(`✅ Page Ready: ${outputBase}.html`);
            browserSync.reload();
        }
    });
}// --- Watcher ---
fs.watch(srcDir, { recursive: true }, (eventType, filename) => {
    if (!filename || filename.includes('node_modules')) return;
    debounce(filename, () => {
        console.log(`🔄 Change detected: ${filename}`);
        findPages(path.join(srcDir, 'pages')).forEach(compilePage);
    });
});

const timers = new Map();
function debounce(id, callback) {
    if (timers.has(id)) clearTimeout(timers.get(id));
    timers.set(id, setTimeout(() => { callback(); timers.delete(id); }, 200));
}

// --- Init ---
console.log('🚀 Starting project build...');
findPages(path.join(srcDir, 'pages')).forEach(compilePage);

browserSync.init({ server: { baseDir: distDir }, port: 3000, open: true, notify: false });
