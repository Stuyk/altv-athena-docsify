const glob = require("glob")
const fs = require('fs')

const categoryOrder = [
    'general',
    'install',
    'info',
    'plugins',
    'controllers',
    'menus',
    'player',
    'systems',
    'scripting',
    'chat',
    'webviews',
    'misc',
]

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// options is optional
glob("**/*.md", {}, function (er, files) {
    // Get files we give a shit about
    const trueFiles = files.filter(filePath => {
        if (filePath.includes('node_modules')) {
            return false;
        }

        if (filePath.includes('_sidebar.md')) {
            return false;
        }

        if (filePath.includes('_glossary.md')) {
            return false;
        }

        if (filePath.includes('_readme.md')) {
            return false;
        }

        if (filePath.includes('README.md')) {
            return false;
        }

        return true;
    });

    // Filter Files & Header Data
    const headersList = [];
    for (let i = 0; i < trueFiles.length; i++) {
        const file = fs.readFileSync(trueFiles[i]).toString();
        const splitter = trueFiles[i].includes('/') ? '/' : '\\';
        const folders = trueFiles[i].split(splitter)
        const lastFolder = folders[folders.length - 2];
        const headers = file.match(/^#[^#]+?\n/gm);
        headersList.push({
            header: headers[0].replace('# ', '').replace('\r\n', '').replace('\n', ''),
            file: trueFiles[i],
            category: lastFolder,
        });
    }

    // Sort by Category
    let categoryData = {};
    for (let i = 0; i < categoryOrder.length; i++) {
        const fileList = headersList.filter(x => x.category === categoryOrder[i]);
        categoryData[categoryOrder[i]] = fileList;
    }

    // Delete if exists
    if (fs.existsSync('_sidebar.md'))
        fs.unlinkSync('_sidebar.md');

    // Write to File
    Object.keys(categoryData).forEach(key => {
        const categoryName = capitalizeFirstLetter(key);

        fs.appendFileSync('_sidebar.md', `\r\n${categoryName}`)

        for (let i = 0; i < categoryData[key].length; i++) {
            const fileData = categoryData[key][i];
            fs.appendFileSync('_sidebar.md', `\r\n  * [${fileData.header}](${fileData.file})`);
            if (categoryData[key].length - 1 === i) {
                fs.appendFileSync('_sidebar.md', `\r\n`);
            }
        }
    });
})