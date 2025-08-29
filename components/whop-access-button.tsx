"use client"

import { ArrowRight } from "lucide-react"
import { useWhop } from '@whop-apps/sdk/react'

type AccessLevel = 'free' | 'premium' | 'plus'

interface WhopAccessButtonProps {
  level: AccessLevel
  className?: string
  children: React.ReactNode
}

export function WhopAccessButton({ level, className, children }: WhopAccessButtonProps) {
  const { user, isLoading } = useWhop()

  const handleClick = async () => {
    if (isLoading) return

    try {
      // For embedded apps, we can use the SDK to check access and navigate
      const experienceIds = {
        free: process.env.NEXT_PUBLIC_FREE_EXPERIENCE_ID,
        premium: process.env.NEXT_PUBLIC_PREMIUM_EXPERIENCE_ID,
        plus: process.env.NEXT_PUBLIC_PLUS_UPGRADE_URL
      }

      const targetUrl = experienceIds[level]
      
      if (level === 'plus') {
        // For Plus tier, redirect to upgrade URL
        window.open(targetUrl, '_blank')
      } else if (level === 'free') {
        // For free tier, everyone has access in embedded context
        window.open(`https://whop.com/experiences/${targetUrl}`, '_blank')
      } else if (level === 'premium') {
        // For premium, check if user has access
        window.open(`https://whop.com/experiences/${targetUrl}`, '_blank')
      }
    } catch (error) {
      console.error('Error handling access:', error)
      // Fallback to direct links
      const fallbackUrls = {
        free: `https://whop.com/experiences/${process.env.NEXT_PUBLIC_FREE_EXPERIENCE_ID}`,
        premium: `https://whop.com/experiences/${process.env.NEXT_PUBLIC_PREMIUM_EXPERIENCE_ID}`,
        plus: process.env.NEXT_PUBLIC_PLUS_UPGRADE_URL
      }
      window.open(fallbackUrls[level], '_blank')
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={className}
    >
      {children}
      {!isLoading && (
        <ArrowRight className="w-4 h-4 transition -translate-x-0 group-hover:translate-x-0.5" />
      )}
    </button>
  )
}