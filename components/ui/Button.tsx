'use client'

import { motion, HTMLMotionProps } from 'framer-motion'
import { ReactNode } from 'react'

interface ButtonProps extends HTMLMotionProps<"button"> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'social'
    className?: string
    children: ReactNode
}

export default function Button({ variant = 'primary', className = '', children, ...props }: ButtonProps) {
    const baseStyles = "px-5 py-2.5 rounded-xl font-medium transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none"

    const variants = {
        primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200",
        secondary: "bg-gray-900 text-white hover:bg-gray-800",
        outline: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50",
        ghost: "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900",
        social: "flex items-center justify-center gap-2 py-2.5 border rounded-xl transition font-medium text-sm"
    }

    // Combine classes: if variant is 'social', we expect specific colors to be passed in className or override standard styles
    // However, for simplicity, let's treat 'social' as a base and let className add the specific brand colors
    const variantStyles = variant === 'social'
        ? "flex items-center justify-center gap-2 py-2.5 border rounded-xl transition font-medium text-sm" // Minimal base for social buttons which have unique colors
        : variants[variant]

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            className={`${variant !== 'social' ? baseStyles : ''} ${variantStyles} ${className}`}
            {...props}
        >
            {children}
        </motion.button>
    )
}
