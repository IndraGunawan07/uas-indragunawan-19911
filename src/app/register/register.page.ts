import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { ToastController } from '@ionic/angular';

declare var google: any;

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  validations_form: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  flag = true;
  map: any;
  lat: number;
  lng: number;
  toast: any;
  infoWindow: any = new google.maps.InfoWindow();
  @ViewChild('map', {read: ElementRef, static: false}) mapRef: ElementRef;

  umnPos: any = {
    lat: -6.256081,
    lng: 106.618755
  };

  validation_messages = {
    'email': [
      { type: 'required', message: 'Email is required,'},
      { type: 'pattern', message: 'Enter a valid email.'}
    ],
    'password': [
      { type: 'reqired', message: 'Password is required.'},
      { type: 'minlength', message: 'Password must be at least 6 characters long,'}
    ],
    'cpassword': [
      { type: 'required', message: 'Confirm password is required'},
      { type: 'minlength', message: 'Password must be at least 6 characters long'},
      { type: 'same', message: 'Password must be same as Confirm Password'}
    ]
  };

  constructor(
    private authSrv: AuthService,
    private formBuilder: FormBuilder,
    private router: Router,
    private firestore: AngularFirestore,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
    this.validations_form = this.formBuilder.group({
      email: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
      ])),
      password: new FormControl('', Validators.compose([
        Validators.minLength(6),
        Validators.required
      ])),
      cpassword: new FormControl('', Validators.compose([
        Validators.minLength(6),
        Validators.required,
      ])),
      nama: new FormControl(),
      nim: new FormControl()
    });
  }

  ionViewDidEnter(){
    // this.showMap(this.umnPos);
  }

  tryRegister(value){
    this.authSrv.registerUser(value)
    .then(res => {
      console.log(res);
      console.log('ini lat:', this.lat);
      this.firestore.collection('users').add({
        email: value.email,
        nama: value.nama,
        nim: value.nim,
        latitude: this.lat,
        longitude: this.lng,
        imageUrl: 'https://firebasestorage.googleapis.com/v0/b/mobile2ionic-91059.appspot.com/o/pp.png?alt=media&token=96581b0c-8def-4fe0-818e-f4a30f9b3c39',
      });
      this.errorMessage = '';
      this.successMessage = 'Your account has been created. Please log in.';
    }, err => {
      console.log(err);
      this.errorMessage = err.message;
      this.successMessage = '';
    });
    this.goLoginPage();
  }

  goLoginPage(){
    this.router.navigateByUrl('/login');
  }

  showCurrentLoc(){
    this.flag = false;
    if (navigator.geolocation){
      navigator.geolocation.getCurrentPosition((position: Position) => {
        // this.lat = '' + position.coords.latitude;
        // this.lng = '' + position.coords.longitude;
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        this.infoWindow.setPosition(pos);
        this.infoWindow.setContent('Your Current Location');
        this.infoWindow.open(this.map);
        // this.map.setCenter(pos);
      });
    }
    this.presentToast();
  }

  // showMap(pos: any){
  //   const location = new google.maps.LatLng(pos.lat, pos.lng);
  //   const options = {
  //     center: location,
  //     zoom: 13,
  //     disabledDefaultUI: true
  //   };
  //   this.map = new google.maps.Map(this.mapRef.nativeElement, options);
  // }

  async presentToast() {
    this.toast = await this.toastCtrl.create({
      message: 'Get current location successfull',
      duration: 1000,
      color: 'success',
    });
    this.toast.present();
  }
}
