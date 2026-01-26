'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Users, BarChart3, LogOut, Menu, X, Home, GraduationCap, FileText, HelpCircle, ChevronDown, Settings, Sun, Moon, Monitor } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/components/ThemeProvider';

export default function Navigation() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => pathname === path || pathname?.startsWith(path);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setMoreMenuOpen(false);
      }
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
        setThemeMenuOpen(false);
      }
    }

    if (moreMenuOpen || themeMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [moreMenuOpen, themeMenuOpen]);

  // Show loading state while session is being determined
  if (status === 'loading') {
    return (
      <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Grading App
                </h1>
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  if (!session) {
    return (
      <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-lg group-hover:scale-105 transition-transform">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Grading App
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">Web Design Course</p>
              </div>
            </Link>
            <div className="hidden md:flex items-center space-x-4">
              <ThemeToggle theme={theme} setTheme={setTheme} resolvedTheme={resolvedTheme} themeMenuOpen={themeMenuOpen} setThemeMenuOpen={setThemeMenuOpen} themeMenuRef={themeMenuRef} />
              <Link
                href="/auth/signin"
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signin"
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
              >
                Get Started
              </Link>
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <div className="px-4 py-4 space-y-2">
              <div className="px-4 py-2">
                <ThemeToggle theme={theme} setTheme={setTheme} resolvedTheme={resolvedTheme} themeMenuOpen={themeMenuOpen} setThemeMenuOpen={setThemeMenuOpen} themeMenuRef={themeMenuRef} />
              </div>
              <Link
                href="/auth/signin"
                className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
            </div>
          </div>
        )}
      </nav>
    );
  }

  const isStudent = session.user?.role === 'student';
  const isInstructor = session.user?.role === 'instructor';
  const isAdmin = session.user?.role === 'admin';

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href={isStudent ? "/student" : isInstructor ? "/instructor" : "/"} className="flex items-center space-x-3 group">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-lg group-hover:scale-105 transition-transform">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Grading App
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                {isStudent ? 'Student Portal' : isInstructor ? 'Instructor Portal' : 'Web Design Course'}
              </p>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {isAdmin && (
              <>
                <NavLink href="/admin" icon={Home} label="Dashboard" isActive={isActive('/admin') && pathname === '/admin'} />
                <NavLink href="/admin/courses" icon={BookOpen} label="Courses" isActive={isActive('/admin/courses')} />
                <NavLink href="/admin/instructors" icon={Users} label="Instructors" isActive={isActive('/admin/instructors')} />
                <NavLink href="/students" icon={Users} label="Students" isActive={isActive('/students')} />
                <NavLink href="/cohorts" icon={Users} label="Cohorts" isActive={isActive('/cohorts')} />
                <NavLink href="/instructor/grades" icon={BarChart3} label="Grades" isActive={isActive('/instructor/grades') || isActive('/grades')} />
                <MoreMenu
                  isOpen={moreMenuOpen}
                  setIsOpen={setMoreMenuOpen}
                  menuRef={moreMenuRef}
                  pathname={pathname}
                  items={[
                    { href: '/instructor/resources', icon: FileText, label: 'Resources' },
                  ]}
                  isActive={isActive}
                />
              </>
            )}
            {isStudent && (
              <>
                <NavLink href="/student" icon={Home} label="Dashboard" isActive={isActive('/student') && pathname === '/student'} />
                <NavLink href="/student/courses" icon={BookOpen} label="Courses" isActive={isActive('/student/courses') || isActive('/student/course')} />
                <NavLink href="/student/grades" icon={BarChart3} label="Grades" isActive={isActive('/student/grades')} />
              </>
            )}
            {isInstructor && (
              <>
                <NavLink href="/instructor" icon={Home} label="Dashboard" isActive={isActive('/instructor') && pathname === '/instructor'} />
                <NavLink href="/instructor/courses" icon={BookOpen} label="Courses" isActive={isActive('/instructor/courses')} />
                <StudentsMenu
                  isActive={isActive}
                  pathname={pathname}
                />
                <NavLink href="/cohorts" icon={Users} label="Cohorts" isActive={isActive('/cohorts')} />
                <NavLink href="/instructor/grades" icon={BarChart3} label="Grades" isActive={isActive('/instructor/grades') || isActive('/grades')} />
                <MoreMenu
                  isOpen={moreMenuOpen}
                  setIsOpen={setMoreMenuOpen}
                  menuRef={moreMenuRef}
                  pathname={pathname}
                  items={[
                    { href: '/instructor/resources', icon: FileText, label: 'Resources' },
                  ]}
                  isActive={isActive}
                />
              </>
            )}
            <ThemeToggle theme={theme} setTheme={setTheme} resolvedTheme={resolvedTheme} themeMenuOpen={themeMenuOpen} setThemeMenuOpen={setThemeMenuOpen} themeMenuRef={themeMenuRef} />
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden lg:inline">Sign Out</span>
            </button>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="px-4 py-4 space-y-2">
            {isAdmin && (
              <>
                <MobileNavLink href="/admin" icon={Home} label="Dashboard" onClick={() => setMobileMenuOpen(false)} />
                <MobileNavLink href="/admin/courses" icon={BookOpen} label="Courses" onClick={() => setMobileMenuOpen(false)} />
                <MobileNavLink href="/admin/instructors" icon={Users} label="Instructors" onClick={() => setMobileMenuOpen(false)} />
                <MobileNavLink href="/students" icon={Users} label="Students" onClick={() => setMobileMenuOpen(false)} />
                <MobileNavLink href="/cohorts" icon={Users} label="Cohorts" onClick={() => setMobileMenuOpen(false)} />
                <MobileNavLink href="/instructor/grades" icon={BarChart3} label="Grades" onClick={() => setMobileMenuOpen(false)} />
              </>
            )}
            {isStudent && (
              <>
                <MobileNavLink href="/student" icon={Home} label="Dashboard" onClick={() => setMobileMenuOpen(false)} />
                <MobileNavLink href="/student/courses" icon={BookOpen} label="Courses" onClick={() => setMobileMenuOpen(false)} />
                <MobileNavLink href="/student/grades" icon={BarChart3} label="Grades" onClick={() => setMobileMenuOpen(false)} />
              </>
            )}
            {isInstructor && (
              <>
                <MobileNavLink href="/instructor" icon={Home} label="Dashboard" onClick={() => setMobileMenuOpen(false)} />
                <MobileNavLink href="/instructor/courses" icon={BookOpen} label="Courses" onClick={() => setMobileMenuOpen(false)} />
                <MobileNavLink href="/instructor/students" icon={Users} label="My Students" onClick={() => setMobileMenuOpen(false)} />
                <MobileNavLink href="/students" icon={Users} label="All Students" onClick={() => setMobileMenuOpen(false)} />
                <MobileNavLink href="/cohorts" icon={Users} label="Cohorts" onClick={() => setMobileMenuOpen(false)} />
                <MobileNavLink href="/instructor/grades" icon={BarChart3} label="Grades" onClick={() => setMobileMenuOpen(false)} />
                <div className="border-t border-gray-200 my-2"></div>
                <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">More</div>
                <MobileNavLink href="/instructor/resources" icon={FileText} label="Resources" onClick={() => setMobileMenuOpen(false)} />
              </>
            )}
            <div className="px-4 py-2">
              <ThemeToggle theme={theme} setTheme={setTheme} resolvedTheme={resolvedTheme} themeMenuOpen={themeMenuOpen} setThemeMenuOpen={setThemeMenuOpen} themeMenuRef={themeMenuRef} />
            </div>
            <button
              onClick={() => {
                signOut({ callbackUrl: '/' });
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center space-x-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

function ThemeToggle({
  theme,
  setTheme,
  resolvedTheme,
  themeMenuOpen,
  setThemeMenuOpen,
  themeMenuRef,
}: {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  resolvedTheme: 'light' | 'dark';
  themeMenuOpen: boolean;
  setThemeMenuOpen: (open: boolean) => void;
  themeMenuRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <div className="relative" ref={themeMenuRef}>
      <button
        onClick={() => setThemeMenuOpen(!themeMenuOpen)}
        className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Toggle theme"
      >
        {resolvedTheme === 'dark' ? (
          <Moon className="h-5 w-5" />
        ) : (
          <Sun className="h-5 w-5" />
        )}
      </button>

      {themeMenuOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
          <button
            onClick={() => {
              setTheme('light');
              setThemeMenuOpen(false);
            }}
            className={`w-full flex items-center space-x-3 px-4 py-2 text-sm transition-colors ${
              theme === 'light'
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Sun className="h-4 w-4" />
            <span>Light</span>
          </button>
          <button
            onClick={() => {
              setTheme('dark');
              setThemeMenuOpen(false);
            }}
            className={`w-full flex items-center space-x-3 px-4 py-2 text-sm transition-colors ${
              theme === 'dark'
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Moon className="h-4 w-4" />
            <span>Dark</span>
          </button>
          <button
            onClick={() => {
              setTheme('system');
              setThemeMenuOpen(false);
            }}
            className={`w-full flex items-center space-x-3 px-4 py-2 text-sm transition-colors ${
              theme === 'system'
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Monitor className="h-4 w-4" />
            <span>System</span>
          </button>
        </div>
      )}
    </div>
  );
}

function NavLink({ href, icon: Icon, label, isActive }: { href: string; icon: any; label: string; isActive: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
        isActive
          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
          : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800'
      }`}
    >
      <Icon className="h-4 w-4" />
      <span className="font-medium">{label}</span>
    </Link>
  );
}

function MobileNavLink({ href, icon: Icon, label, onClick }: { href: string; icon: any; label: string; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </Link>
  );
}

function StudentsMenu({
  isActive,
  pathname,
}: {
  isActive: (path: string) => boolean;
  pathname: string | null;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const studentsActive = isActive('/instructor/students') || isActive('/students');

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <Link
        href="/instructor/students"
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
          studentsActive
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
            : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800'
        }`}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        <Users className="h-4 w-4" />
        <span className="font-medium">Students</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Link>

      {isOpen && (
        <div
          className="absolute left-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          <Link
            href="/instructor/students"
            onClick={() => setIsOpen(false)}
            className={`flex items-center space-x-2 px-4 py-2 text-sm transition-colors ${
              isActive('/instructor/students')
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>My Students</span>
          </Link>
          <Link
            href="/students"
            onClick={() => setIsOpen(false)}
            className={`flex items-center space-x-2 px-4 py-2 text-sm transition-colors ${
              isActive('/students')
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>All Students</span>
          </Link>
        </div>
      )}
    </div>
  );
}

function MoreMenu({
  isOpen,
  setIsOpen,
  menuRef,
  pathname,
  items,
  isActive,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  menuRef: React.RefObject<HTMLDivElement>;
  pathname: string | null;
  items: Array<{ href: string; icon: any; label: string }>;
  isActive: (path: string) => boolean;
}) {
  const hasActiveItem = items.some((item) => isActive(item.href));

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
          hasActiveItem
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
            : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800'
        }`}
      >
        <Settings className="h-4 w-4" />
        <span className="font-medium">More</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
          {items.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-2 px-4 py-2 text-sm transition-colors ${
                  active
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

