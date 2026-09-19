document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 SK Mini Editor iniciando...');

  // Setup de eventos
  MiniEvents.setupEditorEvents();
  MiniEvents.setupFileTreeEvents();

  // Criar arquivo de exemplo se vazio
  if (miniVFS.getAllFiles().length === 0) {
    miniVFS.addFile('/index.html', `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bem-vindo ao SK Editor</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        h1 { color: #4ec9b0; }
        p { line-height: 1.6; }
    </style>
</head>
<body>
    <h1>🚀 Bem-vindo ao SK Mini Editor</h1>
    <p>Este é um editor de código completo com:</p>
    <ul>
        <li>✅ Sistema de arquivos virtual</li>
        <li>✅ Preview em tempo real</li>
        <li>✅ Integração com YouTube</li>
        <li>✅ Importar/Exportar ZIP</li>
        <li>✅ Integração com GitHub</li>
        <li>✅ Temas claro/escuro</li>
        <li>✅ Responsivo para mobile</li>
    </ul>
    <p>Comece criando um novo arquivo!</p>
</body>
</html>`);

    miniVFS.addFile('/style.css', `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

.container {
    background: white;
    padding: 40px;
    border-radius: 10px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    text-align: center;
    max-width: 500px;
}

h1 {
    color: #333;
    margin-bottom: 20px;
}

p {
    color: #666;
    line-height: 1.6;
}`);

    miniVFS.addFile('/script.js', `console.log('SK Mini Editor carregado com sucesso!');

function saudacao() {
    return 'Olá, mundo!';
}

console.log(saudacao());`);

    miniVFS.addFile('/dados.json', `{
  "nome": "SK Mini Editor",
  "versao": "1.0",
  "autor": "Seu Nome",
  "features": [
    "Editor de código",
    "Preview em tempo real",
    "Integração GitHub",
    "Temas customizáveis"
  ],
  "criado": "2024"
}`);

    miniFileTree.refresh();
  }

  // Atualizar tema
  const themeToggle = document.getElementById('theme-toggle');
  themeToggle.textContent = miniTheme.theme === 'dark' ? '☀️' : '🌙';

  console.log('✅ SK Mini Editor pronto!');
  console.log('📊 Stats:', miniVFS.getStats());
});
