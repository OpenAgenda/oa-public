/* eslint-disable */
module.exports = {
name: "@yarnpkg/plugin-workspace-lockfile",
factory: function (require) {var plugin;(()=>{"use strict";var e={d:(o,t)=>{for(var r in t)e.o(t,r)&&!e.o(o,r)&&Object.defineProperty(o,r,{enumerable:!0,get:t[r]})},o:(e,o)=>Object.prototype.hasOwnProperty.call(e,o),r:e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})}},o={};e.r(o),e.d(o,{default:()=>n});const t=require("@yarnpkg/core"),r=require("@yarnpkg/cli"),a=require("@yarnpkg/fslib"),i=async(e,{cwd:o})=>{const a=await t.Configuration.find(o,(0,r.getPluginConfiguration)(),{lookup:t.ProjectLookup.MANIFEST}),i=await t.Cache.find(a),{project:n,workspace:c}=await t.Project.find(a,o);n.originalPackages=new Map(e.originalPackages),n.storedResolutions=new Map(e.storedResolutions);const s=new Set([c]);for(const e of s)for(const o of t.Manifest.hardDependencies)for(const t of e.manifest.getForScope(o).values()){const e=n.tryWorkspaceByDescriptor(t);null!==e&&s.add(e)}return await n.resolveEverything({cache:i,report:new t.ThrowReport}),await n.fetchEverything({cache:i,report:new t.ThrowReport}),n.generateLockfile()},n={configuration:{workspaceLockfiles:{description:"List of the workspaces that need a specific lockfile",type:t.SettingsType.STRING,default:!0,isArray:!0},workspaceLockfileFilename:{description:"Name of the workspaces specific lockfile",type:t.SettingsType.STRING,default:"yarn.lock-workspace"}},hooks:{afterAllInstalled:async(e,o)=>{const r=e.configuration.values.get("workspaceLockfiles"),n=e.configuration.values.get("workspaceLockfileFilename"),c=Array.isArray(r)?new Set(r.map(o=>e.getWorkspaceByIdent(t.structUtils.parseIdent(o)))):new Set(e.workspaces);for(const t of c){const r=a.ppath.join(t.cwd,n);await a.xfs.writeFilePromise(r,await i(e,t)),o.report.reportInfo(null,`${s="✓",`[32m${s}[0m`} Wrote ${r}`)}var s}}};plugin=o})();return plugin;
}
};