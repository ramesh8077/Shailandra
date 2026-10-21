import fs from 'node:fs';
const path='src/cms/Admin.jsx';
let source=fs.readFileSync(path,'utf8');
source=source.replace('item.draft.title || item.key','item.draft.title || sectionLabel(item.key)').replace("draft.title || doc.key || 'Create content'","draft.title || sectionLabel(doc.key) || 'Create content'").replace('{u.key}</Link>','{sectionLabel(u.key)}</Link>');
source=source.replace('sectionRoute(doc.key)','sectionRoute(doc.key,doc.kind)').replace('function sectionRoute(key) {',"function sectionRoute(key,kind) {\n  if(kind==='journey')return '/journey';");
source+=`\nfunction sectionLabel(key){return ${JSON.stringify({Hero:'Home · Hero',Journey:'Home · Introduction cards',Stats:'Home · Statistics',Features:'Home · Features',YouthConnect:'Home · Youth questions',ContactInsights:'Home · Contact and videos',Navbar:'Navigation',Footer:'Footer',JourneyPage:'Journey · Page content',EducationPage:'Education',Sewapage:'Sewa',Sportspage:'Sports',vision2047:'Vision 2047',Thoughtleadershippage:'Thought leadership',Updevelopmentpage:'UP development',ChaiPaiCharchaPage:'Chai Pe Charcha',ConnectPage:'Connect',Nationbuildingpage:'Nation building',Mediapage:'Media'})}[key] || key;}\n`;
fs.writeFileSync(path,source);
const manifest=JSON.parse(fs.readFileSync('server/content-manifest.json','utf8'));
for(const section of Object.values(manifest.sections))for(const field of Object.values(section.fields)){
 field.label=field.label.replace(/^(h1|h2|h3|title):/,'Heading:').replace(/^(p|span|strong):/,'Text:').replace(/^label:/,'Field label:').replace(/^(href|to):/,'Link:').replace(/^placeholder:/,'Input hint:').replace(/^alt:/,'Image description:');
}
for(let i=1;i<=3;i++){const file=`src/assets/Home-Images/blog${i}.png`;manifest.assets[file]=file;}
fs.writeFileSync('server/content-manifest.json',JSON.stringify(manifest,null,2)+'\n');
