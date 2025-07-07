import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { firstValueFrom, map } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

export const isAuthGuard: CanActivateFn = async (route, state): Promise<boolean | UrlTree> => {
  const auth    = inject(AuthService);
  const router  = inject(Router);

  try {
    // Espera al primer valor de currentUser$
    const user = await firstValueFrom(
      auth.currentUser$.pipe(
        map(u => u || null)
      )
    );
    //si existe user log, permite ruta
    if (user) {
      return true;
    } else {
      // sino redirige a login
      return router.parseUrl('/login');
    }
  } catch {
    return router.parseUrl('/login');
  }
};
