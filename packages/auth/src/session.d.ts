// Shape returned by `/api/auth/get-session` for OpenAgenda — the native
// better-auth user (OA columns declared as core/additional fields with
// `returned: true`). Hand-typed (rather than inferred from server `typeof
// auth`) so consumer packages can import the type without pulling the server
// bundle.

export type Session = {
  user: {
    id: string;
    uid: number;
    name: string | null;
    email: string;
    emailVerified: boolean;
    image: string | null;
    culture: string | null;
    isNew: boolean;
    isBlacklisted: boolean;
    transverseApiAccess: boolean;
    createdAt: string;
    updatedAt: string;
  };
  session: {
    id: string;
    userId: string;
    expiresAt: string;
    token: string;
    ipAddress?: string | null;
    userAgent?: string | null;
  };
};
