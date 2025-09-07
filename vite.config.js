import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    optimizeDeps: {
        include: [
            'cannon-es',
            'three',
            '@react-three/fiber',
            '@react-three/drei',
            'zustand'
        ]
    },
    server: {
        fs: {
            strict: false
        },
        allowedHosts: ['drones.helpico.tech'],
        port: 5000,
        host: true,
        open: true,
        cors: true, // Enable CORS for all requests
        hmr: {
            // Enable proper event handling in HMR
            clientPort: 5000,
            host: 'localhost'
        }
    },
    build: {
        sourcemap: true, // Enable sourcemaps for better debugging
        minify: 'terser', // Use Terser for better minification
        terserOptions: {
            compress: {
                drop_console: false, // Keep console logs for debugging
                drop_debugger: false
            }
        },
        rollupOptions: {
            output: {
                manualChunks: {
                    'vendor': ['react', 'react-dom'],
                    'three-core': ['three'],
                    'three-ecosystem': ['@react-three/fiber', '@react-three/drei'],
                    'physics': ['@react-three/cannon', 'cannon-es'],
                    'utils': ['zustand', 'uuid', 'file-saver']
                }
            }
        },
        chunkSizeWarningLimit: 1000, // Increase the warning limit
    },
    define: {
        // Define custom event handling and debug options for bridge-fix.js based on environment
        __CUSTOM_EVENT_HANDLING__: JSON.stringify(process.env.NODE_ENV !== 'production'),
        __BRIDGE_FIX_DEBUG_MODE__: JSON.stringify(
            process.env.BRIDGE_FIX_DEBUG === 'true' || process.env.NODE_ENV !== 'production'
        ),
        __BRIDGE_FIX_SUPPRESS_WARNINGS__: JSON.stringify(
            process.env.BRIDGE_FIX_SUPPRESS_WARNINGS === 'true' || process.env.NODE_ENV === 'production'
        ),
        __BRIDGE_FIX_DEEP_CLONE__: JSON.stringify(
            process.env.BRIDGE_FIX_DEEP_CLONE === 'true' || false
        ),
        __BRIDGE_FIX_TRACE_EVENTS__: JSON.stringify(
            process.env.BRIDGE_FIX_TRACE_EVENTS === 'true' || false
        ),
        __BRIDGE_FIX_MAX_ATTEMPTS__: process.env.BRIDGE_FIX_MAX_ATTEMPTS || 2,
    }
}); 