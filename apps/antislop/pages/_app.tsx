import '../styles/globals.css'
import type { AppProps } from 'next/app'

import { SiteShell } from '@/components/site-shell'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SiteShell>
      <Component {...pageProps} />
    </SiteShell>
  )
}
