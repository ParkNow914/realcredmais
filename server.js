import express from 'express';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import xssClean from 'xss-clean';
import mongoSanitize from 'express-mongo-sanitize';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { promisify } from 'util';
const appendFile = promisify(fs.appendFile);

// Valid categories
const CATEGORIAS_VALIDAS = [
  'inss', // Aposentado/Pensionista INSS
  'servidor', // Servidor Público
  'militar', // Militar
  'clt', // CLT
  'credito-pessoal', // Crédito Pessoal
  'fgts', // Saque Aniversário FGTS
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
const isDevelopment = process.env.NODE_ENV !== 'production';

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim())
  : [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:3002',
      'https://realcredplus.com.br',
      'https://www.realcredplus.com.br',
    ];

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    // Permite requisições sem origem (como mobile apps ou curl)
    if (!origin) return callback(null, true);

    // Em desenvolvimento, permite qualquer origem
    if (isDevelopment) return callback(null, true);

    if (allowedOrigins.indexOf(origin) === -1) {
      const msg =
        'A política de CORS para este site não permite acesso a partir da origem especificada.';
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
  optionsSuccessStatus: 204,
};

// Apply CORS with the specified options
app.use(cors(corsOptions));

// Ensure logs directory exists
try {
  if (!fs.existsSync(path.join(__dirname, 'logs'))) {
    fs.mkdirSync(path.join(__dirname, 'logs'));
  }
} catch (e) {
  console.warn('Could not create logs directory:', e.message);
}

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

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Chat-specific rate limiter to prevent abuse of OpenAI API (e.g., 20 reqs per minute)
const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: parseInt(process.env.CHAT_RATE_LIMIT_MAX || '20', 10),
  standardHeaders: true,
  legacyHeaders: false,
});
// Apply local middleware to /api/chat later when route is defined.

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

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// API endpoint for lead submission
app.post('/api/lead', async (req, res) => {
  console.log('Received lead request:', req.body);

  try {
    // Honeypot anti-spam check
    if (req.body.company_name || req.body.website_url) {
      console.log('Honeypot triggered - spam detected');
      return res.status(400).json({
        success: false,
        message: 'Erro ao processar solicitação.',
      });
    }

    const { nome, email, telefone, categoria, salario, valor, prazo, cpf } = req.body;

    // Log the received data for debugging
    console.log('Received data:', { nome, cpf, email, telefone, categoria, salario, valor, prazo });

    // Validate required fields
    if (!nome || !telefone || !categoria) {
      return res.status(400).json({
        success: false,
        message: 'Por favor, preencha todos os campos obrigatórios.',
        field: !nome ? 'nome' : !telefone ? 'telefone' : 'categoria',
      });
    }

    // Validate category
    if (!CATEGORIAS_VALIDAS.includes(categoria)) {
      console.error(
        `Invalid category received: ${categoria}. Valid categories are:`,
        CATEGORIAS_VALIDAS
      );
      return res.status(400).json({
        success: false,
        message: 'Categoria selecionada não é válida.',
        field: 'categoria',
        validCategories: CATEGORIAS_VALIDAS,
      });
    }

    // Validate phone format (11 digits with DDD)
    const phoneRegex = /^\d{11}$/;
    if (!phoneRegex.test(telefone.replace(/\D/g, ''))) {
      return res.status(400).json({
        success: false,
        message: 'Formato de telefone inválido. Use (99) 99999-9999.',
        field: 'telefone',
      });
    }

    // Validate email if provided
    if (email && !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de e-mail inválido.',
        field: 'email',
      });
    }

    // Here you would typically save the lead to a database
    console.log('Novo lead recebido:', {
      nome,
      email,
      telefone,
      categoria,
      salario,
      valor,
      prazo,
      cpf,
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
            <div class="info-value">${cpf ? cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : 'Não informado'}</div>
          </div>

          ${
            email
              ? `
          <div class="info">
            <div class="info-label">E-mail:</div>
            <div class="info-value">${email}</div>
          </div>
          `
              : ''
          }

          ${
            telefone
              ? `
          <div class="info">
            <div class="info-label">Telefone:</div>
            <div class="info-value">${telefone}</div>
          </div>
          `
              : ''
          }

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
      from: process.env.EMAIL_FROM || `"RealCred" <${process.env.EMAIL_USER}>`,
      to: process.env.LEAD_RECEIVER,
      subject: 'Novo Lead - Simulação de Empréstimo',
      html: emailTemplate,
    };

    console.log('Sending email to:', process.env.LEAD_RECEIVER);

    await transporter.sendMail(mailOptions);

    console.log('Email sent successfully');
    return res.status(200).json({
      success: true,
      message: 'Solicitação enviada com sucesso! Entraremos em contato em breve.',
    });
  } catch (error) {
    console.error('Error processing lead:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor. Por favor, tente novamente mais tarde.',
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
      message: 'Por favor, preencha todos os campos obrigatórios.',
    });
  }

  try {
    // Enviar email
    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Contato Site RealCred" <${process.env.EMAIL_USER}>`,
      to: process.env.CONTACT_RECEIVER || process.env.EMAIL_USER,
      subject: `Novo Contato: ${assunto}`,
      text: `Novo contato recebido através do site:

Nome: ${nome}
E-mail: ${email}
Telefone: ${telefone}
Assunto: ${assunto}
Mensagem: ${mensagem}

Data/Hora: ${new Date().toLocaleString('pt-BR')}`,
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'Mensagem enviada com sucesso! Entraremos em contato em breve.',
    });
  } catch (error) {
    console.error('Error processing contact form:', error);
    res.status(500).json({
      success: false,
      message: 'Ocorreu um erro ao processar sua mensagem. Por favor, tente novamente mais tarde.',
    });
  }
});

// Chat proxy to OpenAI Chat Completions API
// Health check for chat service
app.get('/api/chat/health', (req, res) => {
  const configured = Boolean(process.env.OPENAI_API_KEY);
  res.json({ success: true, configured });
});

// Admin route to view metrics (protected by basic auth)
app.get('/admin/chat-metrics', (req, res) => {
  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASS;
  const auth = req.headers.authorization;
  if (!user || !pass) return res.status(403).send('Admin not configured');
  if (!auth || !auth.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Admin"');
    return res.status(401).send('Authentication required');
  }
  const creds = Buffer.from(auth.split(' ')[1], 'base64').toString();
  const [u, p] = creds.split(':');
  if (u !== user || p !== pass) return res.status(403).send('Forbidden');

  // Serve a simple HTML table of metrics
  try {
    const { getMetrics } = await import('./db/metrics.js');
    const rows = getMetrics(500);
    const htmlRows = rows
      .map(
        (r) => `
      <tr>
        <td>${r.id}</td>
        <td>${r.timestamp}</td>
        <td>${r.model}</td>
        <td>${r.prompt_tokens}</td>
        <td>${r.completion_tokens}</td>
        <td>${r.estimated_cost_usd || ''}</td>
        <td>${r.ip || ''}</td>
        <td>${r.user_agent || ''}</td>
        <td>${r.streaming ? 'yes' : 'no'}</td>
      </tr>`
      )
      .join('\n');

    const html = `
      <html>
        <head>
          <title>Chat Metrics</title>
          <style>table{border-collapse:collapse;width:100%}td,th{border:1px solid #ddd;padding:8px}</style>
        </head>
        <body>
          <h1>Chat Metrics</h1>
          <table>
            <thead>
              <tr><th>ID</th><th>Timestamp</th><th>Model</th><th>Prompt</th><th>Completion</th><th>Cost</th><th>IP</th><th>UserAgent</th><th>Streaming</th></tr>
            </thead>
            <tbody>${htmlRows}</tbody>
          </table>
        </body>
      </html>
    `;
    res.send(html);
  } catch (e) {
    console.error('Error rendering admin metrics:', e.message);
    res.status(500).send('Internal server error');
  }
});

// Chat endpoint with optional streaming
app.post('/api/chat', chatLimiter, async (req, res) => {
  try {
    const { messages, message, stream } = req.body;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ success: false, message: 'OpenAI API key not configured on server.' });
    }

    // Accept either an array of messages or a single message string
    let chatMessages = [];
    if (Array.isArray(messages) && messages.length > 0) {
      chatMessages = messages;
    } else if (message) {
      // Default system prompt in Portuguese
      chatMessages = [
        { role: 'system', content: 'Você é o assistente virtual da RealCred +, responda de forma clara e objetiva em Português.' },
        { role: 'user', content: message },
      ];
    } else {
      return res.status(400).json({ success: false, message: 'Invalid request: no message provided.' });
    }

    const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';

    // If streaming requested, proxy and stream deltas
    if (stream) {
      const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ model, messages: chatMessages, stream: true, temperature: 0.2, max_tokens: 800 }),
      });

      if (!openaiRes.ok) {
        const errText = await openaiRes.text();
        console.error('OpenAI stream error:', errText);
        return res.status(502).json({ success: false, message: 'OpenAI returned an error', details: errText });
      }

      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      const reader = openaiRes.body.getReader();
      const decoder = new TextDecoder('utf-8');

      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          // OpenAI stream uses lines beginning with 'data: '
          const parts = chunk.split(/\n/);
          for (const part of parts) {
            if (!part.trim()) continue;
            if (part.startsWith('data: ')) {
              const data = part.replace(/^data:\s*/, '').trim();
              if (data === '[DONE]') {
                done = true;
                break;
              }
              try {
                const parsed = JSON.parse(data);
                const delta = parsed.choices && parsed.choices[0] && parsed.choices[0].delta && parsed.choices[0].delta.content;
                if (delta) {
                  // forward raw delta text to client
                  res.write(delta);
                }
              } catch (e) {
                // ignore JSON parse errors on partial chunks
              }
            }
          }
        }
        if (readerDone) break;
      }

      res.end();

      // Log streaming event
      const logEntry = {
        timestamp: new Date().toISOString(),
        model,
        streaming: true,
        ip: req.ip,
        userAgent: req.headers['user-agent'] || '',
      };
      await appendFile(path.join(__dirname, 'logs', 'chat_metrics.log'), JSON.stringify(logEntry) + '\n');

      // persist to DB if available
      try {
        const { insertMetric } = await import('./db/metrics.js');
        insertMetric({ timestamp: logEntry.timestamp, model: logEntry.model, ip: logEntry.ip, userAgent: logEntry.userAgent, streaming: 1 });
      } catch (e) {
        console.warn('DB metrics insert failed', e.message);
      }

      return;
    }

    // Non-stream: normal chat completion
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model, messages: chatMessages, temperature: 0.2, max_tokens: 800 }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('OpenAI error:', errText);
      return res.status(502).json({ success: false, message: 'OpenAI returned an error', details: errText });
    }

    const data = await response.json();
    const assistantMessage = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content
      ? data.choices[0].message.content
      : '';

    // Log metrics (if available)
    try {
      const usage = data.usage || {};
      // if fallback is configured and openai fails, try fallback
    } catch (e) {
      console.warn('Failed to parse usage:', e.message);
    }

    // If OpenAI didn't return a usable message and a fallback service is configured, try it
    if ((!assistantMessage || assistantMessage.trim() === '') && process.env.FALLBACK_API_URL) {
      try {
        const fallbackRes = await fetch(process.env.FALLBACK_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: process.env.FALLBACK_API_KEY ? `Bearer ${process.env.FALLBACK_API_KEY}` : undefined,
          },
          body: JSON.stringify({ message: message || (messages && messages[messages.length - 1] && messages[messages.length - 1].content) || '' }),
        });
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          if (fallbackData && fallbackData.reply) {
            // Log fallback as a metric too
            const logEntry = { timestamp: new Date().toISOString(), model: 'fallback', ip: req.ip };
            await appendFile(path.join(__dirname, 'logs', 'chat_metrics.log'), JSON.stringify(logEntry) + '\n');
            try {
              const { insertMetric } = await import('./db/metrics.js');
              insertMetric({ timestamp: logEntry.timestamp, model: 'fallback', ip: req.ip, userAgent: req.headers['user-agent'] || '' });
            } catch (e) {
              console.warn('Failed to persist fallback metric:', e.message);
            }

            return res.json({ success: true, reply: fallbackData.reply, fallback: true });
          }
        }
      } catch (e) {
        console.warn('Fallback call failed:', e.message);
      }
    }
      const prices = {
        'gpt-3.5-turbo': parseFloat(process.env.OPENAI_PRICE_GPT35 || '0.002'), // USD per 1k tokens
        'gpt-4': parseFloat(process.env.OPENAI_PRICE_GPT4 || '0.06'),
      };
      const pricePerThousand = prices[model] || prices['gpt-3.5-turbo'];
      const totalTokens = (usage.prompt_tokens || 0) + (usage.completion_tokens || 0);
      const estimatedCost = (totalTokens / 1000) * pricePerThousand;

      const logEntry = {
        timestamp: new Date().toISOString(),
        model,
        usage,
        estimatedCostUSD: estimatedCost,
        ip: req.ip,
        userAgent: req.headers['user-agent'] || '',
      };
      await appendFile(path.join(__dirname, 'logs', 'chat_metrics.log'), JSON.stringify(logEntry) + '\n');

      // persist metrics to DB
      try {
        const { insertMetric } = await import('./db/metrics.js');
        insertMetric({
          timestamp: logEntry.timestamp,
          model,
          prompt_tokens: usage.prompt_tokens,
          completion_tokens: usage.completion_tokens,
          estimated_cost_usd: estimatedCost,
          ip: req.ip,
          userAgent: req.headers['user-agent'] || '',
          streaming: 0,
        });
      } catch (e) {
        console.warn('Failed to persist metrics to DB:', e.message);
      }
    } catch (e) {
      console.warn('Failed to log chat metrics:', e.message);
    }

    return res.json({ success: true, reply: assistantMessage });
  } catch (error) {
    console.error('Error in /api/chat:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Only listen when not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server rodando em http://localhost:${PORT}`);
  });
}

export default app;
