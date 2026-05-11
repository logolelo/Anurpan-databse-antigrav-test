import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, ChevronDown, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { CartDrawer } from '@/components/CartDrawer';
import { CATEGORIES, COLLECTIONS, type MainCategory } from '@/lib/constants';
import { isAuthenticated, getIdTokenClaims, logout } from '@/lib/auth';

export function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [megaMenuOpen, setMegaMenuOpen] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      navigate(`/products?q=${encodeURIComponent(q)}`);
      setSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-primary border-b border-primary-foreground/10">
      {/* Top bar */}
      <div className="bg-[#C89641] text-[#4a2c1d] text-center py-1.5 text-xs font-body font-semibold tracking-wide border-b border-[#C89641]/10">
        Free Shipping on Orders Above ₹9999 | 7 Days Easy Returns
      </div>

      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden text-primary-foreground hover:bg-primary-foreground/10">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 flex flex-col bg-primary border-primary-foreground/10">
              <SheetTitle className="font-display text-xl text-secondary">Anurpan Jewellery</SheetTitle>
              <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide">
                <nav className="mt-6 space-y-6 pb-8">
                  {(Object.keys(CATEGORIES) as MainCategory[]).map((cat) => (
                    <div key={cat}>
                      <p className="font-display font-semibold text-secondary mb-2">{cat}</p>
                      <div className="pl-4 space-y-4">
                        {Object.entries(CATEGORIES[cat]).map(([group, items]) => (
                          <div key={group}>
                            <p className="text-[10px] uppercase tracking-widest text-primary-foreground/60 font-semibold mb-1">{group}</p>
                            <div className="space-y-1">
                              {items.map((sub) => (
                                <Link key={sub} to={`/products?category=${encodeURIComponent(cat)}&sub=${encodeURIComponent(sub)}`} className="block py-1 text-sm text-primary-foreground/80 hover:text-secondary transition-colors">
                                  {sub}
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div>
                    <p className="font-display font-semibold text-secondary mb-2">Collections</p>
                    <div className="pl-4 space-y-1">
                      {COLLECTIONS.map((col) => (
                        <Link key={col} to={`/products?collection=${encodeURIComponent(col)}`} className="block py-1 text-sm text-primary-foreground/80 hover:text-secondary transition-colors">
                          {col}
                        </Link>
                      ))}
                    </div>
                  </div>
                </nav>
              </div>

              {/* Bottom Auth Section */}
              <div className="mt-auto pt-6 border-t border-primary-foreground/10">
                {isAuthenticated() ? (
                  <div className="space-y-2">
                    <Link to="/account" className="flex items-center gap-3 py-3 px-4 rounded-xl bg-primary-foreground/5 text-sm font-medium text-primary-foreground hover:bg-primary-foreground/10 transition-all">
                      <User className="h-5 w-5 text-secondary" />
                      <div className="flex flex-col">
                        <span className="text-xs text-primary-foreground/60 font-normal">Welcome back,</span>
                        <span className="truncate max-w-[180px]">
                          {(getIdTokenClaims()?.["name"] as string) || (getIdTokenClaims()?.["email"] as string) || "Account"}
                        </span>
                      </div>
                    </Link>
                    <button onClick={() => logout("/")} className="flex items-center gap-3 py-3 px-4 w-full text-left text-sm font-medium text-primary-foreground/60 hover:text-secondary transition-colors">
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                ) : (
                  <Link to="/login" className="flex items-center justify-between py-4 px-4 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-all group">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5" />
                      <span className="font-semibold">Log in</span>
                    </div>
                    <ChevronDown className="h-4 w-4 -rotate-90 opacity-60 group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link to="/" className="inline-flex items-center">
            <img 
              src="/Anurpan Jewellery Logo.png" 
              alt="Anurpan Jewellery" 
              className="h-12 lg:h-14 w-auto" 
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {(Object.keys(CATEGORIES) as MainCategory[]).map((cat) => (
              <div
                key={cat}
                className="relative"
                onMouseEnter={() => setMegaMenuOpen(cat)}
                onMouseLeave={() => setMegaMenuOpen(null)}
              >
                <button className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-primary-foreground/90 hover:text-secondary transition-colors">
                  {cat} <ChevronDown className="h-3 w-3" />
                </button>
                {megaMenuOpen === cat && (
                  <div className="absolute top-full left-0 bg-card rounded-lg shadow-xl border border-border p-6 min-w-[320px] animate-in fade-in-0 slide-in-from-top-2 duration-200">
                    <div className="space-y-6">
                      {Object.entries(CATEGORIES[cat]).map(([group, items]) => (
                        <div key={group}>
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-3 border-b border-border pb-1">
                            {group}
                          </p>
                          <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                            {items.map((sub) => (
                              <Link 
                                key={sub} 
                                to={`/products?category=${encodeURIComponent(cat)}&sub=${encodeURIComponent(sub)}`} 
                                className="py-1.5 text-sm text-muted-foreground hover:text-primary transition-colors whitespace-nowrap"
                              >
                                {sub}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div
              className="relative"
              onMouseEnter={() => setMegaMenuOpen('collections')}
              onMouseLeave={() => setMegaMenuOpen(null)}
            >
              <button className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-primary-foreground/90 hover:text-secondary transition-colors">
                Collections <ChevronDown className="h-3 w-3" />
              </button>
              {megaMenuOpen === 'collections' && (
                <div className="absolute top-full left-0 bg-card rounded-lg shadow-xl border border-border p-6 min-w-[220px] animate-in fade-in-0 slide-in-from-top-2 duration-200">
                  {COLLECTIONS.map((col) => (
                    <Link key={col} to={`/products?collection=${encodeURIComponent(col)}`} className="block py-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                      {col}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search jewellery..."
                  className="w-40 lg:w-64 h-9 text-sm bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 focus-visible:ring-secondary"
                  autoFocus
                />
                <Button type="submit" size="sm" className="h-9 bg-secondary hover:bg-secondary/90 text-secondary-foreground">Go</Button>
                <Button variant="ghost" size="icon" onClick={() => setSearchOpen(false)} className="text-primary-foreground hover:bg-primary-foreground/10">
                  <X className="h-4 w-4" />
                </Button>
              </form>
            ) : (
              <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)} className="text-primary-foreground hover:bg-primary-foreground/10">
                <Search className="h-5 w-5" />
              </Button>
            )}
            {isAuthenticated() ? (
              <div className="hidden lg:flex items-center gap-2">
                <Link to="/account">
                  <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10" title={(getIdTokenClaims()?.["name"] as string) || (getIdTokenClaims()?.["email"] as string) || "Account"}>
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10" onClick={() => logout("/")} title="Sign out">
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <Link to="/login" className="hidden lg:block">
                <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10" title="Log in">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            )}
            <div className="text-primary-foreground">
              <CartDrawer />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
