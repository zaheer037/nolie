"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, User, LogOut } from "lucide-react"
import { usePathname } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const { user, signOut, loading } = useAuth()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ]

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-purple-900">NoLie AI</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === link.href ? "text-purple-900 font-semibold" : "text-gray-600 hover:text-purple-900"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {!loading && (
              <>
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={user.user_metadata?.avatar_url || "/placeholder.svg"}
                            alt={user.user_metadata?.full_name || user.email || "User"}
                          />
                          <AvatarFallback>
                            {user.user_metadata?.full_name
                              ? user.user_metadata.full_name
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .join("")
                                  .toUpperCase()
                                  .slice(0, 2)
                              : user.email?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuItem className="flex flex-col items-start">
                        <div className="font-medium">{user.user_metadata?.full_name || "User"}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="flex items-center">
                          <User className="mr-2 h-4 w-4" />
                          Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleSignOut} className="flex items-center">
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button asChild className="ml-4 bg-purple-900 hover:bg-purple-800">
                    <Link href="/auth">Sign In</Link>
                  </Button>
                )}
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-purple-900 focus:outline-none"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  pathname === link.href ? "text-purple-900 font-semibold" : "text-gray-600 hover:text-purple-900"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            {!loading && (
              <>
                {user ? (
                  <div className="border-t pt-4 mt-4">
                    <div className="px-3 py-2 text-sm text-gray-500">
                      {user.user_metadata?.full_name || "User"} ({user.email})
                    </div>
                    <Link
                      href="/profile"
                      className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-purple-900"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-3 py-2 text-base font-medium text-gray-600 hover:text-purple-900"
                    >
                      Sign out
                    </button>
                  </div>
                ) : (
                  <Button asChild className="w-full mt-4 bg-purple-900 hover:bg-purple-800">
                    <Link href="/auth">Sign In</Link>
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
