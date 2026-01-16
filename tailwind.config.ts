import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--bg)",
                foreground: "var(--fg)",
                border: "var(--border)",
                accent: "var(--accent)",
                muted: "var(--muted)",
                surface: "var(--surface)",
            },
            fontFamily: {
                sans: ["var(--font-sans)"],
                serif: ["var(--font-serif)"],
            },
        },
    },
    plugins: [],
};
export default config;
