'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Map,
  FolderKanban,
  FileSpreadsheet,
  MapPin,
  FileCheck2,
  HardHat,
  ClipboardCheck,
  CheckSquare2,
  Settings,
  ChevronRight,
  ArrowLeft,
  Users,
  Building2,
  Database,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';

interface NavItem {
  label: string;
  href: string;
  icon: any;
  children?: { label: string; href: string }[];
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

const globalNavigation: NavGroup[] = [
  {
    group: 'Main',
    items: [
      {
        label: 'Dashboard',
        href: '/',
        icon: LayoutDashboard,
      },
      {
        label: 'GIS Spatial Map',
        href: '/gis',
        icon: Map,
      },
    ]
  },
  {
    group: 'Projects',
    items: [
      {
        label: 'Project Master List',
        href: '/projects',
        icon: FolderKanban,
      },
    ]
  },
  {
    group: 'Master Data',
    items: [
      {
        label: 'Master Data',
        href: '/master-data',
        icon: Database,
        children: [
          {
            label: 'Bowheer (Client)',
            href: '/master-data/bowheer',
          },
          {
            label: 'Users',
            href: '/master-data/users',
          },
          {
            label: 'Materials',
            href: '/master-data/materials',
          },
          {
            label: 'Vendors',
            href: '/master-data/vendors',
          },
          {
            label: 'Warehouses',
            href: '/master-data/warehouses',
          },
          {
            label: 'Designator',
            href: '/master-data/designator',
          },
          {
            label: 'Alat Kerja',
            href: '/master-data/alat-kerja',
          },
        ],
      },
    ],
  },
];

function NavCollapsible({ item, pathname, counts }: { item: any, pathname: string, counts: any }) {
  const isItemActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
  const [open, setOpen] = React.useState(isItemActive);

  React.useEffect(() => {
    if (isItemActive) setOpen(true);
  }, [isItemActive]);

  const getBadgeForLabel = (label: string) => {
    if (label === 'Approvals Queue' && counts.approvals > 0) {
      return <Badge variant="destructive" className="ml-auto h-5 px-1.5 flex items-center justify-center text-xs">{counts.approvals}</Badge>;
    }
    return null;
  };

  const groupHasNotification = () => {
    if (item.label === 'Approvals Queue' && counts.approvals > 0) return true;
    return false;
  };

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <SidebarMenuButton 
          isActive={isItemActive} 
          tooltip={item.label}
          render={<CollapsibleTrigger />}
        >
          <item.icon />
          <span>{item.label}</span>
          {!open && groupHasNotification() && (
            <div className="w-2 h-2 rounded-full bg-destructive absolute right-10 top-1/2 -translate-y-1/2" />
          )}
          <ChevronRight className={`ml-auto transition-transform duration-200 ${open ? 'rotate-90' : ''}`} />
        </SidebarMenuButton>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.children?.map((child: any) => (
              <SidebarMenuSubItem key={child.label}>
                <SidebarMenuSubButton 
                  isActive={pathname === child.href}
                  render={<Link href={child.href} />}
                >
                  <span>{child.label}</span>
                  {getBadgeForLabel(child.label)}
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

export default function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [counts, setCounts] = React.useState<any>({ approvals: 0 });

  const currentNavigation = globalNavigation;

  React.useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await fetch('/api/notifications/counts');
        if (!res.ok) return;
        const json = await res.json();
        if (json.data) setCounts(json.data);
      } catch(e) {
        // Silently catch error while backend is missing
      }
    };
    fetchCounts();
  }, [pathname]);

  return (
    <Sidebar variant="sidebar" {...props}>
      <SidebarHeader className="border-b h-16 flex justify-center px-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center shrink-0">
            <Image
              src="/images/logo-pt-mitra-akses-insani.png"
              alt="Logo PT Mitra Akses Insani"
              width={40}
              height={40}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold tracking-tight text-primary">Proper</h1>
            <p className="text-xs text-muted-foreground leading-tight mt-0.5 font-medium">
              Project Performance App
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        {currentNavigation.map((group) => (
          <SidebarGroup key={group.group}>
            <SidebarGroupLabel className="text-xs font-semibold tracking-wider text-muted-foreground/70 uppercase px-3 mb-1">
              {group.group}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  if (item.children) {
                    return (
                      <NavCollapsible 
                        key={item.label} 
                        item={item} 
                        pathname={pathname} 
                        counts={counts}
                      />
                    );
                  }

                  const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
                  const Icon = item.icon;

                  return (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton 
                        isActive={isActive} 
                        tooltip={item.label}
                        render={<Link href={item.href} />}
                      >
                        <Icon />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t p-4 text-xs text-muted-foreground text-center">
        Proper Enterprise v1.0
      </SidebarFooter>
    </Sidebar>
  );
}
