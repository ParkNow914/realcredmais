// Logger leve com níveis e mascaramento de PII (LGPD).
// Controlado por LOG_LEVEL (error|warn|info|debug) e silenciado em testes.

const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };

const envLevel = (process.env.LOG_LEVEL || '').toLowerCase();
const defaultLevel = process.env.NODE_ENV === 'production' ? 'info' : 'debug';
const isTest = process.env.NODE_ENV === 'test';
const activeLevel = LEVELS[envLevel] ?? LEVELS[defaultLevel];

// Campos sensíveis que nunca devem ir para os logs em texto puro.
const SENSITIVE_KEYS = new Set([
  'cpf',
  'email',
  'telefone',
  'phone',
  'salario',
  'valor',
  'mensagem',
  'message',
  'messages',
  'password',
  'senha',
  'authorization',
]);

function maskValue(value) {
  const str = String(value);
  if (str.length <= 4) return '***';
  return `${str.slice(0, 2)}***${str.slice(-2)}`;
}

// Retorna uma cópia do objeto com os campos sensíveis mascarados.
export function maskPII(input) {
  if (Array.isArray(input)) return input.map(maskPII);
  if (input && typeof input === 'object') {
    return Object.fromEntries(
      Object.entries(input).map(([key, val]) => {
        if (SENSITIVE_KEYS.has(key.toLowerCase())) {
          return [key, val == null || val === '' ? val : maskValue(val)];
        }
        return [key, typeof val === 'object' ? maskPII(val) : val];
      })
    );
  }
  return input;
}

function emit(level, consoleFn, args) {
  if (isTest && level !== 'error') return;
  if (LEVELS[level] > activeLevel) return;
  consoleFn(...args);
}

export const logger = {
  error: (...args) => emit('error', console.error, args),
  warn: (...args) => emit('warn', console.warn, args),
  info: (...args) => emit('info', console.log, args),
  debug: (...args) => emit('debug', console.log, args),
};

export default logger;
