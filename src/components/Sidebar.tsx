import { Button, Tooltip } from 'tdesign-react';
import { AddIcon, DeleteIcon, SettingIcon } from 'tdesign-icons-react';
import APP_CONFIG from '../config';
import { Session, Agent, Theme } from '../types';

interface SidebarProps {
  sessions: Session[];
  currentSessionId: string | null;
  isSettingsPage: boolean;
  sidebarOpen: boolean;
  theme: Theme;
  agents: Agent[];
  getAgent: (id: string) => Agent | undefined;
  onNewChat: () => void;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onOpenSettings: () => void;
}

export function Sidebar({
  sessions,
  currentSessionId,
  isSettingsPage,
  sidebarOpen,
  theme,
  onNewChat,
  onSelectSession,
  onDeleteSession,
  onOpenSettings,
}: SidebarProps) {
  const logoSrc = theme === 'dark' ? APP_CONFIG.logoDark : APP_CONFIG.logoColor;

  return (
    <aside 
      className="flex flex-col flex-shrink-0 transition-all duration-300 overflow-hidden"
      style={{ 
        width: sidebarOpen ? 260 : 0,
        backgroundColor: 'var(--td-bg-color-container)',
        borderRight: '1px solid var(--td-component-border)',
      }}
    >
      {/* Logo */}
      <div className="h-14 px-4 flex items-center flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <img
            src={logoSrc}
            alt={APP_CONFIG.name}
            className="h-8 w-auto object-contain"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.style.display = 'none';
            }}
          />
          <div>
            <span 
              className="text-base font-semibold block leading-tight"
              style={{ 
                color: 'var(--td-text-color-primary)',
                letterSpacing: '-0.01em',
              }}
            >
              {APP_CONFIG.name}
            </span>
            <span 
              className="text-xs leading-tight"
              style={{ color: 'var(--td-text-color-placeholder)' }}
            >
              {APP_CONFIG.subtitle}
            </span>
          </div>
        </div>
      </div>

      {/* 鏂板璇濇寜閽?*/}
      <div className="px-3 pb-2">
        <Button 
          icon={<AddIcon />}
          onClick={onNewChat}
          block
          variant="outline"
          style={{
            borderColor: 'var(--td-component-border)',
            color: 'var(--td-text-color-primary)',
            borderRadius: '10px',
          }}
        >
          鏂扮殑瀵硅瘽
        </Button>
      </div>

      {/* 浼氳瘽鍒楄〃 */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
        {sessions.length === 0 && (
          <div className="text-center py-10 px-4">
            <p className="text-xs" style={{ color: 'var(--td-text-color-placeholder)', lineHeight: '1.8' }}>
              鏆傛棤瀵硅瘽璁板綍<br />寮€濮嬩綘鐨勭涓€娆″€捐瘔
            </p>
          </div>
        )}
        {sessions.map(session => {
          const isActive = session.id === currentSessionId && !isSettingsPage;
          return (
            <div 
              key={session.id}
              className="flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-colors duration-150 group"
              style={{
                backgroundColor: isActive
                  ? 'var(--td-bg-color-component-active)'
                  : 'transparent',
                color: isActive
                  ? 'var(--td-text-color-primary)'
                  : 'var(--td-text-color-secondary)',
              }}
              onClick={() => onSelectSession(session.id)}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'var(--td-bg-color-component-hover)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span className="flex-1 truncate text-sm">{session.title}</span>
              <Tooltip content="鍒犻櫎">
                <Button
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  variant="text"
                  shape="circle"
                  size="small"
                  icon={<DeleteIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(session.id);
                  }}
                />
              </Tooltip>
            </div>
          );
        })}
      </div>
      
      {/* 搴曢儴锛氳缃?+ 鐗堟湰淇℃伅 */}
      <div 
        className="p-3 flex-shrink-0"
        style={{ borderTop: '1px solid var(--td-component-border)' }}
      >
        <Button 
          icon={<SettingIcon />}
          onClick={onOpenSettings}
          block
          variant={isSettingsPage ? 'base' : 'text'}
          theme={isSettingsPage ? 'default' : 'default'}
          style={{ borderRadius: '10px', marginBottom: '8px' }}
        >
          璁剧疆
        </Button>
        {/* 寮€鍙戣€呬俊鎭拰鐗堟湰鍙?*/}
        <div className="text-center">
          <p 
            className="text-xs"
            style={{ color: 'var(--td-text-color-placeholder)', fontSize: '11px' }}
          >
            {APP_CONFIG.developer}
          </p>
          <p 
            className="text-xs"
            style={{ color: 'var(--td-text-color-disabled)', fontSize: '11px' }}
          >
            v{APP_CONFIG.version}
          </p>
        </div>
      </div>
    </aside>
  );
}
