import { Injectable } from '@angular/core';
// import { environment } from 'src/environments/myEnv';
// import { initializeApp } from "firebase/app";
// import { getDatabase, ref, set } from "firebase/database";

@Injectable({
  providedIn: 'root'
})

export class FirebaseService {
  // app = initializeApp(environment.firebaseConfig);

  constructor() { }

  // prototype
  // AddUserToDatabase(userId: string, name: string, email: string, imageUrl: string) {
  //   let db = getDatabase();
  //   let reference = ref(db, 'users/' + userId);

  //   set(reference, { username: name, email: email, avatar: imageUrl });
  // };
}
