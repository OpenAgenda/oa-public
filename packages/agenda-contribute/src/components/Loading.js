import { Spinner } from '@openagenda/react-shared';

function Loading() {
  return (
    <div
      className="text-center margin-top-lg"
      style={{
        minHeight: 300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Spinner mode="inline" options={{ scale: 1, width: 1 }} />
    </div>
  );
}

export default Loading;
