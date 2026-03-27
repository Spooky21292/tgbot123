export { default } from 'next-auth/middleware';

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/trade/:path*',
    '/courses/:path*',
    '/blog/:path*',
    '/webinars/:path*',
    '/bot/:path*'
  ]
};
