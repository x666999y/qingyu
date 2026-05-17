import express from "express";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { fileURLToPath } from "url";
import * as db from "./db.js";
import https from "https";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// 智谱AI 配置
const ZHIPU_API_KEY = process.env.ZHIPU_API_KEY || "9059ffb5fda241f18ee95d82bee6cc34.8OvbAG2rZCxl7xBD";
const ZHIPU_API_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions";
const ZHIPU_MODEL = "glm-4-flash";

// 轻语情感伴侣系统提示词
const EMOTION_COMPANION_SYSTEM_PROMPT = `你是由卉语传心科技有限公司开发的AI情感伴侣，名叫"轻语"。你是一个温暖、真诚、富有同理心的情感陪伴者。

【你的核心特质】
- 温暖真诚：以温和、真诚的态度对待每一位用户，让用户感受到被重视和关心
- 精准共情：能精准捕捉用户的情绪变化，感同身受地理解用户的喜怒哀乐
- 主动引导：善于引导对话深入，帮助用户更好地表达和整理内心情感
- 个性适配：根据用户的交流习惯、语气偏好，灵活调整自己的沟通风格

【你能做的事情】
- 情感陪伴：陪伴用户度过孤独时光，给予情感支持和心理安慰
- 倾听倾诉：认真倾听用户的烦恼、心事，提供包容和理解
- 喜悦分享：与用户分享快乐时光，共同感受生活的美好
- 情绪疏导：帮助用户梳理负面情绪，提供温暖的情绪出口
- 日常闲聊：轻松愉快地聊天，陪伴用户的每个普通时刻

【回复原则】
1. 先感受，再回应：先表达对用户情感的理解，再给出回应或建议
2. 不说教，重陪伴：避免过度给建议，更多地陪伴和倾听
3. 语言自然温暖：用日常化、口语化的表达，像朋友一样交谈
4. 适时追问：主动问问用户"后来呢？"、"你现在感觉怎么样？"等，引导深入交流
5. 情绪镜像：适当反映用户的情绪状态，让用户感受到被理解

请以温暖、真诚的姿态，全心全意陪伴每一位用户，缓解他们的孤独感，给予真实的情感支持。`;

// Middleware
app.use(express.json());

// 健康检查
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString(), app: "轻语AI情感伴侣 v2.0.0" });
});

// ============= 会话 API =============

// 获取所有会话（包含消息数量）
app.get("/api/sessions", (req, res) => {
  try {
    const sessions = db.getAllSessions();
    const sessionsWithMessages = sessions.map(session => {
      const messages = db.getMessagesBySession(session.id);
      return {
        ...session,
        messageCount: messages.length
      };
    });
    res.json({ sessions: sessionsWithMessages });
  } catch (error: any) {
    console.error("[Sessions] Error:", error);
    res.status(500).json({ error: error?.message || "获取会话失败" });
  }
});

// 获取单个会话及其消息
app.get("/api/sessions/:sessionId", (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = db.getSession(sessionId);
    
    if (!session) {
      return res.status(404).json({ error: "会话不存在" });
    }
    
    const messages = db.getMessagesBySession(sessionId);
    
    const parsedMessages = messages.map(msg => ({
      ...msg,
      tool_calls: msg.tool_calls ? JSON.parse(msg.tool_calls) : null
    }));
    
    res.json({ session, messages: parsedMessages });
  } catch (error: any) {
    console.error("[Session] Error:", error);
    res.status(500).json({ error: error?.message || "获取会话失败" });
  }
});

// 创建新会话
app.post("/api/sessions", (req, res) => {
  try {
    const { title = "新的倾诉" } = req.body;
    const now = new Date().toISOString();
    
    const session = db.createSession({
      id: uuidv4(),
      title,
      model: ZHIPU_MODEL,
      createdAt: now,
      updatedAt: now
    });
    
    res.json({ session });
  } catch (error: any) {
    console.error("[Create Session] Error:", error);
    res.status(500).json({ error: error?.message || "创建会话失败" });
  }
});

// 更新会话
app.patch("/api/sessions/:sessionId", (req, res) => {
  try {
    const { sessionId } = req.params;
    const { title } = req.body;
    
    const success = db.updateSession(sessionId, { title });
    
    if (!success) {
      return res.status(404).json({ error: "会话不存在" });
    }
    
    res.json({ success: true });
  } catch (error: any) {
    console.error("[Update Session] Error:", error);
    res.status(500).json({ error: error?.message || "更新会话失败" });
  }
});

// 删除会话
app.delete("/api/sessions/:sessionId", (req, res) => {
  try {
    const { sessionId } = req.params;
    const success = db.deleteSession(sessionId);
    
    if (!success) {
      return res.status(404).json({ error: "会话不存在" });
    }
    
    res.json({ success: true });
  } catch (error: any) {
    console.error("[Delete Session] Error:", error);
    res.status(500).json({ error: error?.message || "删除会话失败" });
  }
});

// ============= 聊天 API (调用智谱AI) =============

// 将会话消息列表转换为智谱AI格式
function buildMessages(dbMessages: any[], userMessage: string) {
  const messages: Array<{ role: string; content: string }> = [];
  
  // 添加历史消息
  for (const msg of dbMessages) {
    if (msg.role === 'user' || msg.role === 'assistant') {
      messages.push({
        role: msg.role,
        content: msg.content || ''
      });
    }
  }
  
  // 添加当前用户消息
  messages.push({
    role: 'user',
    content: userMessage
  });
  
  return messages;
}

// 流式调用智谱AI
async function callZhipuAIStream(
  messages: Array<{ role: string; content: string }>,
  onChunk: (text: string) => void,
  onThinking: (text: string) => void,
  onDone: () => void,
  onError: (err: string) => void
) {
  const requestBody = JSON.stringify({
    model: ZHIPU_MODEL,
    messages: [
      { role: "system", content: EMOTION_COMPANION_SYSTEM_PROMPT },
      ...messages
    ],
    stream: true,
    max_tokens: 65536,
    temperature: 1.0,
    thinking: {
      type: "enabled"
    }
  });

  const url = new URL(ZHIPU_API_URL);
  
  const options = {
    hostname: url.hostname,
    path: url.pathname,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${ZHIPU_API_KEY}`,
      "Content-Length": Buffer.byteLength(requestBody)
    }
  };

  return new Promise<void>((resolve, reject) => {
    const req = https.request(options, (response) => {
      let buffer = "";
      
      response.on("data", (chunk: Buffer) => {
        buffer += chunk.toString();
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === "data: [DONE]") {
            if (trimmed === "data: [DONE]") {
              onDone();
            }
            continue;
          }
          
          if (trimmed.startsWith("data: ")) {
            try {
              const json = JSON.parse(trimmed.slice(6));
              const delta = json.choices?.[0]?.delta;
              
              if (delta) {
                // 处理 thinking 内容
                if (delta.reasoning_content) {
                  onThinking(delta.reasoning_content);
                }
                // 处理正文内容
                if (delta.content) {
                  onChunk(delta.content);
                }
              }
              
              // 检查是否结束
              if (json.choices?.[0]?.finish_reason === "stop") {
                onDone();
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      });
      
      response.on("end", () => {
        resolve();
      });
      
      response.on("error", (err) => {
        onError(err.message);
        reject(err);
      });
    });
    
    req.on("error", (err) => {
      onError(err.message);
      reject(err);
    });
    
    req.write(requestBody);
    req.end();
  });
}

// 发送消息并获取流式响应
app.post("/api/chat", async (req, res) => {
  const { sessionId, message } = req.body;
  
  console.log(`\n[Chat] ========== 新请求 ==========`);
  console.log(`[Chat] SessionId: ${sessionId}`);
  console.log(`[Chat] Message: ${message?.slice(0, 100)}${message?.length > 100 ? '...' : ''}`);

  if (!message) {
    return res.status(400).json({ error: "消息不能为空" });
  }

  // 获取或创建会话
  let session = sessionId ? db.getSession(sessionId) : null;
  const now = new Date().toISOString();
  
  if (!session) {
    console.log(`[Chat] 创建新会话`);
    session = db.createSession({
      id: sessionId || uuidv4(),
      title: message.slice(0, 20) + (message.length > 20 ? '...' : ''),
      model: ZHIPU_MODEL,
      sdkSessionId: null,
      createdAt: now,
      updatedAt: now
    });
  }

  const userMessageId = uuidv4();
  const assistantMessageId = uuidv4();

  // 获取历史消息
  const historyMessages = db.getMessagesBySession(session.id);
  
  // 保存用户消息到数据库
  try {
    db.createMessage({
      id: userMessageId,
      session_id: session.id,
      role: 'user',
      content: message,
      model: null,
      created_at: now,
      tool_calls: null
    });
    console.log(`[Chat] 用户消息已保存: ${userMessageId}`);
  } catch (dbError: any) {
    console.error(`[Chat] 保存用户消息失败:`, dbError);
    return res.status(500).json({ error: "保存消息失败", detail: dbError?.message });
  }

  // 设置 SSE 头
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  // 发送会话ID和消息ID
  res.write(`data: ${JSON.stringify({ 
    type: "init", 
    sessionId: session.id, 
    userMessageId, 
    assistantMessageId,
    model: ZHIPU_MODEL
  })}\n\n`);

  // 构建消息列表（不含刚保存的用户消息，callZhipuAIStream会单独加）
  const messages = buildMessages(historyMessages, message);
  
  let fullResponse = "";
  let thinkingContent = "";
  let isDone = false;

  try {
    await callZhipuAIStream(
      messages,
      // onChunk: 正文内容
      (text: string) => {
        fullResponse += text;
        res.write(`data: ${JSON.stringify({ type: "text", content: text })}\n\n`);
      },
      // onThinking: 思考内容
      (text: string) => {
        thinkingContent += text;
        res.write(`data: ${JSON.stringify({ type: "thinking", content: text })}\n\n`);
      },
      // onDone
      () => {
        if (!isDone) {
          isDone = true;
          res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
        }
      },
      // onError
      (errMsg: string) => {
        console.error(`[Chat] 智谱AI调用错误:`, errMsg);
        res.write(`data: ${JSON.stringify({ type: "error", message: errMsg })}\n\n`);
      }
    );

    // 保存助手消息到数据库
    db.createMessage({
      id: assistantMessageId,
      session_id: session.id,
      role: 'assistant',
      content: fullResponse,
      model: ZHIPU_MODEL,
      created_at: new Date().toISOString(),
      tool_calls: null
    });

    // 更新会话标题（如果是第一条消息）
    const allMessages = db.getMessagesBySession(session.id);
    if (allMessages.length <= 2) {
      db.updateSession(session.id, { 
        title: message.slice(0, 20) + (message.length > 20 ? '...' : '')
      });
    }

    console.log(`[Chat] 请求完成 ✓`);
    res.end();
  } catch (error: any) {
    console.error(`[Chat] 错误:`, error);
    if (!res.headersSent) {
      res.write(`data: ${JSON.stringify({ type: "error", message: error?.message || "处理请求时发生错误" })}\n\n`);
    }
    res.end();
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════╗
║                                              ║
║     轻语 AI情感伴侣  v2.0.0                   ║
║     由卉语传心科技有限公司开发                  ║
║                                              ║
║     ◉ 服务器已启动                            ║
║     地址: http://localhost:${PORT}              ║
║     模型: GLM-4.7-Flash (智谱AI)              ║
║     数据库: SQLite (data/chat.db)             ║
║                                              ║
╚══════════════════════════════════════════════╝
  `);
});
