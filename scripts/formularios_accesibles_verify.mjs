import fs from 'node:fs';import ts from 'typescript';import assert from 'node:assert/strict';
const files=['src/pages/confetti/ConfettiFormularioPastel.jsx','src/pages/confetti/ConfettiFormularioProductos.jsx'];let total=0;
for(const file of files){const src=fs.readFileSync(new URL('../'+file,import.meta.url),'utf8');const ast=ts.createSourceFile(file,src,ts.ScriptTarget.Latest,true,ts.ScriptKind.JSX);const ids=new Set(),labels=new Set(),controls=[];
const attr=(n,key)=>n.attributes.properties.find(a=>a.name?.text===key);
const value=a=>a?.initializer&&ts.isStringLiteral(a.initializer)?a.initializer.text:null;
const visit=n=>{if(ts.isJsxOpeningElement(n)||ts.isJsxSelfClosingElement(n)){const tag=n.tagName.getText(ast);const id=value(attr(n,'id'));if(id){assert(!ids.has(id),'Duplicate id '+id);ids.add(id);}if(tag==='label'){const target=value(attr(n,'htmlFor'));if(target)labels.add(target);}
if(['input','textarea','select'].includes(tag)){let parent=n.parent,wrapped=false;while(parent){if(ts.isJsxElement(parent)&&parent.openingElement.tagName.getText(ast)==='label'){wrapped=true;break;}parent=parent.parent;}controls.push({id,wrapped,n});}}
ts.forEachChild(n,visit);};visit(ast);
for(const c of controls){assert(c.wrapped||attr(c.n,'aria-label')||(c.id&&labels.has(c.id)),`${file}: unnamed control at ${ast.getLineAndCharacterOfPosition(c.n.pos).line+1}`);total++;}
for(const target of labels)assert(ids.has(target)||(target==='confetti-relleno'&&src.includes('<RellenoSelector')),file+': broken label '+target);
}
assert(fs.readFileSync(new URL('../index.html',import.meta.url),'utf8').includes('lang="es"'));console.log(`PASS: ${total} actual public input/textarea controls have associated names; unique ids; label targets; Spanish document language`);
