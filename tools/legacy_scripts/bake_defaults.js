const fs = require('fs');

let pluginsText = fs.readFileSync('js/plugins.js', 'utf8');
let pluginsJson = pluginsText.replace('var $plugins =', '').trim();
if (pluginsJson.endsWith(';')) pluginsJson = pluginsJson.slice(0, -1);
let plugins = JSON.parse(pluginsJson);

function bakePlugin(pluginName, fileName) {
    let pluginObj = plugins.find(p => p.name === pluginName);
    if (!pluginObj) {
        console.log('Plugin ' + pluginName + ' not found in plugins.js');
        return;
    }
    
    let params = pluginObj.parameters;
    let fileContent = fs.readFileSync(fileName, 'utf8');
    
    let modified = false;
    for (let key in params) {
        let val = params[key];
        if (val === undefined || val === '') continue;
        
        let safeKey = key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        
        let regex1 = new RegExp(`(parameters\\['${safeKey}'\\]\\s*\\|\\|\\s*)([^\\);,\\n\\}]+)`, 'g');
        if (regex1.test(fileContent)) {
            fileContent = fileContent.replace(regex1, (match, p1, p2) => {
                let p2Trim = p2.trim();
                let quote = p2Trim.startsWith('"') ? '"' : (p2Trim.startsWith("'") ? "'" : "");
                let newVal = val;
                
                if (quote) {
                    newVal = quote + val + quote;
                } else if (isNaN(Number(p2Trim)) && p2Trim !== 'true' && p2Trim !== 'false') {
                    // Original wasn't quoted but isn't a number/boolean (maybe a variable like Graphics.boxWidth)
                    // If we override it with a fixed number, just put the number.
                    if (isNaN(Number(val))) newVal = `'${val}'`;
                } else if (!isNaN(Number(p2Trim))) {
                    newVal = Number(val);
                } else if (p2Trim === 'true' || p2Trim === 'false') {
                    newVal = val.toLowerCase() === 'true' ? 'true' : 'false';
                }
                
                return p1 + newVal;
            });
            modified = true;
        }
        
        let regex2 = new RegExp(`(parameters\\["${safeKey}"\\]\\s*\\|\\|\\s*)([^\\);,\\n\\}]+)`, 'g');
        if (regex2.test(fileContent)) {
            fileContent = fileContent.replace(regex2, (match, p1, p2) => {
                let p2Trim = p2.trim();
                let quote = p2Trim.startsWith('"') ? '"' : (p2Trim.startsWith("'") ? "'" : "");
                let newVal = val;
                
                if (quote) {
                    newVal = quote + val + quote;
                } else if (isNaN(Number(p2Trim)) && p2Trim !== 'true' && p2Trim !== 'false') {
                    if (isNaN(Number(val))) newVal = `'${val}'`;
                } else if (!isNaN(Number(p2Trim))) {
                    newVal = Number(val);
                } else if (p2Trim === 'true' || p2Trim === 'false') {
                    newVal = val.toLowerCase() === 'true' ? 'true' : 'false';
                }
                
                return p1 + newVal;
            });
            modified = true;
        }
    }
    
    if (modified) {
        fs.writeFileSync(fileName, fileContent);
        console.log('Baked ' + pluginName + ' successfully!');
    } else {
        console.log('No modifications for ' + pluginName);
    }
}

bakePlugin('MOG_SceneMenu', 'js/plugins/MOG_SceneMenu.js');
bakePlugin('Custom_SaveStatus_MOG', 'js/plugins/Custom_SaveStatus_MOG.js');
