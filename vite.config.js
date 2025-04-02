import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    optimizeDeps: {
        include: ['cannon-es']
    },
    server: {
        fs: {
            strict: false
        },
        allowedHosts: ['drones.helpico.tech'],
        port: 5000,
        host: true,
        open: true
    },
    build: {
        sourcemap: false, // Disable sourcemaps in production for smaller files
        minify: 'terser', // Use Terser for better minification
        terserOptions: {
            compress: {
                drop_console: true, // Remove console logs in production
                drop_debugger: true
            }
        },
        rollupOptions: {
            output: {
                manualChunks: {
                    'vendor': ['react', 'react-dom', 'three'],
                    'drei': ['@react-three/drei'],
                    'fiber': ['@react-three/fiber'],
                    'physics': ['@react-three/cannon', 'cannon-es'],
                    'utils': ['zustand', 'uuid', 'file-saver']
                }
            }
        },
        chunkSizeWarningLimit: 1000, // Increase the warning limit
    }
}); 