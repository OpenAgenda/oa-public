import { memo } from 'react';
import { chakra } from '@openagenda/uikit';
import defaultStyle from '@/src/utils/defaultStyle';
import { useNonce } from '@/src/app/NonceProvider';

type LongDescriptionProps = {
  html: string;
  links?: any[];
};

const LongDescription = memo(function LongDescription({
  html,
  links,
}: LongDescriptionProps) {
  const nonce = useNonce();
  return (
    <>
      <chakra.div
        css={defaultStyle}
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {links
        ? links.map((link: any) => {
            if (link?.data?.script) {
              return (
                <script
                  key={link.data.script.src}
                  {...link.data.script}
                  nonce={nonce ?? undefined}
                />
              );
            }
            return null;
          })
        : null}
    </>
  );
});

export default LongDescription;
