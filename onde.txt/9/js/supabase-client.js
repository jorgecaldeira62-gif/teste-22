/**
 * supabase-client.js
 */

class SupabaseClient {
  constructor(url, apiKey) {
    this.url = url;
    this.apiKey = apiKey;
  }

  async query(table, method = 'GET', data = null) {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'apikey': this.apiKey,
        'Authorization': `Bearer ${this.apiKey}`
      }
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${this.url}/rest/v1/${table}`, options);
    
    if (!response.ok) {
      throw new Error(`Erro ${response.status}`);
    }

    return await response.json();
  }

  // CRUD
  async create(table, data) {
    return this.query(table, 'POST', data);
  }

  async read(table, filter = '') {
    return this.query(`${table}${filter}`);
  }

  async update(table, id, data) {
    return this.query(`${table}?id=eq.${id}`, 'PATCH', data);
  }

  async delete(table, id) {
    return this.query(`${table}?id=eq.${id}`, 'DELETE');
  }
}

const supabase = new SupabaseClient(
  'https://seu-projeto.supabase.co',
  'sua-chave-publica'
);
