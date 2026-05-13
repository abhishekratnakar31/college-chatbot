
import fs from 'fs';

const content = fs.readFileSync('web/app/page.tsx', 'utf8');

let openDivs = 0;
let closeDivs = 0;

const openRegex = /<div\b/g;
const closeRegex = /<\/div>/g;

while (openRegex.exec(content)) openDivs++;
while (closeRegex.exec(content)) closeDivs++;

console.log(`Open divs: ${openDivs}`);
console.log(`Close divs: ${closeDivs}`);

let openSections = 0;
let closeSections = 0;
while (/<section\b/g.exec(content)) openSections++;
while (/<\/section>/g.exec(content)) closeSections++;
console.log(`Open sections: ${openSections}`);
console.log(`Close sections: ${closeSections}`);

let openReveals = 0;
let closeReveals = 0;
while (/<Reveal\b/g.exec(content)) openReveals++;
while (/<\/Reveal>/g.exec(content)) closeReveals++;
console.log(`Open Reveals: ${openReveals}`);
console.log(`Close Reveals: ${closeReveals}`);
