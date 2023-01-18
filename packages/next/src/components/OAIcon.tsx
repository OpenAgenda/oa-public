import { Icon, IconProps, SystemStyleObject, useToken, forwardRef } from '@openagenda/uikit';

interface OAIconProps extends IconProps {
  withShadow?: boolean;
  primaryColor?: string;
  secondaryColor?: string;
  tertiaryColor?: string;
  primaryOpacity?: string | number;
  secondaryOpacity?: string | number;
  tertiaryOpacity?: string | number;
}

const OAIcon = forwardRef<OAIconProps, 'svg'>(function OAIcon({
  withShadow = false,
  primaryColor,
  secondaryColor,
  tertiaryColor,
  primaryOpacity = 1,
  secondaryOpacity = 1,
  tertiaryOpacity = 1,
  ...props
}: OAIconProps, ref) {
  const [
    primaryC,
    secondaryC,
    tertiaryC,
  ] = useToken(
    'colors',
    [primaryColor, secondaryColor, tertiaryColor],
    ['currentColor', 'currentColor', 'currentColor'],
  );

  const styles: SystemStyleObject = {
    w: 'auto',
  };

  const viewBoxHeight = withShadow ? 216.004 : 185.594;

  return (
    <Icon ref={ref} viewBox={`0 0 146.278 ${viewBoxHeight}`} __css={styles} {...props}>
      <path
        fill={`var(--icon-secondary-color, ${secondaryC})`}
        opacity={`var(--icon-secondary-opacity, ${secondaryOpacity})`}
        d="M73.133 0C32.75 0 0 32.748 0 73.133c0 12.691 3.206 24.622 8.896 35.025.574 1.292 1.385 2.625 2.382 3.993l.143.21c1.728 2.712 3.684 5.324 5.744 7.777l4.346 5.954 27.602 37.69 10.228 14.008c7.595 10.387 20.007 10.387 27.6 0l10.228-13.941 27.671-37.757 4.696-6.444c1.744-2.122 3.325-4.343 4.833-6.657l.7-.84c1.106-1.503 1.873-3.009 2.452-4.413 5.75-10.627 8.761-22.521 8.757-34.605C146.278 32.748 113.527 0 73.144 0h-.011Zm0 10.578c33.388 0 60.455 27.067 60.455 60.455s-27.067 60.455-60.455 60.455-60.455-27.06-60.455-60.455c0-33.394 27.065-60.455 60.455-60.455Z"
      />
      <path
        fill="none"
        stroke={`var(--icon-primary-color, ${primaryC})`}
        strokeOpacity={`var(--icon-primary-opacity, ${primaryOpacity})`}
        strokeLinecap="round"
        strokeWidth="14"
        d="m38.014 51.413 32.863 34.535 34.68-50.874"
      />
      {withShadow ? (
        <path
          fill={`var(--icon-tertiary-color, ${tertiaryC})`}
          opacity={`var(--icon-tertiary-opacity, ${tertiaryOpacity})`}
          d="M115.117 210.003c0 3.311-18.118 6.001-40.473 6.001s-40.475-2.69-40.475-6.001c0-3.312 18.117-5.993 40.475-5.993s40.473 2.681 40.473 5.993"
        />
      ) : null}
    </Icon>
  );
});

export default OAIcon;
