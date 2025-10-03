import { forwardRef } from 'react';
import { Tooltip, TooltipTrigger, TooltipContent } from './Tooltip.js';

const Icon = forwardRef(function Icon({ link, className, style }, ref) {
  const iconStyle = {
    color: '#1d77ce',
    fontSize: '1.3em',
    ...style,
  };

  return link ? (
    <a
      ref={ref}
      href={link}
      rel="noopener noreferrer"
      target="_blank"
      aria-label="More info"
    >
      <i
        className={`fa fa-question-circle ${className}`}
        aria-hidden="true"
        style={iconStyle}
      />
    </a>
  ) : (
    <i
      ref={ref}
      className={`fa fa-question-circle ${className}`}
      aria-hidden="true"
      style={iconStyle}
    />
  );
});

export default function MoreInfo({
  children = null,
  title = null,
  content = null,
  link = null,
  placement = 'right',
  className = '',
  style = null,
}) {
  if (!content && !children) {
    return <Icon link={link} className={className} style={style} />;
  }

  if (!content) return children;

  return (
    <Tooltip placement={placement}>
      <TooltipTrigger asChild>
        {children || <Icon link={link} className={className} style={style} />}
      </TooltipTrigger>
      <TooltipContent
        style={{
          zIndex: 3001,
          backgroundColor: '#fff',
          border: '1px solid rgba(0, 0, 0, 0.2)',
          borderRadius: '6px',
          boxShadow: '0 5px 10px rgba(0, 0, 0, 0.2)',
          backgroundClip: 'padding-box',
          maxWidth: '276px',
          overflowWrap: 'break-word',
        }}
        arrowProps={{
          fill: '#fff',
          stroke: 'rgba(0, 0, 0, 0.2)',
          strokeWidth: 1,
        }}
      >
        {title ? (
          <h3
            style={{
              margin: '0',
              padding: '8px 14px',
              fontSize: '14px',
              backgroundColor: '#f7f7f7',
              borderBottom: '1px solid #ebebeb',
              borderRadius: '6px 6px 0 0',
            }}
          >
            {title}
          </h3>
        ) : null}
        <div style={{ padding: '8px 14px' }}>{content}</div>
      </TooltipContent>
    </Tooltip>
  );
}
