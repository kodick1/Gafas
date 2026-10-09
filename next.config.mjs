/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    proxyClientMaxBodySize: "22mb",
  },
};

const withNextIntl = (await import("next-intl/plugin")).default("./i18n/request.ts");

export default withNextIntl(nextConfig);
