import type { ForgeConfig } from "@electron-forge/shared-types";
import { MakerSquirrel } from "@electron-forge/maker-squirrel";
import { MakerZIP } from "@electron-forge/maker-zip";
import { MakerDeb } from "@electron-forge/maker-deb";
import { MakerRpm } from "@electron-forge/maker-rpm";
import { VitePlugin } from "@electron-forge/plugin-vite";

const ignore = (file: string) => {
  if (!file) return false;
  if (file === "/node_modules") return false;
  if (file.startsWith("/drizzle")) return false;
  if (file.startsWith("/scaffold")) return false;
  if (file.startsWith("/worker")) return false;
  if (file.startsWith("/node_modules/stacktrace-js")) return false;
  if (file.startsWith("/node_modules/stacktrace-js/dist")) return false;
  if (file.startsWith("/node_modules/better-sqlite3")) return false;
  if (file.startsWith("/node_modules/bindings")) return false;
  if (file.startsWith("/node_modules/file-uri-to-path")) return false;
  if (file.startsWith("/.vite")) return false;
  return true;
};

const isEndToEndTestBuild = process.env.E2E_TEST_BUILD === "true";

const config: ForgeConfig = {
  packagerConfig: {
    protocols: [
      {
        name: "Dyad",
        schemes: ["dyad"],
      },
    ],
    icon: "./assets/icon/logo",
    osxSign: isEndToEndTestBuild
      ? undefined
      : {
          identity: process.env.APPLE_TEAM_ID,
        },
    osxNotarize: isEndToEndTestBuild
      ? undefined
      : {
          appleId: process.env.APPLE_ID!,
          appleIdPassword: process.env.APPLE_PASSWORD!,
          teamId: process.env.APPLE_TEAM_ID!,
        },
    asar: true,
    ignore,
  },
  rebuildConfig: {
    extraModules: ["better-sqlite3"],
    force: true,
  },
  makers: [
    new MakerSquirrel({
      signWithParams: `/sha1 ${process.env.SM_CODE_SIGNING_CERT_SHA1_HASH} /tr http://timestamp.digicert.com /td SHA256 /fd SHA256`,
    }),
    new MakerZIP({}, ["darwin"]),
    new MakerRpm({}),
    new MakerDeb({
      options: {
        mimeType: ["x-scheme-handler/dyad"],
      },
    }),
  ],
  publishers: [
    {
      name: "@electron-forge/publisher-github",
      config: {
        repository: {
          owner: "dyad-sh",
          name: "dyad",
        },
        draft: true,
        force: true,
      },
    },
  ],
  plugins: [
    new VitePlugin({
      build: [
        {
          entry: "src/main.ts",
          config: "vite.main.config.mts",
          target: "main",
        },
        {
          entry: "src/preload.ts",
          config: "vite.preload.config.mts",
          target: "preload",
        },
      ],
      renderer: [
        {
          name: "main_window",
          config: "vite.renderer.config.mts",
        },
      ],
    }),
  ],
};

export default config;
