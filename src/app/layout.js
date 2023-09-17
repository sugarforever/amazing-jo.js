
import './globals.css';
import { Inter } from 'next/font/google';
import { getServerSession } from "next-auth/next"
import { authOptions } from "pages/api/auth/[...nextauth]"
import Link from 'next/link';
import { Analytics } from '@vercel/analytics/react';

const inter = Inter({ subsets: ['latin'] })

const pages = ['Prompts'];
const settings = ['Logout'];

export const metadata = {
  title: "Amazing JO",
  description: "Amazing JO is the AI driven services hub that provides useful features to customers.",
}

export default async function RootLayout({ children }) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="flex flex-col items-center justify-between bg-gray-100">
          <ul className="flex flex-row gap-3 h-[60px] items-center text-blue-600">
            <li><Link className="underline" href="/prompts">Prompts</Link></li>
            <li><Link className="underline" href="/tokens">Tokens</Link></li>
            <li>🥷🏼 {session?.user?.name} </li>
            {!session?.user?.name && (
              <li><Link className="underline" href="/api/auth/signin">sign in</Link></li>
            )}
            {session?.user?.name && (
              <li><Link className="underline" href="/api/auth/signout">sign out</Link></li>
            )}
          </ul>
        </header>
        <main>
          {children}
          <Analytics />
        </main>
      </body>
    </html>
  )
}
