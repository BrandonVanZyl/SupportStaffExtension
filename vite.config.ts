import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";
import path, { extname, relative } from "path";
import { fileURLToPath } from "node:url";
import { glob } from "glob";

const external = [/node_modules/];

const input = Object.fromEntries(
  glob
    .sync("src/**/*.{ts,css}", {
      ignore: ["src/**/*.d.ts"],
    })
    .map((file: any) => [
      // The name of the entry point
      // lib/nested/foo.ts becomes nested/foo
      relative("src", file.slice(0, file.length - extname(file).length)),
      // The absolute path to the entry file
      // lib/nested/foo.ts becomes /project/lib/nested/foo.ts
      fileURLToPath(new URL(file, import.meta.url)),
    ])
);
input["main"] = "index.html";
input["build"] = "build.css";

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: "public/manifest.json",
          dest: ".",
        },
        { src: "public/images", dest: "." },
      ],
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    minify: false,
    rollupOptions: {
      input: input,
      output: {
        assetFileNames: "assets/[name][extname]",
        entryFileNames: "[name].js",
      },
    },
  },
});
