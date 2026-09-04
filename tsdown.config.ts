import { defineConfig } from "tsdown";

export default defineConfig({
    entry: ["src/index.ts"],
    outDir: "dist",

    format: ["esm", "cjs"],
    dts: true,
    clean: true,
    minify: true,

    deps: {
        neverBundle: ["mongodb","mongodb/*"]
    },

    target: "esnext",
    platform: "node",
});