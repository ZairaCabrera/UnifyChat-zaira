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

  auth = inject(Auth);

  //devuelve un observable <User | null> que emite el usuario actual
  currentUser$ = user(this.auth);


  //constructor(private auth: Auth) {}

  // ... (otros métodos como signupWithEmailAndPassword, signinWithEmailAndPassword, signout)

  /**
   * Iniciar sesión usando Google con un popup. como async porque iniciamos primero sesión y esperamos un promesa
   * @returns Una promesa que se resuelve con los datos del usuario.
   */
   async signInWithGooglePopup(): Promise<User> {
    try {

      const provider = new GoogleAuthProvider();

      //iniciamos primero sesión con singInWithPopup
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


  //metodo para crear ususario usando email
  async signUpWithEmail(email: string, pass: string): Promise<User> {
    const creds = await createUserWithEmailAndPassword(this.auth, email, pass);
    return creds.user;
  }

  //método para registrarse con email
  async signInWithEmail(email: string, pass: string): Promise<User> {
    const creds = await signInWithEmailAndPassword(this.auth, email, pass);
    return creds.user;
  }

  // cerramos sesión
  async signOut(): Promise<void> {
    await signOut(this.auth);
  }









}
