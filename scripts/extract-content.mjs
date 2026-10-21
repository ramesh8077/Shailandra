// One-time source migration. Do not rerun on already converted components.
import fs from 'node:fs';
import path from 'node:path';
import { parse } from '@babel/parser';
import traverseModule from '@babel/traverse';
import generateModule from '@babel/generator';
import * as t from '@babel/types';
const traverse = traverseModule.default;
const generate = generateModule.default;
const manifest = { sections: {}, assets: {}, journey: [] };
const dirs = ['src/components','src/pages'];
for (const dir of dirs) for (const name of fs.readdirSync(dir).filter(n => n.endsWith('.jsx'))) {
  if (['Photo.jsx','PageHero.jsx','Blogs.jsx'].includes(name)) continue;
  const filename = `${dir}/${name}`;
  const source = fs.readFileSync(filename,'utf8');
  if (source.includes('useSection')) throw new Error('Already migrated');
  const ast = parse(source,{ sourceType:'module', plugins:['jsx'] });
  const key = name.slice(0,-4);
  const fields = {};
  let count = 0;
  function field(value, label, type='text') {
    const id = `f${++count}`;
    fields[id] = { label, type, value };
    return t.callExpression(t.identifier('cms'),[t.stringLiteral(id)]);
  }
  const moved = [];
  const images = new Map();
  ast.program.body = ast.program.body.filter(node => {
    if (t.isImportDeclaration(node) && /\.(png|jpe?g|webp)$/i.test(node.source.value)) {
      const original = path.resolve(dir,node.source.value).replaceAll('\\','/');
      if (!fs.existsSync(original)) throw new Error(`Missing asset ${original}`);
      const relative = path.relative(process.cwd(),original).replaceAll('\\','/');
      manifest.assets[relative] = relative;
      images.set(node.specifiers[0].local.name, relative);
      return false;
    }
    if (t.isVariableDeclaration(node)) { moved.push(node); return false; }
    return true;
  });
  const main = ast.program.body.find(n => t.isExportDefaultDeclaration(n)).declaration;
  // Keep icon/component references in source; only editable leaf values cross the API.
  for (const [name, asset] of images) moved.unshift(t.variableDeclaration('const',[t.variableDeclarator(t.identifier(name),field(asset,`Image: ${name}`,'image'))]));
  main.body.body.unshift(...moved);
  traverse(ast, {
    VariableDeclarator(p) {
      if (p.node.id.name === 'timeline' && key === 'JourneyPage') {
        manifest.journey = p.node.init.elements.map(n => Object.fromEntries(n.properties.map(x => [x.key.name,x.value.value])));
        p.node.init = t.callExpression(t.identifier('useJourney'),[]); p.skip(); return;
      }
      const init = p.get('init');
      if (!init.isArrayExpression() && !init.isObjectExpression()) return;
      const variable = p.node.id.name || 'Content';
      init.traverse({ StringLiteral(s) {
        if (s.parentPath.isObjectProperty() && s.key === 'key') return;
        if (s.parentPath.isCallExpression()) return;
        const prop = s.parentPath.isObjectProperty() ? s.parent.key.name : '';
        if (['className','color','bg','icon','position'].includes(prop)) return;
        if (!s.node.value.trim()) return;
        const type = /^(href|path|url|sourceUrl)$/.test(prop) ? 'link' : prop === 'videoId' ? 'videoId' : 'text';
        s.replaceWith(field(s.node.value,`${variable}${prop ? ` · ${prop}` : ''}: ${s.node.value.slice(0,65)}`,type)); s.skip();
      }});
    },
    JSXText(p) {
      const value = p.node.value.replace(/\s+/g,' ').trim();
      if (!value || !/[\p{L}\p{N}]/u.test(value)) return;
      // Content in helper components needs its own hook scope.
      const fn = p.getFunctionParent();
      if (fn?.node !== main) return;
      p.replaceWith(t.jsxExpressionContainer(field(value,`${p.parent.openingElement?.name?.name || 'Text'}: ${value.slice(0,75)}`)));
    },
    JSXAttribute(p) {
      if (!['title','alt','placeholder','href','to'].includes(p.node.name.name) || !t.isStringLiteral(p.node.value) || !p.node.value.value) return;
      if (p.getFunctionParent()?.node !== main) return;
      const attr = p.node.name.name;
      p.node.value = t.jsxExpressionContainer(field(p.node.value.value,`${attr}: ${p.node.value.value.slice(0,65)}`,['href','to'].includes(attr)?'link':'text'));
    }
  });
  main.body.body.unshift(t.variableDeclaration('const',[t.variableDeclarator(t.identifier('cms'),t.callExpression(t.identifier('useSection'),[t.stringLiteral(key)]))]));
  ast.program.body.unshift(t.importDeclaration([t.importSpecifier(t.identifier('useSection'),t.identifier('useSection')), ...(key==='JourneyPage'?[t.importSpecifier(t.identifier('useJourney'),t.identifier('useJourney'))]:[])],t.stringLiteral('../cms/PublicCMS')));
  manifest.sections[key] = { kind: ['Navbar','Footer'].includes(key)?'settings':'page', source: filename, fields };
  fs.writeFileSync(filename,generate(ast,{retainLines:false},source).code+'\n');
}
fs.mkdirSync('server',{recursive:true});
fs.writeFileSync('server/content-manifest.json',JSON.stringify(manifest,null,2)+'\n');
console.log(`Extracted ${Object.keys(manifest.sections).length} sections and ${Object.keys(manifest.assets).length} assets`);
