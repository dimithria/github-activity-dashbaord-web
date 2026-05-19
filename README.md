# GitHub Activity Dashboard

## 📋 O que é este projeto?

**GitHub Activity Dashboard** é uma aplicação web moderna e responsiva para visualizar as **atividades públicas recentes** de qualquer usuário do GitHub. 

Com design em **glassmorphism** e tema escuro, ela oferece uma visão completa e visual do perfil do usuário, incluindo:
- Informações do perfil e avatar
- Gráficos interativos de eventos por tipo e por dia
- Tabela detalhada dos últimos 30 eventos públicos
- **Atualização automática** baseada no header `X-Poll-Interval` da API do GitHub

## ✨ Funcionalidades

- 🔍 **Busca rápida** por username do GitHub
- 📊 **Gráficos Chart.js**:
  - Doughnut: Distribuição de eventos por tipo (PushEvent, WatchEvent, etc.)
  - Bar: Eventos agrupados por dia
- 📋 **Tabela de eventos** com detalhes específicos por tipo
- ⏰ **Auto-refresh inteligente**
- 📱 **Totalmente responsivo** (mobile-first)
- 🌙 **Tema escuro** com efeitos glassmorphism
- ⚡ **Zero dependências backend** - 100% frontend

## 🛠️ Como funciona?

1. **Digite o username** de qualquer usuário GitHub
2. **Clique em "Buscar Atividades"** ou pressione Enter
3. A app faz 2 requests paralelos:
   - `GET /users/{username}` → Perfil e avatar
   - `GET /users/{username}/events/public?per_page=30` → Últimos 30 eventos públicos
4. **Processa os dados**:
   - Agrupa eventos por tipo e data
   - Gera gráficos automaticamente
   - Formata tabela com detalhes específicos (commits count, actions, etc.)
5. **Auto-atualiza** a cada X segundos (definido pela API do GitHub)

### Fluxo técnico:
```
Frontend (HTML/JS/CSS) 
    ↓
GitHub API v3 (sem autenticação)
    ↓
Processamento client-side (groupBy, Chart.js)
    ↓
Renderização (Tailwind + Custom CSS)
```

## 🚀 Como usar

1. **Abra `index.html`** no navegador (Live Server ou direto)
2. Digite um username válido (ex: `octocat`, `torvalds`)
3. Clique **Buscar Atividades**
4. Explore os gráficos e tabela!

**Rate limit**: 60 requests/hora (API pública anônima)

## 🏗️ Stack Tecnológica

| Frontend | Bibliotecas | Estilização |
|----------|-------------|-------------|
| HTML5 | Tailwind CSS (CDN) | Glassmorphism |
| Vanilla JS | Chart.js | Custom CSS Dark |
| GitHub API v3 | - | - |

## 📁 Estrutura do Projeto

```
github-activity-dashboard-web/
├── index.html      # Interface principal
├── script.js       # Lógica + API + Charts
├── style.css       # Estilos customizados (glass effect)
└── README.md       # Este arquivo
```

## 🎨 Preview

![Dashboard Preview] 

## 🤝 Contribuições

1. Fork o projeto
2. Crie uma branch `feat/nova-funcionalidade`
3. Commit suas mudanças
4. Abra um Pull Request

## 📄 Licença

MIT License - sinta-se à vontade para usar e modificar!

## 🙏 Agradecimentos

- [GitHub API](https://docs.github.com/en/rest)
- [Chart.js](https://www.chartjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)