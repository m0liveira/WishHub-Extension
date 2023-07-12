import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { initializeApp, FirebaseError } from 'firebase/app';
import { getDatabase, ref, set } from 'firebase/database';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendEmailVerification, sendPasswordResetEmail, AuthErrorCodes } from 'firebase/auth';

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

  async signUpWithEmailAndPassword(email: string, password: string) {
    try {
      return (await createUserWithEmailAndPassword(this.auth, email, password)).user;
    } catch (error) {
      let firebaseError = error as FirebaseError;

      if (firebaseError.code === AuthErrorCodes.EMAIL_EXISTS) {
        return { error: 'The email address provided is already registered.' };
      }

      return { error: 'Something went wrong! Try again later.' }
    }
  }

  async updateUserProfile(displayName: string, photoURL: string) {
    try {
      let currentUser: any = this.auth.currentUser;
      await updateProfile(currentUser, { displayName, photoURL });

      return { status: 200 }
    } catch (error) {
      return { error: 'Something went wrong! Try again later.' }
    }
  }

  async sendEmailValidation() {
    try {
      let currentUser: any = this.auth.currentUser;
      await sendEmailVerification(currentUser);

      return { message: '✔️ Email sent successfully!' }
    } catch (error) {
      return { error: 'Something went wrong! Try again later.' }
    }
  }

  async sendPasswordResetToEmail(email: string) {
    try {
      await sendPasswordResetEmail(this.auth, email);

      return { message: '✔️ Email sent successfully!' }
    } catch (error) {
      let firebaseError = error as FirebaseError;

      if (firebaseError.code === AuthErrorCodes.USER_DELETED) { return { error: "The email address provided isn't registered." }; };

      if (firebaseError.code === AuthErrorCodes.INVALID_EMAIL) { return { error: 'The email address provided is invalid.' }; };

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
