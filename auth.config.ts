  import type { NextAuthConfig } from "next-auth";


  export const authConfig = {
    secret: process.env.AUTH_SECRET || "development-secret-key-at-least-32-characters-long",
    pages: {
      signIn: "/login",
    },
    callbacks: {
      authorized({ auth, request: { nextUrl } }) {
        const isLoggedIn = !!auth?.user;
        const isOnDashboard = nextUrl.pathname.startsWith("/");

        if (isOnDashboard) {
          return isLoggedIn; // redirect ke /login kalau belum login
        } else if (isLoggedIn) {
          return true;
        }
        return true;
      },
    },
    providers: [], // provider sebenarnya didaftarkan di auth.ts
  } satisfies NextAuthConfig;