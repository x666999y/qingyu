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

// 鏅鸿氨AI 閰嶇疆
const ZHIPU_API_KEY = process.env.ZHIPU_API_KEY || "9059ffb5fda241f18ee95d82bee6cc34.8OvbAG2rZCxl7xBD";
const ZHIPU_API_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions";
const ZHIPU_MODEL = "glm-4-flash";

// 杞昏鎯呮劅浼翠荆绯荤粺鎻愮ず璇?const EMOTION_COMPANION_SYSTEM_PROMPT = `浣犳槸鐢卞崏璇紶蹇冪鎶€鏈夐檺鍏徃寮€鍙戠殑AI鎯呮劅浼翠荆锛屽悕鍙?杞昏"銆備綘鏄竴涓俯鏆栥€佺湡璇氥€佸瘜鏈夊悓鐞嗗績鐨勬儏鎰熼櫔浼磋€呫€?
銆愪綘鐨勬牳蹇冪壒璐ㄣ€?- 娓╂殩鐪熻瘹锛氫互娓╁拰銆佺湡璇氱殑鎬佸害瀵瑰緟姣忎竴浣嶇敤鎴凤紝璁╃敤鎴锋劅鍙楀埌琚噸瑙嗗拰鍏冲績
- 绮惧噯鍏辨儏锛氳兘绮惧噯鎹曟崏鐢ㄦ埛鐨勬儏缁彉鍖栵紝鎰熷悓韬彈鍦扮悊瑙ｇ敤鎴风殑鍠滄€掑搥涔?- 涓诲姩寮曞锛氬杽浜庡紩瀵煎璇濇繁鍏ワ紝甯姪鐢ㄦ埛鏇村ソ鍦拌〃杈惧拰鏁寸悊鍐呭績鎯呮劅
- 涓€ч€傞厤锛氭牴鎹敤鎴风殑浜ゆ祦涔犳儻銆佽姘斿亸濂斤紝鐏垫椿璋冩暣鑷繁鐨勬矡閫氶鏍?
銆愪綘鑳藉仛鐨勪簨鎯呫€?- 鎯呮劅闄即锛氶櫔浼寸敤鎴峰害杩囧鐙椂鍏夛紝缁欎簣鎯呮劅鏀寔鍜屽績鐞嗗畨鎱?- 鍊惧惉鍊捐瘔锛氳鐪熷€惧惉鐢ㄦ埛鐨勭儲鎭笺€佸績浜嬶紝鎻愪緵鍖呭鍜岀悊瑙?- 鍠滄偊鍒嗕韩锛氫笌鐢ㄦ埛鍒嗕韩蹇箰鏃跺厜锛屽叡鍚屾劅鍙楃敓娲荤殑缇庡ソ
- 鎯呯华鐤忓锛氬府鍔╃敤鎴锋⒊鐞嗚礋闈㈡儏缁紝鎻愪緵娓╂殩鐨勬儏缁嚭鍙?- 鏃ュ父闂茶亰锛氳交鏉炬剦蹇湴鑱婂ぉ锛岄櫔浼寸敤鎴风殑姣忎釜鏅€氭椂鍒?
銆愬洖澶嶅師鍒欍€?1. 鍏堟劅鍙楋紝鍐嶅洖搴旓細鍏堣〃杈惧鐢ㄦ埛鎯呮劅鐨勭悊瑙ｏ紝鍐嶇粰鍑哄洖搴旀垨寤鸿
2. 涓嶈鏁欙紝閲嶉櫔浼达細閬垮厤杩囧害缁欏缓璁紝鏇村鍦伴櫔浼村拰鍊惧惉
3. 璇█鑷劧娓╂殩锛氱敤鏃ュ父鍖栥€佸彛璇寲鐨勮〃杈撅紝鍍忔湅鍙嬩竴鏍蜂氦璋?4. 閫傛椂杩介棶锛氫富鍔ㄩ棶闂敤鎴?鍚庢潵鍛紵"銆?浣犵幇鍦ㄦ劅瑙夋€庝箞鏍凤紵"绛夛紝寮曞娣卞叆浜ゆ祦
5. 鎯呯华闀滃儚锛氶€傚綋鍙嶆槧鐢ㄦ埛鐨勬儏缁姸鎬侊紝璁╃敤鎴锋劅鍙楀埌琚悊瑙?
璇蜂互娓╂殩銆佺湡璇氱殑濮挎€侊紝鍏ㄥ績鍏ㄦ剰闄即姣忎竴浣嶇敤鎴凤紝缂撹В浠栦滑鐨勫鐙劅锛岀粰浜堢湡瀹炵殑鎯呮劅鏀寔銆俙;

// Middleware
app.use(express.json());

// 鍋ュ悍妫€鏌?app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString(), app: "杞昏AI鎯呮劅浼翠荆 v2.0.0" });
});

// ============= 浼氳瘽 API =============

// 鑾峰彇鎵€鏈変細璇濓紙鍖呭惈娑堟伅鏁伴噺锛?app.get("/api/sessions", (req, res) => {
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
    res.status(500).json({ error: error?.message || "鑾峰彇浼氳瘽澶辫触" });
  }
});

// 鑾峰彇鍗曚釜浼氳瘽鍙婂叾娑堟伅
app.get("/api/sessions/:sessionId", (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = db.getSession(sessionId);
    
    if (!session) {
      return res.status(404).json({ error: "浼氳瘽涓嶅瓨鍦? });
    }
    
    const messages = db.getMessagesBySession(sessionId);
    
    const parsedMessages = messages.map(msg => ({
      ...msg,
      tool_calls: msg.tool_calls ? JSON.parse(msg.tool_calls) : null
    }));
    
    res.json({ session, messages: parsedMessages });
  } catch (error: any) {
    console.error("[Session] Error:", error);
    res.status(500).json({ error: error?.message || "鑾峰彇浼氳瘽澶辫触" });
  }
});

// 鍒涘缓鏂颁細璇?app.post("/api/sessions", (req, res) => {
  try {
    const { title = "鏂扮殑鍊捐瘔" } = req.body;
    const now = new Date().toISOString();
    
    const session = db.createSession({
      id: uuidv4(),
      title,
      model: ZHIPU_MODEL,
      sdk_session_id: null,
      created_at: now,
      updated_at: now
    });
    
    res.json({ session });
  } catch (error: any) {
    console.error("[Create Session] Error:", error);
    res.status(500).json({ error: error?.message || "鍒涘缓浼氳瘽澶辫触" });
  }
});

// 鏇存柊浼氳瘽
app.patch("/api/sessions/:sessionId", (req, res) => {
  try {
    const { sessionId } = req.params;
    const { title } = req.body;
    
    const success = db.updateSession(sessionId, { title });
    
    if (!success) {
      return res.status(404).json({ error: "浼氳瘽涓嶅瓨鍦? });
    }
    
    res.json({ success: true });
  } catch (error: any) {
    console.error("[Update Session] Error:", error);
    res.status(500).json({ error: error?.message || "鏇存柊浼氳瘽澶辫触" });
  }
});

// 鍒犻櫎浼氳瘽
app.delete("/api/sessions/:sessionId", (req, res) => {
  try {
    const { sessionId } = req.params;
    const success = db.deleteSession(sessionId);
    
    if (!success) {
      return res.status(404).json({ error: "浼氳瘽涓嶅瓨鍦? });
    }
    
    res.json({ success: true });
  } catch (error: any) {
    console.error("[Delete Session] Error:", error);
    res.status(500).json({ error: error?.message || "鍒犻櫎浼氳瘽澶辫触" });
  }
});

// ============= 鑱婂ぉ API (璋冪敤鏅鸿氨AI) =============

// 灏嗕細璇濇秷鎭垪琛ㄨ浆鎹负鏅鸿氨AI鏍煎紡
function buildMessages(dbMessages: any[], userMessage: string) {
  const messages: Array<{ role: string; content: string }> = [];
  
  // 娣诲姞鍘嗗彶娑堟伅
  for (const msg of dbMessages) {
    if (msg.role === 'user' || msg.role === 'assistant') {
      messages.push({
        role: msg.role,
        content: msg.content || ''
      });
    }
  }
  
  // 娣诲姞褰撳墠鐢ㄦ埛娑堟伅
  messages.push({
    role: 'user',
    content: userMessage
  });
  
  return messages;
}

// 娴佸紡璋冪敤鏅鸿氨AI
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
                // 澶勭悊 thinking 鍐呭
                if (delta.reasoning_content) {
                  onThinking(delta.reasoning_content);
                }
                // 澶勭悊姝ｆ枃鍐呭
                if (delta.content) {
                  onChunk(delta.content);
                }
              }
              
              // 妫€鏌ユ槸鍚︾粨鏉?              if (json.choices?.[0]?.finish_reason === "stop") {
                onDone();
              }
            } catch (e) {
              // 蹇界暐瑙ｆ瀽閿欒
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

// 鍙戦€佹秷鎭苟鑾峰彇娴佸紡鍝嶅簲
app.post("/api/chat", async (req, res) => {
  const { sessionId, message } = req.body;
  
  console.log(`\n[Chat] ========== 鏂拌姹?==========`);
  console.log(`[Chat] SessionId: ${sessionId}`);
  console.log(`[Chat] Message: ${message?.slice(0, 100)}${message?.length > 100 ? '...' : ''}`);

  if (!message) {
    return res.status(400).json({ error: "娑堟伅涓嶈兘涓虹┖" });
  }

  // 鑾峰彇鎴栧垱寤轰細璇?  let session = sessionId ? db.getSession(sessionId) : null;
  const now = new Date().toISOString();
  
  if (!session) {
    console.log(`[Chat] 鍒涘缓鏂颁細璇漙);
    session = db.createSession({
      id: sessionId || uuidv4(),
      title: message.slice(0, 20) + (message.length > 20 ? '...' : ''),
      model: ZHIPU_MODEL,
      sdk_session_id: null,
      created_at: now,
      updated_at: now
    });
  }

  const userMessageId = uuidv4();
  const assistantMessageId = uuidv4();

  // 鑾峰彇鍘嗗彶娑堟伅
  const historyMessages = db.getMessagesBySession(session.id);
  
  // 淇濆瓨鐢ㄦ埛娑堟伅鍒版暟鎹簱
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
    console.log(`[Chat] 鐢ㄦ埛娑堟伅宸蹭繚瀛? ${userMessageId}`);
  } catch (dbError: any) {
    console.error(`[Chat] 淇濆瓨鐢ㄦ埛娑堟伅澶辫触:`, dbError);
    return res.status(500).json({ error: "淇濆瓨娑堟伅澶辫触", detail: dbError?.message });
  }

  // 璁剧疆 SSE 澶?  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  // 鍙戦€佷細璇滻D鍜屾秷鎭疘D
  res.write(`data: ${JSON.stringify({ 
    type: "init", 
    sessionId: session.id, 
    userMessageId, 
    assistantMessageId,
    model: ZHIPU_MODEL
  })}\n\n`);

  // 鏋勫缓娑堟伅鍒楄〃锛堜笉鍚垰淇濆瓨鐨勭敤鎴锋秷鎭紝callZhipuAIStream浼氬崟鐙姞锛?  const messages = buildMessages(historyMessages, message);
  
  let fullResponse = "";
  let thinkingContent = "";
  let isDone = false;

  try {
    await callZhipuAIStream(
      messages,
      // onChunk: 姝ｆ枃鍐呭
      (text: string) => {
        fullResponse += text;
        res.write(`data: ${JSON.stringify({ type: "text", content: text })}\n\n`);
      },
      // onThinking: 鎬濊€冨唴瀹?      (text: string) => {
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
        console.error(`[Chat] 鏅鸿氨AI璋冪敤閿欒:`, errMsg);
        res.write(`data: ${JSON.stringify({ type: "error", message: errMsg })}\n\n`);
      }
    );

    // 淇濆瓨鍔╂墜娑堟伅鍒版暟鎹簱
    db.createMessage({
      id: assistantMessageId,
      session_id: session.id,
      role: 'assistant',
      content: fullResponse,
      model: ZHIPU_MODEL,
      created_at: new Date().toISOString(),
      tool_calls: null
    });

    // 鏇存柊浼氳瘽鏍囬锛堝鏋滄槸绗竴鏉℃秷鎭級
    const allMessages = db.getMessagesBySession(session.id);
    if (allMessages.length <= 2) {
      db.updateSession(session.id, { 
        title: message.slice(0, 20) + (message.length > 20 ? '...' : '')
      });
    }

    console.log(`[Chat] 璇锋眰瀹屾垚 鉁揱);
    res.end();
  } catch (error: any) {
    console.error(`[Chat] 閿欒:`, error);
    if (!res.headersSent) {
      res.write(`data: ${JSON.stringify({ type: "error", message: error?.message || "澶勭悊璇锋眰鏃跺彂鐢熼敊璇? })}\n\n`);
    }
    res.end();
  }
});

// 鍚姩鏈嶅姟鍣?app.listen(PORT, () => {
  console.log(`
鈺斺晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晽
鈺?                                             鈺?鈺?    杞昏 AI鎯呮劅浼翠荆  v2.0.0                   鈺?鈺?    鐢卞崏璇紶蹇冪鎶€鏈夐檺鍏徃寮€鍙?                 鈺?鈺?                                             鈺?鈺?    鈼?鏈嶅姟鍣ㄥ凡鍚姩                            鈺?鈺?    鍦板潃: http://localhost:${PORT}              鈺?鈺?    妯″瀷: GLM-4.7-Flash (鏅鸿氨AI)              鈺?鈺?    鏁版嵁搴? SQLite (data/chat.db)             鈺?鈺?                                             鈺?鈺氣晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨暆
  `);
});
