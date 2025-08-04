# Configuração SMTP para Formulários

## Configuração Necessária

Para que os formulários funcionem corretamente com envio de emails, você precisa configurar as seguintes variáveis de ambiente:

### 1. Criar arquivo `.env`

Copie o arquivo `.env.example` para `.env` e configure as seguintes variáveis:

```bash
# Configuração SMTP Gmail
EMAIL_SERVICE=gmail
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=sua-senha-de-app
EMAIL_FROM="RealCred+ <seu-email@gmail.com>"

# Emails de destino
LEAD_RECEIVER=leads@seudominio.com
CONTACT_RECEIVER=contato@seudominio.com

# Configurações do servidor
PORT=3002
NODE_ENV=development
```

### 2. Configurar Gmail SMTP

Para usar o Gmail como servidor SMTP:

1. **Ativar verificação em duas etapas** na sua conta Google
2. **Gerar uma senha de app**:
   - Vá para https://myaccount.google.com/apppasswords
   - Selecione "Email" e "Outro (nome personalizado)"
   - Digite "RealCred" como nome
   - Copie a senha gerada (16 caracteres)
3. **Usar a senha de app** no campo `EMAIL_PASS`

### 3. Configurar emails de destino

- `LEAD_RECEIVER`: Email que receberá os leads de simulação
- `CONTACT_RECEIVER`: Email que receberá os contatos do formulário de contato

## Como Funciona

### Formulário de Simulação (`/api/lead`)
- Envia dados da simulação para `LEAD_RECEIVER`
- Inclui: nome, CPF, email, telefone, categoria, salário, valor, prazo
- Template HTML formatado

### Formulário de Contato (`/api/contact`)
- Envia mensagens de contato para `CONTACT_RECEIVER`
- Inclui: nome, email, telefone, assunto, mensagem
- Formato texto simples

## Testando

1. Configure o arquivo `.env` com suas credenciais
2. Execute o servidor: `npm run dev`
3. Teste os formulários no site
4. Verifique se os emails estão sendo recebidos

## Troubleshooting

- **Erro de autenticação**: Verifique se a senha de app está correta
- **Emails não chegam**: Verifique a pasta de spam
- **Erro CORS**: Configure `ALLOWED_ORIGINS` no `.env` 