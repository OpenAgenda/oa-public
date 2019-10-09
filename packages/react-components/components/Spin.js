import React, { Component } from 'react';

const defaults = {
  lines: 12,
  length: 7,
  width: 5,
  radius: 10,
  scale: 1.0,
  corners: 1,
  color: '#000',
  fadeColor: 'transparent',
  animation: 'spinner-line-fade-default',
  rotate: 0,
  direction: 1,
  speed: 1,
  zIndex: 2e9,
  className: 'spinner',
  top: '50%',
  left: '50%',
  shadow: '0 0 1px transparent',
  position: 'absolute',
};

export default class Spin extends Component {
  constructor(props) {
    super(props);

    this.opts = Object.assign(Object.assign({}, defaults), props);
  }

  render() {
    return (
      <div
        role="progressbar"
        className={this.opts.className}
        style={{
          position: this.opts.position,
          width: 0,
          zIndex: this.opts.zIndex,
          left: this.opts.left,
          top: this.opts.top,
          transform: `scale(${this.opts.scale})`,
        }}
      >
        {drawLines(this.opts)}
      </div>
    );
  }
}

/**
 * Returns the line color from the given string or array.
 */
function getColor(color, idx) {
  return typeof color == 'string' ? color : color[idx % color.length];
}

/**
 * Internal method that draws the individual lines.
 */
function drawLines(opts) {
  let borderRadius = (Math.round(opts.corners * opts.width * 500) / 1000) + 'px';
  let shadow = 'none';
  if (opts.shadow === true) {
    shadow = '0 2px 4px #000'; // default shadow
  } else if (typeof opts.shadow === 'string') {
    shadow = opts.shadow;
  }
  let shadows = parseBoxShadow(shadow);

  const lines = [];

  for (let i = 0; i < opts.lines; i++) {
    let degrees = ~~(360 / opts.lines * i + opts.rotate);
    let delay = i * opts.direction / opts.lines / opts.speed;

    lines.push(
      <div
        key={`line-${i}`}
        style={{
          position: 'absolute',
          top: `${-opts.width / 2}px`,
          width: (opts.length + opts.width) + 'px',
          height: opts.width + 'px',
          background: getColor(opts.fadeColor, i),
          borderRadius: borderRadius,
          transformOrigin: 'left',
          transform: `rotate(${degrees}deg) translateX(${opts.radius}px)`
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            background: getColor(opts.color, i),
            borderRadius: borderRadius,
            boxShadow: normalizeShadow(shadows, degrees),
            animation: `${1 / opts.speed}s linear ${delay}s infinite ${opts.animation}`,
          }}
        >
        </div>
      </div>
    );
  }

  return lines;
}

function parseBoxShadow(boxShadow) {
  let regex = /^\s*([a-zA-Z]+\s+)?(-?\d+(\.\d+)?)([a-zA-Z]*)\s+(-?\d+(\.\d+)?)([a-zA-Z]*)(.*)$/;
  let shadows = [];
  for (let shadow of boxShadow.split(',')) {
    let matches = shadow.match(regex);
    if (matches === null) {
      continue; // invalid syntax
    }
    let x = +matches[2];
    let y = +matches[5];
    let xUnits = matches[4];
    let yUnits = matches[7];
    if (x === 0 && !xUnits) {
      xUnits = yUnits;
    }
    if (y === 0 && !yUnits) {
      yUnits = xUnits;
    }
    if (xUnits !== yUnits) {
      continue; // units must match to use as coordinates
    }
    shadows.push({
      prefix: matches[1] || '',
      x: x,
      y: y,
      xUnits: xUnits,
      yUnits: yUnits,
      end: matches[8],
    });
  }
  return shadows;
}

/**
 * Modify box-shadow x/y offsets to counteract rotation
 */
function normalizeShadow(shadows, degrees) {
  let normalized = [];
  for (let shadow of shadows) {
    let xy = convertOffset(shadow.x, shadow.y, degrees);
    normalized.push(shadow.prefix + xy[0] + shadow.xUnits + ' ' + xy[1] + shadow.yUnits + shadow.end);
  }
  return normalized.join(', ');
}

function convertOffset(x, y, degrees) {
  let radians = degrees * Math.PI / 180;
  let sin = Math.sin(radians);
  let cos = Math.cos(radians);
  return [
    Math.round((x * cos + y * sin) * 1000) / 1000,
    Math.round((-x * sin + y * cos) * 1000) / 1000,
  ];
}
