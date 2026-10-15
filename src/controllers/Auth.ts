import { CookieOptions, NextFunction, Request, Response } from 'express';
import AuthService from '../services/AuthService';

const REFRESH_COOKIE = 'refreshToken';

const lCookieOptions: CookieOptions = {
    httpOnly: true,
    sameSite: 'strict',
    path: '/auth'
};

// Función para registrar un usuario nuevo
// Según el contrato, el registro no devuelve token: el frontend lleva al usuario a la página de login
const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await AuthService.register(req.body);

        // 201 porque se ha creado un recurso nuevo
        res.status(201).json({ user });
    } catch (error) {
        // Si el email ya existe, el ErrorHandler responde 409
        next(error);
    }
};

// Función para iniciar sesión
const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await AuthService.login(req.body.email, req.body.password);

      if (result) {
        // Devolvemos refreshToken en una cookie.
        res.cookie(REFRESH_COOKIE, result.refreshToken, {
          ...lCookieOptions,
          maxAge: 7 * 24 * 60 * 60 * 1000
        });
        // Devolvemos { token, user }
        res.status(200).json({ token: result.token, user: result.user });
      } else {
         // 401: no se ha podido identificar al usuario
            res.status(401).json({ message: 'Email o contraseña incorrectos' });
        }
    } catch (error) {
        next(error);
    }
};

// Función para pedir un access token nuevo con el refresh token
const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
      const refreshToken = req.cookies[REFRESH_COOKIE];

      if (!refreshToken) {
        return res.status(401).json({ message: 'Falta el refresh token' });
      }

      const result = await AuthService.refresh(refreshToken);

      if (result) {
          // Devolvemos { token }
          res.status(200).json(result);
      } else {
          res.status(401).json({ message: 'El usuario ya no existe' });
      }
    } catch (error) {
        // Si el refresh token está caducado o no es válido, el ErrorHandler responde 401
        next(error);
    }
};

const logout = (req: Request, res: Response) => {
  res.clearCookie(REFRESH_COOKIE, lCookieOptions);
  res.status(200).json({ message: 'Sesión cerrada' });
};

export default { register, login, refresh, logout };
