import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-add',
  templateUrl: './add.page.html',
  styleUrls: ['./add.page.scss'],
})
export class AddPage implements OnInit {
  idCurrentUser: string;
  allUser = [];
  allUserNoFilter = [];
  friendList = [];
  listId = [];

  currentUser = [];

  searchedId: string;
  searchedName: string;
  searchedImageUrl: string;
  searchedNim: string;

  display = false;
  userExist = false;
  userNoExist = false;

  self = false;
  friendsExist = false;
  ada = false;


  constructor(
    private authService: AuthService,
    private firestore: AngularFirestore,
    private router: Router
  ) { }

  ngOnInit() {
    this.authService.userDetails().subscribe((res) => {
      this.firestore.collection('users').snapshotChanges().subscribe((data) => {
        this.allUser = data.map((e) => {
          return {
            id: e.payload.doc.id,
            nama: e.payload.doc.data()['nama'],
            nim: e.payload.doc.data()['nim'],
            imageUrl: e.payload.doc.data()['imageUrl']
          };
        });


        this.allUserNoFilter = data.map((b) => {
          return {
            id: b.payload.doc.id,
            nama: b.payload.doc.data()['nama'],
            nim: b.payload.doc.data()['nim'],
            email: b.payload.doc.data()['email'],
            imageUrl: b.payload.doc.data()['imageUrl']
          };
        });

        this.firestore.collection('users').snapshotChanges().subscribe((datas) => {
          datas.map((d) => {
            if (res.email === d.payload.doc.data()['email']){
              this.idCurrentUser = d.payload.doc.id;
              this.currentUser.push(
              {
                id: d.payload.doc.id , nim: d.payload.doc.data()['nim'], nama: d.payload.doc.data()['nama'], imageUrl: d.payload.doc.data()['imageUrl']
              });
              // console.log('id', this.idCurrentUser);
              this.firestore.collection('users').doc(this.idCurrentUser).collection('friends').snapshotChanges().subscribe((friends) => {
                this.friendList = friends.map((c) => {
                  return {
                    id: c.payload.doc.data()['idUser'],
                  };
                });

                this.friendList.forEach(a => {
                  this.listId.push(a.id);
                });
                this.allUser = this.allUser.filter((item) => {
                  return this.listId.indexOf(item.id) !== -1;
                });
                // console.log('temen', this.allUser);
              });
            }
          });
        });

      });
    });
  }

  search(form: NgForm){
    this.ada = false;
    this.userNoExist = false;
    this.allUserNoFilter.forEach(a => {
      // console.log('no filter', this.allUserNoFilter);
      if (a.nim === form.value.nim){
        this.userExist = true;
      }
    });

    if (this.userExist){
      this.display = true;
      // console.log(this.currentUser[0].nim);
      // console.log(this.currentUser[0].nama);
      // console.log(this.currentUser[0].imageUrl);

      if (form.value.nim === this.currentUser[0].nim){
        console.log('masuk');
        this.self = true;
        this.friendsExist = false;
        this.ada = true;
        this.searchedName = this.currentUser[0].nama;
        this.searchedImageUrl = this.currentUser[0].imageUrl;
      }

      this.allUser.forEach(b => {
        if (b.nim === form.value.nim){
          this.friendsExist = true;
          this.self = false;
          this.ada = true;
          this.searchedName = b.nama;
          this.searchedImageUrl = b.imageUrl;
          this.searchedNim = b.nim;
        }
      });

      if (this.ada === false){
        this.allUserNoFilter.forEach(a => {
          // console.log('masuk');
          if (a.nim === form.value.nim){
            this.friendsExist = false;
            this.self = false;
            this.searchedName = a.nama;
            this.searchedImageUrl = a.imageUrl;
            this.searchedId = a.id;
            this.searchedNim = a.nim;
          }
        });
      }
      console.log(this.self);
    }
    else{
      this.display = false;
      this.userNoExist = true;
    }

    // if (form.value.nama.trim() && form.value.nama.trim() !== this.nama){
    //   this.firestore.collection('users').doc(id).update({
    //     nama: form.value.nama,
    //   });
    // }
  }

  addUser(id: string){
    console.log('ididi', id);
    this.firestore.collection('users').doc(this.currentUser[0].id).collection('friends').add({
      idUser: id,
    });

    this.firestore.collection('users').doc(id).collection('friends').add({
      idUser: this.currentUser[0].id,
    });

    setTimeout(() => {
      this.router.navigateByUrl('/friend').then(() => {
        location.reload();
      });
    }, 1000);
  }

}
