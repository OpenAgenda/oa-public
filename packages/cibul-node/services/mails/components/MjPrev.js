import { HeadComponent } from 'mjml-core';

export default class MjPrev extends HeadComponent {
  static componentName = 'mj-prev';

  static endingTag = true;

  static allowedAttributes = {
    length: 'integer',
  };

  static defaultAttributes = {
    length: '300',
  };

  getPaddedContent() {
    const content = this.getContent();

    const blankPad = new Array(
      Math.max(0, this.getAttribute('length') - content.length),
    )
      .fill('&#847;&zwnj;&nbsp;&#8199;&#65279;')
      .join(' ');

    return `${content}${blankPad}`;
  }

  handler() {
    const { add } = this.context;

    add('preview', this.getPaddedContent());
  }
}

MjPrev.dependencies = {
  'mj-head': ['mj-prev'],
};
