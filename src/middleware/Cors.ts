import cors from 'cors';
import { config } from '../config/config';

// Middleware de CORS: le dice al navegador desde qué origen se puede llamar a esta API.
// El origen se configura en el .env con CORS_ORIGIN; por defecto se acepta cualquiera.
// De las peticiones OPTIONS (las que manda el navegador antes de la real) se encarga
// el propio paquete cors.
export const Cors = cors({
    origin: (origin, callback) => {
      // Si CORS_ORIGIN es '*', permitimos dinámicamente cualquier origen que haga la petición
      if (config.cors.origin === '*' || !origin) {
        callback(null, true);
      } else if (origin === config.cors.origin || origin === 'http://localhost:4200') {
        callback(null, true);
      } else {
        callback(new Error('No permitido por CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
    credentials: true
});
