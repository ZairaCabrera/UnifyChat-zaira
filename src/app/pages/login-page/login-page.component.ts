import { AuthService } from './../../services/auth.service';
import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { FormUtils } from '../utils/form-utils';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-page',
  imports: [IonicModule, ReactiveFormsModule],
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export default class LoginPageComponent implements OnInit {

  private fb = inject(FormBuilder);
  myForm!: FormGroup;
  private authService = inject( AuthService );
  router = inject(Router);
  formUtils = FormUtils;

  ngOnInit() {

    this.myForm = this.fb.group({
    email: ['', [Validators.required, Validators.pattern(FormUtils.emailPattern)]],
    password: ['' , [Validators.required, Validators.minLength(6)]],
  })

 }

 async login() {

    const { email, password } = this.myForm.value;
    try {

      await this.authService.signInWithGooglePopup();

      this.router.navigate(['/chat']);
    } catch (err: any) {
      console.error('Error en login:', err);

    }
  }

  goToSignup() {
    this.router.navigate(['/signup']);
  }

}
