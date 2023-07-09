import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AES, enc } from 'crypto-js';
import { FirebaseService } from '../../../services/firebase.service';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent implements OnInit {
  form!: FormGroup;
  isVisible: boolean = false;
  isMailFocused: boolean = false;
  isMailwritten: boolean = false;
  isPasswordFocused: boolean = false;
  isPasswordwritten: boolean = false;
  messageType: string = 'error';
  messages: Array<string> = [];
  messageIndex: number = 0;
  startAnimationTimeout: NodeJS.Timeout | undefined;
  endAnimationTimeout: NodeJS.Timeout | undefined;

  constructor(private firebaseService: FirebaseService, private userService: UserService, private router: Router) { }

  getSavedLogIn() {
    if (!localStorage.getItem('WishHub')) { return; }

    let data: any = localStorage.getItem('WishHub');

    let { email, password, timestamp } = JSON.parse(data);
    let expirationTime = 7 * 24 * 60 * 60 * 1000;

    if (Date.now() - timestamp > expirationTime) {
      localStorage.removeItem('WishHub');
      return;
    }

    this.form.patchValue({ email: AES.decrypt(email, environment.encryptionKey).toString(enc.Utf8), password: AES.decrypt(password, environment.encryptionKey).toString(enc.Utf8) });
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      'email': new FormControl('', [Validators.email, this.noSpaceAllowed, this.noEmptyAllowed]),
      'password': new FormControl('', [this.lengthRangeAllowed, this.noSpaceAllowed, this.noEmptyAllowed]),
      'remember': new FormControl(false)
    });

    this.getSavedLogIn();
  }

  messageAnimation(card: HTMLDivElement, timeBar: HTMLDivElement) {
    card.classList.replace('hide', 'slideDown');

    if (this.messageIndex <= this.messages.length - 1) {
      timeBar.classList.remove('slideToLeft')
    }

    clearTimeout(this.startAnimationTimeout);

    this.startAnimationTimeout = setTimeout(() => {
      timeBar.classList.add('slideToLeft');

      this.endAnimationTimeout = setTimeout(() => {
        if (this.messageIndex >= this.messages.length - 1) {
          card.classList.replace('slideDown', 'slideUp');

          setTimeout(() => {
            card.classList.replace('slideUp', 'hide');
            timeBar.classList.remove('slideToLeft')
          }, 750);
        }
      }, 2000);
    }, 500);
  }

  showMessage(card: HTMLDivElement, timeBar: HTMLDivElement) {
    if (this.messages.length === 1) {
      clearTimeout(this.startAnimationTimeout);
      clearTimeout(this.endAnimationTimeout);
      this.messageAnimation(card, timeBar);
      return;
    }

    if (this.messageIndex >= this.messages.length) {
      clearTimeout(this.startAnimationTimeout);
      return;
    }

    this.messageAnimation(card, timeBar);

    this.startAnimationTimeout = setTimeout(() => {
      this.messageIndex++;
      this.messageAnimation(card, timeBar);
      this.showMessage(card, timeBar);
    }, 2600);

    return;
  };

  formValidation(card: HTMLDivElement, timeBar: HTMLDivElement) {
    this.messages = [];
    this.messageIndex = 0;

    Object.keys(this.form.controls).forEach(key => {
      let control: any = this.form.controls[key];

      if (control.errors) {
        Object.keys(control.errors).forEach(error => {
          this.messages.push(control.errors[error]);
        });
      };
    });

    this.showMessage(card, timeBar);
  }

  saveLogIn() {
    if (!this.form.value.remember) { return; }

    if (localStorage.getItem('WishHub')) { return }

    localStorage.setItem('WishHub', JSON.stringify({ email: AES.encrypt(this.form.value.email, environment.encryptionKey).toString(), password: AES.encrypt(this.form.value.password, environment.encryptionKey).toString(), timestamp: Date.now() }));
  }

  async logIn(card: HTMLDivElement, timeBar: HTMLDivElement) {
    this.messageType = 'error';

    Object.values(this.form.controls).forEach(control => {
      control.markAsTouched();
    });

    if (this.form.valid === false) {
      this.formValidation(card, timeBar);
      return;
    }

    let data = await this.firebaseService.logInWithEmailAndPassword(this.form.value.email, this.form.value.password);

    this.messages = [];
    this.messageIndex = 0;

    if ('error' in data) {
      this.messages.push(data.error);
      this.showMessage(card, timeBar);
      return;
    }

    if (!data.emailVerified) {
      this.messages.push(`⚠️ Verify your email to activate your account.`);
      this.messageType = 'warning';
      this.showMessage(card, timeBar);
      return;
    }

    let userInfo = { id: data.uid, displayName: data.displayName, email: data.email, avatar: data.photoURL, verified: data.emailVerified };

    data.getIdToken().then(token => {
      this.userService.userInfo = { token, id: userInfo.id, displayName: userInfo.displayName, email: userInfo.email, avatar: userInfo.avatar, verified: userInfo.verified };
      this.messages.push(`✔️ Logged in successfully as ${this.userService.userInfo.displayName}.`);
      this.messageType = 'success';

      this.saveLogIn();
      this.showMessage(card, timeBar);
    });
  }

  togglePassword(input: HTMLInputElement) {
    this.isVisible = !this.isVisible;
    this.isVisible ? input.type = 'text' : input.type = 'password';
    this.isPasswordFocused = true;
  }

  onInput(): void {
    this.form.value.email !== '' && this.form.value.email !== null ? this.isMailwritten = true : this.isMailwritten = false;
    this.form.value.password !== '' && this.form.value.password !== null ? this.isPasswordwritten = true : this.isPasswordwritten = false;
  }

  // Form validations

  noSpaceAllowed(control: AbstractControl) {
    let parentControl: any = control.parent;
    let controlName;

    if (parentControl) {
      controlName = Object.keys(parentControl.controls).find(key => parentControl.controls[key] === control);
    }

    if (control.value !== null && control.value.indexOf(' ') !== -1) {
      return { noSpaceAllowed: `Your ${controlName} can't contain spaces.` };
    }

    return null;
  }

  noEmptyAllowed(control: AbstractControl) {
    let parentControl: any = control.parent;
    let controlName;

    if (parentControl) {
      controlName = Object.keys(parentControl.controls).find(key => parentControl.controls[key] === control);
    }

    if (control.value !== null && control.value === '') {
      return { error: `Your ${controlName} can't be empty.` };
    }

    return null;
  }

  lengthRangeAllowed(control: AbstractControl) {
    let parentControl: any = control.parent;
    let controlName;

    if (parentControl) {
      controlName = Object.keys(parentControl.controls).find(key => parentControl.controls[key] === control);
    }

    if (control.value !== null && control.value.length < 6) {
      return { error: `Your ${controlName} must contain a minimum of 6 characters.` };
    }

    if (control.value !== null && control.value.length > 24) {
      return { error: `Your ${controlName} must have less then 24 characters.` };
    }

    return null;
  }
}
