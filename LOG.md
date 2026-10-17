### Secció d'Ús d'IA Generativa

**Eina i Model utilitzat**: Gemini 3.6 Flash i Claude Sonnet 5.5

---

### Prompts

#### Prompt 1:
- **Model**: Gemini Flash 3.6
- **Prompt literal**:
  > *"¿Cómo hago para leer una cookie o los valores de esa cookie en Express? ¿Existe alguna forma de hacerlo de forma nativa sin instalar ninguna dependencia externa?"*
- **Resposta de la IA**:
  Explicació que Express no inclou una forma integrada per llegir cookies (`res.cookie()` i `res.clearCookie()` només s'utilitzen per escriure-les i esborrar-les). Es detalla que la millor opció és utilitzar la dependència `cookie-parser` (`npm install cookie-parser` i `@types/cookie-parser`), registrar el middleware amb `app.use(cookieParser())` a `server.ts` i accedir als seus valors directament mitjançant `req.cookies[REFRESH_COOKIE]`.
- **Incoherències detectades**: 
  Cap incoherència tècnica.
- **Solució / Adaptació manual**: 
  S'ha instal·lat la llibreria `cookie-parser`, s'ha afegit el middleware al fitxer principal del servidor (`server.ts`) i s'ha adaptat l'endpoint de refresc de token per extreure el refresh token des de `req.cookies`.

---

#### Prompt 2:
- **Model**: Gemini Flash 3.6
- **Prompt literal**:
  > *"¿Cómo puedo definir las opciones de seguridad de una cookie con TypeScript en Express usando CookieOptions?"*
- **Resposta de la IA**:
  Explicació de com estructurar un objecte de tipus `CookieOptions` en TypeScript definint paràmetres de seguretat com `httpOnly: true`, `sameSite: 'strict'`, `path: '/auth'` i `secure: process.env.NODE_ENV === 'production'`. Es detalla l'ús de `res.cookie('nombreCookie', valor, cookieOptions)` per adjuntar la cookie a la resposta de l'API.
- **Incoherències detectades**: 
  Cap incoherència tècnica.
- **Solució / Adaptació manual**: 
  S'ha definit l'objecte de configuració de la cookie amb les opcions de seguretat recomanades i s'ha integrat a la funció del controlador d'autenticació en executar la devolució de la cookie HTTP-only.

---

#### Prompt 3: 
- **Model**: Gemini Flash 3.6
- **Prompt literal**:
  > *"Tengo configurado el middleware de CORS en Express utilizando `CORS_ORIGIN=*` en el `.env` y `credentials: true` en las opciones del paquete `cors`. Sin embargo, desde el frontend en Angular recibo un error con status 0 ('No se puede conectar con la API'). ¿Por qué ocurre esto si tengo el CORS supuestamente permitido y cómo lo puedo arreglar?"*
- **Resposta de la IA**:
  Explicació que la llibreria `cors` a Express no permet utilitzar el comodí `CORS_ORIGIN=*` quan l'opció `credentials: true` està activada, ja que l'especificació del protocol HTTP prohibeix utilitzar un comodí si s'envien credencials. Es va proposar adaptar el middleware `src/middleware/Cors.ts` per validar l'origen de la petició de manera dinàmica.
- **Incoherències detectades**: 
  Cap incoherència tècnica.
- **Solució / Adaptació manual**: 
  S'ha modificat la lògica de comprovació d'origen al fitxer `src/middleware/Cors.ts` per retornar de forma dinàmica l'origen del frontend (`http://localhost:4200`) quan s'utilitza `*`, permetent que el navegador rebi les capçaleres correctes (`Access-Control-Allow-Origin` i `Access-Control-Allow-Credentials: true`) i solucionant l'error `status === 0` a Angular.

---

#### Prompt 4: 
- **Model**: Claude Sonnet 5.5
- **Prompt literal**:
  > *"En mi frontend Angular, al entrar en Autores o Libros la petición `GET /authors?page=1&limit=4` recibe un 401 y la aplicación me devuelve a `/login`. En el chat no me pasa tan a menudo, pero si hago varias navegaciones entre el menú principal y el chat, acabo igualmente en el login con un error 401. Te adjunto capturas de la pestaña Network. ¿Dónde está el problema? Mi access token se guarda solo en memoria, así que ¿cómo debo recuperarlo para que la sesión no se pierda?"*
- **Resposta de la IA**:
  Després de llegir el codi del frontend i d'analitzar les captures de DevTools, la IA va identificar la causa. El token d'accés només viu en memòria (`currentUserToken` comença a `null` a `auth.service.ts`), mentre que l'usuari es restaura de `localStorage`. Després d'una recàrrega de la pàgina, `authGuard` deixa passar perquè hi ha usuari, però l'interceptor envia la petició sense capçalera `Authorization`. El backend respon 401 "Falta el token" i l'interceptor crida `logout()`, que esborra la cookie del refresh. Això es va confirmar comprovant que `GET /books` no portava `Authorization`.
  Es va aclarir que mantenir el token en memòria és correcte, però cal recuperar-lo en arrencar amb la cookie del refresh. La solució proposada va ser afegir un mètode `restoreSession()` a `AuthService`, que fa `POST /auth/refresh` si hi ha usuari guardat, i registrar-lo amb `provideAppInitializer` perquè s'executi abans del router i dels guards.
- **Incoherències detectades**:
  - La primera hipòtesi de la IA (el token es perd en recarregar) no explicava del tot la prova de l'usuari, que deia que no recarregava. Es va haver de contrastar amb les captures. La causa real era que `ng serve` recarrega la pàgina en cada desat de fitxer.
- **Solució / Adaptació manual**:
  S'ha afegit `restoreSession()` a `src/app/services/auth.service.ts` i `provideAppInitializer(() => inject(AuthService).restoreSession())` a `src/app/app.config.ts`. S'ha comprovat manualment que, després de recarregar la pàgina, la sessió es manté i no es redirigeix al login.
