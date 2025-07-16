import express from 'express';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import xssClean from 'xss-clean';
import mongoSanitize from 'express-mongo-sanitize';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';

// Valid categories
const CATEGORIAS_VALIDAS = [
  'inss',               // Aposentado/Pensionista INSS
  'servidor',           // Servidor Público
  'militar',            // Militar
  'clt',                // CLT
  'credito-pessoal',    // Crédito Pessoal
  'fgts'                // Saque Aniversário FGTS
];

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log all incoming requests for debugging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    if (Object.keys(req.body).length > 0) {
        console.log('Request body:', req.body);
    }
    next();
});

// Para usar __dirname em ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



// CORS configuration
const corsOptions = {
    origin: ['http://localhost:3001', 'https://yourdomain.com'], // Frontend na porta 3001
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

// Apply CORS with the specified options
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));
app.use(express.json());

// Basic security headers
app.use((req, res, next) => {
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-DNS-Prefetch-Control', 'off');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
});

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false });
app.use(limiter);
app.use(xssClean());
app.use(mongoSanitize());

// Servir arquivos estáticos
app.use(express.static(__dirname));
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/dist', express.static(path.join(__dirname, 'dist')));

// Servir LOGO 2 como favicon
app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, 'assets', 'LOGO 2.jpeg'));
});

// Rota GET / para retornar index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Helper functions
const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const isValidPhone = (phone) => {
  const re = /^\(?[1-9]{2}\)?\s?(?:[2-8]|9[1-9])[0-9]{3}\-?[0-9]{4}$/;
  return re.test(phone);
};

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

// API Routes
app.post('/api/lead', async (req, res) => {
  console.log('Received lead request:', req.body);
  
  try {
    // Validate request body
    if (!req.body) {
      console.error('No request body received');
      return res.status(400).json({
        success: false,
        message: 'Dados da requisição inválidos'
      });
    }
    
    const { nome, cpf, email, telefone, categoria, salario, valor, prazo } = req.body;

    // Log the received data for debugging
    console.log('Received data:', { nome, cpf, email, telefone, categoria, salario, valor, prazo });

    // Basic validation for required fields
    if (!nome || !cpf || !categoria || salario === undefined || valor === undefined || !prazo) {
      console.log('Missing required fields');
      return res.status(400).json({ 
        success: false,
        message: 'Todos os campos são obrigatórios.',
        fields: {
          nome: !nome,
          cpf: !cpf,
          categoria: !categoria,
          salario: salario === undefined,
          valor: valor === undefined,
          prazo: !prazo
        }
      });
    }

    // Validate CPF format (11 digits)
    if (!/^\d{11}$/.test(cpf)) {
      return res.status(400).json({
        success: false,
        message: 'CPF inválido. Deve conter 11 dígitos numéricos.',
        field: 'cpf'
      });
    }

    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de e-mail inválido.',
        field: 'email'
      });
    }

    // Validate phone format if provided (accepts (99) 99999-9999 or (99) 9999-9999)
    if (telefone && !/^\(\d{2}\)\s*\d{4,5}-?\d{4}$/.test(telefone)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de telefone inválido. Use (99) 99999-9999.',
        field: 'telefone'
      });
    }

    // Validate category
    console.log('Validating category:', categoria);
    console.log('Type of categoria:', typeof categoria);
    console.log('Valid categories:', CATEGORIAS_VALIDAS);
    
    if (!CATEGORIAS_VALIDAS.includes(categoria)) {
      console.error(`Invalid category received: ${categoria}. Valid categories are:`, CATEGORIAS_VALIDAS);
      return res.status(400).json({
        success: false,
        message: `Categoria selecionada não é válida. Categoria recebida: ${categoria}`,
        field: 'categoria',
        receivedCategory: categoria,
        validCategories: CATEGORIAS_VALIDAS
      });
    }

    // Validate email if provided
    if (email && !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de e-mail inválido',
        field: 'email'
      });
    }

    // Validate phone if provided
    if (telefone && !isValidPhone(telefone)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de telefone inválido. Use (DD) 9XXXX-XXXX',
        field: 'telefone'
      });
    }

    // Validate category
    console.log('Validating category:', categoria);
    console.log('Type of categoria:', typeof categoria);
    console.log('Valid categories:', CATEGORIAS_VALIDAS);
    
    if (!CATEGORIAS_VALIDAS.includes(categoria)) {
      console.error(`Invalid category received: ${categoria}. Valid categories are:`, CATEGORIAS_VALIDAS);
      return res.status(400).json({
        success: false,
        message: `Categoria selecionada não é válida. Categoria recebida: ${categoria}`,
        field: 'categoria',
        receivedCategory: categoria,
        validCategories: CATEGORIAS_VALIDAS
      });
    }

    // Format values - handle both string with comma and dot, and number inputs
    const formatCurrency = (value) => {
      if (typeof value === 'number') return value;
      return parseFloat(value.toString().replace(/\./g, '').replace(',', '.'));
    };

    const formattedValor = formatCurrency(valor);
    const formattedSalario = formatCurrency(salario);
    const formattedPrazo = parseInt(prazo);

    // Validate numeric values
    if (isNaN(formattedValor) || isNaN(formattedSalario) || isNaN(formattedPrazo)) {
      return res.status(400).json({
        success: false,
        message: 'Valores numéricos inválidos',
        fields: {
          valor: isNaN(formattedValor),
          salario: isNaN(formattedSalario),
          prazo: isNaN(formattedPrazo)
        }
      });
    }

    // Create email template
    const emailTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Inter', sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #0066cc; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 8px; }
        .info { margin: 20px 0; }
        .info-label { font-weight: bold; color: #0066cc; }
        .info-value { margin: 5px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; }
        .timestamp { font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Novo Lead - Simulação de Empréstimo</h1>
          <img src="https://realcredplus.com.br/assets/LOGO%202.jpeg" alt="RealCred +" style="max-width: 200px; margin: 20px auto; display: block;">
        </div>
        
        <div class="content">
          <div class="info">
            <div class="info-label">Nome Completo:</div>
            <div class="info-value">${nome}</div>
          </div>
          
          <div class="info">
            <div class="info-label">CPF:</div>
            <div class="info-value">${cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}</div>
          </div>
          
          ${email ? `
          <div class="info">
            <div class="info-label">E-mail:</div>
            <div class="info-value">${email}</div>
          </div>
          ` : ''}
          
          ${telefone ? `
          <div class="info">
            <div class="info-label">Telefone:</div>
            <div class="info-value">${telefone}</div>
          </div>
          ` : ''}
          
          <div class="info">
            <div class="info-label">Categoria:</div>
            <div class="info-value">${categoria.charAt(0).toUpperCase() + categoria.slice(1)}</div>
          </div>
          
          <div class="info">
            <div class="info-label">Salário/Benefício Líquido:</div>
            <div class="info-value">R$ ${formattedSalario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          </div>
          
          <div class="info">
            <div class="info-label">Valor Desejado:</div>
            <div class="info-value">R$ ${formattedValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          </div>
          
          <div class="info">
            <div class="info-label">Prazo:</div>
            <div class="info-value">${formattedPrazo} meses</div>
          </div>
        </div>
        
        <div class="footer">
          <div class="timestamp">Data/Hora: ${new Date().toLocaleString('pt-BR')}</div>
          <div>Sistema de Leads - RealCred +</div>
        </div>
      </div>
    </body>
    </html>`;

    // Send email
    const mailOptions = {
      from: `"RealCred" <${process.env.GMAIL_USER}>`,
      to: process.env.LEAD_RECEIVER,
      subject: 'Novo Lead - Simulação de Empréstimo',
      html: emailTemplate
    };
    
    console.log('Sending email to:', process.env.LEAD_RECEIVER);

    await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully');
    return res.status(200).json({
      success: true,
      message: 'Solicitação enviada com sucesso! Entraremos em contato em breve.'
    });
    
  } catch (error) {
    console.error('Error processing lead:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor. Por favor, tente novamente mais tarde.'
    });
  }
});

// Rota para processar contatos
app.post('/api/contact', async (req, res) => {
  const { nome, email, telefone, assunto, mensagem } = req.body;

  // Validação básica dos campos obrigatórios
  if (!nome || !email || !telefone || !assunto || !mensagem) {
    return res.status(400).json({
      success: false,
      message: 'Por favor, preencha todos os campos obrigatórios.'
    });
  }

  try {
    // Enviar email
    const mailOptions = {
      from: `Contato Site RealCred <${process.env.GMAIL_USER}>`,
      to: process.env.CONTACT_RECEIVER || process.env.GMAIL_USER,
      subject: `Novo Contato: ${assunto}`,
      text: `Novo contato recebido através do site:

Nome: ${nome}
E-mail: ${email}
Telefone: ${telefone}
Assunto: ${assunto}
Mensagem: ${mensagem}

Data/Hora: ${new Date().toLocaleString('pt-BR')}`
    };

    await transporter.sendMail(mailOptions);
    
    res.json({
      success: true,
      message: 'Mensagem enviada com sucesso! Entraremos em contato em breve.'
    });
  } catch (error) {
    console.error('Error processing contact form:', error);
    res.status(500).json({
      success: false,
      message: 'Ocorreu um erro ao processar sua mensagem. Por favor, tente novamente mais tarde.'
    });
  }
});

// Rota para processar leads
app.post('/lead', async (req, res) => {
  const { nome, email, telefone, cpf, categoria, salario, valor, prazo } = req.body;

  // Validação básica dos campos obrigatórios
  if (!nome || !categoria || !salario || !valor || !prazo) {
    return res.status(400).json({
      success: false,
      message: 'Dados incompletos. Por favor, preencha todos os campos obrigatórios.'
    });
  }

  // Validar e-mail se fornecido
  if (email && !isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      message: 'Formato de e-mail inválido',
      field: 'email'
    });
  }

  // Validar telefone se fornecido
  if (telefone && !isValidPhone(telefone)) {
    return res.status(400).json({
      success: false,
      message: 'Formato de telefone inválido. Use (DD) 9XXXX-XXXX',
      field: 'telefone'
    });
  }

  // Validar categoria
  if (!CATEGORIAS_VALIDAS.includes(categoria)) {
    return res.status(400).json({
      success: false,
      message: 'Categoria inválida',
      field: 'categoria',
      validCategories: CATEGORIAS_VALIDAS
    });
  }

  try {
    // Formatar valores
    const formatCurrency = (value) => {
      if (typeof value === 'number') return value;
      if (typeof value === 'string') {
        // If it's already a string with a dot, parse it directly
        if (value.includes('.')) {
          return parseFloat(value);
        }
        // If it's a string with comma as decimal separator
        return parseFloat(value.replace(/\./g, '').replace(',', '.'));
      }
      return 0; // Default value if parsing fails
    };

    const formattedValor = formatCurrency(valor);
    const formattedSalario = formatCurrency(salario);
    const formattedPrazo = parseInt(prazo);

    // Validar valores numéricos
    if (isNaN(formattedValor) || isNaN(formattedSalario) || isNaN(formattedPrazo)) {
      return res.status(400).json({
        success: false,
        message: 'Valores numéricos inválidos',
        fields: {
          valor: isNaN(formattedValor),
          salario: isNaN(formattedSalario),
          prazo: isNaN(formattedPrazo)
        }
      });
    }

    // Aqui você pode adicionar a lógica para salvar no banco de dados ou enviar por e-mail
    // Por exemplo, enviar um e-mail com os dados do lead
    const mailOptions = {
      from: `Novo Lead RealCred <${process.env.GMAIL_USER}>`,
      to: process.env.LEAD_RECEIVER || process.env.GMAIL_USER,
      subject: `Novo Lead: ${nome} - ${categoria}`,
      text: `Novo lead recebido:

Nome: ${nome}
E-mail: ${email || 'Não informado'}
Telefone: ${telefone || 'Não informado'}
CPF: ${cpf || 'Não informado'}
Categoria: ${categoria}
Salário: R$ ${formattedSalario.toFixed(2)}
Valor desejado: R$ ${formattedValor.toFixed(2)}
Prazo: ${formattedPrazo} meses

Data/Hora: ${new Date().toLocaleString('pt-BR')}`
    };

    await transporter.sendMail(mailOptions);
    
    res.json({
      success: true,
      message: 'Lead recebido com sucesso!',
      data: {
        nome,
        email,
        telefone,
        cpf,
        categoria,
        salario: formattedSalario,
        valor: formattedValor,
        prazo: formattedPrazo
      }
    });
  } catch (error) {
    console.error('Erro ao processar lead:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao processar o lead. Por favor, tente novamente.'
    });
  }
});

// Rota para contato
app.post('/api/contact', async (req, res) => {
  const { nome, email, telefone, assunto, mensagem } = req.body;

  if (!nome || !email || !assunto || !mensagem) {
    return res.status(400).json({ error: 'Dados incompletos.' });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS
    }
  });

  const mailOptions = {
    from: `Contato RealCred <${process.env.GMAIL_USER}>`,
    to: process.env.LEAD_RECEIVER,
    subject: `Novo Contato: ${assunto}`,
    text: `Novo contato recebido:\n\nNome: ${nome}\nE-mail: ${email}\nTelefone: ${telefone || '-'}\nAssunto: ${assunto}\nMensagem: ${mensagem}\nData/Hora: ${new Date().toLocaleString('pt-BR')}`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao enviar e-mail.' });
  }
});

app.listen(PORT, () => {
    console.log(`Server rodando em http://localhost:${PORT}`);
});