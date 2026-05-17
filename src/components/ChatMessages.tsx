import { Loading } from 'tdesign-react';
import { ChatMarkdown } from '@tdesign-react/chat';
import { User } from 'lucide-react';
import { Message, Model, PermissionRequest, ContentBlock } from '../types';
import APP_CONFIG from '../config';

interface ChatMessagesProps {
  messages: Message[];
  models: Model[];
  messagesEndRef: React.RefObject<HTMLDivElement>;
  permissionRequest?: PermissionRequest | null;
  theme?: string;
  onPermissionAllow?: () => void;
  onPermissionDeny?: () => void;
}

export function ChatMessages({ 
  messages, 
  models, 
  messagesEndRef,
  theme,
}: ChatMessagesProps) {
  const logoSrc = theme === 'dark' ? APP_CONFIG.logoDark : APP_CONFIG.logoColor;

  // 渲染单个内容块
  const renderContentBlock = (block: ContentBlock, index: number, isStreaming?: boolean, isLast?: boolean) => {
    if (block.type === 'text') {
      return (
        <div 
          key={`text-${index}`}
          className="px-4 py-3 leading-relaxed break-words"
          style={{
            backgroundColor: 'var(--td-bg-color-component)',
            color: 'var(--td-text-color-primary)',
            borderRadius: '16px 16px 16px 4px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            fontSize: '14px',
            lineHeight: '1.7',
          }}
        >
          <div className="chat-markdown">
            <ChatMarkdown content={block.text} />
          </div>
          {isStreaming && isLast && (
            <span 
              className="animate-cursor-blink ml-0.5"
              style={{ color: 'var(--td-text-color-secondary)' }}
            >
              |
            </span>
          )}
        </div>
      );
    }
    return null;
  };

  // 渲染 assistant 消息内容
  const renderAssistantContent = (message: Message) => {
    if (message.contentBlocks && message.contentBlocks.length > 0) {
      return message.contentBlocks.map((block, index) => 
        renderContentBlock(block, index, message.isStreaming, index === message.contentBlocks!.length - 1)
      );
    }
    
    return (
      <>
        {message.content && (
          <div 
            className="px-4 py-3 leading-relaxed break-words"
            style={{
              backgroundColor: 'var(--td-bg-color-component)',
              color: 'var(--td-text-color-primary)',
              borderRadius: '16px 16px 16px 4px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              fontSize: '14px',
              lineHeight: '1.7',
            }}
          >
            <div className="chat-markdown">
              <ChatMarkdown content={message.content} />
            </div>
            {message.isStreaming && (
              <span 
                className="animate-cursor-blink ml-0.5"
                style={{ color: 'var(--td-text-color-secondary)' }}
              >
                |
              </span>
            )}
          </div>
        )}
      </>
    );
  };

  return (
    <div className="flex flex-col gap-5 max-w-3xl mx-auto">
      {messages.map(message => (
        <div 
          key={message.id} 
          className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
        >
          {/* 头像 */}
          <div 
            className="w-8 h-8 flex items-center justify-center flex-shrink-0 rounded-full self-start overflow-hidden"
            style={{
              background: message.role === 'user' 
                ? 'var(--td-bg-color-component-active)'
                : 'var(--td-bg-color-component)',
            }}
          >
            {message.role === 'user' ? (
              <User size={15} style={{ color: 'var(--td-text-color-secondary)' }} />
            ) : (
              <img
                src={logoSrc}
                alt={APP_CONFIG.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.style.display = 'none';
                  if (img.parentElement) {
                    img.parentElement.style.background = '#1a1a1a';
                    img.parentElement.innerHTML = `<span style="color:#fff;font-size:12px;font-weight:600">${APP_CONFIG.nameInitial}</span>`;
                  }
                }}
              />
            )}
          </div>
          
          <div 
            className={`flex flex-col gap-1.5 max-w-[78%] ${message.role === 'user' ? 'items-end' : ''}`}
          >
            {/* 发言者名称 */}
            <span 
              className="text-xs px-1"
              style={{ color: 'var(--td-text-color-placeholder)', fontSize: '11px' }}
            >
              {message.role === 'user' ? '你' : APP_CONFIG.name}
            </span>
            
            {/* 用户消息 */}
            {message.role === 'user' && (
              <div 
                className="px-4 py-3 leading-relaxed break-words"
                style={{
                  backgroundColor: '#1a1a1a',
                  color: '#ffffff',
                  borderRadius: '16px 16px 4px 16px',
                  fontSize: '14px',
                  lineHeight: '1.7',
                }}
              >
                {message.content}
              </div>
            )}
            
            {/* 助手消息 */}
            {message.role === 'assistant' && renderAssistantContent(message)}
            
            {/* 思考中状态 */}
            {message.role === 'assistant' && message.isStreaming && 
             !message.content && 
             (!message.contentBlocks || message.contentBlocks.length === 0) && (
              <div 
                className="flex items-center gap-2 px-4 py-3 rounded-2xl"
                style={{ 
                  backgroundColor: 'var(--td-bg-color-component)',
                }}
              >
                <Loading size="small" />
                <span 
                  className="text-sm"
                  style={{ color: 'var(--td-text-color-secondary)', fontSize: '13px' }}
                >
                  {APP_CONFIG.name}正在回复中…
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
      
      <div ref={messagesEndRef} />
    </div>
  );
}
