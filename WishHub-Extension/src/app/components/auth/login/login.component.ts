import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AES, enc } from 'crypto-js';
import { FirebaseService } from '../../../services/firebase.service';

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
  errors: Array<string> = [];
  errorIndex: number = 0;
  startAnimationTimeout: NodeJS.Timeout | undefined;
  endAnimationTimeout: NodeJS.Timeout | undefined;

  constructor(public firebaseService: FirebaseService, private router: Router) { }

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

    if (this.errorIndex <= this.errors.length - 1) {
      timeBar.classList.remove('slideToLeft')
    }

    clearTimeout(this.startAnimationTimeout);

    this.startAnimationTimeout = setTimeout(() => {
      timeBar.classList.add('slideToLeft');

      this.endAnimationTimeout = setTimeout(() => {
        if (this.errorIndex >= this.errors.length - 1) {
          card.classList.replace('slideDown', 'slideUp');

          setTimeout(() => {
            card.classList.replace('slideUp', 'hide');
            timeBar.classList.remove('slideToLeft')
          }, 750);
        }
      }, 2000);
    }, 500);
  }

  showErrorMessage(card: HTMLDivElement, timeBar: HTMLDivElement) {
    if (this.errors.length === 1) {
      clearTimeout(this.startAnimationTimeout);
      clearTimeout(this.endAnimationTimeout);
      this.messageAnimation(card, timeBar);
      return;
    }

    if (this.errorIndex >= this.errors.length) {
      clearTimeout(this.startAnimationTimeout);
      return;
    }

    this.messageAnimation(card, timeBar);

    this.startAnimationTimeout = setTimeout(() => {
      this.errorIndex++;
      this.messageAnimation(card, timeBar);
      this.showErrorMessage(card, timeBar);
    }, 2600);

    return;
  };

  saveLogIn() {
    if (!this.form.value.remember) { return; }

    if (localStorage.getItem('WishHub')) { return }

    localStorage.setItem('WishHub', JSON.stringify({ email: AES.encrypt(this.form.value.email, environment.encryptionKey).toString(), password: AES.encrypt(this.form.value.password, environment.encryptionKey).toString(), timestamp: Date.now() }));
  }

  logIn(card: HTMLDivElement, timeBar: HTMLDivElement) {
    Object.values(this.form.controls).forEach(control => {
      control.markAsTouched();
    });

    if (this.form.valid === false) {
      this.errors = [];
      this.errorIndex = 0;

      Object.keys(this.form.controls).forEach(key => {
        let control: any = this.form.controls[key];

        if (control.errors) {
          Object.keys(control.errors).forEach(error => {
            this.errors.push(control.errors[error]);
          });
        };
      });

      this.showErrorMessage(card, timeBar);
      return;
    }

    this.saveLogIn();

    // this.firebaseService.AddUserToDatabase('GHaFtnRL3NiUNVB2', 'andré', 'email@123.com', 'noavatar.png');
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
