import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { Home, Layers, Compass, Briefcase, BookOpen, Newspaper, Settings } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarSeparator,
  SidebarInput,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarMenuBadge,
} from "@/components/ui/sidebar";

export function AppSidebar(): JSX.Element {
  const { t } = useTranslation();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="h-6 w-6 rounded-md bg-gradient-to-br from-indigo-500 to-purple-500" />
          <span className="text-sm font-medium">{t('nav.home')}</span>
        </div>
        <SidebarInput placeholder={t('common.search')} />
      </SidebarHeader>
      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>{t('nav.home')}</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/app/dashboard">
                  <Home className="h-4 w-4" />
                  <span>{t('nav.dashboard')}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/app/chat">
                  <Layers className="h-4 w-4" />
                  <span>{t('nav.chat')}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/app/signals">
                  <Compass className="h-4 w-4" />
                  <span>{t('signals.title')}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Learning Resources */}
        <SidebarGroup>
          <SidebarGroupLabel>{t('nav.learning') || 'Learning'}</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/courses">
                  <BookOpen className="h-4 w-4" />
                  <span>{t('nav.courses') || 'Courses'}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/articles">
                  <Newspaper className="h-4 w-4" />
                  <span>{t('nav.articles') || 'Articles'}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Portfolio & Settings */}
        <SidebarGroup>
          <SidebarGroupLabel>{t('common.other')}</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/app/portfolio">
                  <Briefcase className="h-4 w-4" />
                  <span>{t('nav.portfolio')}</span>
                </Link>
              </SidebarMenuButton>
              <SidebarMenuBadge>Premium</SidebarMenuBadge>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/app/settings">
                  <Settings className="h-4 w-4" />
                  <span>{t('nav.settings')}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="px-2 text-xs text-muted-foreground">{t('landing.footer.tagline')}</div>
      </SidebarFooter>
    </Sidebar>
  );
}
