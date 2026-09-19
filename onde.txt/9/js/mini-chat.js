/**
 * mini-chat.js
 */

class MiniChat {
  constructor(containerId, supabaseConfig) {
    this.container = document.getElementById(containerId);
    this.messages = [];
    this.supabaseConfig = supabaseConfig;
    this.userId = localStorage.getItem('userId') || this.generateId();
    
    this.render();
  }

  // Enviar mensagem
  async sendMessage(text) {
    const message = {
      id: this.generateId(),
      userId: this.userId,
      text,
      timestamp: new Date(),
      role: 'user'
    };

    this.messages.push(message);

    // Salvar no Supabase
    if (this.supabaseConfig) {
      await this.saveToSupabase(message);
    }

    this.render();
  }

  // Salvar no Supabase
  async saveToSupabase(message) {
    try {
      const response = await fetch(
        `${this.supabaseConfig.url}/rest/v1/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': this.supabaseConfig.apiKey,
            'Authorization': `Bearer ${this.supabaseConfig.apiKey}`
          },
          body: JSON.stringify(message)
        }
      );

      if (!response.ok) throw new Error('Erro ao salvar');
      return await response.json();
    } catch (error) {
      console.error('Erro Supabase:', error);
    }
  }

  // Carregar mensagens
  async loadMessages() {
    try {
      const response = await fetch(
        `${this.supabaseConfig.url}/rest/v1/messages?userId=eq.${this.userId}`,
        {
          headers: {
            'apikey': this.supabaseConfig.apiKey,
            'Authorization': `Bearer ${this.supabaseConfig.apiKey}`
          }
        }
      );

      if (!response.ok) throw new Error('Erro ao carregar');
      this.messages = await response.json();
      this.render();
    } catch (error) {
      console.error('Erro ao carregar:', error);
    }
  }

  // Renderizar
  render() {
    this.container.innerHTML = `
      <div class="chat">
        <div class="chat-messages">
          ${this.messages.map(msg => `
            <div class="chat-message ${msg.role}">
              <div class="chat-bubble">
                ${msg.text}
              </div>
              <span class="chat-time">${new Date(msg.timestamp).toLocaleTimeString('pt-BR')}</span>
            </div>
          `).join('')}
        </div>

        <div class="chat-input">
          <input 
            type="text" 
            id="chatInput" 
            class="chat-input-field"
            placeholder="Digite sua mensagem..."
          >
          <button id="chatSendBtn" class="chat-send-btn">
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    `;

    this.attachListeners();
  }

  attachListeners() {
    const input = document.getElementById('chatInput');
    const sendBtn = document.getElementById('chatSendBtn');

    sendBtn.addEventListener('click', () => {
      if (input.value.trim()) {
        this.sendMessage(input.value);
        input.value = '';
      }
    });

    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && input.value.trim()) {
        this.sendMessage(input.value);
        input.value = '';
      }
    });
  }

  generateId() {
    return 'user_' + Math.random().toString(36).substr(2, 9);
  }
}

const miniChat = new MiniChat('chatContainer', {
  url: 'https://seu-projeto.supabase.co',
  apiKey: 'sua-chave-publica'
});
