import { Tabs } from '@openagenda/uikit';
import SplitHero from './SplitHero';
import SegmentContainer from './SegmentContainer';

interface TabSetProps {
  title?: string;
  description?: string;
  Tabs: Array<any>;
}

export default function TabSet({
  title = null,
  description,
  Tabs: TabsData,
}: TabSetProps) {
  if (!TabsData?.length) {
    return null;
  }

  return (
    <SegmentContainer title={title} description={description}>
      <Tabs.Root defaultValue={TabsData[0].id}>
        <Tabs.List>
          {TabsData.map((tab) => (
            <Tabs.Trigger key={tab.id} value={tab.id} fontSize="md">
              {tab.title}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        {TabsData.map((tab) => (
          <Tabs.Content key={tab.id} value={tab.id} p={6}>
            <SplitHero {...tab.content} />
          </Tabs.Content>
        ))}
      </Tabs.Root>
    </SegmentContainer>
  );
}
