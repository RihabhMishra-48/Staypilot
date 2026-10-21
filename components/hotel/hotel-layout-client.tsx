'use client';

import * as React from 'react';
import { Property, Profile, PropertyRole } from '@/types';
import { HotelSidebar } from './hotel-sidebar';
import { HotelTopNav } from './hotel-top-nav';

interface HotelLayoutClientProps {
  children: React.ReactNode;
  properties: (Property & { role?: string })[];
  profile: Profile | null;
}

export const HotelPropertyContext = React.createContext<{
  currentProperty: Property | null;
  setCurrentProperty: (prop: Property) => void;
  properties: (Property & { role?: string })[];
}>({
  currentProperty: null,
  setCurrentProperty: () => {},
  properties: [],
});

export function useHotelProperty() {
  return React.useContext(HotelPropertyContext);
}

export function HotelLayoutClient({
  children,
  properties,
  profile,
}: HotelLayoutClientProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Default to first user property, or null if no property exists
  const [currentProperty, setCurrentProperty] = React.useState<Property | null>(() => {
    return properties.length > 0 ? properties[0] : null;
  });

  const userRole =
    (currentProperty as (Property & { role?: PropertyRole }) | null)?.role || 'manager';

  return (
    <HotelPropertyContext.Provider
      value={{
        currentProperty,
        setCurrentProperty,
        properties,
      }}
    >
      <div className="flex h-screen w-full overflow-hidden bg-zinc-50 font-sans text-zinc-900 antialiased">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:shrink-0">
          <HotelSidebar userRole={userRole} />
        </div>

        {/* Mobile Drawer Sidebar */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="fixed inset-0 bg-zinc-900/50 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 flex w-64 max-w-full">
              <HotelSidebar
                onCloseMobile={() => setMobileOpen(false)}
                userRole={userRole}
              />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <HotelTopNav
            onOpenMobile={() => setMobileOpen(true)}
            properties={properties}
            currentProperty={currentProperty}
            onSelectProperty={setCurrentProperty}
            profile={profile}
          />

          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </HotelPropertyContext.Provider>
  );
}
