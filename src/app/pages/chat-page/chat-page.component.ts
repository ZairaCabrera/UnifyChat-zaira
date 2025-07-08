import { Component, inject, OnInit, signal, ViewChild} from '@angular/core';
import { IonicModule, NavController, IonContent, InfiniteScrollCustomEvent, IonInfiniteScroll } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { logOutOutline } from 'ionicons/icons';
import { CommonModule, DatePipe } from '@angular/common';
import { Messages } from 'src/app/interfaces/messages.interface';
import { ChatService } from 'src/app/services/chatService.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom, take } from 'rxjs';

@Component({
  selector: 'app-chat-page',
  imports: [IonicModule, DatePipe, CommonModule, ReactiveFormsModule],
  templateUrl: './chat-page.component.html',
  styleUrls: ['./chat-page.component.scss'],
})
export default class ChatPageComponent implements OnInit {

  private auth = inject(AuthService);
  private chat = inject(ChatService);
  private navCtrl = inject(NavController);
  public logOutOutline = logOutOutline; //icono de cerrar sesión
  public messages = signal<Messages[]>([]);//aqui se crean los mensajes con la interfaz que queremos
  currentUser = this.auth.currentUser$ ; //info usuario autenticado: observable<User|null>
  public messageForm!: FormGroup; //creamos el formulario

  // bandera para mostrar u ocultar el menu de opciones.
  public showMenu = signal(false);

  //bandera dispara el scroll
  private shouldScroll = false;
  //capturamos el elemento del DOM chatlist
   @ViewChild(IonContent, { static: false }) content!: IonContent;
   //capuramos evento del DOM del ionInfinitive
   @ViewChild('inf', { static: false }) infScroll!: IonInfiniteScroll;


  constructor(private fb: FormBuilder,private chatService: ChatService, private authService: AuthService) {
    this.messageForm = this.fb.group({
      message: ['', [ Validators.required ]]
    });
  }

  async ngOnInit() {
    // carga inicial de los últimos 10 mensajes
    const inicial = await this.chat.getMessages(null, 10);
      this.messages.set(inicial);
      this.shouldScroll = true;
  }


  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.shouldScroll = false;
      this.scrollToBottom();
      this.infScroll.disabled = false;
    }
  }

  ngAfterViewInit() {
    // scroll al inicio
    // this.shouldScroll = true;
    setTimeout(() => this.content.scrollToBottom(1000), 1000);
  }

  private scrollToBottom() {
    this.content.scrollToBottom(0);
  }

   async getMoreMessage(event: InfiniteScrollCustomEvent) {
    const current = this.messages();
    if (!current.length) {
      event.target.disabled = true;
      return event.target.complete();
    }

    const oldestTs = current[0].ts as number;
    try {
      //  cargo 10 anteriores
      const older = await this.chat.getMessages(oldestTs, 10);
      if (older.length) {
        this.messages.set([...older, ...current]);
      } else {
        event.target.disabled = true;
      }
    } catch (err) {
      console.error('Error cargando anteriores', err);
    } finally {
      event.target.complete();
    }
  }


  //menu de opciones, mostramos las opciones.
  toggleMenu() {
    this.showMenu.set(!this.showMenu());
  }


  // llamamos a chat.sendMessage() y luego reseteamos el formulario
  async onSubmit() {
    if (this.messageForm.invalid) return;

    const text = this.messageForm.value.message.trim();
    if (!text) return;

    try {
      await this.chatService.sendMessage(text);
      this.messageForm.reset();
      // carga solo el ultimo mensaje
      const [last] = await this.chat.getMessages(null, 1);
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
      this.showMenu.set(false);
    } catch (err) {
      console.error('Error eliminando todos los mensajes', err);
    }
  }

  // elimina un mensaje concreto, según su id
  deleteMessage(id?: string) {
    try{
      if (!id) return;
      this.chatService.deleteMessage(id);
    } catch (err){
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




