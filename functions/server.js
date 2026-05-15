import serverless from 'serverless-http';
import app from '../server.js';

const serverHandler = serverless(app);

export const handler = async (event, context) => {
  if (event.path.startsWith('/.netlify/functions/server/')) {
    event.path = event.path.replace('/.netlify/functions/server/', '/');
  }

  return serverHandler(event, context);
};