import { Routes } from '@angular/router';
import { isAuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home-page/home-page.component'),
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login-page/login-page.component'),
  },
  {
    path: 'chat',
    loadComponent: () => import('./pages/chat-page/chat-page.component'),
    //protegemos el chat con el guard, se ejecuta antes de cargar el chat
    canActivate: [ isAuthGuard ], // dentro si no hay user redirige a Login
  },
  {
    path: '**',
    redirectTo: ''
  },

];




//lazyloading
