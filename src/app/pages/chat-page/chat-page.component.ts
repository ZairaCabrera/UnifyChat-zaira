import { Component, inject, OnInit } from '@angular/core';
import { IonicModule, NavController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { logOutOutline } from 'ionicons/icons';

@Component({
  selector: 'app-chat-page',
  imports: [IonicModule],
  templateUrl: './chat-page.component.html',
  styleUrls: ['./chat-page.component.scss'],
})
export default class ChatPageComponent implements OnInit {

  private auth = inject(AuthService);
  private navCtrl = inject(NavController);

  public logOutOutline = logOutOutline;

  ngOnInit() { }

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
