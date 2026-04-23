import axios from 'axios';

const API = axios.create({
  baseURL: `${process.env.REACT_APP_BACKEND_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
});

export const generateSQL = (diagram, dialect) =>
  API.post('/generate-sql', { diagram, dialect }).then(r => r.data.sql);

export const importSQL = (sql, dialect) =>
  API.post('/import-sql', { sql, dialect }).then(r => r.data.diagram);

export const aiGenerateSchema = (prompt) =>
  API.post('/ai/generate-schema', { prompt }).then(r => r.data.diagram);

export const aiAnalyzeSchema = (diagram, dialect) =>
  API.post('/ai/analyze-schema', { diagram, dialect }).then(r => r.data.analysis);

export const aiChat = (messages, diagram, dialect) =>
  API.post('/ai/chat', { messages, diagram, dialect }).then(r => r.data.reply);

export const shareDiagram = (diagram) =>
  API.post('/share', { diagram }).then(r => r.data.shareId);

export const getShare = (shareId) =>
  API.get(`/share/${shareId}`).then(r => r.data);

export default API;
