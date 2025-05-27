import { H2, Tabs } from '@openagenda/uikit';
import SplitHero from './SplitHero';
import SegmentContainer from './SegmentContainer';

export default function TabSet({ title = null, Tabs: TabsData }) {
  if (!TabsData?.length) {
    return null;
  }

  return (
    <SegmentContainer backgroundColor={{ name: 'white' }}>
      {title && (
        <H2 mb={4} fontWeight="bold">
          {title}
        </H2>
      )}

      <Tabs.Root defaultValue={TabsData[0].id}>
        <Tabs.List>
          {TabsData.map((tab) => (
            <Tabs.Trigger key={tab.id} value={tab.id}>
              {tab.title}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        {TabsData.map((tab) => (
          <Tabs.Content key={tab.id} value={tab.id}>
            <SplitHero {...tab.content} />
            {/* {tab.content && (
              <Box>
                {tab.content.title && (
                  <H2 size="md" mb={4}>{tab.content.title}</H2>
                )}
                {tab.content.text && (
                  <Box className="markdown-content">
                    <ReactMarkdown>{tab.content.text}</ReactMarkdown>
                  </Box>
                )}
                {tab.content.image && (
                  <Box mt={4}>
                    <img
                      src={tab.content.image.url}
                      alt={tab.content.image.alternativeText || tab.content.title || ''}
                      style={{ maxWidth: '100%' }}
                    />
                  </Box>
                )}
              </Box>
            )} */}
          </Tabs.Content>
        ))}
      </Tabs.Root>
    </SegmentContainer>
  );
}
