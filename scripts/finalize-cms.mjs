import fs from 'node:fs';
import {parse} from '@babel/parser';
import generateModule from '@babel/generator';
import * as t from '@babel/types';
const generate=generateModule.default;
const manifest=JSON.parse(fs.readFileSync('server/content-manifest.json','utf8'));
for(const [key,section] of Object.entries(manifest.sections)){
 const ast=parse(fs.readFileSync(section.source,'utf8'),{sourceType:'module',plugins:['jsx']});
 const fn=ast.program.body.find(n=>t.isExportDefaultDeclaration(n)).declaration;
 if(!fs.readFileSync(section.source,'utf8').includes('SectionBoundary')){
  const ret=fn.body.body.find(n=>t.isReturnStatement(n));
  const old=ret.argument;
  ret.argument=t.jsxElement(t.jsxOpeningElement(t.jsxIdentifier('SectionBoundary'),[t.jsxAttribute(t.jsxIdentifier('name'),t.stringLiteral(key))]),t.jsxClosingElement(t.jsxIdentifier('SectionBoundary')),[old]);
  ast.program.body.unshift(t.importDeclaration([t.importSpecifier(t.identifier('SectionBoundary'),t.identifier('SectionBoundary'))],t.stringLiteral('../cms/PublicCMS')));
 }
 fs.writeFileSync(section.source,generate(ast).code+'\n');
}
// Keep the CMS implementation readable without adding a formatter/runtime dependency.
for(const dir of ['src/cms','server/src','server/test']) for(const file of fs.readdirSync(dir).filter(n=>/\.(jsx|js)$/.test(n))){
 const target=`${dir}/${file}`,ast=parse(fs.readFileSync(target,'utf8'),{sourceType:'module',plugins:['jsx']});
 fs.writeFileSync(target,generate(ast).code+'\n');
}
