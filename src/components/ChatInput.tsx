import { useRef, useCallback } from 'react';
import { ChatSender } from '@tdesign-react/chat';
import { Model, PermissionMode } from '../types';
import APP_CONFIG from '../config';

interface ChatInputProps {
  inputValue: string;
  selectedModel: string;
  models: Model[];
  isLoading: boolean;
  permissionMode: PermissionMode;
  onSend: (message: string) => void;
  onStop: () => void;
  onChange: (value: string) => void;
  onModelChange: (modelId: string) => void;
  onPermissionModeChange: (mode: PermissionMode) => void;
}

export function ChatInput({
  inputValue,
  isLoading,
  onSend,
  onStop,
  onChange,
}: ChatInputProps) {
  const chatSenderRef = useRef<any>(null);

  const handleSend = useCallback((e: any) => {
    const content = e?.detail?.message || e?.detail || e?.message || inputValue;
    if (content && typeof content === 'string' && content.trim()) {
      onSend(content.trim());
    } else if (inputValue.trim()) {
      onSend(inputValue.trim());
    }
  }, [inputValue, onSend]);

  const handleChange = useCallback((e: any) => {
    const value = e?.detail ?? e ?? '';
    onChange(typeof value === 'string' ? value : '');
  }, [onChange]);

  return (
    <div 
      className="px-4 pb-6 pt-3"
      style={{ backgroundColor: 'var(--td-bg-color-page)' }}
    >
      <div className="max-w-3xl mx-auto">
        <ChatSender
          ref={chatSenderRef}
          value={inputValue}
          placeholder={`和${APP_CONFIG.name}说说心里话…`}
          loading={isLoading}
          autosize={{ minRows: 1, maxRows: 6 }}
          actions={['send']}
          onSend={handleSend}
          onStop={onStop}
          onChange={handleChange}
        >
          <div slot="footer-prefix" className="flex items-center gap-2">
            <span 
              className="text-xs px-2.5 py-1 rounded-full"
              style={{ 
                color: 'var(--td-text-color-placeholder)',
                backgroundColor: 'var(--td-bg-color-component)',
                fontSize: '11px',
              }}
            >
              {APP_CONFIG.company} · {APP_CONFIG.modelDisplayName}
            </span>
          </div>
        </ChatSender>
        <p 
          className="text-center text-xs mt-2"
          style={{ color: 'var(--td-text-color-placeholder)', fontSize: '11px' }}
        >
          你的每句话，{APP_CONFIG.name}都认真倾听 · 内容仅供情感交流参考
        </p>
      </div>
    </div>
  );
}
