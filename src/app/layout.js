
import './globals.css';
import { Inter } from 'next/font/google';
import { getServerSession } from "next-auth/next"
import { authOptions } from "pages/api/auth/[...nextauth]"

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: "Amazing JO's Recipe",
  description: "Amazing JO's Recipe is the AI powered recipe parse engine.",
}

export default async function RootLayout({ children }) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="flex flex-col items-center justify-between bg-gray-100">
          <ul className="flex flex-row gap-3 h-[60px] items-center text-blue-600">
            <li>🥷🏼 {session?.user?.name} </li>
            {!session?.user?.name && (
              <li><a className="underline" href="/api/auth/signin">sign in</a></li>
            )}
            {session?.user?.name && (
              <li><a className="underline" href="/api/auth/signout">sign out</a></li>
            )}
          </ul>
        </header>
        <main>
          {children}
        </main>
      </body>
    </html>
  )
}
