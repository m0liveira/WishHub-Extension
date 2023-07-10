import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { FirebaseService } from '../../../services/firebase.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  form!: FormGroup;
  isVisible: boolean = false;
  isMailFocused: boolean = false;
  isMailwritten: boolean = false;
  isUsernameFocused: boolean = false;
  isUsernamewritten: boolean = false;
  isPasswordFocused: boolean = false;
  isPasswordwritten: boolean = false;
  messageType: string = 'error';
  passwordType: string = 'Weak';
  messages: Array<string> = [];
  messageIndex: number = 0;
  startAnimationTimeout: NodeJS.Timeout | undefined;
  endAnimationTimeout: NodeJS.Timeout | undefined;

  constructor(private firebaseService: FirebaseService, public router: Router) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      'email': new FormControl('', [Validators.email, this.lengthRangeAllowed, this.noSpaceAllowed, this.noEmptyAllowed]),
      'username': new FormControl('', [this.lengthRangeAllowed, this.noEmptyAllowed]),
      'password': new FormControl('', [this.lengthRangeAllowed, this.noSpaceAllowed, this.noEmptyAllowed, this.noWeakPassword(this.passwordType)]),
      'avatar': new FormControl(''),
      'tos': new FormControl(false)
    });
  }

  async register(card: HTMLDivElement, timeBar: HTMLDivElement) {
    this.messageType = 'error';

    Object.values(this.form.controls).forEach(control => {
      control.markAsTouched();
    });

    // if (this.form.valid === false) {
    //   this.formValidation(card, timeBar);
    //   return;
    // }
  }

  togglePassword(input: HTMLInputElement) {
    this.isVisible = !this.isVisible;
    this.isVisible ? input.type = 'text' : input.type = 'password';
  }

  levenshteinDistance(string1: string, string2: string): number {
    let p = 0;

    if (string1.length === 0 || string2.length === 0) {
      return 1;
    }

    let maxDistance = Math.floor(Math.max(string1.length, string2.length) / 2) - 1;
    let matches1 = Array(string1.length).fill(false);
    let matches2 = Array(string2.length).fill(false);

    let matchingCharacters = 0;

    for (let i = 0; i < string1.length; i++) {
      let start = Math.max(0, i - maxDistance);
      let end = Math.min(string2.length - 1, i + maxDistance);

      for (let j = start; j <= end; j++) {
        if (!matches2[j] && string1[i] === string2[j]) {
          matches1[i] = true;
          matches2[j] = true;
          matchingCharacters++;
          break;
        }
      }
    }

    if (matchingCharacters === 0) {
      return 0;
    }

    let transpositions = 0;
    let k = 0;

    for (let i = 0; i < string1.length; i++) {
      if (matches1[i]) {
        while (!matches2[k]) {
          k++;
        }

        if (string1[i] !== string2[k]) {
          transpositions++;
        }

        k++;
      }
    }

    let prefixLength = Math.min(4, Math.max(string1.length, string2.length));

    let commonPrefix = 0;
    for (let i = 0; i < prefixLength; i++) {
      if (string1[i] === string2[i]) {
        commonPrefix++;
      } else {
        break;
      }
    }

    let similarity = (matchingCharacters / string1.length + matchingCharacters / string2.length + (matchingCharacters - transpositions / 2) / matchingCharacters) / 3;
    let distance = 1 - similarity;

    return distance + commonPrefix * p * (1 - distance);
  }

  isSimilar(string1: string, string2: string): boolean {
    let distance = this.levenshteinDistance(string1, string2);

    return 1 - distance >= 0.7;
  }

  getPasswordStrengthIndicator(password: string, email: string, username: string): string {
    let lengthScore = password.length < 8 ? 0 : password.length < 12 ? 1 : password.length < 16 ? 2 : 3;

    let hasUppercase = /[A-Z]/.test(password);
    let hasLowercase = /[a-z]/.test(password);
    let hasNumber = /[0-9]/.test(password);
    let hasSpecialChar = /[!@#$%^&*]/.test(password);

    let strengthScore = lengthScore + (hasUppercase ? 1 : 0) + (hasLowercase ? 1 : 0) + (hasNumber ? 1 : 0) + (hasSpecialChar ? 1 : 0);

    let similarityScore = (this.isSimilar(password, email) ? 1 : 0) + (this.isSimilar(password, username) ? 1 : 0);

    let totalScore = strengthScore - similarityScore;

    if (totalScore <= 2) { return 'Weak'; }

    if (totalScore <= 5) { return 'Fair'; }

    return 'Strong';
  }

  onInput(): void {
    this.form.value.email !== '' && this.form.value.email !== null ? this.isMailwritten = true : this.isMailwritten = false;
    this.form.value.username !== '' && this.form.value.username !== null ? this.isUsernamewritten = true : this.isUsernamewritten = false;
    this.form.value.password !== '' && this.form.value.password !== null ? this.isPasswordwritten = true : this.isPasswordwritten = false;

    this.passwordType = this.getPasswordStrengthIndicator(this.form.value.password, this.form.value.email, this.form.value.username);
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

    if (controlName === 'email' && control.value !== null && control.value.length > 254) {
      return { error: `Your ${controlName} must have less then 254 characters.` };
    }

    if (controlName === 'username' && control.value !== null && control.value.length > 20) {
      return { error: `Your ${controlName} must have less then 20 characters.` };
    }

    if (controlName === 'password' && control.value !== null && control.value.length < 6) {
      return { error: `Your ${controlName} must contain a minimum of 6 characters.` };
    }

    if (controlName === 'password' && control.value !== null && control.value.length > 24) {
      return { error: `Your ${controlName} must have less then 24 characters.` };
    }

    return null;
  }

  noWeakPassword(passwordType: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      let parentControl: any = control.parent;
      let controlName;

      if (parentControl) { controlName = Object.keys(parentControl.controls).find(key => parentControl.controls[key] === control); }

      if (passwordType === 'Weak') { return { error: `Your ${controlName} is weak.` }; }

      return null;
    };
  }
}
