import { defineConfig } from "tsdown";

export default defineConfig({
	entry: ["src/index.ts"],
	outDir: "dist",
	format: ["esm", "cjs"],
	dts: true,
    clean: true,
	minify: true,
    unbundle: true,
	target: "esnext",
	platform: "node",
});