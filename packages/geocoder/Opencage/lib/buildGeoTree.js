'use strict';

const fs = require('fs');

function buildLeaf(leaf) {
  const adminLevel = Object.keys(leaf).filter(leafItem => leafItem.match(/adminLevel/)).pop();
  return {
    [adminLevel]: leaf[adminLevel].map(adminLevelItem => ({
      name: adminLevelItem,
      $set: leaf.$set
    }))
  };
}

function buildLeaves(leavesPath) {
  const leaves = fs.readdirSync(leavesPath).map(leafFilename => JSON.parse(fs.readFileSync(`${leavesPath}/${leafFilename}`, 'utf-8')));
  return leaves.reduce((subAdminLevels, leaf) => {
    const adminLevel = Object.keys(leaf).filter(leafItem => leafItem.match(/adminLevel/)).pop();
    if (subAdminLevels[adminLevel]) {
      subAdminLevels[adminLevel] = subAdminLevels[adminLevel].concat(buildLeaf(leaf)[adminLevel]);
      return ({
        ...subAdminLevels,
      });
    }
    return ({
      ...subAdminLevels,
      ...buildLeaf(leaf)
    });
  }, {});
}

function processTreeItem(nodePath, nodeData = {}, options = {}) {
  const {
    isBranch = false,
  } = options;

  const nodeContent = fs.readdirSync(nodePath);

  if (!isBranch) {
    return nodeContent.map(country => processTreeItem(`${nodePath}/${country}`, { name: country }, {
      isBranch: true
    }));
  }

  const adminLevelNodes = nodeContent.filter(item => item.match(/adminLevel/)).reduce((adminLevels, currentAdminLevel) => ({
    ...adminLevels,
    [currentAdminLevel]: fs.readdirSync(`${nodePath}/${currentAdminLevel}`).map(adminLevelNode => {
      const adminLevelNodePath = `${nodePath}/${currentAdminLevel}/${adminLevelNode}`;
      const adminLevelNodeContent = fs.readdirSync(adminLevelNodePath);

      const leaves = adminLevelNodeContent.includes('_set') ? buildLeaves(
        /* currentAdminLevel, */
        `${nodePath}/${currentAdminLevel}/${adminLevelNode}/_set`
      ) : {};
      const subAdminLevels = processTreeItem(adminLevelNodePath, {}, { isBranch: true });

      return {
        name: adminLevelNode,
        ...subAdminLevels,
        ...leaves
      };
    })
  }), {});

  return {
    ...nodeData,
    ...adminLevelNodes
  };
}

module.exports = processTreeItem;
