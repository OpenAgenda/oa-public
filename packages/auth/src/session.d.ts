// Shape returned by `/api/auth/get-session` for OpenAgenda, projected by the
// `resolveSessionExtras` callback wired in cibul-node/services/auth/index.js.
// Hand-typed (rather than inferred from server `typeof auth`) so consumer
// packages can import the type without pulling the server bundle.

export type Session = {
  user: {
    id: string;
    uid: number;
    name: string | null;
    fullName: string | null;
    email: string;
    culture: string | null;
    image: string | null;
    thumbnail: string | null;
    isNew: boolean;
    isBlacklisted: boolean;
    transverseApiAccess: boolean;
    hasLocalAccount: boolean;
    hasSocialAccount: boolean;
  };
  session: {
    id: string;
    userId: string;
    expiresAt: string;
    token: string;
    ipAddress?: string | null;
    userAgent?: string | null;
  };
  lang: string | null;
};
