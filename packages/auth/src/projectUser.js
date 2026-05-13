// Pure projection from a raw better-auth user row to the OA-shape payload
// exposed to consumers (cibul-templates, react-layouts, Next, …).
//
// Kept I/O-free so it can be called from any context (per-request session
// resolution, OIDC userinfo, …) without dragging in Feathers services.
// cibul-node wraps this with a thin layer that adds the absolute
// `thumbnail` URL — the bucket prefix is a runtime config, not a property
// of the user row, so it doesn't belong here.
export default function projectUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    uid: user.uid,
    email: user.email,
    name: user.name ?? user.fullName ?? null,
    // `image` is the raw stored path ; consumers that need an absolute URL
    // are expected to prepend their own bucket prefix.
    image: user.image ?? null,
    culture: user.culture ?? null,
    isActivated: user.emailVerified ?? user.isActivated ?? false,
    isBlacklisted: !!user.isBlacklisted,
  };
}
