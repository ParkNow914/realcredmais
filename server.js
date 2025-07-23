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



// Parse JSON bodies
app.use(express.json());

// Configuração de CORS dinâmica baseada em ambiente
const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
    : ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3002'];

// CORS configuration
const corsOptions = {
    origin: (origin, callback) => {
        // Permite requisições sem origem (como mobile apps ou curl)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'A política de CORS para este site não permite acesso a partir da origem especificada.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
    credentials: true,
    maxAge: 86400, // 24 horas
    preflightContinue: false,
    optionsSuccessStatus: 204
};

// Apply CORS with the specified options
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

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

// API endpoint for lead submission
app.post('/api/lead', async (req, res) => {
  console.log('Received lead request:', req.body);
  
  try {
    const { nome, email, telefone, categoria, salario, valor, prazo, cpf } = req.body;

    // Log the received data for debugging
    console.log('Received data:', { nome, cpf, email, telefone, categoria, salario, valor, prazo });

    // Validate required fields
    if (!nome || !telefone || !categoria) {
      return res.status(400).json({
        success: false,
        message: 'Por favor, preencha todos os campos obrigatórios.',
        field: !nome ? 'nome' : !telefone ? 'telefone' : 'categoria'
      });
    }

    // Validate category
    if (!CATEGORIAS_VALIDAS.includes(categoria)) {
      console.error(`Invalid category received: ${categoria}. Valid categories are:`, CATEGORIAS_VALIDAS);
      return res.status(400).json({
        success: false,
        message: 'Categoria selecionada não é válida.',
        field: 'categoria',
        validCategories: CATEGORIAS_VALIDAS
      });
    }

    // Validate phone format (11 digits with DDD)
    const phoneRegex = /^\d{11}$/;
    if (!phoneRegex.test(telefone.replace(/\D/g, ''))) {
      return res.status(400).json({
        success: false,
        message: 'Formato de telefone inválido. Use (99) 99999-9999.',
        field: 'telefone'
      });
    }

    // Validate email if provided
    if (email && !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de e-mail inválido.',
        field: 'email'
      });
    }

    // Here you would typically save the lead to a database
    console.log('Novo lead recebido:', { nome, email, telefone, categoria, salario, valor, prazo, cpf });

    // Send success response
    return res.status(200).json({
      success: true,
      message: 'Solicitação recebida com sucesso! Entraremos em contato em breve.'
    });

    // Format values - handle both string with comma and dot, and number inputs
    const formatCurrency = (value) => {
      if (typeof value === 'number') return value;
      if (!value) return 0;
      return parseFloat(value.toString().replace(/\./g, '').replace(',', '.')) || 0;
    };

    const formattedValor = formatCurrency(valor);
    const formattedSalario = formatCurrency(salario);
    const formattedPrazo = parseInt(prazo) || 0;

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



app.listen(PORT, () => {
    console.log(`Server rodando em http://localhost:${PORT}`);
});