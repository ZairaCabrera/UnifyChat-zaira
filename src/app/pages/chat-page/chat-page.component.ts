import { Component, ElementRef, inject, OnInit, signal, ViewChild, AfterViewChecked } from '@angular/core';
import { IonicModule, NavController, IonContent } from '@ionic/angular';
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

  private scrollToBottom() {
    this.content.scrollToBottom(300);
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

  async logout() {
    try {
      await this.auth.signOut();
      this.navCtrl.navigateRoot(['/login'], { animated: true });
    } catch (err) {
      console.error('Error al cerrar sesión', err);
    }
  }




}
