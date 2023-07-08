import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { FirebaseService } from "../../../services/firebase.service";

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

  constructor(public firebaseService: FirebaseService, private router: Router) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      'email': new FormControl('', [Validators.email, this.noSpaceAllowed, this.noEmptyAllowed]),
      'password': new FormControl('', [this.lengthRangeAllowed, this.noSpaceAllowed, this.noEmptyAllowed]),
    });
  }

  logIn() {
    this.errors = [];

    Object.values(this.form.controls).forEach(control => {
      control.markAsTouched();
    });

    if (this.form.valid === false) {
      Object.keys(this.form.controls).forEach(key => {
        let control: any = this.form.controls[key];

        if (control.errors) {
          Object.keys(control.errors).forEach(error => {
            this.errors.push(control.errors[error])
          });
        };
      });

      console.log(this.errors);
      return;
    }

    console.log(this.form.value);

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
