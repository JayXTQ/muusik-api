import fs from 'fs';
import path from 'path';

const typesDir = path.join(process.cwd(), 'src', 'types');
const indexFile = path.join(typesDir, 'index.ts');

let exportContent = '';

fs.readdirSync(typesDir).forEach((file) => {
    const filePath = path.join(typesDir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
        fs.readdirSync(filePath).forEach((subFile) => {
            if (subFile.endsWith('.ts') && subFile !== 'index.ts') {
                const typeName = subFile.replace('.ts', '');
                exportContent += `export * from './${file}/${typeName}';\n`;
            }
        });
    } else if (file.endsWith('.ts') && file !== 'index.ts') {
        const typeName = file.replace('.ts', '');
        exportContent += `export * from './${typeName}';\n`;
    }
});

fs.writeFileSync(indexFile, exportContent);
