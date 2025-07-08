// src/app/services/chat.service.ts
import { inject, Injectable } from '@angular/core';
//importamos el modulo de @angular/fire/database
import { Database } from '@angular/fire/database';
import { endBefore, get, limitToLast, orderByChild, push, query, ref, serverTimestamp, set } from 'firebase/database';
import { firstValueFrom } from 'rxjs';
import { Messages } from '../interfaces/messages.interface';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})


export class ChatService {

  private db = inject(Database);
  private authService = inject(AuthService);


  //push al nodo messages
  async addMessage(msg: Messages): Promise<void> {
    const messagesRef = ref(this.db, 'messages');
    const newRef = push(messagesRef); //creamos referencia única
    await set(newRef, { ...msg, ts: serverTimestamp() }); //guardamos el timestamp del mensaje
  }

  //devuelve un Observable de array de mensajes, incluyendo la clave ID de cada uno.

  async getMessages(lastTs: number | null, pageSize: number): Promise<Messages[]> {
    const baseRef = ref(this.db, 'messages');

    const messagesQuery = lastTs === null
      ? query(
        baseRef,
        orderByChild('ts'),
        limitToLast(pageSize)
      )
      : query(
        baseRef,
        orderByChild('ts'),
        endBefore(lastTs),
        limitToLast(pageSize)
      );

    // una unica lectura en lugar de onValue para evitar listeners colgando
    const snap = await get(messagesQuery);
    const arr: Messages[] = [];

    snap.forEach(childSnap => {
      arr.push({
        ...(childSnap.val() as Messages),
        id: childSnap.key!
      });
    });

    return arr;
  }


  // bb q tiene el usuario actual, construye el objeto con serverTimestamp() y hace push.
  async sendMessage(text: string): Promise<void> {
    const trimmed = text.trim();
    if (!trimmed) return;

    const currentUser = await firstValueFrom(this.authService.currentUser$);
    if (!currentUser) {
      throw new Error('No hay usuario autenticado.');
    }

    const newMsg: Messages = {
      user: currentUser.displayName || 'Anónimo',
      from: currentUser.uid,
      text: trimmed,
      ts: serverTimestamp() as any,
      avatar: currentUser.photoURL ?? undefined
    };

    const messagesRef = ref(this.db, 'messages');
    const newRef = push(messagesRef);
    await set(newRef, newMsg);
  }



  //Borra un mensaje por su clave id
  async deleteMessage(id: string): Promise<void> {
    const msgRef = ref(this.db, `messages/${id}`);
    await set(msgRef, null);
  }

  // Borrar todos los mensajes
  async deleteAllMessages(): Promise<void> {
    const rootRef = ref(this.db, 'messages');
    await set(rootRef, null);
  }


}
