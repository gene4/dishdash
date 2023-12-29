import { authMiddleware, redirectToSignIn } from "@clerk/nextjs";

import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";

const intlMiddleware = createMiddleware({
    locales: ["en", "de"],
    defaultLocale: "en",
});

export default authMiddleware({
    beforeAuth: (req) => {
        // Execute next-intl middleware before Clerk's auth middleware
        return intlMiddleware(req);
    },

    // Ensure that locale specific sign-in pages are public
    // publicRoutes: ["/:locale/sign-in"],
    // afterAuth(auth, req) {
    //     if (auth.userId && auth.isPublicRoute) {
    //         let path = "/select-org";

    //         if (auth.orgId) {
    //             path = "/";
    //         }
    //         const orgSelection = new URL(path, req.url);
    //         return NextResponse.redirect(orgSelection);
    //     }
    // },
    afterAuth(auth, req, evt) {
        // Handle users who aren't authenticated
        if (!auth.userId && !auth.isPublicRoute) {
            return redirectToSignIn({ returnBackUrl: req.url });
        }
        // Redirect logged in users to organization selection page if they are not active in an organization
        if (
            auth.userId &&
            !auth.orgId &&
            req.nextUrl.pathname !== "/select-org"
        ) {
            const orgSelection = new URL("/select-org", req.url);
            return NextResponse.redirect(orgSelection);
        }
        // If the user is logged in and trying to access a protected route, allow them to access route
        // if (auth.userId && !auth.isPublicRoute) {
        //     return NextResponse.next();
        // }
        // Allow users visiting public routes to access them
        // return NextResponse.next();
    },
});

export const config = {
    matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
