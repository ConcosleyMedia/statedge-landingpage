"use client"

import { ArrowRight } from "lucide-react"
import { useWhop } from '@whop-apps/sdk/react'
import { useEffect, useState } from 'react'

type AccessLevel = 'free' | 'premium' | 'plus'

interface WhopAccessButtonProps {
  level: AccessLevel
  className?: string
  children: React.ReactNode
}

export function WhopAccessButton({ level, className, children }: WhopAccessButtonProps) {
  const { user, isLoading } = useWhop()
  const [debugInfo, setDebugInfo] = useState<string>('')
  const [isEmbedded, setIsEmbedded] = useState(false)

  useEffect(() => {
    // Detect if we're in an iframe
    const inIframe = window !== window.top
    setIsEmbedded(inIframe)
    
    // Debug logging
    console.log('Whop Context:', {
      isEmbedded: inIframe,
      user,
      isLoading,
      level,
      env: {
        FREE_EXPERIENCE_ID: process.env.NEXT_PUBLIC_FREE_EXPERIENCE_ID,
        PREMIUM_EXPERIENCE_ID: process.env.NEXT_PUBLIC_PREMIUM_EXPERIENCE_ID,
        PLUS_UPGRADE_URL: process.env.NEXT_PUBLIC_PLUS_UPGRADE_URL,
      }
    })
    
    setDebugInfo(`Embedded: ${inIframe}, User: ${user?.id || 'None'}, Loading: ${isLoading}`)
  }, [user, isLoading, level])

  const handleClick = async () => {
    if (isLoading) {
      console.log('Still loading, skipping click')
      return
    }

    console.log('Button clicked:', { level, user, isEmbedded })

    try {
      const experienceIds = {
        free: process.env.NEXT_PUBLIC_FREE_EXPERIENCE_ID,
        premium: process.env.NEXT_PUBLIC_PREMIUM_EXPERIENCE_ID,
        plus: process.env.NEXT_PUBLIC_PLUS_UPGRADE_URL
      }

      const targetUrl = experienceIds[level]
      console.log('Target URL:', targetUrl)

      if (!targetUrl) {
        console.error('No target URL found for level:', level)
        return
      }

      if (isEmbedded) {
        // In iframe context, try different navigation strategies
        if (level === 'plus') {
          // For Plus tier upgrade, try parent window navigation
          try {
            if (window.parent && window.parent !== window) {
              window.parent.location.href = targetUrl
            } else {
              window.top!.location.href = targetUrl
            }
          } catch (e) {
            console.log('Parent navigation failed, using fallback:', e)
            window.location.href = targetUrl
          }
        } else {
          // For free/premium experiences, construct proper Whop URLs
          const whopUrl = `https://whop.com/experiences/${targetUrl}`
          console.log('Navigating to experience:', whopUrl)
          
          try {
            // Try parent window navigation first
            if (window.parent && window.parent !== window) {
              window.parent.location.href = whopUrl
            } else {
              window.top!.location.href = whopUrl
            }
          } catch (e) {
            console.log('Parent navigation failed, using current window:', e)
            window.location.href = whopUrl
          }
        }
      } else {
        // Not embedded, use window.open (original behavior)
        if (level === 'plus') {
          window.open(targetUrl, '_blank')
        } else {
          window.open(`https://whop.com/experiences/${targetUrl}`, '_blank')
        }
      }
    } catch (error) {
      console.error('Error handling access:', error)
      
      // Ultimate fallback - try direct navigation
      const fallbackUrls = {
        free: `https://whop.com/experiences/${process.env.NEXT_PUBLIC_FREE_EXPERIENCE_ID}`,
        premium: `https://whop.com/experiences/${process.env.NEXT_PUBLIC_PREMIUM_EXPERIENCE_ID}`,
        plus: process.env.NEXT_PUBLIC_PLUS_UPGRADE_URL
      }
      
      const fallbackUrl = fallbackUrls[level]
      if (fallbackUrl) {
        window.location.href = fallbackUrl
      }
    }
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={className}
        title={debugInfo}
      >
        {children}
        {!isLoading && (
          <ArrowRight className="w-4 h-4 transition -translate-x-0 group-hover:translate-x-0.5" />
        )}
        {isLoading && (
          <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        )}
      </button>
      
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-white/40 mt-1">
          {debugInfo}
        </div>
      )}
    </div>
  )
}