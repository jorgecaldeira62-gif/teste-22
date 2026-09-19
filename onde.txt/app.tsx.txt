import { useState } from 'react'
import GitHubPanel from './components/GitHubPanel'
import { Code2, FileText, Settings } from 'lucide-react'

export default function App() {
  // Estado dos arquivos do projeto
  const [files, setFiles] = useState<Record<string, string>>({
    'index.html': `<!DOCTYPE html>
<html>
<head>
  <title>Meu Projeto</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Olá, Mundo!</h1>
  <script src="script.js"><\/script>
</body>
</html>`,
    'style.css': `body {
  font-family: Arial, sans-serif;
  background-color: #f0f0f0;
  color: #333;
}

h1 {
  color: #0066cc;
}`,
    'script.js': `console.log('Projeto carregado!');

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM pronto');
});`,
  })

  const [projectName, setProjectName] = useState('Meu Projeto Web')
  const [activeTab, setActiveTab] = useState<'editor' | 'github'>('editor')
  const [selectedFile, setSelectedFile] = useState('index.html')

  // Atualizar conteúdo do arquivo
  const updateFile = (filename: string, content: string) => {
    setFiles(prev => ({
      ...prev,
      [filename]: content
    }))
  }

  // Criar novo arquivo
  const createNewFile = () => {
    const name = prompt('Nome do arquivo:')
    if (name && !files[name]) {
      setFiles(prev => ({
        ...prev,
        [name]: ''
      }))
      setSelectedFile(name)
    }
  }

  // Deletar arquivo
  const deleteFile = (filename: string) => {
    if (confirm(`Deletar ${filename}?`)) {
      setFiles(prev => {
        const newFiles = { ...prev }
        delete newFiles[filename]
        return newFiles
      })
      if (selectedFile === filename) {
        setSelectedFile(Object.keys(files)[0] || '')
      }
    }
  }

  // Importar arquivos do GitHub
  const handleImport = (importedFiles: Record<string, string>) => {
    setFiles(importedFiles)
    setSelectedFile(Object.keys(importedFiles)[0] || '')
    alert(`✓ ${Object.keys(importedFiles).length} arquivo(s) importado(s)!`)
  }

  return (
    <div className="h-screen flex flex-col bg-[#0d1117]">
      {/* Header */}
      <header className="bg-[#161b22] border-b border-gray-700/50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Code2 size={28} className="text-green-400" />
          <div>
            <h1 className="text-xl font-bold text-white">SK Code Editor</h1>
            <p className="text-xs text-gray-500">Com integração GitHub</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="text"
            value={projectName}
            onChange={e => setProjectName(e.target.value)}
            className="px-3 py-2 bg-[#0d1117] border border-gray-700/50 rounded-lg text-sm text-gray-300 focus:border-green-500/50 outline-none"
            placeholder="Nome do projeto"
          />
          <span className="text-xs text-gray-600">
            {Object.keys(files).length} arquivo(s)
          </span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Arquivos */}
        <aside className="w-64 bg-[#161b22] border-r border-gray-700/50 flex flex-col">
          <div className="px-4 py-3 border-b border-gray-700/50">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-gray-300">Arquivos</h2>
              <button
                onClick={createNewFile}
                className="p-1 hover:bg-white/10 rounded text-green-400 text-xs"
                title="Novo arquivo"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {Object.keys(files).map(filename => (
              <button
                key={filename}
                onClick={() => setSelectedFile(filename)}
                className={`w-full text-left px-4 py-2.5 text-sm border-l-2 transition-colors flex items-center justify-between group ${
                  selectedFile === filename
                    ? 'bg-green-500/10 border-green-500 text-green-400'
                    : 'border-transparent text-gray-400 hover:bg-white/5'
                }`}
              >
                <span className="flex items-center gap-2 flex-1 min-w-0">
                  <FileText size={14} className="shrink-0" />
                  <span className="truncate">{filename}</span>
                </span>
                <button
                  onClick={e => {
                    e.stopPropagation()
                    deleteFile(filename)
                  }}
                  className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-xs"
                  title="Deletar"
                >
                  ✕
                </button>
              </button>
            ))}
          </div>

          <div className="p-3 border-t border-gray-700/50">
            <button
              onClick={() => setActiveTab(activeTab === 'editor' ? 'github' : 'editor')}
              className={`w-full py-2 px-3 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'github'
                  ? 'bg-green-600 text-white hover:bg-green-500'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Settings size={16} />
              {activeTab === 'github' ? 'Voltar' : 'GitHub'}
            </button>
          </div>
        </aside>

        {/* Main Editor Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {activeTab === 'editor' ? (
            <>
              {/* Editor Tabs */}
              <div className="bg-[#161b22] border-b border-gray-700/50 px-4 py-2 flex items-center gap-2 overflow-x-auto">
                {Object.keys(files).map(filename => (
                  <button
                    key={filename}
                    onClick={() => setSelectedFile(filename)}
                    className={`px-3 py-1.5 text-xs rounded-t border-b-2 transition-colors whitespace-nowrap ${
                      selectedFile === filename
                        ? 'bg-[#0d1117] border-green-500 text-green-400'
                        : 'border-transparent text-gray-500 hover:text-gray-400'
                    }`}
                  >
                    {filename}
                  </button>
                ))}
              </div>

              {/* Editor */}
              <div className="flex-1 flex overflow-hidden">
                <textarea
                  value={files[selectedFile] || ''}
                  onChange={e => updateFile(selectedFile, e.target.value)}
                  className="flex-1 p-4 bg-[#0d1117] text-gray-300 font-mono text-sm outline-none resize-none border-none"
                  spellCheck="false"
                  style={{
                    lineHeight: '1.6',
                    tabSize: 2,
                  }}
                />

                {/* Preview */}
                <div className="w-1/2 bg-white border-l border-gray-700/50 overflow-auto">
                  {selectedFile.endsWith('.html') ? (
                    <iframe
                      srcDoc={files[selectedFile]}
                      className="w-full h-full border-none"
                      title="Preview"
                    />
                  ) : (
                    <div className="p-4 text-gray-600 text-sm">
                      <p>Preview disponível apenas para arquivos HTML</p>
                      <pre className="mt-4 bg-gray-100 p-3 rounded overflow-auto text-xs">
                        {files[selectedFile]}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* GitHub Panel */
            <div className="flex-1 overflow-hidden">
              <GitHubPanel
                files={files}
                onImport={handleImport}
                projectName={projectName}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
