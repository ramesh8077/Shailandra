import fs from 'node:fs';
import {parse} from '@babel/parser';
import traverseModule from '@babel/traverse';
import generateModule from '@babel/generator';
import * as t from '@babel/types';
const traverse=traverseModule.default,generate=generateModule.default;
const configs={
  'Thoughtleadershippage.jsx':{latestArticles:['Latest articles','article'],relatedArticles:['Related reading','article']},
  'EducationPage.jsx':{relatedReading:['Related reading','article','Education']},
  'Updevelopmentpage.jsx':{relatedReading:['Related reading','article','UP Development']},
  'vision2047.jsx':{relatedReading:['Related reading','article','Vision 2047']},
  'Nationbuildingpage.jsx':{roomPosts:['In the room','news'],charchaVideos:['Chai Pe Charcha','video'],relatedReading:['Related reading','article','Nation Building']},
  'ChaiPaiCharchaPage.jsx':{episodes:['Season 1 episodes','video','Chai Pe Charcha']},
};
for(const [file,arrays] of Object.entries(configs)){
 const target=`src/pages/${file}`,ast=parse(fs.readFileSync(target,'utf8'),{sourceType:'module',plugins:['jsx']});
 traverse(ast,{CallExpression(p){const c=p.node.callee;if(!t.isMemberExpression(c)||c.property.name!=='map'||!arrays[c.object.name])return;const definition=arrays[c.object.name];const section=p.findParent(n=>n.isJSXElement()&&n.node.openingElement.name.name==='section');if(!section)return;const attrs=['title','type','category'].flatMap((key,i)=>definition[i]?[t.jsxAttribute(t.jsxIdentifier(key),t.stringLiteral(definition[i]))]:[]);section.replaceWith(t.jsxElement(t.jsxOpeningElement(t.jsxIdentifier('PostList'),attrs,true),null,[],true));}});
 // Remove data declarations and state that belonged only to replaced placeholder sections.
 for(let i=0;i<4;i++){traverse(ast,{Program(p){p.scope.crawl();},VariableDeclarator(p){const names=t.getBindingIdentifiers(p.node.id);if(Object.keys(names).length&&Object.keys(names).every(n=>!p.scope.getBinding(n)?.referenced))p.remove();}});}
 ast.program.body.unshift(t.importDeclaration([t.importSpecifier(t.identifier('PostList'),t.identifier('PostList'))],t.stringLiteral('../cms/PublicCMS')));
 fs.writeFileSync(target,generate(ast).code+'\n');
}
// Drop fields removed with placeholder listings: admin forms contain only live editable fields.
const manifest=JSON.parse(fs.readFileSync('server/content-manifest.json','utf8'));
for(const section of Object.values(manifest.sections)){
 const source=fs.readFileSync(section.source,'utf8');
 const used=new Set([...source.matchAll(/cms\("(f\d+)"\)/g)].map(m=>m[1]));
 section.fields=Object.fromEntries(Object.entries(section.fields).filter(([k])=>used.has(k)));
}
fs.writeFileSync('server/content-manifest.json',JSON.stringify(manifest,null,2)+'\n');
