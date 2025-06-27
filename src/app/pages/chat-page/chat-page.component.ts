import { Component, inject, OnInit, signal } from '@angular/core';
import { IonicModule, NavController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { logOutOutline } from 'ionicons/icons';
import { CommonModule, DatePipe } from '@angular/common';
import { Messages } from 'src/app/interfaces/messages.interface';
import { ChatService } from 'src/app/services/chatService.service';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-chat-page',
  imports: [IonicModule, DatePipe, CommonModule, FormsModule],
  templateUrl: './chat-page.component.html',
  styleUrls: ['./chat-page.component.scss'],
})
export default class ChatPageComponent {

  private auth = inject(AuthService);
  private chat = inject(ChatService);
  private navCtrl = inject(NavController);

  public logOutOutline = logOutOutline; //icono de cerrar sesión

  public messages = signal<Messages[]>([]);//aqui se crean los mensajes con la interfaz que queremos
  public messageInput = signal('');
  currentUser = this.auth.currentUser$ ; //info usuario autenticado: observable<User|null>

  ngOnInit() {
    // al llegar nuevos mensajes, actualizamos la señal
    this.chat.getMessages().subscribe(msgs => {
      this.messages.set(msgs);
    });
  }

  async sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;

    try {
      await this.chat.sendMessage(trimmed);
    } catch (err) {
      console.error('Error al enviar mensaje:', err);
    }
  }


  async logout() {
    try {
      await this.auth.signOut();
      //  vuelta a la pantalla de login
      this.navCtrl.navigateRoot(['/login'], { animated: true });
    } catch (err) {
      console.error('Error al cerrar sesión', err);
    }
  }




}
