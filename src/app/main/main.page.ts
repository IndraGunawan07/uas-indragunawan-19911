import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ToastController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';

declare var google: any;

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
})
export class MainPage implements OnInit {
  map: any;
  @ViewChild('map', {read: ElementRef, static: false}) mapRef: ElementRef;

  userData = [];
  id: string;
  email: string;
  nama: string;
  nim: string;
  latitude: string;
  longitude: string;
  friendList = [];
  listId = [];
  allUser = [];
  infowindow: any = new google.maps.InfoWindow();
  toast: any;
  lat: number;
  lng: number;

  idCurrentUser: string;

  currentUser = [];
  currentPos: any;

  constructor(
    private authService: AuthService,
    private firestore: AngularFirestore,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
    // update location tiap 10 menit
    setInterval(() => {
      this.getCurrentLoc();
    }, 600000);

    this.authService.userDetails().subscribe((res) => {
      this.firestore.collection('users').snapshotChanges().subscribe((data) => {
        this.allUser = data.map((c) => {
          return {
            id: c.payload.doc.id,
            email: c.payload.doc.data()['email'],
            nama: c.payload.doc.data()['nama'],
            nim: c.payload.doc.data()['nim'],
            latitude: c.payload.doc.data()['latitude'],
            longitude: c.payload.doc.data()['longitude'],
          };
        });

        data.map((d) => {
          if (res.email === d.payload.doc.data()['email']){
            this.idCurrentUser = d.payload.doc.id;
            this.currentUser.push({
              id: d.payload.doc.id,
              email: d.payload.doc.data()['email'],
              nama: d.payload.doc.data()['nama'],
              nim: d.payload.doc.data()['nim'],
              latitude: d.payload.doc.data()['latitude'],
              longitude: d.payload.doc.data()['longitude'],
            });
          }
          this.firestore.collection('users').doc(this.idCurrentUser).collection('friends').snapshotChanges().subscribe((friends) => {
            this.friendList = friends.map((a) => {
              return {
                id: a.payload.doc.data()['idUser'],
              };
            });
            this.friendList.forEach(a => {
              this.listId.push(a.id);
            });
            this.allUser = this.allUser.filter((item) => {
              return this.listId.indexOf(item.id) !== -1;
            });
            // console.log(this.allUser);
            this.currentPos = {
              lat: this.currentUser[0].latitude,
              lng: this.currentUser[0].longitude
            };
            // console.log(this.currentPos);

            const location = new google.maps.LatLng(this.currentUser[0].latitude, this.currentUser[0].longitude);
            const options = {
              center: location,
              zoom: 14,
              disableDefaultUI: true
            };

            this.map = new google.maps.Map(this.mapRef.nativeElement, options);
            // console.log(this.allUser);
            const marker = new google.maps.Marker({
              position: this.currentPos,
              map: this.map,
            });

            this.infowindow = new google.maps.InfoWindow({
              content: 'Your own position',
              position: new google.maps.LatLng(this.currentUser[0].latitude, this.currentUser[0].longitude),
            });
            this.infowindow.open(this.map);

            this.allUser.forEach((friendsLocation) => {
              const marker = new google.maps.Marker({
                position: new google.maps.LatLng(friendsLocation.latitude, friendsLocation.longitude),
                map: this.map,
              });

              this.infowindow = new google.maps.InfoWindow({
                content: friendsLocation.nama,
                position: new google.maps.LatLng(friendsLocation.latitude, friendsLocation.longitude),
              });
              this.infowindow.open(this.map);
              this.map.setCenter(this.currentPos);

            });
// map sampe sini
          });
        });

      });
    });
  }

  getCurrentLoc(){
    if (navigator.geolocation){
      navigator.geolocation.getCurrentPosition((position: Position) => {
        // this.lat = '' + position.coords.latitude;
        // this.lng = '' + position.coords.longitude;
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;
        // console.log('lat', this.lat);
        this.firestore.collection('users').doc(this.currentUser[0].id).update({
          latitude: this.lat,
          longitude: this.lng,
        });
        this.presentToast();
      });
    }
  }

  async presentToast() {
    this.toast = await this.toastCtrl.create({
      message: 'Current Location Successfully updated',
      duration: 1000,
      color: 'success',
    });
    this.toast.present();
    setTimeout(() => {
      location.reload();
    }, 700);
  }

  setCenter(){
    const location = new google.maps.LatLng(this.currentUser[0].latitude, this.currentUser[0].longitude);
    const options = {
      center: location,
      zoom: 14,
      disableDefaultUI: true
    };

    this.map = new google.maps.Map(this.mapRef.nativeElement, options);
    const marker = new google.maps.Marker({
      position: this.currentPos,
      map: this.map,
    });

    this.infowindow = new google.maps.InfoWindow({
      content: 'Your own position',
      position: new google.maps.LatLng(this.currentUser[0].latitude, this.currentUser[0].longitude),
    });
    this.infowindow.open(this.map);

    this.allUser.forEach((friendsLocation) => {
      const marker = new google.maps.Marker({
        position: new google.maps.LatLng(friendsLocation.latitude, friendsLocation.longitude),
        map: this.map,
      });

      this.infowindow = new google.maps.InfoWindow({
        content: friendsLocation.nama,
        position: new google.maps.LatLng(friendsLocation.latitude, friendsLocation.longitude),
      });
      this.infowindow.open(this.map);
      this.map.setCenter(location);
  });
  }
}
