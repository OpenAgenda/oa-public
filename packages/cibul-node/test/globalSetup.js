export default async () => {
  await fetch('http://localhost:8903').then(
    () => {
      console.log('\nNode container is running, pls stop it');
      process.exit(1);
    },
    () => null,
  );
};
