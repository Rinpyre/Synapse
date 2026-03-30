import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
    // 1. clsx combines all the conditions into one string
    // 2. twMerge resolves any Tailwind CSS conflicts
    return twMerge(clsx(inputs))
}
