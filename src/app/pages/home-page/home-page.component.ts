import { Component, ViewEncapsulation } from '@angular/core';
import { IonicModule, NavController } from '@ionic/angular';


@Component({
  selector: 'app-home-page',
  imports: [IonicModule],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export default class HomePageComponent {
  constructor(private navCtrl: NavController) {}

  redirectToLogin() {
    this.navCtrl.navigateForward('/login', {
      animated: true,
      animationDirection: 'forward',
    });
  }
}
