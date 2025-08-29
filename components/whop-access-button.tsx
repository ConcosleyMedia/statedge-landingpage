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
    // Detect if we're in an iframe
    const inIframe = window !== window.top
    setIsEmbedded(inIframe)
    
    // More comprehensive debug logging
    const debugData = {
      isEmbedded: inIframe,
      user,
      isLoading,
      level,
      userAgent: navigator.userAgent,
      location: window.location.href,
      parent: window.parent !== window ? 'EXISTS' : 'SAME',
      top: window.top !== window ? 'EXISTS' : 'SAME',
      env: {
        FREE_EXPERIENCE_ID: process.env.NEXT_PUBLIC_FREE_EXPERIENCE_ID,
        PREMIUM_EXPERIENCE_ID: process.env.NEXT_PUBLIC_PREMIUM_EXPERIENCE_ID,
        PLUS_UPGRADE_URL: process.env.NEXT_PUBLIC_PLUS_UPGRADE_URL,
      }
    }
    
    console.log('🔍 Whop Debug Context:', debugData)
    
    setDebugInfo(`${inIframe ? 'IFRAME' : 'STANDALONE'} | User: ${user?.id || 'None'} | ${isLoading ? 'LOADING' : 'READY'}`)
    
    // Test postMessage communication
    if (inIframe && window.parent) {
      console.log('🟡 Testing postMessage communication...')
      try {
        window.parent.postMessage({ type: 'WHOP_TEST', level }, '*')
      } catch (e) {
        console.log('🔴 postMessage failed:', e)
      }
    }
  }, [user, isLoading, level])

  const handleClick = async () => {
    const newClickCount = clickCount + 1
    setClickCount(newClickCount)
    
    console.log(`🚀 BUTTON CLICK #${newClickCount}:`, { 
      level, 
      user, 
      isEmbedded, 
      isLoading,
      timestamp: new Date().toISOString()
    })

    if (isLoading) {
      console.log('⏳ Still loading Whop SDK, skipping click')
      alert('Still loading, please wait...')
      return
    }

    try {
      const experienceIds = {
        free: process.env.NEXT_PUBLIC_FREE_EXPERIENCE_ID,
        premium: process.env.NEXT_PUBLIC_PREMIUM_EXPERIENCE_ID,
        plus: process.env.NEXT_PUBLIC_PLUS_UPGRADE_URL
      }

      const targetUrl = experienceIds[level]
      console.log('🎯 Target URL:', targetUrl)

      if (!targetUrl) {
        console.error('❌ No target URL found for level:', level)
        alert(`ERROR: No URL configured for ${level} tier`)
        return
      }

      // Show user confirmation in embedded context
      if (isEmbedded) {
        const confirmed = confirm(`Navigate to ${level} content?\n\nURL: ${targetUrl}\nClick OK to continue.`)
        if (!confirmed) {
          console.log('🚫 User cancelled navigation')
          return
        }
      }

      console.log('🔄 Attempting navigation...')

      if (isEmbedded) {
        console.log('📱 IFRAME CONTEXT - Trying multiple navigation methods...')
        
        if (level === 'plus') {
          // For Plus tier upgrade, try different methods
          const methods = [
            () => {
              console.log('Method 1: window.parent.location.href')
              if (window.parent && window.parent !== window) {
                window.parent.location.href = targetUrl
                return true
              }
              return false
            },
            () => {
              console.log('Method 2: window.top.location.href')
              if (window.top && window.top !== window) {
                window.top.location.href = targetUrl
                return true
              }
              return false
            },
            () => {
              console.log('Method 3: postMessage to parent')
              if (window.parent) {
                window.parent.postMessage({ 
                  type: 'NAVIGATE', 
                  url: targetUrl,
                  level: level 
                }, '*')
                return true
              }
              return false
            },
            () => {
              console.log('Method 4: window.location.href (current frame)')
              window.location.href = targetUrl
              return true
            }
          ]
          
          for (let i = 0; i < methods.length; i++) {
            try {
              console.log(`🔄 Trying navigation method ${i + 1}...`)
              if (methods[i]()) {
                console.log(`✅ Method ${i + 1} succeeded`)
                break
              }
            } catch (e) {
              console.log(`❌ Method ${i + 1} failed:`, e)
            }
          }
        } else {
          // For free/premium experiences, construct proper Whop URLs
          const whopUrl = `https://whop.com/experiences/${targetUrl}`
          console.log('🎪 Navigating to Whop experience:', whopUrl)
          
          const methods = [
            () => {
              console.log('Experience Method 1: parent.location')
              if (window.parent && window.parent !== window) {
                window.parent.location.href = whopUrl
                return true
              }
              return false
            },
            () => {
              console.log('Experience Method 2: top.location')
              if (window.top && window.top !== window) {
                window.top.location.href = whopUrl
                return true
              }
              return false
            },
            () => {
              console.log('Experience Method 3: postMessage')
              if (window.parent) {
                window.parent.postMessage({ 
                  type: 'NAVIGATE', 
                  url: whopUrl,
                  level: level,
                  experienceId: targetUrl
                }, '*')
                return true
              }
              return false
            },
            () => {
              console.log('Experience Method 4: current window')
              window.location.href = whopUrl
              return true
            }
          ]
          
          for (let i = 0; i < methods.length; i++) {
            try {
              console.log(`🔄 Trying experience method ${i + 1}...`)
              if (methods[i]()) {
                console.log(`✅ Experience method ${i + 1} succeeded`)
                break
              }
            } catch (e) {
              console.log(`❌ Experience method ${i + 1} failed:`, e)
            }
          }
        }
      } else {
        console.log('🌐 STANDALONE CONTEXT - Using window.open')
        // Not embedded, use window.open (original behavior)
        if (level === 'plus') {
          window.open(targetUrl, '_blank')
        } else {
          window.open(`https://whop.com/experiences/${targetUrl}`, '_blank')
        }
      }
    } catch (error) {
      console.error('💥 CRITICAL ERROR in navigation:', error)
      alert(`Navigation failed: ${error.message}`)
      
      // Ultimate fallback - try direct navigation
      const fallbackUrls = {
        free: `https://whop.com/experiences/${process.env.NEXT_PUBLIC_FREE_EXPERIENCE_ID}`,
        premium: `https://whop.com/experiences/${process.env.NEXT_PUBLIC_PREMIUM_EXPERIENCE_ID}`,
        plus: process.env.NEXT_PUBLIC_PLUS_UPGRADE_URL
      }
      
      const fallbackUrl = fallbackUrls[level]
      if (fallbackUrl) {
        console.log('🆘 FALLBACK: Direct window navigation')
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
      
      {/* Always show debug info for troubleshooting */}
      <div className="text-xs text-white/60 mt-1 p-2 bg-black/20 rounded">
        <div>🔍 {debugInfo}</div>
        <div>🎯 Level: {level}</div>
        <div>👆 Clicks: {clickCount}</div>
        <div>🌐 URL: {window.location.href}</div>
      </div>
    </div>
  )
}