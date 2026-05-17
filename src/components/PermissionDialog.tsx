import { Dialog, Button, Tag, Descriptions } from 'tdesign-react';
import { 
  TerminalIcon, 
  FileIcon, 
  FolderOpenIcon,
  SearchIcon,
  Code1Icon,
  EditIcon,
  DeleteIcon
} from 'tdesign-icons-react';
import { PermissionRequest } from '../types';

interface PermissionDialogProps {
  visible: boolean;
  request: PermissionRequest | null;
  onAllow: () => void;
  onDeny: () => void;
}

// 宸ュ叿鍚嶇О鍒板浘鏍囧拰棰滆壊鐨勬槧灏?const TOOL_CONFIG: Record<string, { icon: () => React.ReactElement; color: string; label: string }> = {
  'Bash': { icon: () => <TerminalIcon />, color: '#e34d59', label: '鎵ц鍛戒护' },
  'Write': { icon: () => <EditIcon />, color: '#0052d9', label: '鍐欏叆鏂囦欢' },
  'Edit': { icon: () => <EditIcon />, color: '#0052d9', label: '缂栬緫鏂囦欢' },
  'Read': { icon: () => <FileIcon />, color: '#2ba471', label: '璇诲彇鏂囦欢' },
  'ListDir': { icon: () => <FolderOpenIcon />, color: '#ed7b2f', label: '鍒楀嚭鐩綍' },
  'Search': { icon: () => <SearchIcon />, color: '#8a6be5', label: '鎼滅储' },
  'Grep': { icon: () => <SearchIcon />, color: '#8a6be5', label: '鏂囨湰鎼滅储' },
  'Delete': { icon: () => <DeleteIcon />, color: '#e34d59', label: '鍒犻櫎鏂囦欢' },
};

// 鑾峰彇宸ュ叿閰嶇疆
const getToolConfig = (toolName: string) => {
  return TOOL_CONFIG[toolName] || { 
    icon: <Code1Icon />, 
    color: '#666666', 
    label: toolName 
  };
};

// 鏍煎紡鍖栧伐鍏疯緭鍏ヤ负鍙鐨勬弿杩?const formatToolInput = (toolName: string, input: Record<string, unknown>) => {
  const items: Array<{ label: string; content: string }> = [];
  
  if (toolName === 'Bash' && input.command) {
    items.push({ label: '鍛戒护', content: String(input.command) });
  } else if ((toolName === 'Write' || toolName === 'Edit') && input.filePath) {
    items.push({ label: '鏂囦欢璺緞', content: String(input.filePath) });
    if (input.content) {
      const content = String(input.content);
      items.push({ 
        label: '鍐呭棰勮', 
        content: content.length > 200 ? content.slice(0, 200) + '...' : content 
      });
    }
  } else if (toolName === 'Read' && input.filePath) {
    items.push({ label: '鏂囦欢璺緞', content: String(input.filePath) });
  } else if (toolName === 'ListDir' && input.path) {
    items.push({ label: '鐩綍璺緞', content: String(input.path) });
  } else if ((toolName === 'Search' || toolName === 'Grep') && input.pattern) {
    items.push({ label: '鎼滅储妯″紡', content: String(input.pattern) });
    if (input.path) {
      items.push({ label: '鎼滅储璺緞', content: String(input.path) });
    }
  } else {
    // 閫氱敤澶勭悊锛氭樉绀烘墍鏈夊弬鏁?    Object.entries(input).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        const strValue = typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value);
        items.push({ 
          label: key, 
          content: strValue.length > 200 ? strValue.slice(0, 200) + '...' : strValue 
        });
      }
    });
  }
  
  return items;
};

export function PermissionDialog({ visible, request, onAllow, onDeny }: PermissionDialogProps) {
  if (!request) return null;
  
  const toolConfig = getToolConfig(request.toolName);
  const inputItems = formatToolInput(request.toolName, request.input);
  
  return (
    <Dialog
      visible={visible}
      header={
        <div className="flex items-center gap-2">
          <span style={{ color: toolConfig.color }}>{toolConfig.icon()}</span>
          <span>鏉冮檺纭</span>
        </div>
      }
      onClose={onDeny}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onDeny}>
            鎷掔粷
          </Button>
          <Button theme="primary" onClick={onAllow}>
            鍏佽
          </Button>
        </div>
      }
      width={520}
      destroyOnClose
    >
      <div className="space-y-4">
        {/* 宸ュ叿鏍囩 */}
        <div className="flex items-center gap-2">
          <span style={{ color: 'var(--td-text-color-secondary)' }}>宸ュ叿锛?/span>
          <Tag 
            theme="primary" 
            variant="light"
            icon={toolConfig.icon()}
          >
            {toolConfig.label}
          </Tag>
          <Tag variant="outline" size="small">
            {request.toolName}
          </Tag>
        </div>
        
        {/* 宸ュ叿鍙傛暟璇︽儏 */}
        <div 
          className="rounded-lg p-4"
          style={{ backgroundColor: 'var(--td-bg-color-component)' }}
        >
          {request.toolName === 'Bash' && request.input.command ? (
            // Bash 鍛戒护鐗规畩鏄剧ず
            <div>
              <div 
                className="text-xs mb-2 font-medium"
                style={{ color: 'var(--td-text-color-secondary)' }}
              >
                灏嗚鎵ц鐨勫懡浠わ細
              </div>
              <pre 
                className="font-mono text-sm p-3 rounded overflow-x-auto whitespace-pre-wrap break-all"
                style={{ 
                  backgroundColor: 'var(--td-bg-color-page)',
                  color: 'var(--td-text-color-primary)',
                  maxHeight: '200px'
                }}
              >
                {String(request.input.command)}
              </pre>
            </div>
          ) : inputItems.length > 0 ? (
            // 鍏朵粬宸ュ叿浣跨敤鎻忚堪鍒楄〃
            <Descriptions 
              layout="horizontal"
              bordered
              colon={false}
            >
              {inputItems.map((item, index) => (
                <Descriptions.DescriptionsItem key={index} label={item.label}>
                  {item.content}
                </Descriptions.DescriptionsItem>
              ))}
            </Descriptions>
          ) : (
            <div 
              className="text-sm"
              style={{ color: 'var(--td-text-color-placeholder)' }}
            >
              鏃犲弬鏁?            </div>
          )}
        </div>
        
        {/* 璀﹀憡鎻愮ず */}
        {request.toolName === 'Bash' && (
          <div 
            className="flex items-start gap-2 text-sm p-3 rounded-lg"
            style={{ 
              backgroundColor: 'rgba(227, 77, 89, 0.1)',
              color: 'var(--td-error-color)'
            }}
          >
            <span className="flex-shrink-0">鈿狅笍</span>
            <span>姝ゆ搷浣滃皢鍦ㄦ偍鐨勭郴缁熶笂鎵ц鍛戒护锛岃纭鍛戒护鍐呭瀹夊叏鍙俊銆?/span>
          </div>
        )}
        {(request.toolName === 'Write' || request.toolName === 'Edit' || request.toolName === 'Delete') && (
          <div 
            className="flex items-start gap-2 text-sm p-3 rounded-lg"
            style={{ 
              backgroundColor: 'rgba(0, 82, 217, 0.1)',
              color: 'var(--td-brand-color)'
            }}
          >
            <span className="flex-shrink-0">馃摑</span>
            <span>姝ゆ搷浣滃皢淇敼鎮ㄧ殑鏂囦欢绯荤粺锛岃纭鎿嶄綔姝ｇ‘銆?/span>
          </div>
        )}
      </div>
    </Dialog>
  );
}
