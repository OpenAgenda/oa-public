import { Rule as CaslRule } from '@casl/ability';

export default class Rule extends CaslRule {
  constructor(params) {
    super(params);

    this.id = params.id || null;
    this.entityName = params.entityName || null;
    this.identifier = params.identifier || null;
  }
}
