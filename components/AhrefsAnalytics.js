'use client'
import Script from 'next/script'

export default function AhrefsAnalytics() {
  return (
    <Script
      src="https://analytics.ahrefs.com/analytics.js"
      data-key="8p39K6aYbluxbIU/+5Qjrw"
      strategy="afterInteractive"
    />
  )
}
