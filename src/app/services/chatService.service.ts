import { auth } from './../../environments/environment';
import { inject, Injectable } from '@angular/core';
import { Database, ref, push, listVal, remove, update } from '@angular/fire/database';
import { Observable, Subscription } from 'rxjs';
import { AuthService } from './auth.service';
import { Messages } from '../interfaces/messages.interface';
import { User } from 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private db = inject(Database);
  private authService = inject(AuthService); // Inyectamos el AuthService
  private msgsRef = ref(this.db, 'messages');

  //devuelve un observable: utiliza `listVal` de @angular/fire/database que ya incluye un listener en tiempo real.
  getMessages(): Observable<Messages[]> {
    return listVal<Messages>(this.msgsRef, { keyField: 'id' });
  }


  /* ENVIAMOS MENSAJES a la base de datos */
  async sendMessage(messageText: string): Promise<void> {

    if (!messageText || messageText.trim() === '') {
      return; // No enviar mensajes vacíos
    }

    return new Promise<void>((resolve, reject) => {
      let authSubscription: Subscription; //guardamos la suscripción aquí


      authSubscription = this.authService.currentUser$.subscribe({
        next: async (currentUser: User | null) => {

          authSubscription.unsubscribe();// desuscribirse inmediatamente después de obtener el usuario.

          if (!currentUser) {
            const error = new Error("No hay usuario autenticado para enviar el mensaje.");
            console.error(error.message);
            reject(error); // Rechaza la promesa si no hay usuario
            return;
          }

          // creamos el mensaje
          const newMessage: Messages = {
            text: messageText.trim(),
            ts: Date.now(), // timestamp para ordenar
            from: currentUser.uid,
            userDisplayName: currentUser.displayName || 'Anónimo', // nombre de Firebase Auth
            avatar: currentUser.photoURL || undefined // foto avatar de Firebase Auth
          }
          try {
            await push(this.msgsRef, newMessage); // 'push' añade un nuevo nodo con una clave unica
            console.log("Mensaje enviado con éxito!");
            resolve(); // Resuelve la promesa
          } catch (error) {
            console.error("Error al enviar mensaje:", error);
            reject(error); // rechaza la promesa si hay un error en el push
          }
        },
        error: (err) => {

          authSubscription.unsubscribe(); // desuscribir en caso de error
          console.error("Error obteniendo usuario para enviar mensaje:", err);
          reject(err); // rechaza la promesa con el error del observable
        },
        complete: () => {

        }
      });
    });
  }


/**
 * Borra un mensaje del chat por su ID.
 * id único del mensaje a borrar.
 */
// borramos los mensajes
deleteMessage(id: string): Promise < void> {
  const oneRef = ref(this.db, `messages/${id}`);
  return remove(oneRef);
}


/**
 * Modifica el texto de un mensaje existente.
 * ID único del mensaje a modificar.
 * nuevo texto del mensaje.
 */
// modificamos los mensajes
updateMessage(id: string, newText: string): Promise < void> {
  const oneRef = ref(this.db, `messages/${id}`);
  return update(oneRef, { text: newText, ts: Date.now() });
}




}
