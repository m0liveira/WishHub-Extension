import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { initializeApp, FirebaseError } from 'firebase/app';
import { getDatabase, ref, set } from 'firebase/database';
import { getAuth, signInWithEmailAndPassword, AuthErrorCodes } from 'firebase/auth';

@Injectable({
  providedIn: 'root'
})

export class FirebaseService {
  app = initializeApp(environment.firebaseConfig);
  auth = getAuth(this.app);

  constructor() { }

  async logInWithEmailAndPassword(email: string, password: string) {
    try {
      return (await signInWithEmailAndPassword(this.auth, email, password)).user;
    } catch (error) {
      let firebaseError = error as FirebaseError;

      if (firebaseError.code === AuthErrorCodes.INVALID_PASSWORD || firebaseError.code === AuthErrorCodes.USER_DELETED) {
        return { error: 'Enter the correct email address and password to log in.' };
      }

      return { error: 'Something went wrong! Try again later.' }
    }
  }

  // prototype
  AddUserToDatabase(userId: string, name: string, email: string, imageUrl: string) {
    let db = getDatabase();
    let reference = ref(db, 'users/' + userId);

    set(reference, { username: name, email: email, avatar: imageUrl });
  };

  // this.firebaseService.AddUserToDatabase('GHaFtnRL3NiUNVB2', 'andré', 'email@123.com', 'noavatar.png');
}
