import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { NgForm } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource, Capacitor } from '@capacitor/core';
import { AlertController, Platform } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { AngularFireStorage } from '@angular/fire/storage';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  @ViewChild('profilePic') profilePic: ElementRef;
  @ViewChild('filePicker', {static: false})
  filePickerRef: ElementRef<HTMLInputElement>;
  photo: SafeResourceUrl;

  userDetail = [];
  isDesktop: boolean;
  id: string;
  nama: string;
  imageUrl: string;
  nim: string;
  counter = false;
  filePath;
  currentUser = [];
  length: any;
  currentNim: string;
  allUser = [];

  docId: string;

  feeds = [];

  constructor(
    private authService: AuthService,
    private firestore: AngularFirestore,
    private router: Router,
    private alertController: AlertController,
    private platform: Platform,
    private sanitizer: DomSanitizer,
    private storage: AngularFireStorage,
  ) { }

  ngOnInit() {
    if ((this.platform.is('mobile') && this.platform.is('hybrid')) || this.platform.is('desktop')){
      this.isDesktop = true;
    }

    this.firestore.collection('users').snapshotChanges().subscribe((data) => {
      this.allUser = data.map((e) => {
        return {
          id: e.payload.doc.id,
          nim: e.payload.doc.data()['nim'],
          email: e.payload.doc.data()['email'],
        };
      });
    });

  }

  ionViewWillEnter(){
    this.authService.userDetails().subscribe((res) => {
      this.firestore.collection('users').snapshotChanges().subscribe((data) => {
        this.userDetail = data.map((e) => {
          if (res.email === e.payload.doc.data()['email']){
            this.id = e.payload.doc.id;
            this.nama = e.payload.doc.data()['nama'];
            this.imageUrl = e.payload.doc.data()['imageUrl'];
            this.nim = e.payload.doc.data()['nim'];
          }
        });

        data.map((e) => {
          if (res.email === e.payload.doc.data()['email']){
            this.firestore.collection('users').doc(e.payload.doc.id).collection('history').snapshotChanges().subscribe((history) => {
              this.feeds = history.map((f) => {
                return {
                  id: f.payload.doc.id,
                  latlng: f.payload.doc.data()['latlng'],
                };
              });
            });
          }
        });
      });
    });
  }

  async getPicture(type: 'camera' | 'gallery'){
    if (!Capacitor.isPluginAvailable('Camera') || (this.isDesktop && type === 'gallery')){
      this.filePickerRef.nativeElement.click();
      return;
    }

    const image = await Camera.getPhoto({
      quality: 100,
      width: 400,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Prompt,
    });

    this.photo = this.sanitizer.bypassSecurityTrustResourceUrl(
      image && image.dataUrl
    );

    const convertedImageFile = this.dataURLtoFile(image.dataUrl, `sample.${image.format}`)

    this.changeProfilePic(convertedImageFile);
  }

  onFileChoose(event: Event){
    const file = (event.target as HTMLInputElement).files[0];
    const pattern = /image-*/;
    const reader = new FileReader();

    if (!file.type.match(pattern)){
      return ;
    }

    reader.onload = () => {
      this.photo = reader.result.toString();
    };

    reader.readAsDataURL(file);

    this.changeProfilePic(file);
  }

  dataURLtoFile(dataurl, filename){
    let arr = dataurl.split(','),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);

    while (n--){
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, {type: mime});
  }

  changeProfilePic(file){
    this.authService.userDetails().subscribe((user) => {
      this.allUser.forEach((a) => {
        if (user.email === a.email){
          this.filePath = 'userProfile/' + a.nim + '.jpg';
          const ref = this.storage.ref(this.filePath);
          this.storage.upload(this.filePath, file).snapshotChanges().pipe(finalize(() =>
            ref.getDownloadURL().subscribe((res) => {
              this.firestore.collection('users').doc(this.id).update({
                imageUrl: res,
              });
            })
          )).subscribe();
        }
      });
    });
  }

  async presentPopup(){
    const alert = await this.alertController.create({
      header: 'Update profile picture',
      cssClass: 'alert-update',
      buttons: [
        {
          text: 'Kamera',
          cssClass: 'primary',
          handler: () => this.getPicture('camera'),
        },
        {
          text: 'Galeri',
          cssClass: 'primary',
          handler: () => this.getPicture('gallery'),
        }
      ]
    });
    await alert.present();
  }

  logout(){
    this.authService.logoutUser();
    this.router.navigateByUrl('/login');
  }

  updateUser(form: NgForm, id){
    if (form.value.nama.trim() && form.value.nama.trim() !== this.nama){
      this.firestore.collection('users').doc(id).update({
        nama: form.value.nama,
      });
    }
    this.counter = false;
  }

  deleteHistory(id: string){
    this.authService.userDetails().subscribe((res) => {
      this.firestore.collection('users').snapshotChanges().subscribe((data) => {
        data.map((e) => {
          if (res.email === e.payload.doc.data()['email']){
            this.firestore.collection('users').doc(e.payload.doc.id).collection('history').doc(id).delete();
          }
        });
      });
    });
  }

}
