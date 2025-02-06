import { memo } from 'react';
import { chakra } from '@openagenda/uikit';
import mdStyle from 'utils/mdStyle';

type LongDescriptionProps = {
  html: string;
  links?: any[];
};

const LongDescription = memo(function LongDescription({
  html,
  links,
}: LongDescriptionProps) {
  return (
    <>
      <chakra.div sx={mdStyle} dangerouslySetInnerHTML={{ __html: html }} />

      {links
        ? links.map((link: any) => {
            if (link?.data?.script) {
              return (
                <script key={link.data.script.src} {...link.data.script} />
              );
            }
            return null;
          })
        : null}
    </>
  );
});

export default LongDescription;
