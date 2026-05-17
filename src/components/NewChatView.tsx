import { useState } from 'react';
import APP_CONFIG from '../config';
import { Model, Agent, PermissionMode } from '../types';
import { Select, Tooltip } from 'tdesign-react';
import { Bot, Sparkles, Code, FileText, Globe, Lightbulb } from 'lucide-react';

interface NewChatViewProps {
  agents: Agent[];
  models: Model[];
  selectedModel: string;
  newChatAgentId: string;
  newChatCwd: string;
  newChatPermissionMode: PermissionMode;
  onSelectModel: (modelId: string) => void;
  onSelectAgent: (agentId: string) => void;
  onSetCwd: (cwd: string) => void;
  onSetPermissionMode: (mode: PermissionMode) => void;
  theme?: string;
}

// 情感引导问句（无emoji）
const EMOTION_STARTERS = [
  "今天过得怎么样？有什么想聊聊的吗？",
  "最近有什么开心或烦恼的事吗？",
  "你现在心情如何？我在这里陪着你。",
  "遇到什么让你想倾诉的事了吗？",
];

// Agent图标映射
const AGENT_ICONS: Record<string, any> = {
  Bot,
  Sparkles,
  Code,
  FileText,
  Globe,
  Lightbulb,
};

export function NewChatView({
  agents,
  selectedModel,
  newChatAgentId,
  theme,
  onSelectModel,
  onSelectAgent,
}: NewChatViewProps) {
  const logoSrc = theme === 'dark' ? APP_CONFIG.logoDark : APP_CONFIG.logoColor;

  // 获取Agent图标组件
  const getAgentIcon = (iconName: string) => {
    return AGENT_ICONS[iconName] || Bot;
  };

  // 获取当前选中的Agent
  const selectedAgent = agents.find(a => a.id === newChatAgentId) || agents[0];

  return (
    <div className="flex flex-col items-center justify-center h-full px-4">
      <div className="w-full max-w-md text-center">
        {/* Logo 区域 */}
        <div className="mb-8">
          <div className="flex justify-center mb-4">
            <div 
              className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center shadow-sm"
              style={{ backgroundColor: 'var(--td-bg-color-component)' }}
            >
              <img
                src={logoSrc}
                alt={APP_CONFIG.name}
                className="w-full h-full object-contain p-2"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.style.display = 'none';
                  if (img.parentElement) {
                    img.parentElement.style.background = '#1a1a1a';
                    img.parentElement.innerHTML = `<span style="color:#fff;font-size:28px;font-weight:700;font-family:system-ui">${APP_CONFIG.name}</span>`;
                  }
                }}
              />
            </div>
          </div>
          <h2 
            className="text-2xl font-semibold mb-1"
            style={{ 
              color: 'var(--td-text-color-primary)',
              letterSpacing: '-0.02em',
            }}
          >
            {APP_CONFIG.name}
          </h2>
          <p 
            className="text-sm"
            style={{ color: 'var(--td-text-color-secondary)' }}
          >
            {APP_CONFIG.subtitle}
          </p>
        </div>

        {/* Agent 选择器 */}
        <div className="mb-6 px-4">
          <div 
            className="p-4 rounded-xl"
            style={{ 
              backgroundColor: 'var(--td-bg-color-component)',
              border: '1px solid var(--td-component-border)'
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              {/* 当前选中Agent的头像 */}
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: selectedAgent?.color || '#0052d9' }}
              >
                {(() => {
                  const IconComponent = getAgentIcon(selectedAgent?.icon || 'Bot');
                  return <IconComponent size={20} color="white" />;
                })()}
              </div>
              <div className="flex-1 text-left">
                <div 
                  className="text-sm font-medium"
                  style={{ color: 'var(--td-text-color-primary)' }}
                >
                  {selectedAgent?.name || '选择 Agent'}
                </div>
                <div 
                  className="text-xs truncate"
                  style={{ color: 'var(--td-text-color-placeholder)' }}
                >
                  {selectedAgent?.description || selectedAgent?.systemPrompt?.slice(0, 40) + '...'}
                </div>
              </div>
            </div>
            
            {/* Agent下拉选择器 */}
            <Select
              value={newChatAgentId}
              onChange={(value) => onSelectAgent(value as string)}
              style={{ width: '100%' }}
              placeholder="选择 Agent"
              size="large"
            >
              {agents.map(agent => {
                const IconComponent = getAgentIcon(agent.icon || 'Bot');
                return (
                  <Select.Option 
                    key={agent.id} 
                    value={agent.id}
                    label={agent.name}
                  >
                    <div className="flex items-center gap-2 py-1">
                      <div 
                        className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: agent.color || '#0052d9' }}
                      >
                        <IconComponent size={14} color="white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate" style={{ color: 'var(--td-text-color-primary)' }}>
                          {agent.name}
                        </div>
                        <div className="text-xs truncate" style={{ color: 'var(--td-text-color-placeholder)' }}>
                          {agent.description || '无描述'}
                        </div>
                      </div>
                    </div>
                  </Select.Option>
                );
              })}
            </Select>
          </div>
        </div>

        {/* 轻语问候 */}
        <div 
          className="p-5 rounded-2xl mb-6 text-left mx-4"
          style={{ 
            backgroundColor: 'var(--td-bg-color-component)',
          }}
        >
          <div className="flex items-center gap-2.5 mb-3">
            <div 
              className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--td-bg-color-container)' }}
            >
              <img
                src={logoSrc}
                alt={APP_CONFIG.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.style.display = 'none';
                  if (img.parentElement) {
                    img.parentElement.innerHTML = `<span style="font-size:12px;font-weight:600;color:var(--td-text-color-primary)">${APP_CONFIG.nameInitial}</span>`;
                  }
                }}
              />
            </div>
            <span 
              className="text-sm font-medium"
              style={{ color: 'var(--td-text-color-primary)' }}
            >
              {APP_CONFIG.name}
            </span>
            <span 
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ 
                color: 'var(--td-text-color-secondary)',
                backgroundColor: 'var(--td-bg-color-container)',
              }}
            >
              AI情感伴侣
            </span>
          </div>
          <p 
            className="text-sm leading-relaxed"
            style={{ color: 'var(--td-text-color-secondary)', lineHeight: '1.8' }}
          >
            你好，我是{selectedAgent?.name || '轻语'}，你的专属情感伴侣。<br/>
            无论是喜悦还是烦恼，我都在这里倾听。<br/>
            在下方输入你想说的话，我们就开始吧。
          </p>
        </div>

        {/* 快捷话题 */}
        <div className="mb-6">
          <p 
            className="text-xs mb-3"
            style={{ color: 'var(--td-text-color-placeholder)' }}
          >
            你也可以试着说……
          </p>
          <div className="grid grid-cols-2 gap-2 mx-4">
            {EMOTION_STARTERS.map((starter, index) => (
              <div
                key={index}
                className="px-3 py-2.5 rounded-xl text-sm cursor-pointer transition-all text-left"
                style={{
                  backgroundColor: 'var(--td-bg-color-component)',
                  color: 'var(--td-text-color-secondary)',
                  border: '1px solid transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--td-border-color-focus)';
                  e.currentTarget.style.color = 'var(--td-text-color-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.color = 'var(--td-text-color-secondary)';
                }}
              >
                {starter}
              </div>
            ))}
          </div>
        </div>

        {/* 底部提示 */}
        <p 
          className="text-xs"
          style={{ color: 'var(--td-text-color-placeholder)', fontSize: '11px' }}
        >
          你的每次倾诉，都在安全、私密的环境中进行
        </p>
      </div>
    </div>
  );
}
