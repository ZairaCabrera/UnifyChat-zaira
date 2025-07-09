import { inject, Injectable } from '@angular/core';
import {
  Auth,
  user,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  User
} from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  //injectamos servicio de Firebase authentication
  auth = inject(Auth);

  //devuelve un observable <User | null> que emite el usuario actual. Null cuando no haya nadie autenticado
  currentUser$ = user(this.auth);

  //Lanza popup para que el usuario elija cuenta de google

   async signInWithGooglePopup(): Promise<User> {
    try {

      const provider = new GoogleAuthProvider();

      //guardamos credenciales
      let userCredential = null;
      await signInWithPopup(this.auth, provider). then( (credencial) => userCredential = credencial);

      // userCredential.user contiene la información del usuario que inició sesión
      console.log("Inicio de sesión con Google exitoso:", userCredential!.user);

      return userCredential!.user;

    } catch (error: any) {
      console.error("Error al iniciar sesión con Google:", error);
      throw error; // Propagar el error
    }
  }

  //metodo para crear ususario usando email con método de Firebase
  async signUpWithEmail(email: string, pass: string): Promise<User> {
    const creds = await createUserWithEmailAndPassword(this.auth, email, pass);
    return creds.user;
  }

  //método registrarse con email y contraseña
  async signInWithEmail(email: string, pass: string): Promise<User> {
    const creds = await signInWithEmailAndPassword(this.auth, email, pass);
    return creds.user;
  }

  // cerramos sesión
  async signOut(): Promise<void> {
    await signOut(this.auth);
  }
}
