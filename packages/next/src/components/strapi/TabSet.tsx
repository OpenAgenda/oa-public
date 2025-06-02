import { Tabs } from '@openagenda/uikit';
import SplitHero from './SplitHero';
import SegmentContainer from './SegmentContainer';

export default function TabSet({ title = null, Tabs: TabsData }) {
  if (!TabsData?.length) {
    return null;
  }

  return (
    <SegmentContainer backgroundColor={{ name: 'white' }} title={title}>
      <Tabs.Root defaultValue={TabsData[0].id}>
        <Tabs.List>
          {TabsData.map((tab) => (
            <Tabs.Trigger key={tab.id} value={tab.id}>
              {tab.title}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        {TabsData.map(
          (tab) => (
            console.log(tab.content),
            (
              <Tabs.Content key={tab.id} value={tab.id}>
                <SplitHero {...tab.content} />
              </Tabs.Content>
            )
          ),
        )}
      </Tabs.Root>
    </SegmentContainer>
  );
}
