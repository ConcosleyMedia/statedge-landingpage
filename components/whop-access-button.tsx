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
  const [clickCount, setClickCount] = useState(0)

  useEffect(() => {
    const inIframe = window !== window.top
    setIsEmbedded(inIframe)
    
    const debugData = {
      isEmbedded: inIframe,
      user,
      isLoading,
      level,
      location: window.location.href,
      env: {
        FREE_EXPERIENCE_ID: process.env.NEXT_PUBLIC_FREE_EXPERIENCE_ID,
        PREMIUM_EXPERIENCE_ID: process.env.NEXT_PUBLIC_PREMIUM_EXPERIENCE_ID,
        PLUS_UPGRADE_URL: process.env.NEXT_PUBLIC_PLUS_UPGRADE_URL,
      }
    }
    
    console.log('🔍 Whop Context:', debugData)
    setDebugInfo(`${inIframe ? 'IFRAME' : 'STANDALONE'} | User: ${user?.id || 'None'} | ${isLoading ? 'LOADING' : 'READY'}`)
  }, [user, isLoading, level])

  const handleClick = async () => {
    const newClickCount = clickCount + 1
    setClickCount(newClickCount)
    
    console.log(`🚀 CLICK #${newClickCount}:`, { level, user, isEmbedded, isLoading })

    if (isLoading) {
      console.log('⏳ SDK still loading')
      return
    }

    try {
      const experienceIds = {
        free: process.env.NEXT_PUBLIC_FREE_EXPERIENCE_ID,
        premium: process.env.NEXT_PUBLIC_PREMIUM_EXPERIENCE_ID,
        plus: process.env.NEXT_PUBLIC_PLUS_UPGRADE_URL
      }

      const targetId = experienceIds[level]
      if (!targetId) {
        console.error('❌ No target configured for level:', level)
        return
      }

      if (isEmbedded) {
        console.log('📱 IFRAME: Using postMessage communication')
        
        // For embedded context, use postMessage to communicate with Whop parent
        if (level === 'plus') {
          // Plus tier is external upgrade URL
          console.log('🔄 Requesting external navigation to:', targetId)
          window.parent?.postMessage({
            type: 'whop_navigate_external',
            url: targetId,
            level,
            source: 'statedge_landing'
          }, '*')
        } else {
          // Free/Premium are Whop experiences - request parent to navigate
          console.log('🔄 Requesting experience navigation to:', targetId)
          window.parent?.postMessage({
            type: 'whop_navigate_experience', 
            experienceId: targetId,
            level,
            source: 'statedge_landing'
          }, '*')
        }
        
        // Visual feedback
        console.log('✅ Navigation request sent via postMessage')
        
      } else {
        console.log('🌐 STANDALONE: Using direct navigation')
        // Not embedded, use direct navigation
        if (level === 'plus') {
          window.open(targetId, '_blank')
        } else {
          window.open(`https://whop.com/experiences/${targetId}`, '_blank')
        }
      }
    } catch (error) {
      console.error('💥 Navigation error:', error)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={className}
      title={`${debugInfo} | Clicks: ${clickCount}`}
    >
      {children}
      {!isLoading && (
        <ArrowRight className="w-4 h-4 transition -translate-x-0 group-hover:translate-x-0.5" />
      )}
      {isLoading && (
        <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      )}
    </button>
  )
}