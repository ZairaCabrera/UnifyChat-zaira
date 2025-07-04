import { Component, inject, OnInit, signal, ViewChild} from '@angular/core';
import { IonicModule, NavController, IonContent, InfiniteScrollCustomEvent } from '@ionic/angular';
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


  constructor(private fb: FormBuilder,private chatService: ChatService, private authService: AuthService) {
    this.messageForm = this.fb.group({
      message: ['', [ Validators.required ]]
    });
  }

  ngOnInit() {
    this.chat.getMessages().subscribe(msgs => {
      this.messages.set(msgs);
      // marcamos scroll tras llegada de nuevos mensajes
      this.shouldScroll = true;
    });


  }

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.shouldScroll = false;
      this.scrollToBottom();
    }
  }

  ngAfterViewInit() {
    // scroll al inicio
    setTimeout(() => this.content.scrollToBottom(300), 50);
  }

  private scrollToBottom() {
    this.content.scrollToBottom(300);
  }

  async loadMore(event: InfiniteScrollCustomEvent) {
    try {
      // se llama al servicio para traer mensajes anteriores
      await new Promise(res => setTimeout(res, 500));

    } finally {
      // informa a ionic que ya se ha terminado de cargar los mensajes
      event.detail.complete();
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

    const currentUser = await firstValueFrom(
      this.authService.currentUser$.pipe(take(1))
    );
    if (!currentUser) { return; }

    const newMsg: Messages = {
      user:   currentUser.displayName || 'Anónimo',
      from:   currentUser.uid,
      text,
      ts:     Date.now(),
      avatar: currentUser.photoURL ?? undefined
    };

    try {
      await this.chatService.addMessage(newMsg);
      this.messageForm.reset();

      // marcamos la bandera para que en AfterViewChecked haga scroll
      this.shouldScroll = true;

    } catch (err) {
      console.error('Error añadiendo mensaje:', err);
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

/**
 *
 * he conseguido poner el scroll abajo cuando inicias sesión (que estaba predeterminado arriba)
 * y también que se posicione abajo cada vez que salga un mensaje.
 * he puesto un desplegable con dos opciones: borrar todos los mensajes y logout
 * he puesto un icono de papelera para eliminar cada uno de los mensajes
 *
 */


