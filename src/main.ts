import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { importProvidersFrom } from '@angular/core';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { IonicModule } from '@ionic/angular';
import { environment } from './environments/environment';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getDatabase, provideDatabase } from '@angular/fire/database';

// --- Importaciones de la capa COMPAT:
import { AngularFireModule }          from '@angular/fire/compat';
import { AngularFireDatabaseModule }  from '@angular/fire/compat/database';
import { AngularFireAuthModule }      from '@angular/fire/compat/auth';
bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(IonicModule.forRoot()),

    provideRouter(routes),

    // inicializa Firebase
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),

    // recoge el token de auth para "inyectar" auth en servicios
    provideAuth(() => getAuth()),

    provideDatabase(() => getDatabase()),


    importProvidersFrom(
      AngularFireModule.initializeApp(environment.firebaseConfig),
      AngularFireDatabaseModule,
      AngularFireAuthModule
    )
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
