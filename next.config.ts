import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow the dev server to be reached from phones/other devices on the LAN.
  // By default Next only allows `localhost`, so opening the Network URL from a
  // phone is treated as cross-origin and dev assets are blocked — the page
  // loads but never hydrates, so taps do nothing. These wildcards cover the
  // common private IP ranges a phone on the same Wi-Fi would use.
  allowedDevOrigins: [
    "192.168.0.*",
    "192.168.1.*",
    "192.168.*",
    "172.16.*",
    "172.*",
    "10.*",
  ],
};

export default nextConfig;
