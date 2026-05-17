/**
 * 卉语传心 - 数据库模块
 * 使用 JSON 文件存储会话和消息数据（无需原生编译）
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 数据文件路径
const dataDir = path.join(__dirname, '..', 'data');
const dbPath = path.join(dataDir, 'chat.json');

// 确保 data 目录存在
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 数据库结构
interface DbData {
  sessions: DbSession[];
  messages: DbMessage[];
}

// 类型定义
export interface DbSession {
  id: string;
  title: string;
  model: string;
  sdk_session_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  model: string | null;
  created_at: string;
  tool_calls: string | null;
}

// 读取数据库
function readDb(): DbData {
  try {
    if (fs.existsSync(dbPath)) {
      const content = fs.readFileSync(dbPath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (e) {
    console.error('[DB] Error reading database:', e);
  }
  return { sessions: [], messages: [] };
}

// 写入数据库
function writeDb(data: DbData): void {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('[DB] Error writing database:', e);
  }
}

// ============= 会话操作 =============

// 获取所有会话
export function getAllSessions(): DbSession[] {
  const data = readDb();
  return data.sessions.sort((a, b) => 
    new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );
}

// 获取单个会话
export function getSession(id: string): DbSession | undefined {
  const data = readDb();
  return data.sessions.find(s => s.id === id);
}

// 创建会话
export function createSession(session: DbSession): DbSession {
  const data = readDb();
  data.sessions.push(session);
  writeDb(data);
  return session;
}

// 更新会话
export function updateSession(id: string, updates: Partial<Pick<DbSession, 'title' | 'model' | 'sdk_session_id'>>): boolean {
  const data = readDb();
  const index = data.sessions.findIndex(s => s.id === id);
  if (index === -1) return false;
  
  data.sessions[index] = {
    ...data.sessions[index],
    ...updates,
    updated_at: new Date().toISOString()
  };
  writeDb(data);
  return true;
}

// 删除会话
export function deleteSession(id: string): boolean {
  const data = readDb();
  const index = data.sessions.findIndex(s => s.id === id);
  if (index === -1) return false;
  
  data.sessions.splice(index, 1);
  // 同时删除该会话的所有消息
  data.messages = data.messages.filter(m => m.session_id !== id);
  writeDb(data);
  return true;
}

// ============= 消息操作 =============

// 获取会话的所有消息
export function getMessagesBySession(sessionId: string): DbMessage[] {
  const data = readDb();
  return data.messages
    .filter(m => m.session_id === sessionId)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}

// 创建消息
export function createMessage(message: DbMessage): DbMessage {
  const data = readDb();
  data.messages.push(message);
  
  // 更新会话的 updated_at
  const sessionIndex = data.sessions.findIndex(s => s.id === message.session_id);
  if (sessionIndex !== -1) {
    data.sessions[sessionIndex].updated_at = new Date().toISOString();
  }
  
  writeDb(data);
  return message;
}

// 清空所有数据
export function clearAllData(): void {
  writeDb({ sessions: [], messages: [] });
}

export default { readDb, writeDb };
