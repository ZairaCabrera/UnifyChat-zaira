// src/app/services/chat.service.ts
import { Injectable } from '@angular/core';
//importamos el modulo de @angular/fire/database
import { AngularFireDatabase, AngularFireList } from '@angular/fire/compat/database';
import { firstValueFrom, Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Messages } from '../interfaces/messages.interface';
import { serverTimestamp } from 'firebase/database';

@Injectable({
  providedIn: 'root'
})



export class ChatService {


  private mensajesDB: AngularFireList<Messages>;

  constructor(
    private db: AngularFireDatabase,
    private authService: AuthService
  ) {
    // creamos la lista ordenada por el campo 'ts'
    this.mensajesDB = this.db.list('/messages', (ref) => ref.orderByChild('date')
    );

    // this.mensajesDB.push({
    // user: 'zaira',
    // text: 'Mensaje de prueba',
    // from: 'system',
    // ts: serverTimestamp() as any, // Timestamp del servidor
    // avatar: 'https://example.com/system-avatar.png' // URL de un avatar por defecto
  // });
  }



  //push al nodo messages
   addMessage(msg: Messages): Promise<void> {
    return this.mensajesDB.push(msg).then(() => {});
  }

  //devuelve un Observable de array de mensajes, incluyendo la clave ID de cada uno.

  getMessages(): Observable<(Messages & { id: string })[]> {
    return this.mensajesDB.snapshotChanges().pipe(
      map(actions =>
        actions.map(a => {
          // data tiene id?: string en su tipo, pero lo vamos a omitir
          const data = a.payload.val() as Messages & { id?: string };//contenido del mensaje
          const id = a.payload.key!; //nos da la clave id

          // extraemos id del objeto data y recogemos el resto en rest
          const { id: _, ...rest } = data;
          // ahora solo añadimos nuestra id limpia
          return { ...rest, id };
        })
      )
    );
  }

  // bbtiene el usuario actual, construye el objeto con serverTimestamp() y hace push.
  async sendMessage(text: string): Promise<void> {
    const trimmed = text.trim();
    if (!trimmed) return;

    // obtenemos currentUser$ o usuario actual
    const currentUser = await firstValueFrom(this.authService.currentUser$);

    if (!currentUser) {
      throw new Error('No hay usuario autenticado.');
    }

    const newMsg: Messages = {
      user: currentUser.displayName || 'Anónimo',
      from: currentUser.uid,
      text: trimmed,
      ts: serverTimestamp() as any,    // Timestamp del servidor
      avatar: currentUser.photoURL ?? undefined
    };

    await this.mensajesDB.push(newMsg);
  }

  /**
   * Borra un mensaje por su clave 'id'.
   */
  deleteMessage(id: string): Promise<void> {
    return this.mensajesDB.remove(id);
  }

  /**
   * Actualiza solo el texto y el timestamp de un mensaje existente.
   */
  updateMessage(id: string, newText: string): Promise<void> {
    return this.mensajesDB.update(id, {
      text: newText,
      ts: serverTimestamp() as any
    });
  }
}
