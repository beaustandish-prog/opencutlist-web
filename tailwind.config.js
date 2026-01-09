/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    dark: '#000000', // Black
                    primary: '#D97706', // Rustic Amber
                    light: '#FFFFFF', // White
                    text: '#1F2937', // Dark Charcoal
                }
            }
        },
    },
    plugins: [],
}
