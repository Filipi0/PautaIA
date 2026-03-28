import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// 1. Definimos quais rotas são privadas (podem ser várias, usando regex)
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)' // Protege a rota /dashboard e qualquer sub-rota dela
]);

export default clerkMiddleware(async (auth, req) => {
  // 2. Se o usuário tentar acessar uma rota protegida...
  if (isProtectedRoute(req)) {
    // 3. O Clerk verifica o token. Se não estiver logado, bloqueia e redireciona.
    await auth.protect(); 
  }
});

export const config = {
  matcher: [
    // Pula arquivos internos do Next.js e arquivos estáticos
    "/((?!_next|.*\\..*).*)",
  ],
};