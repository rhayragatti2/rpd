# MindLog - Registro de Pensamentos Disfuncionais (RPD Digital)

Um **Web App Progressivo (PWA)** para registro de pensamentos, emoções e comportamentos, baseado na técnica de Registro de Pensamentos Disfuncionais (RPD).

O aplicativo usa Firebase para autenticação e armazenamento, com suporte offline integrado via Firestore — os dados são sincronizados automaticamente quando a conexão retorna.

## Funcionalidades

- **Registro Completo:** Campos para Situação, Emoção, Pensamentos e Comportamentos
- **Humor por Cores:** Visualização intuitiva baseada no estado emocional selecionado
- **Gráfico de Humor:** Dashboard com gráfico doughnut mostrando a distribuição de emoções
- **Calendário de Humor:** Visualização mensal com indicadores coloridos por dia
- **Filtros e Busca:** Filtre por humor ou busque palavras-chave nos registros
- **Exportação PDF:** Gere relatórios consolidados para levar à sessão de terapia
- **PWA Instalável:** Adicione à tela inicial do celular como um aplicativo nativo
- **Suporte Offline:** Dados são cacheados localmente e sincronizados quando online

## Tecnologias

- **React 18** + **Vite** (build e dev server)
- **Firebase Auth** (autenticação por e-mail/senha)
- **Cloud Firestore** (banco de dados com persistência offline)
- **Chart.js** + **react-chartjs-2** (visualização de dados)
- **jsPDF** + **jspdf-autotable** (exportação de relatórios)
- **Lucide React** (ícones)

## Configuração

1. Clone o repositório
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Crie um projeto no [Firebase Console](https://console.firebase.google.com):
   - Ative **Authentication** com o provedor Email/Password
   - Crie um banco **Cloud Firestore** em modo produção
   - Adicione as regras de segurança do Firestore (veja abaixo)
4. Copie o arquivo `.env` e preencha com suas credenciais Firebase:
   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```
5. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## Regras do Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /entries/{entryId} {
      allow read, delete: if request.auth != null && request.auth.uid == resource.data.user_id;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.user_id;
    }
    match /profiles/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Instalar no Celular

1. Acesse o link do projeto pelo navegador do celular
2. **iOS (Safari):** Compartilhar > "Adicionar à Tela de Início"
3. **Android (Chrome):** Menu > "Instalar Aplicativo"

---

*Desenvolvido como ferramenta de apoio ao autoconhecimento.*
