import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { LoadingController, NavController, ToastController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  validations_form: FormGroup;
  errorMessage: string = '';
  exist: boolean = false;
  toast: any;

  validation_messages = {
    'email': [
      { type: 'required', message: 'Email is required,'},
      { type: 'pattern', message: 'Enter a valid email.'}
    ],
    'password': [
      { type: 'reqired', message: 'Password is required.'},
      { type: 'minlength', message: 'Password must be at least 6 characters long,'}
    ]
  };

  constructor(
    private navCtrl: NavController,
    private authSrv: AuthService,
    private formBuilder: FormBuilder,
    private toastCtrl: ToastController,
    private loadingController: LoadingController
  ) { }

  ngOnInit() {
    this.validations_form = this.formBuilder.group({
      email: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
      ])),
      password: new FormControl('', Validators.compose([
        Validators.required,
        Validators.minLength(6)
      ]))
    });
  }

  loginUser(value){
    this.authSrv.loginUser(value)
    .then(res => {
      this.exist = true;
      console.log(res);
      this.errorMessage = '';
      this.presentLoading(this.exist);
      this.navCtrl.navigateForward('/main');
    }, err => {
      this.exist = false;
      this.errorMessage = err.message;
      this.presentLoading(this.exist);
    });
  }

  goToRegisterPage(){
    this.navCtrl.navigateForward('/register');
  }

  async presentToast(param: boolean) {

    if (param) {
      this.toast = await this.toastCtrl.create({
        message: 'Signed In',
        duration: 2000,
        color: 'success',
      });
    } else {
      this.toast = await this.toastCtrl.create({
        message: 'Email or password is wrong',
        duration: 2000,
        color: 'danger',
      });
    }
    this.toast.present();
  }

  async presentLoading(param: boolean) {
    this.validations_form.reset();
    const loading = await this.loadingController.create({
      message: 'Signing in...',
      duration: 1600,
    });

    await loading.present();
    setTimeout(() => {
      this.presentToast(param);
    }, 1600);
  }

}
