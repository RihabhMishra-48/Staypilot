'use client';

import * as React from 'react';
import { Sidebar } from './sidebar';
import { TopNav } from './top-nav';
import { Property, Profile } from '@/types';

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  initialProperties: (Property & { role?: string })[];
  userProfile: Profile | null;
  isConfigured: boolean;
}

export const PropertyContext = React.createContext<{
  currentProperty: Property | null;
  setCurrentProperty: (prop: Property) => void;
  properties: (Property & { role?: string })[];
  setProperties: React.Dispatch<React.SetStateAction<(Property & { role?: string })[]>>;
  isConfigured: boolean;
}>({
  currentProperty: null,
  setCurrentProperty: () => {},
  properties: [],
  setProperties: () => {},
  isConfigured: false,
});

export function usePropertyContext() {
  return React.useContext(PropertyContext);
}

export function DashboardLayoutClient({
  children,
  initialProperties,
  userProfile,
  isConfigured,
}: DashboardLayoutClientProps) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [properties, setProperties] = React.useState<(Property & { role?: string })[]>(
    initialProperties
  );

  // Active property (null if none configured yet)
  const [currentProperty, setCurrentProperty] = React.useState<Property | null>(() => {
    return initialProperties.length > 0 ? initialProperties[0] : null;
  });

  return (
    <PropertyContext.Provider
      value={{
        currentProperty,
        setCurrentProperty,
        properties,
        setProperties,
        isConfigured,
      }}
    >
      <div className="flex h-screen w-full bg-zinc-50 overflow-hidden text-zinc-900 antialiased selection:bg-blue-100 selection:text-blue-900">
        {/* Persistent Sidebar */}
        <Sidebar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden min-w-0">
          <TopNav
            onOpenMobile={() => setMobileOpen(true)}
            properties={properties}
            currentProperty={currentProperty}
            onSelectProperty={setCurrentProperty}
            profile={userProfile}
          />

          <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </PropertyContext.Provider>
  );
}
