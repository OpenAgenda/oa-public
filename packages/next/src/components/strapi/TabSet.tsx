import { Tabs, H3 } from '@openagenda/uikit';
import { allowedItemColors, color } from 'utils/strapi';
import SplitHero from './SplitHero';
import SegmentContainer from './SegmentContainer';
import type { Color } from './types';

interface TabSetProps {
  title?: string;
  description?: string;
  Tabs: Array<any>;
  CTAs?: any[];
  background?: any;
  fontColor?: any;
  descriptionColor?: Color;
}

export default function TabSet({
  title = null,
  description,
  Tabs: TabsData,
  CTAs,
  background,
  fontColor,
  descriptionColor,
}: TabSetProps) {
  if (!TabsData?.length) {
    return null;
  }

  return (
    <SegmentContainer
      title={title}
      description={description}
      CTAs={CTAs}
      background={background}
      fontColor={fontColor}
      descriptionColor={descriptionColor}
    >
      <Tabs.Root defaultValue={TabsData[0].id}>
        <Tabs.List>
          {TabsData.map((tab, index) => (
            <Tabs.Trigger
              key={tab.id}
              value={tab.id}
              fontSize="md"
              color={fontColor ? color(fontColor, 500) : undefined}
              pb={6}
              colorPalette={
                fontColor
                  ? color(fontColor)
                  : allowedItemColors[index % allowedItemColors.length]
              }
            >
              {tab.title}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        {TabsData.map((tab) => (
          <Tabs.Content key={tab.id} value={tab.id} py={12} px={3}>
            <SplitHero {...tab.content} TitleComponent={H3} />
          </Tabs.Content>
        ))}
      </Tabs.Root>
    </SegmentContainer>
  );
}
