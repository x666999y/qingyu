import { useState, useEffect, useCallback } from 'react';
import { 
  Form, 
  Input, 
  Textarea, 
  Button, 
  Tooltip,
  Popconfirm,
  MessagePlugin,
  Loading,
  Link,
  Tag,
  Select
} from 'tdesign-react';
import { 
  AddIcon, 
  EditIcon, 
  DeleteIcon,
  CheckIcon,
  CheckCircleFilledIcon,
  CloseCircleFilledIcon,
  RefreshIcon
} from 'tdesign-icons-react';
import { Bot, Sparkles, Code, FileText, Globe, Lightbulb } from 'lucide-react';
import { CustomAgent, PermissionMode } from '../types';

interface SettingsPageProps {
  agents: CustomAgent[];
  onAdd: (agent: Omit<CustomAgent, 'id' | 'createdAt' | 'updatedAt'>) => CustomAgent;
  onUpdate: (id: string, updates: Partial<Omit<CustomAgent, 'id' | 'createdAt'>>) => void;
  onDelete: (id: string) => void;
}

type LoginMethod = 'env' | 'cli' | 'none';

interface LoginStatus {
  isLoggedIn: boolean;
  checking: boolean;
  method?: LoginMethod;
  envConfigured?: boolean;
  cliConfigured?: boolean;
  error?: string;
  apiKey?: string;
  envVars?: {
    apiKey?: string;
    authToken?: string;
    internetEnv?: string;
    baseUrl?: string;
  };
}

const PRESET_ICONS = [
  { name: 'Bot', icon: Bot },
  { name: 'Sparkles', icon: Sparkles },
  { name: 'Code', icon: Code },
  { name: 'FileText', icon: FileText },
  { name: 'Globe', icon: Globe },
  { name: 'Lightbulb', icon: Lightbulb },
];

const PRESET_COLORS = [
  '#0052d9', '#0594fa', '#00a870', '#ed7b2f', 
  '#e34d59', '#a25eb5', '#5c6bc0', '#26a69a'
];

const PERMISSION_MODES: { value: PermissionMode; label: string; description: string }[] = [
  { value: 'default', label: 'default', description: '榛樿妯″紡锛屾墍鏈夋搷浣滈渶纭' },
  { value: 'acceptEdits', label: 'acceptEdits', description: '鑷姩鎵瑰噯鏂囦欢缂栬緫锛孊ash 浠嶉渶纭' },
  { value: 'plan', label: 'plan', description: '瑙勫垝妯″紡锛屼粎鍏佽璇诲彇鎿嶄綔' },
  { value: 'bypassPermissions', label: 'bypassPermissions', description: '璺宠繃鎵€鏈夋潈闄愭鏌ワ紙璋ㄦ厧浣跨敤锛? },
];

const PRESET_TEMPLATES = [
  {
    name: '浠ｇ爜鍔╂墜',
    description: '涓撴敞浜庣紪绋嬪拰浠ｇ爜鐩稿叧浠诲姟',
    systemPrompt: '浣犳槸涓€涓笓涓氱殑缂栫▼鍔╂墜銆備綘鎿呴暱缂栧啓銆佸鏌ュ拰瑙ｉ噴浠ｇ爜銆傝鎻愪緵娓呮櫚銆侀珮鏁堜笖绗﹀悎鏈€浣冲疄璺电殑浠ｇ爜瑙ｅ喅鏂规銆傚湪瑙ｉ噴鏃讹紝璇疯€冭檻浠ｇ爜鐨勫彲璇绘€с€佹€ц兘鍜屽彲缁存姢鎬с€?,
    icon: 'Code',
    color: '#0594fa',
  },
  {
    name: '鍐欎綔鍔╂墜',
    description: '甯姪鎾板啓鍜屼紭鍖栧悇绫绘枃妗?,
    systemPrompt: '浣犳槸涓€涓笓涓氱殑鍐欎綔鍔╂墜銆備綘鎿呴暱鎾板啓銆佺紪杈戝拰浼樺寲鍚勭被鏂囨。锛屽寘鎷枃绔犮€佹姤鍛娿€侀偖浠剁瓑銆傝甯姪鐢ㄦ埛鎻愬崌鏂囧瓧琛ㄨ揪鐨勬竻鏅板害銆侀€昏緫鎬у拰鍚稿紩鍔涖€?,
    icon: 'FileText',
    color: '#00a870',
  },
  {
    name: '缈昏瘧鍔╂墜',
    description: '鎻愪緵楂樿川閲忕殑澶氳瑷€缈昏瘧',
    systemPrompt: '浣犳槸涓€涓笓涓氱殑缈昏瘧鍔╂墜銆備綘绮鹃€氬绉嶈瑷€锛岃兘澶熸彁渚涘噯纭€佽嚜鐒躲€佺鍚堣澧冪殑缈昏瘧銆傝鍦ㄧ炕璇戞椂淇濇寔鍘熸枃鐨勮姘斿拰椋庢牸锛屽悓鏃剁‘淇濈洰鏍囪瑷€鐨勫湴閬撹〃杈俱€?,
    icon: 'Globe',
    color: '#ed7b2f',
  },
  {
    name: '鍒涙剰鍔╂墜',
    description: '婵€鍙戠伒鎰燂紝鎻愪緵鍒涙剰寤鸿',
    systemPrompt: '浣犳槸涓€涓瘜鏈夊垱鎰忕殑鍔╂墜銆備綘鍠勪簬澶磋剳椋庢毚銆佹彁渚涘垱鏂版兂娉曞拰鐙壒瑙嗚銆傝甯姪鐢ㄦ埛绐佺牬鎬濈淮瀹氬紡锛屾帰绱㈡柊鐨勫彲鑳芥€э紝婵€鍙戝垱閫犲姏銆?,
    icon: 'Lightbulb',
    color: '#a25eb5',
  },
];

export function SettingsPage({ 
  agents, 
  onAdd, 
  onUpdate, 
  onDelete 
}: SettingsPageProps) {
  const [editingAgent, setEditingAgent] = useState<CustomAgent | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    systemPrompt: '',
    icon: 'Bot',
    color: '#0052d9',
    permissionMode: 'default' as PermissionMode,
  });
  
  // 鐧诲綍鐘舵€?  const [loginStatus, setLoginStatus] = useState<LoginStatus>({
    isLoggedIn: false,
    checking: true,
  });
  
  // 鐜鍙橀噺閰嶇疆
  const [showEnvConfig, setShowEnvConfig] = useState(false);
  const [envConfig, setEnvConfig] = useState({
    apiKey: '',
    authToken: '',
    internetEnv: '' as '' | 'internal' | 'iOA',
    baseUrl: '',
  });
  const [savingEnv, setSavingEnv] = useState(false);

  // 妫€鏌ョ櫥褰曠姸鎬?  const checkLoginStatus = useCallback(async () => {
    setLoginStatus(prev => ({ ...prev, checking: true, error: undefined }));
    
    try {
      const response = await fetch('/api/check-login');
      const data = await response.json();
      
      setLoginStatus({
        isLoggedIn: data.isLoggedIn,
        checking: false,
        method: data.method,
        envConfigured: data.envConfigured,
        cliConfigured: data.cliConfigured,
        error: data.error,
        apiKey: data.apiKey,
        envVars: data.envVars,
      });
    } catch (error: any) {
      setLoginStatus({
        isLoggedIn: false,
        checking: false,
        error: error?.message || '妫€鏌ョ櫥褰曠姸鎬佸け璐?,
      });
    }
  }, []);
  
  // 淇濆瓨鐜鍙橀噺閰嶇疆
  const saveEnvConfig = async () => {
    // 鑷冲皯闇€瑕侀厤缃竴涓湁鏁堢殑鍊?    const hasAnyConfig = envConfig.apiKey.trim() || envConfig.authToken.trim();
    if (!hasAnyConfig) {
      MessagePlugin.warning('璇疯嚦灏戦厤缃?API Key 鎴?Auth Token');
      return;
    }
    
    setSavingEnv(true);
    try {
      const response = await fetch('/api/save-env-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: envConfig.apiKey.trim() || undefined,
          authToken: envConfig.authToken.trim() || undefined,
          internetEnv: envConfig.internetEnv || undefined,
          baseUrl: envConfig.baseUrl.trim() || undefined,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        MessagePlugin.success(data.message);
        setShowEnvConfig(false);
        setEnvConfig({ apiKey: '', authToken: '', internetEnv: '', baseUrl: '' });
        // 閲嶆柊妫€鏌ョ櫥褰曠姸鎬?        checkLoginStatus();
      } else {
        MessagePlugin.error(data.error || '淇濆瓨澶辫触');
      }
    } catch (error: any) {
      MessagePlugin.error(error?.message || '淇濆瓨澶辫触');
    } finally {
      setSavingEnv(false);
    }
  };

  // 鍒濆鍖栨椂妫€鏌ョ櫥褰曠姸鎬?  useEffect(() => {
    checkLoginStatus();
  }, [checkLoginStatus]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      systemPrompt: '',
      icon: 'Bot',
      color: '#0052d9',
      permissionMode: 'default',
    });
    setEditingAgent(null);
    setIsCreating(false);
  };

  const handleEdit = (agent: CustomAgent) => {
    if (agent.id === 'default') return;
    setEditingAgent(agent);
    setFormData({
      name: agent.name,
      description: agent.description || '',
      systemPrompt: agent.systemPrompt,
      icon: agent.icon || 'Bot',
      color: agent.color || '#0052d9',
      permissionMode: agent.permissionMode || 'default',
    });
    setIsCreating(true);
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.systemPrompt.trim()) {
      MessagePlugin.warning('璇峰～鍐欏悕绉板拰绯荤粺鎻愮ず璇?);
      return;
    }

    if (editingAgent) {
      onUpdate(editingAgent.id, formData);
      MessagePlugin.success('Agent 宸叉洿鏂?);
    } else {
      onAdd(formData);
      MessagePlugin.success('Agent 宸插垱寤?);
    }
    resetForm();
  };

  const handleUseTemplate = (template: typeof PRESET_TEMPLATES[0]) => {
    setFormData({
      ...template,
      description: template.description,
      permissionMode: 'default' as PermissionMode,
    });
    setIsCreating(true);
  };

  const handleDelete = (id: string) => {
    onDelete(id);
    MessagePlugin.success('Agent 宸插垹闄?);
  };

  const getIconComponent = (iconName: string) => {
    const preset = PRESET_ICONS.find(p => p.name === iconName);
    return preset ? preset.icon : Bot;
  };

  const customAgents = agents.filter(a => a.id !== 'default');

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* 椤甸潰鏍囬 */}
        <div>
          <h1 
            className="text-2xl font-semibold mb-2"
            style={{ color: 'var(--td-text-color-primary)' }}
          >
            璁剧疆
          </h1>
          <p style={{ color: 'var(--td-text-color-secondary)' }}>
            绠＄悊鐧诲綍閰嶇疆鍜岃嚜瀹氫箟 Agent
          </p>
        </div>

        {/* 鐧诲綍閰嶇疆 */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 
                className="text-lg font-medium"
                style={{ color: 'var(--td-text-color-primary)' }}
              >
                鐧诲綍閰嶇疆
              </h2>
              <p 
                className="text-sm mt-1"
                style={{ color: 'var(--td-text-color-secondary)' }}
              >
                鏀寔鐜鍙橀噺鎴?CodeBuddy CLI 鐧诲綍
              </p>
            </div>
            <Button 
              variant="text" 
              icon={<RefreshIcon />}
              onClick={checkLoginStatus}
              loading={loginStatus.checking}
            >
              鍒锋柊
            </Button>
          </div>
          
          {/* 褰撳墠鐘舵€?*/}
          <div className="flex items-center gap-3 mb-6">
            {loginStatus.checking ? (
              <>
                <Loading size="small" />
                <span style={{ color: 'var(--td-text-color-secondary)' }}>
                  姝ｅ湪妫€鏌ョ櫥褰曠姸鎬?..
                </span>
              </>
            ) : loginStatus.isLoggedIn ? (
              <>
                <CheckCircleFilledIcon 
                  size="20px" 
                  style={{ color: 'var(--td-success-color)' }} 
                />
                <span style={{ color: 'var(--td-text-color-primary)' }}>
                  宸茬櫥褰?                </span>
                <Tag size="small" variant="outline">
                  {loginStatus.method === 'env' ? '鐜鍙橀噺' : 'CLI'}
                </Tag>
                {loginStatus.method === 'env' && loginStatus.apiKey && (
                  <span 
                    className="text-sm font-mono"
                    style={{ color: 'var(--td-text-color-secondary)' }}
                  >
                    {loginStatus.apiKey}
                  </span>
                )}
              </>
            ) : (
              <>
                <CloseCircleFilledIcon 
                  size="20px" 
                  style={{ color: 'var(--td-text-color-placeholder)' }} 
                />
                <span style={{ color: 'var(--td-text-color-secondary)' }}>
                  鏈櫥褰?                </span>
              </>
            )}
          </div>
          
          {/* 鐜鍙橀噺閰嶇疆 */}
          <div className="mb-6">
            <h3 
              className="text-sm font-medium mb-3"
              style={{ color: 'var(--td-text-color-secondary)' }}
            >
              鏂瑰紡涓€锛氱幆澧冨彉閲?            </h3>
            
            {showEnvConfig ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label 
                      className="text-xs block mb-1"
                      style={{ color: 'var(--td-text-color-placeholder)' }}
                    >
                      CODEBUDDY_API_KEY
                    </label>
                    <Input
                      type="password"
                      size="small"
                      value={envConfig.apiKey}
                      onChange={(v) => setEnvConfig(prev => ({ ...prev, apiKey: v as string }))}
                      placeholder="API 瀵嗛挜锛堟帹鑽愶級"
                    />
                  </div>
                  <div>
                    <label 
                      className="text-xs block mb-1"
                      style={{ color: 'var(--td-text-color-placeholder)' }}
                    >
                      CODEBUDDY_AUTH_TOKEN
                    </label>
                    <Input
                      type="password"
                      size="small"
                      value={envConfig.authToken}
                      onChange={(v) => setEnvConfig(prev => ({ ...prev, authToken: v as string }))}
                      placeholder="璁よ瘉浠ょ墝"
                    />
                  </div>
                  <div>
                    <label 
                      className="text-xs block mb-1"
                      style={{ color: 'var(--td-text-color-placeholder)' }}
                    >
                      CODEBUDDY_INTERNET_ENVIRONMENT
                    </label>
                    <Select
                      size="small"
                      value={envConfig.internetEnv}
                      onChange={(v) => setEnvConfig(prev => ({ ...prev, internetEnv: v as any }))}
                      placeholder="缃戠粶鐜锛堝彲閫夛級"
                      clearable
                      options={[
                        { label: 'internal', value: 'internal' },
                        { label: 'iOA', value: 'iOA' },
                      ]}
                    />
                  </div>
                  <div>
                    <label 
                      className="text-xs block mb-1"
                      style={{ color: 'var(--td-text-color-placeholder)' }}
                    >
                      CODEBUDDY_BASE_URL
                    </label>
                    <Input
                      size="small"
                      value={envConfig.baseUrl}
                      onChange={(v) => setEnvConfig(prev => ({ ...prev, baseUrl: v as string }))}
                      placeholder="鑷畾涔?URL锛堝彲閫夛級"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    size="small"
                    theme="primary" 
                    onClick={saveEnvConfig}
                    loading={savingEnv}
                  >
                    淇濆瓨
                  </Button>
                  <Button 
                    size="small"
                    variant="text" 
                    onClick={() => {
                      setShowEnvConfig(false);
                      setEnvConfig({ apiKey: '', authToken: '', internetEnv: '', baseUrl: '' });
                    }}
                  >
                    鍙栨秷
                  </Button>
                  <span 
                    className="text-xs"
                    style={{ color: 'var(--td-text-color-placeholder)' }}
                  >
                    浠呭綋鍓嶈繘绋嬫湁鏁?                  </span>
                </div>
              </div>
            ) : (
              <Button 
                variant="outline" 
                size="small"
                onClick={() => setShowEnvConfig(true)}
              >
                閰嶇疆鐜鍙橀噺
              </Button>
            )}
          </div>
          
          {/* CLI 鐧诲綍 */}
          <div>
            <h3 
              className="text-sm font-medium mb-3"
              style={{ color: 'var(--td-text-color-secondary)' }}
            >
              鏂瑰紡浜岋細CodeBuddy CLI
            </h3>
            <div className="flex items-center gap-3">
              <code 
                className="px-3 py-1.5 rounded text-sm"
                style={{ 
                  backgroundColor: 'var(--td-bg-color-component)',
                  color: 'var(--td-text-color-primary)'
                }}
              >
                codebuddy
              </code>
              <Link 
                href="https://www.codebuddy.ai/docs/zh/cli/settings" 
                target="_blank"
                theme="primary"
                size="small"
              >
                鏌ョ湅鏂囨。
              </Link>
            </div>
          </div>
          
          {loginStatus.error && !loginStatus.isLoggedIn && (
            <div 
              className="text-xs mt-4"
              style={{ color: 'var(--td-text-color-placeholder)' }}
            >
              {loginStatus.error}
            </div>
          )}
        </div>

        <div 
          style={{ 
            height: '1px', 
            backgroundColor: 'var(--td-component-border)' 
          }} 
        />

        {/* Agent 閰嶇疆 */}
        <div>
          <div className="mb-4">
            <h2 
              className="text-lg font-medium"
              style={{ color: 'var(--td-text-color-primary)' }}
            >
              Agent 閰嶇疆
            </h2>
            <p 
              className="text-sm mt-1"
              style={{ color: 'var(--td-text-color-secondary)' }}
            >
              鍒涘缓鍜岀鐞嗚嚜瀹氫箟 Agent
            </p>
          </div>

          <div className="space-y-6">
              {/* 鍒涘缓/缂栬緫琛ㄥ崟 */}
              {isCreating ? (
                <div 
                  className="p-5 rounded-xl border"
                  style={{ 
                    backgroundColor: 'var(--td-bg-color-container)',
                    borderColor: 'var(--td-component-border)'
                  }}
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-base font-medium" style={{ color: 'var(--td-text-color-primary)' }}>
                        {editingAgent ? '缂栬緫 Agent' : '鍒涘缓鏂?Agent'}
                      </h4>
                      <Button variant="text" onClick={resetForm}>鍙栨秷</Button>
                    </div>
                    
                    <Form labelAlign="top">
                      <Form.FormItem label="鍚嶇О" requiredMark>
                        <Input 
                          value={formData.name}
                          onChange={(v) => setFormData(prev => ({ ...prev, name: v as string }))}
                          placeholder="渚嬪锛氫唬鐮佸姪鎵?
                        />
                      </Form.FormItem>
                      
                      <Form.FormItem label="鎻忚堪">
                        <Input 
                          value={formData.description}
                          onChange={(v) => setFormData(prev => ({ ...prev, description: v as string }))}
                          placeholder="绠€鐭弿杩拌繖涓?Agent 鐨勭敤閫?
                        />
                      </Form.FormItem>
                      
                      <Form.FormItem label="鍥炬爣鍜岄鑹?>
                        <div className="flex gap-4">
                          <div className="flex gap-2">
                            {PRESET_ICONS.map(({ name, icon: Icon }) => (
                              <button
                                key={name}
                                type="button"
                                className="w-9 h-9 rounded-lg flex items-center justify-center transition-all border-2"
                                style={{
                                  backgroundColor: formData.icon === name ? formData.color : 'transparent',
                                  color: formData.icon === name ? 'white' : 'var(--td-text-color-secondary)',
                                  borderColor: formData.icon === name ? formData.color : 'var(--td-component-border)',
                                }}
                                onClick={() => setFormData(prev => ({ ...prev, icon: name }))}
                              >
                                <Icon size={18} />
                              </button>
                            ))}
                          </div>
                          <div className="flex gap-1.5 items-center">
                            {PRESET_COLORS.map(color => (
                              <button
                                key={color}
                                type="button"
                                className="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                                style={{ backgroundColor: color }}
                                onClick={() => setFormData(prev => ({ ...prev, color }))}
                              >
                                {formData.color === color && <CheckIcon style={{ color: 'white' }} size="14px" />}
                              </button>
                            ))}
                          </div>
                        </div>
                      </Form.FormItem>
                      
                      <Form.FormItem label="鏉冮檺妯″紡">
                        <Select
                          value={formData.permissionMode}
                          onChange={(v) => setFormData(prev => ({ ...prev, permissionMode: v as PermissionMode }))}
                          style={{ width: '100%' }}
                        >
                          {PERMISSION_MODES.map(mode => (
                            <Select.Option key={mode.value} value={mode.value} label={mode.label}>
                              <div className="flex flex-col py-1">
                                <span className="font-mono text-sm" style={{ color: 'var(--td-success-color)' }}>
                                  {mode.label}
                                </span>
                                <span className="text-xs" style={{ color: 'var(--td-text-color-placeholder)' }}>
                                  {mode.description}
                                </span>
                              </div>
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.FormItem>
                      
                      <Form.FormItem label="绯荤粺鎻愮ず璇? requiredMark>
                        <Textarea 
                          value={formData.systemPrompt}
                          onChange={(v) => setFormData(prev => ({ ...prev, systemPrompt: v as string }))}
                          placeholder="瀹氫箟 Agent 鐨勮涓哄拰鑳藉姏..."
                          autosize={{ minRows: 4, maxRows: 8 }}
                        />
                      </Form.FormItem>
                    </Form>
                    
                    <div className="flex justify-end gap-2 pt-2">
                      <Button variant="outline" onClick={resetForm}>鍙栨秷</Button>
                      <Button theme="primary" onClick={handleSave}>
                        {editingAgent ? '淇濆瓨淇敼' : '鍒涘缓 Agent'}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* 蹇€熸ā鏉?*/}
                  <div>
                    <h4 className="text-sm font-medium mb-3" style={{ color: 'var(--td-text-color-secondary)' }}>
                      蹇€熷垱寤?                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {PRESET_TEMPLATES.map(template => {
                        const Icon = getIconComponent(template.icon);
                        return (
                          <div 
                            key={template.name} 
                            className="p-3 rounded-lg cursor-pointer transition-all hover:shadow-md"
                            style={{ backgroundColor: 'var(--td-bg-color-component)' }}
                            onClick={() => handleUseTemplate(template)}
                          >
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: template.color }}
                              >
                                <Icon size={20} color="white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium truncate" style={{ color: 'var(--td-text-color-primary)' }}>
                                  {template.name}
                                </div>
                                <div className="text-xs truncate" style={{ color: 'var(--td-text-color-placeholder)' }}>
                                  {template.description}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 鑷畾涔夊垱寤烘寜閽?*/}
                  <Button 
                    icon={<AddIcon />} 
                    variant="dashed" 
                    block 
                    onClick={() => setIsCreating(true)}
                  >
                    浠庡ご鍒涘缓 Agent
                  </Button>

                  {/* 宸叉湁鐨勮嚜瀹氫箟 Agent */}
                  {customAgents.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-3" style={{ color: 'var(--td-text-color-secondary)' }}>
                        鎴戠殑 Agent ({customAgents.length})
                      </h4>
                      <div className="space-y-2">
                        {customAgents.map(agent => {
                          const Icon = getIconComponent(agent.icon || 'Bot');
                          return (
                            <div 
                              key={agent.id} 
                              className="p-3 rounded-lg"
                              style={{ backgroundColor: 'var(--td-bg-color-component)' }}
                            >
                              <div className="flex items-center gap-3">
                                <div 
                                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                  style={{ backgroundColor: agent.color || '#0052d9' }}
                                >
                                  <Icon size={20} color="white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium" style={{ color: 'var(--td-text-color-primary)' }}>
                                    {agent.name}
                                  </div>
                                  <div className="text-xs truncate" style={{ color: 'var(--td-text-color-placeholder)' }}>
                                    {agent.description || agent.systemPrompt.slice(0, 50) + '...'}
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  <Tooltip content="缂栬緫">
                                    <Button 
                                      variant="text" 
                                      shape="circle" 
                                      size="small"
                                      icon={<EditIcon />}
                                      onClick={() => handleEdit(agent)}
                                    />
                                  </Tooltip>
                                  <Popconfirm
                                    key={agent.id}
                                    content="纭畾鍒犻櫎杩欎釜 Agent 鍚楋紵"
                                    onConfirm={() => handleDelete(agent.id)}
                                    destroyOnClose
                                  >
                                    <span>
                                      <Tooltip content="鍒犻櫎">
                                        <Button 
                                          variant="text" 
                                          shape="circle" 
                                          size="small"
                                          icon={<DeleteIcon />}
                                        />
                                      </Tooltip>
                                    </span>
                                  </Popconfirm>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
        </div>
      </div>
    </div>
  );
}
