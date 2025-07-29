import { Tabs } from '@openagenda/uikit';
import { allowedItemColors } from 'utils/strapi';
import SplitHero from './SplitHero';
import SegmentContainer from './SegmentContainer';

interface TabSetProps {
  title?: string;
  description?: string;
  Tabs: Array<any>;
  CTAs?: any[];
  backgroundColor?: any;
  colorVariant?: string;
}

export default function TabSet({
  title = null,
  description,
  Tabs: TabsData,
  CTAs,
  backgroundColor,
  colorVariant,
}: TabSetProps) {
  if (!TabsData?.length) {
    return null;
  }

  console.log('backgroundColor', backgroundColor);
  return (
    <SegmentContainer
      title={title}
      description={description}
      CTAs={CTAs}
      backgroundColor={backgroundColor}
      colorVariant={colorVariant}
    >
      <Tabs.Root defaultValue={TabsData[0].id}>
        <Tabs.List>
          {TabsData.map((tab, index) => (
            <Tabs.Trigger
              key={tab.id}
              value={tab.id}
              fontSize="md"
              pb={6}
              colorPalette={allowedItemColors[index % allowedItemColors.length]}
            >
              {tab.title}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        {TabsData.map((tab) => (
          <Tabs.Content key={tab.id} value={tab.id} py={12} px={3}>
            <SplitHero {...tab.content} />
          </Tabs.Content>
        ))}
      </Tabs.Root>
    </SegmentContainer>
  );
}
