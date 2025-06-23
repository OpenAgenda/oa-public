import abilityPkg from '@casl/ability';
const {
  Rule: CaslRule
} = abilityPkg;
export default class Rule extends CaslRule {
  constructor(params) {
    super(params);
    this.id = params.id || null;
    this.entityName = params.entityName || null;
    this.identifier = params.identifier || null;
  }
}
//# sourceMappingURL=Rule.js.map