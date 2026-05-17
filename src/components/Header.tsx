import { Button, Tooltip } from 'tdesign-react';
import { 
  SunnyIcon,
  MoonIcon,
  MenuFoldIcon,
  MenuUnfoldIcon,
} from 'tdesign-icons-react';
import APP_CONFIG from '../config';
import { Session, Agent, Theme } from '../types';
import { Model } from '../types';

interface HeaderProps {
  isSettingsPage: boolean;
  sidebarOpen: boolean;
  theme: Theme;
  currentSession: Session | undefined;
  currentAgent: Agent | undefined;
  models: Model[];
  onToggleSidebar: () => void;
  onToggleTheme: () => void;
  onRefreshModels: () => void;
}

export function Header({
  isSettingsPage,
  sidebarOpen,
  theme,
  currentSession,
  onToggleSidebar,
  onToggleTheme,
}: HeaderProps) {
  const logoSrc = theme === 'dark' ? APP_CONFIG.logoDark : APP_CONFIG.logoColor;

  return (
    <header 
      className="h-14 flex justify-between items-center px-4 flex-shrink-0"
      style={{ 
        backgroundColor: 'var(--td-bg-color-page)',
        borderBottom: '1px solid var(--td-component-border)',
      }}
    >
      <div className="flex items-center gap-3">
        <Button
          variant="text"
          shape="circle"
          icon={sidebarOpen ? <MenuFoldIcon /> : <MenuUnfoldIcon />}
          onClick={onToggleSidebar}
        />
        {!isSettingsPage && (
          <div className="flex items-center gap-2">
            {/* 轻语头像：小LOGO圆形裁切 */}
            <div 
              className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--td-bg-color-component)' }}
            >
              <img
                src={logoSrc}
                alt={APP_CONFIG.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.style.display = 'none';
                  if (img.parentElement) {
                    img.parentElement.style.background = '#1a1a1a';
                    img.parentElement.style.color = '#fff';
                    img.parentElement.style.fontSize = '12px';
                    img.parentElement.style.fontWeight = '600';
                    img.parentElement.innerHTML = '轻';
                  }
                }}
              />
            </div>
            <h1 
              className="text-base font-medium"
              style={{ 
                color: 'var(--td-text-color-primary)',
                letterSpacing: '-0.01em',
              }}
            >
              {currentSession?.title || APP_CONFIG.description}
            </h1>
          </div>
        )}
        {isSettingsPage && (
          <h1 
            className="text-base font-medium"
            style={{ 
              color: 'var(--td-text-color-primary)',
              letterSpacing: '-0.01em',
            }}
          >
            设置
          </h1>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Tooltip content={theme === 'light' ? '切换到深色模式' : '切换到浅色模式'}>
          <Button
            variant="text"
            shape="circle"
            icon={theme === 'light' ? <MoonIcon /> : <SunnyIcon />}
            onClick={onToggleTheme}
          />
        </Tooltip>
        {/* 公司标识 */}
        <span 
          className="text-xs hidden md:block px-2.5 py-1 rounded-full"
          style={{ 
            color: 'var(--td-text-color-secondary)',
            backgroundColor: 'var(--td-bg-color-component)',
            fontSize: '11px',
          }}
        >
          {APP_CONFIG.company}
        </span>
      </div>
    </header>
  );
}
