import { Routes } from '@angular/router';

import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth.guard';
import { estudianteGuard } from './core/guards/estudiante.guard';
import { guestGuard } from './core/guards/guest.guard';
import { AppShell } from './layout/app-shell/app-shell';

const detalle = () => import('./features/solicitudes/detalle/detalle-page/detalle-page').then(m => m.DetallePage);
const solicitudes = () =>
  import('./features/solicitudes/solicitudes-page/solicitudes-page').then(m => m.SolicitudesPage);

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login-page/login-page').then(m => m.LoginPage),
  },
  {
    path: '',
    component: AppShell,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'inicio' },
      {
        path: 'inicio',
        data: { titulo: 'Inicio' },
        loadComponent: () => import('./features/inicio/inicio-page/inicio-page').then(m => m.InicioPage),
      },

      // Estudiante
      {
        path: 'solicitudes',
        canActivate: [estudianteGuard],
        data: { titulo: 'Mis solicitudes' },
        loadComponent: solicitudes,
      },
      {
        path: 'solicitudes/nueva',
        canActivate: [estudianteGuard],
        data: { titulo: 'Nueva solicitud' },
        loadComponent: () =>
          import('./features/solicitudes/nueva-solicitud-page/nueva-solicitud-page').then(m => m.NuevaSolicitudPage),
      },
      {
        path: 'solicitudes/:id',
        canActivate: [estudianteGuard],
        data: { titulo: 'Detalle de la solicitud', volver: '/solicitudes' },
        loadComponent: detalle,
      },

      // Administrador
      {
        path: 'admin',
        canActivate: [adminGuard],
        children: [
          { path: 'solicitudes', data: { titulo: 'Solicitudes' }, loadComponent: solicitudes },
          {
            path: 'solicitudes/:id',
            data: { titulo: 'Detalle de la solicitud', volver: '/admin/solicitudes' },
            loadComponent: detalle,
          },
          {
            path: 'usuarios',
            data: { titulo: 'Usuarios' },
            loadComponent: () => import('./features/usuarios/usuarios-page/usuarios-page').then(m => m.UsuariosPage),
          },
        ],
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
