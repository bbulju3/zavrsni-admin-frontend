import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // Uvozimo novi Tailwind plugin

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(), // Dodajemo ga ovdje
    ],
})