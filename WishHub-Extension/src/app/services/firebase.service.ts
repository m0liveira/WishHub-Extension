import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { initializeApp, FirebaseError } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendEmailVerification, sendPasswordResetEmail, fetchSignInMethodsForEmail, AuthErrorCodes } from 'firebase/auth';
import { getDatabase, ref, set, onValue } from 'firebase/database';
import { getStorage, ref as reference, uploadBytes, getDownloadURL } from "firebase/storage";

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

  async userExists(email: string) {
    try {
      let result: boolean;
      let response = await fetchSignInMethodsForEmail(this.auth, email);

      response.length > 0 ? result = true : result = false;

      return result;
    } catch (error) {
      return { error: 'Something went wrong! Try again later.' };
    }
  }

  async AddWishListToDatabase(listId: string, email: string, imageUrl: string, name: string, items: Array<any>, views: Array<any>, contributors: Array<any>, code: string) {
    try {
      let db = getDatabase();
      let reference = ref(db, 'Lists/' + listId);

      await set(reference, { creator: email, photo: imageUrl, name, items, views, contributors, code });

      return true;
    } catch (error) {
      return false;
    }
  };

  async isWishListsIdUnique(listId: string): Promise<boolean> {
    try {
      let db = getDatabase();
      let reference = ref(db, 'Lists/');

      return new Promise((resolve) => {
        onValue(reference, (snapshot) => {
          if (!snapshot.exists() || !snapshot.hasChildren()) resolve(false);

          snapshot.forEach(list => {
            if (listId === list.key) resolve(true);
          });

          resolve(false);
        });
      });
    } catch (error) {
      return false;
    }
  }

  async getUserWishLists(user: string): Promise<Array<any>> {
    try {
      let db = getDatabase();
      let reference = ref(db, 'Lists/');
      let lists: Array<any> = [];

      return new Promise((resolve) => {
        onValue(reference, (snapshot) => {
          if (!snapshot.exists() || !snapshot.hasChildren()) resolve([]);

          snapshot.forEach(list => {
            if (list.val().creator === user || (list.hasChild('contributors') && list.val().contributors.includes(user))) {
              let wishList = list.val();
              wishList.id = list.key;

              if (!list.hasChild('items')) wishList.items = [];
              if (!list.hasChild('views')) wishList.views = [];
              if (!list.hasChild('contributors')) wishList.contributors = [];

              lists.push(wishList);
            }
          });

          resolve(lists);
        });
      });
    } catch (error) {
      return [];
    }
  }

  async getImageURL(path: string): Promise<string> {
    try {
      let storage = getStorage();
      let storageRef = reference(storage, path);

      return new Promise(async (resolve) => resolve(await getDownloadURL(storageRef)));
    } catch (error) {
      return '';
    }
  }

  async uploadFileToStorage(file: File, uid: string): Promise<string> {
    try {
      let storage = getStorage();
      let path = `Lists/${uid}/${file.name}`;
      let storageRef = reference(storage, path);

      return new Promise(async (resolve) => {
        await uploadBytes(storageRef, file).then(async () => resolve(this.getImageURL(path)));
      })
    } catch (error) {
      return this.getImageURL('Default/wishHub.png');
    }
  }
}
