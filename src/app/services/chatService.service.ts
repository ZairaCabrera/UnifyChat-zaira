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

  //injectamos el servicio de AngularFire
  private db = inject(Database);
  //ijectamos mi propio servicio de atenticación para saber qué usuario envia cada mensaje
  private authService = inject(AuthService);


  //devuelve un Observable de array de mensajes, incluyendo la clave ID de cada uno.

  async getMessages(lastTs: number | null, pageSize: number): Promise<Messages[]> {
    const baseRef = ref(this.db, 'messages');
    //si lastTs es null (primera vez que cargamos el ts), trae los últimos 10 mensajes
    const messagesQuery = lastTs === null
    //construimos la query
      ? query(
        baseRef,
        orderByChild('ts'), //ordenamos mensajes por fecha
        limitToLast(pageSize) //toma 10 páginas más recientes
      )
      : query(
        baseRef,
        orderByChild('ts'),
        endBefore(lastTs), //solo mensajes con fecha anterior a lastts
        limitToLast(pageSize)
      );

    // una unica lectura en lugar para evitar listeners colgando
    const snap = await get(messagesQuery);//ejecutamos la consulta
    const arr: Messages[] = [];

    //recorremos el nodo y cada nodo hijo lo agregamos con una clave única que firebase nos proporciona
    snap.forEach(childSnap => {
      arr.push({
        ...(childSnap.val() as Messages),
        id: childSnap.key!
      });
    });
    //devuelve array ordenado por ts
    return arr;
  }

  // bb q tiene el usuario actual, construye el objeto con serverTimestamp() y hace push.
  async sendMessage(text: string): Promise<void> {
    //comprobamos si está vacío
    const trimmed = text.trim();
    if (!trimmed) return;

    //obtenemos usuario actual
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

    const messagesRef = ref(this.db, 'messages');//referencia al nodo de firebase donde se guardan todos los mensajes
    const newRef = push(messagesRef);//devuelve obejeto con clave unica
    await set(newRef, newMsg); //guardamos el mensaje con la referencia indicada por newRef
  }

  //Borra un mensaje por su clave id
  async deleteMessage(id: string): Promise<void> {
    const msgRef = ref(this.db, `messages/${id}`);
    await set(msgRef, null); //firebase interpreta como borrar ese nodo
  }

  // Borrar todos los mensajes
  async deleteAllMessages(): Promise<void> {
    const msgRef = ref(this.db, 'messages');
    await set(msgRef, null);
  }


}
