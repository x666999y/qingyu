import { useState, useEffect } from 'react';
import APP_CONFIG from '../config';

const AGREEMENT_KEY = 'qingyu_user_agreement_v2';

// 协议全文内容
const AGREEMENT_CONTENT = `轻语·你的AI情感伴侣产品用户须知协议

欢迎使用由卉语传心科技有限公司（以下简称"我方"）开发的AI情感伴侣产品（以下简称"本产品"）。本产品依托智谱AI开放平台glm-4.7-flash模型，通过API接口，提供虚拟情感陪伴服务，支持流式调用。请您（以下简称"用户"）在使用本产品前，仔细阅读并充分理解本用户须知协议全部条款，您点击"同意"或实际使用本产品服务，即视为您已接受本协议所有约定，自愿遵守本协议的全部内容。若您不同意本协议任何条款，请勿使用本产品。

一、服务范围与限制

1.1 本产品提供的核心服务为虚拟情感陪伴，包括但不限于情感倾诉回应、日常闲聊互动、情绪共情反馈等，旨在为用户提供情感支持、缓解孤独感，所有服务均为非医疗、非专业心理咨询性质，不能替代人类专业心理咨询、医疗诊断及治疗服务。

1.2 本产品不对未成年人提供任何形式的虚拟情感服务。未成年人（指未满十八周岁的自然人）不得注册、登录或使用本产品，若我方发现用户为未成年人，将立即终止提供服务，注销其账号，且不承担任何违约责任。同时，我方严格遵守《未成年人网络保护条例》相关规定，不收集、不存储未成年人相关信息，不向未成年人推送任何服务相关内容，切实履行未成年人网络保护义务。

1.3 本产品服务调用遵循指定模板，确保回复的丰富度和实时性，用户使用时需严格按照我方提供的调用规范操作，不得擅自修改调用参数、篡改API接口信息。

二、用户权利与义务

2.1 用户权利：有权按照本协议约定，合法使用本产品提供的虚拟情感陪伴服务；有权对产品服务质量提出意见和建议，我方将根据用户反馈适时优化服务；有权查询、更正、删除自身在使用产品过程中产生的个人信息（法律法规另有规定的除外）。

2.2 用户义务：
（1）保证自身为年满十八周岁的完全民事行为能力人，提交的注册信息及身份相关材料真实、准确、完整，若提供虚假信息，我方有权终止服务，由此产生的一切责任由用户自行承担；
（2）严格遵守国家法律法规、社会公德及本协议约定，不得利用本产品从事任何违法违规活动，包括但不限于发布违法信息、传播不良内容、侵害他人合法权益、篡改产品数据或API接口等；
（3）妥善保管自身API调用权限及相关账号信息，不得转借、出租、出售给第三方，因自身保管不善导致的账号泄露、API滥用等问题，由用户自行承担全部责任；
（4）理性看待本产品的虚拟情感服务，明确其不能替代专业心理咨询、医疗服务，若自身存在严重心理困扰或健康问题，应及时寻求专业医师或心理咨询师的帮助；
（5）不得利用本产品生成、传播危害国家安全、损害社会公共利益、违背公序良俗的内容，不得利用产品进行骚扰、诋毁、恐吓等不当行为。

三、个人信息保护

3.1 我方仅收集用户使用本产品所必需的个人信息，收集、使用用户信息遵循合法、正当、必要、诚信的原则，仅用于提供服务、优化产品及法律法规允许的其他用途。

3.2 我方对收集的用户信息进行加密存储，设置严格的访问权限控制，防止信息泄露、篡改、丢失，定期对信息安全进行检查和维护。

3.3 未经用户明确同意，我方不得将用户个人信息泄露给任何第三方，法律法规另有规定的除外。

四、免责条款

4.1 本产品为虚拟情感陪伴服务，仅提供情绪支持和闲聊互动，不承担任何医疗、心理咨询责任，用户因使用本产品产生的心理状态变化、情绪波动等，我方不承担任何赔偿责任。

4.2 因不可抗力、技术故障、网络问题、第三方服务异常等非我方原因导致的服务中断、延迟、错误，或用户因自身操作不当导致的损失，我方不承担任何责任。

4.3 因用户泄露API KEY、账号信息导致的损失，由用户自行承担，我方不承担任何责任。

五、协议变更与生效

本协议自用户点击"同意并继续"或实际使用本产品服务之日起生效，有效期至用户终止使用本产品服务或我方终止提供服务之日止。我方有权根据业务发展、技术进步及法律法规变化，对本协议条款进行修改，修改后将通过产品页面通知用户。

六、争议解决

本协议的履行、解释及争议解决，均适用中华人民共和国法律。用户与我方之间因本协议产生的任何争议，应首先友好协商解决；协商不成的，任何一方均有权向我方所在地有管辖权的人民法院提起诉讼。

卉语传心科技有限公司
协议生效日期：2026年5月17日`;

interface UserAgreementModalProps {
  onAgree: () => void;
}

export function UserAgreementModal({ onAgree }: UserAgreementModalProps) {
  const [scrolledToBottom, setScrolledToBottom] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const isAtBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 30;
    if (isAtBottom) setScrolledToBottom(true);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.45)', backdropFilter: 'blur(4px)' }}
    >
      <div 
        className="w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl"
        style={{ 
          backgroundColor: 'var(--td-bg-color-container)',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* 头部 */}
        <div 
          className="px-6 py-5 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--td-component-border)' }}
        >
          <div className="flex items-center gap-3 mb-1">
            <img
              src={APP_CONFIG.logoColor}
              alt="轻语"
              className="h-8 w-auto object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <span 
              className="font-semibold text-lg"
              style={{ color: 'var(--td-text-color-primary)' }}
            >
              {APP_CONFIG.name}
            </span>
          </div>
          <h2 
            className="text-base font-medium mt-2"
            style={{ color: 'var(--td-text-color-primary)' }}
          >
            用户须知协议
          </h2>
          <p 
            className="text-xs mt-1"
            style={{ color: 'var(--td-text-color-placeholder)' }}
          >
            请仔细阅读以下协议，向下滚动至底部后方可同意
          </p>
        </div>

        {/* 协议内容 */}
        <div 
          className="flex-1 overflow-y-auto px-6 py-4"
          style={{ minHeight: 0 }}
          onScroll={handleScroll}
        >
          <pre 
            className="text-sm leading-relaxed whitespace-pre-wrap"
            style={{ 
              color: 'var(--td-text-color-secondary)',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang SC", "Helvetica Neue", sans-serif',
            }}
          >
            {AGREEMENT_CONTENT}
          </pre>
        </div>

        {/* 底部操作 */}
        <div 
          className="px-6 py-4 flex-shrink-0"
          style={{ borderTop: '1px solid var(--td-component-border)' }}
        >
          {!scrolledToBottom && (
            <p 
              className="text-xs text-center mb-3"
              style={{ color: 'var(--td-text-color-placeholder)' }}
            >
              请向下滚动阅读完整协议
            </p>
          )}
          <button
            onClick={onAgree}
            disabled={!scrolledToBottom}
            className="w-full py-3 rounded-xl text-sm font-medium transition-all duration-200"
            style={{
              backgroundColor: scrolledToBottom ? '#1a1a1a' : 'var(--td-bg-color-component)',
              color: scrolledToBottom ? '#ffffff' : 'var(--td-text-color-disabled)',
              cursor: scrolledToBottom ? 'pointer' : 'not-allowed',
              border: 'none',
            }}
          >
            {scrolledToBottom ? '同意并继续使用' : '请阅读完整协议后同意'}
          </button>
          <p 
            className="text-center text-xs mt-3"
            style={{ color: 'var(--td-text-color-placeholder)' }}
          >
            点击"同意并继续使用"即表示您已阅读并同意本协议全部条款
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * 检查用户是否已同意协议
 */
export function hasAgreedToAgreement(): boolean {
  return localStorage.getItem(AGREEMENT_KEY) === 'agreed';
}

/**
 * 记录用户已同意协议
 */
export function setAgreedToAgreement(): void {
  localStorage.setItem(AGREEMENT_KEY, 'agreed');
}
