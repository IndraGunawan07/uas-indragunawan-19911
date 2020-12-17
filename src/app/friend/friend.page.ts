import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-friend',
  templateUrl: './friend.page.html',
  styleUrls: ['./friend.page.scss'],
})
export class FriendPage implements OnInit {

  filterTerm: string;
  friendList = [];
  allUser = [];
  listId = [];
  currentUser = [];
  allUserNoFilter = [];

  email: string;
  nama: string;
  nim: string;
  id: string;

  idUser = [];
  i: number;

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
            email: e.payload.doc.data()['email'],
            nim: e.payload.doc.data()['nim'],
            imageUrl: e.payload.doc.data()['imageUrl'],
          };
        });

        this.allUserNoFilter = data.map((e) => {
          return {
            id: e.payload.doc.id,
            nama: e.payload.doc.data()['nama'],
            email: e.payload.doc.data()['email'],
            nim: e.payload.doc.data()['nim'],
            imageUrl: e.payload.doc.data()['imageUrl'],
          };
        });



        this.firestore.collection('users').snapshotChanges().subscribe((datas) => {
          datas.map((e) => {
            if (res.email === e.payload.doc.data()['email']){
              this.id = e.payload.doc.id;
              this.currentUser.push(
                {
                  id: e.payload.doc.id,
                  nim: e.payload.doc.data()['nim'],
                  nama: e.payload.doc.data()['nama'],
                  imageUrl: e.payload.doc.data()['imageUrl']
                });
              this.firestore.collection('users').doc(this.id).collection('friends').snapshotChanges().subscribe((friends) => {
                this.friendList = friends.map((d) => {
                  return {
                    id: d.payload.doc.data()['idUser'],
                  };
                });
                this.friendList.forEach(a => {
                  this.listId.push(a.id);
                });
                this.allUser = this.allUser.filter((item) => {
                  return this.listId.indexOf(item.id) !== -1;
                });
                // console.log('id temen', this.allUser);
              });
            }
          });
        });
      });
      });
  }

  ionViewWillEnter(){
  }

  deleteFriend(id: string){
    this.firestore.collection('users').doc(this.currentUser[0].id).collection('friends').snapshotChanges().subscribe((res) => {
      res.map((e) => {
        if (e.payload.doc.data()['idUser'] === id){
          this.firestore.collection('users').doc(this.currentUser[0].id).collection('friends').doc(e.payload.doc.id).delete();
        }
      });
    });

    this.firestore.collection('users').doc(id).collection('friends').snapshotChanges().subscribe((res) =>{
      res.map((e) => {
        if (e.payload.doc.data()['idUser'] === this.currentUser[0].id){
          this.firestore.collection('users').doc(id).collection('friends').doc(e.payload.doc.id).delete();
        }
      });
    });

    setTimeout(() => {
      location.reload();
    }, 1000);
  }

}
