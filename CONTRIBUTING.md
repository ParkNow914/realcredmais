# Guia de Contribuição

Obrigado por considerar contribuir para o RealCred+! Aqui estão algumas diretrizes para ajudar você a começar.

## 🛠 Configuração do Ambiente

1. **Faça um Fork** do repositório
2. **Clone** o repositório:
   ```bash
   git clone https://github.com/seu-usuario/realcredmais.git
   cd realcredmais
   ```
3. **Instale as dependências**:
   ```bash
   npm install
   ```
4. **Configure as variáveis de ambiente**:
   ```bash
   cp .env.example .env
   # Edite o arquivo .env com suas configurações
   ```

## 🚀 Executando o Projeto

- **Modo Desenvolvimento**:
  ```bash
  npm run dev:all
  ```
  Isso inicia o servidor backend em `http://localhost:3002` e o frontend em `http://localhost:3000`.

- **Modo Produção**:
  ```bash
  npm run build
  npm start
  ```

## 📝 Padrões de Código

- Siga o [JavaScript Standard Style](https://standardjs.com/)
- Use ESLint e Prettier para formatação
- Escreva testes para novas funcionalidades
- Documente alterações na API

## 🔄 Processo de Pull Request

1. Crie um branch para sua feature:
   ```bash
   git checkout -b feature/nova-funcionalidade
   ```
2. Faça commit das suas alterações:
   ```bash
   git commit -am 'Adiciona nova funcionalidade'
   ```
3. Envie para o repositório remoto:
   ```bash
   git push origin feature/nova-funcionalidade
   ```
4. Abra um Pull Request

## 📋 Checklist do Pull Request

- [ ] O código segue os padrões do projeto
- [ ] Testes foram adicionados/atualizados
- [ ] Documentação foi atualizada
- [ ] O build passa localmente

## 📄 Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a [Licença MIT](LICENSE).
