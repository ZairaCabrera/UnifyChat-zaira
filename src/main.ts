import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
//import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { importProvidersFrom } from '@angular/core';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { IonicModule } from '@ionic/angular';
import { environment } from './environments/environment';
import { getAuth, provideAuth } from '@angular/fire/auth';


bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(IonicModule.forRoot()),

    provideRouter(routes),

    // inicializa Firebase
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),

    // recoge el token de auth para "inyectar" auth en servicios
    provideAuth(() => getAuth()),
  ]
})
.catch(err => console.error(err));



//bootstrapApplication(AppComponent, {


  // providers: [
  //   { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
  //   provideIonicAngular(),
  //   provideRouter(routes, withPreloading(PreloadAllModules)),
  // ],
//});
