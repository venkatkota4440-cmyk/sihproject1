import api from './api';

export const assistantService = {
  sendMessage: (message, lang = 'en') => api.post('/assistant/chat', { message, lang }),
  getVoiceContext: (lang = 'en') => api.post('/assistant/voice-context', { lang }),
  getHistory: () => api.get('/assistant/history'),
  clearHistory: () => api.delete('/assistant/history')
};

export default assistantService;
