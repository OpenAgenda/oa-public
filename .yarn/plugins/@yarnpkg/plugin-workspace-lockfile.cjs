/* eslint-disable */
//prettier-ignore
module.exports = {
name: "@yarnpkg/plugin-workspace-lockfile",
factory: function (require) {
var plugin=(()=>{var g=Object.defineProperty;var R=Object.getOwnPropertyDescriptor;var A=Object.getOwnPropertyNames;var C=Object.prototype.hasOwnProperty;var w=(e=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(e,{get:(t,c)=>(typeof require<"u"?require:t)[c]}):e)(function(e){if(typeof require<"u")return require.apply(this,arguments);throw new Error('Dynamic require of "'+e+'" is not supported')});var v=(e,t)=>{for(var c in t)g(e,c,{get:t[c],enumerable:!0})},P=(e,t,c,l)=>{if(t&&typeof t=="object"||typeof t=="function")for(let n of A(t))!C.call(e,n)&&n!==c&&g(e,n,{get:()=>t[n],enumerable:!(l=R(t,n))||l.enumerable});return e};var S=e=>P(g({},"__esModule",{value:!0}),e);var O={};v(O,{default:()=>I});var a=w("@yarnpkg/core"),E=w("@yarnpkg/cli"),m=w("@yarnpkg/fslib");var r=w("@yarnpkg/core"),u=w("@yarnpkg/fslib"),k=w("@yarnpkg/parsers"),x="<<<<<<<";async function y(e,t,c){if(!e.projectCwd)return!1;let l=u.ppath.join(e.projectCwd,t);if(!await u.xfs.existsPromise(l)||!(await u.xfs.readFilePromise(l,"utf8")).includes(x))return!1;if(c)throw new r.ReportError(r.MessageName.AUTOMERGE_IMMUTABLE,"Cannot autofix a lockfile when running an immutable install");let s=await r.execUtils.execvp("git",["rev-parse","MERGE_HEAD","HEAD"],{cwd:e.projectCwd});if(s.code!==0&&(s=await r.execUtils.execvp("git",["rev-parse","REBASE_HEAD","HEAD"],{cwd:e.projectCwd})),s.code!==0&&(s=await r.execUtils.execvp("git",["rev-parse","CHERRY_PICK_HEAD","HEAD"],{cwd:e.projectCwd})),s.code!==0)throw new r.ReportError(r.MessageName.AUTOMERGE_GIT_ERROR,"Git returned an error when trying to find the commits pertaining to the conflict");let f=await Promise.all(s.stdout.trim().split(/\n/).map(async o=>{let i=await r.execUtils.execvp("git",["show",`${o}:./${t}`],{cwd:e.projectCwd});if(i.code!==0)throw new r.ReportError(r.MessageName.AUTOMERGE_GIT_ERROR,`Git returned an error when trying to access the lockfile content in ${o}`);try{return(0,k.parseSyml)(i.stdout)}catch{throw new r.ReportError(r.MessageName.AUTOMERGE_FAILED_TO_PARSE,"A variant of the conflicting lockfile failed to parse")}}));f=f.filter(o=>!!o.__metadata);for(let o of f){if(o.__metadata.version<7)for(let i of Object.keys(o)){if(i==="__metadata")continue;let d=r.structUtils.parseDescriptor(i,!0),_=e.normalizeDependency(d),h=r.structUtils.stringifyDescriptor(_);h!==i&&(o[h]=o[i],delete o[i])}for(let i of Object.keys(o)){if(i==="__metadata")continue;let d=o[i].checksum;typeof d=="string"&&d.includes("/")||(o[i].checksum=`${o.__metadata.cacheKey}/${d}`)}}let p=Object.assign({},...f);p.__metadata.version=`${Math.min(...f.map(o=>parseInt(o.__metadata.version??0)))}`,p.__metadata.cacheKey="merged";for(let[o,i]of Object.entries(p))typeof i=="string"&&delete p[o];return await u.xfs.changeFilePromise(l,(0,k.stringifySyml)(p),{automaticNewlines:!0}),!0}var D=async(e,{cwd:t})=>{let c=await a.Configuration.find(t,(0,E.getPluginConfiguration)()),l=await a.Cache.find(c),{project:n,workspace:s}=await a.Project.find(c,t);n.originalPackages=new Map(e.originalPackages),n.storedResolutions=new Map(e.storedResolutions);let f=new Set([s]);for(let p of f)for(let o of a.Manifest.hardDependencies)for(let i of p.manifest.getForScope(o).values()){let d=n.tryWorkspaceByDescriptor(i);d!==null&&f.add(d)}return await n.resolveEverything({cache:l,report:new a.ThrowReport}),await n.fetchEverything({cache:l,report:new a.ThrowReport}),n.generateLockfile()},M=e=>`\x1B[32m${e}\x1B[0m`,T={configuration:{workspaceLockfiles:{description:"List of the workspaces that need a specific lockfile",type:a.SettingsType.STRING,default:!0,isArray:!0},workspaceLockfileFilename:{description:"Name of the workspaces specific lockfile",type:a.SettingsType.STRING,default:"yarn.lock-workspace"}},hooks:{afterAllInstalled:async(e,t)=>{let c=e.configuration.values.get("workspaceLockfiles"),l=e.configuration.values.get("workspaceLockfileFilename"),n=Array.isArray(c)?new Set(c.map(s=>e.getWorkspaceByIdent(a.structUtils.parseIdent(s)))):new Set(e.workspaces);for(let s of n){let f=m.ppath.join(s.cwd,l),p=m.ppath.join(s.cwd,m.Filename.lockfile);await m.xfs.existsPromise(f)&&(await y({projectCwd:s.cwd,normalizeDependency:e.configuration.normalizeDependency},l,t.immutable)&&(t.report.reportInfo(a.MessageName.AUTOMERGE_SUCCESS,"Automatically fixed merge conflicts \u{1F44D}"),t.report.reportSeparator()),await m.xfs.renamePromise(f,p)),await m.xfs.writeFilePromise(p,await D(e,s)),await m.xfs.renamePromise(p,f),t.report.reportInfo(null,`${M("\u2713")} Wrote ${f}`)}}}},I=T;return S(O);})();
return plugin;
}
};
