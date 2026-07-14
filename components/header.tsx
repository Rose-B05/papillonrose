"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ShoppingBag, Heart, User, Menu, X } from "lucide-react"
import { useCart } from "@/components/cart-context"
import { useFavorites } from "@/components/favorites-context"

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || ""
const img = (path: string) => BASE + path
const PLACEHOLDER = img("/placeholder.svg")
const LOGO = img("/papillon-rose-logo.png")
const GOLD = "#C8A97E"
const DP = { fontFamily: "var(--font-playfair), serif" } as const

const NAV_ITEMS = [
  { label: "Accueil", href: "/" },
  { label: "Catalogue", href: "/catalogue" },
  { label: "Panier", href: "/reservation" },
  { label: "Favoris", href: "/favoris" },
  { label: "Contact", href: "/contact" },
] as const

export default function Header() {
  const pathname = usePathname()
  const { favorites } = useFavorites()
  const { items: cartItems, itemCount: cartCount } = useCart()
  const [scrolled, setScrolled] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setShowMenu(false)
  }, [pathname])

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  const isHome = pathname === "/"
  const opaque = isHome ? scrolled : true

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          opaque
            ? "bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 md:px-10 flex items-center justify-between h-16 md:h-20">
          <Link href="/" aria-label="Accueil Papillon Rose">
            <img
              src={LOGO || PLACEHOLDER}
              alt="Papillon Rose"
              className={`h-10 md:h-12 w-auto transition-all duration-500 ${
                opaque ? "" : "brightness-0 invert"
              }`}
            />
          </Link>

          <div className="hidden md:flex items-center gap-8 mr-8">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm transition-all duration-300 ${
                  isActive(item.href)
                    ? "font-bold " +
                      (opaque
                        ? "text-[#C8A97E] dark:text-amber-400"
                        : "text-white")
                    : opaque
                      ? "text-[#2E2E2E]/60 dark:text-neutral-400 hover:text-[#C8A97E] dark:hover:text-amber-400"
                      : "text-white/70 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <Link
              href="/favoris"
              aria-label="Favoris"
              className={`relative p-2 transition-colors ${
                opaque
                  ? "hover:text-[#C8A97E] dark:hover:text-amber-400"
                  : "hover:text-white"
              }`}
            >
              <Heart
                size={19}
                fill={favorites.size > 0 ? GOLD : "none"}
                className={
                  favorites.size > 0
                    ? "text-[#C8A97E] dark:text-amber-400"
                    : opaque
                      ? "text-[#2E2E2E]/40 dark:text-neutral-500"
                      : "text-white/80"
                }
              />
              {favorites.size > 0 && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-[#C8A97E] dark:bg-amber-600 text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                  {favorites.size}
                </span>
              )}
            </Link>
            <a
              href="/reservation"
              className="relative p-2 hover:text-[#C8A97E] dark:hover:text-amber-400 transition-colors"
              aria-label="Panier"
            >
              <ShoppingBag
                size={19}
                className={
                  cartCount > 0
                    ? "text-[#C8A97E] dark:text-amber-400"
                    : opaque
                      ? "text-[#2E2E2E]/40 dark:text-neutral-500"
                      : "text-white/80"
                }
              />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-[#C8A97E] dark:bg-amber-600 text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </a>
            <a
              href="/compte"
              className={`relative p-2 transition-colors ${
                opaque
                  ? "hover:text-[#C8A97E] dark:hover:text-amber-400"
                  : "hover:text-white"
              }`}
              aria-label="Mon compte"
            >
              <User
                size={19}
                className={
                  opaque
                    ? "text-[#2E2E2E]/40 dark:text-neutral-500"
                    : "text-white/80"
                }
              />
            </a>
            <button
              onClick={() => setShowMenu(true)}
              aria-label="Menu"
              className={`md:hidden p-2 ${
                opaque
                  ? "text-[#2E2E2E]/60 dark:text-neutral-400"
                  : "text-white/80"
              }`}
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          onClick={() => setShowMenu(false)}
        >
          <div
            className="absolute right-0 top-0 bottom-0 w-72 bg-white dark:bg-neutral-800 rounded-l-3xl shadow-2xl p-8 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-10">
              <img
                src={LOGO || PLACEHOLDER}
                alt="Papillon Rose"
                className="h-9 w-auto"
              />
              <button
                onClick={() => setShowMenu(false)}
                aria-label="Fermer le menu"
                className="w-8 h-8 bg-gray-100 dark:bg-neutral-800 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex flex-col gap-5">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setShowMenu(false)}
                  className={`text-left transition-colors text-lg ${
                    isActive(item.href)
                      ? "font-bold text-[#C8A97E] dark:text-amber-400"
                      : "text-[#2E2E2E]/70 dark:text-neutral-300 hover:text-[#C8A97E] dark:hover:text-amber-400"
                  }`}
                  style={DP}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="mt-auto text-sm text-[#2E2E2E]/35 space-y-1">
              <p>papillonrosebertha@gmail.com</p>
              <p className="text-xs italic">Tél. temporairement indisponible</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
