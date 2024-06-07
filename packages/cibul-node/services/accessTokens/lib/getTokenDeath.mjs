export default ({
  created_at: createdAt,
  lifespan,
}) => new Date(new Date(createdAt).getTime() + lifespan * 1000);
