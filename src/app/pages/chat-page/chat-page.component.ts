import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InfiniteScrollCustomEvent, IonContent, IonicModule, IonInfiniteScroll, NavController } from '@ionic/angular';
import { logOutOutline } from 'ionicons/icons';
import { Messages } from 'src/app/interfaces/messages.interface';
import { AuthService } from 'src/app/services/auth.service';
import { ChatService } from 'src/app/services/chatService.service';

@Component({
  selector: 'app-chat-page',
  imports: [IonicModule, DatePipe, CommonModule, ReactiveFormsModule],
  templateUrl: './chat-page.component.html',
  styleUrls: ['./chat-page.component.scss'],
})
export default class ChatPageComponent implements OnInit {

  private readonly auth = inject(AuthService);
  private readonly chatService = inject(ChatService);
  private readonly navCtrl = inject(NavController);
  private fb = inject(FormBuilder);
  hasMore = true; // bandera comprobar si hay más mensajes
  readonly pageSize = 10;

  logOutOutline = logOutOutline; //icono de cerrar sesión
  messages = signal<Messages[]>([]);//aqui se crean los mensajes con la interfaz que queremos
  currentUser = this.auth.currentUser$; //info usuario autenticado: observable<User|null>

  messageForm: FormGroup = this.fb.group({
    message: ['', [Validators.required]]
  });; //creamos el formulario

  // bandera para mostrar u ocultar el menu de opciones.
  showMenu = signal(false);

  //bandera dispara el scroll
  private shouldScroll = false;
  //capturamos el elemento del DOM chatlist
  @ViewChild(IonContent, { static: false }) content!: IonContent;
  //capuramos evento del DOM del ionInfinitive
  @ViewChild('inf', { static: false }) infScroll!: IonInfiniteScroll;


  async ngOnInit() {
    // carga inicial de los últimos 10 mensajes
    const inicial = await this.chatService.getMessages(null, this.pageSize);
    this.messages.set(inicial);
    this.hasMore = inicial.length === this.pageSize;
    this.shouldScroll = true;//forzamos scroll al fondo
  }

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.shouldScroll = false;
      this.scrollToBottom();
    }
  }

  ngAfterViewInit() {
    setTimeout(() => this.content.scrollToBottom(1000), 1000); //fluidez
  }

  private scrollToBottom() {
    this.content.scrollToBottom(0);
  }

  async getMoreMessage(event: InfiniteScrollCustomEvent) {
    const current = this.messages();
    if (!current.length || !this.hasMore) {
      return event.target.complete();
    }

    const oldestTs = current[0].ts as number; //tomamos mensaje más antiguo
    const older = await this.chatService.getMessages(oldestTs, this.pageSize);
    this.hasMore = older.length === this.pageSize;
    setTimeout(() => {
      if (older.length) { // si hay mensajes los concatena de más antiguos a nuevos
        this.messages.set([...older, ...current]);
      }

      event.target.complete();
    }, 2000);
  }

  //menu de opciones, mostramos las opciones.
  toggleMenu() {
    this.showMenu.set(!this.showMenu());
  }


  // llamamos a chat.sendMessage() y luego reseteamos el formulario
  async onSubmit() {
    if (this.messageForm.invalid) return; //error

    const text = this.messageForm.value.message.trim(); //vacio
    if (!text) return;

    try {
      await this.chatService.sendMessage(text);
      this.messageForm.reset();
      // carga solo el ultimo mensaje
      const [last] = await this.chatService.getMessages(null, 1);
      // se añade al final de la lista
      this.messages.update(arr => [...arr, last]);
      this.shouldScroll = true;
    } catch (err) {
      console.error('Error enviando mensaje:', err);
    }
  }

  // borramos todos los mensajes
  async clearMessages() {
    try {
      await this.chatService.deleteAllMessages();
      this.messages.set([]);
      this.hasMore = false; //no esté cargando mensajes
      this.showMenu.set(false);
    } catch (err) {
      console.error('Error eliminando todos los mensajes', err);
    }
  }

  // elimina un mensaje concreto, según su id
  deleteMessage(id?: string) {
    try {
      if (!id) return;
      this.chatService.deleteMessage(id);

      this.messages.update(arr => arr.filter(msg => msg.id !== id));
      //this.showMenu.set(false);
    } catch (err) {
      console.error('Error eliminando mensaje', err);
    }
  }

  // cerramos sesion
  async logout() {
    try {
      await this.auth.signOut();
      this.navCtrl.navigateRoot(['/login'], { animated: true });
    } catch (err) {
      console.error('Error al cerrar sesión', err);
    }
  }
}




