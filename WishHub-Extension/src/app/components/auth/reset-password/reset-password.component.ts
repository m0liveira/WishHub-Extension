import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { FirebaseService } from 'src/app/services/firebase.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  form!: FormGroup;
  messageType: string = 'error';
  messages: Array<string> = [];
  messageIndex: number = 0;
  startAnimationTimeout: NodeJS.Timeout | undefined;
  endAnimationTimeout: NodeJS.Timeout | undefined;
  isMailSent: boolean = false;
  isMailFocused: boolean = false;
  isMailwritten: boolean = false;

  constructor(private firebaseService: FirebaseService) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      'email': new FormControl('', [this.lengthRangeAllowed, this.noSpaceAllowed, this.noEmptyAllowed]),
    });
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

  async recoverPassword(card: HTMLDivElement, timeBar: HTMLDivElement) {
    this.messageType = 'error';

    Object.values(this.form.controls).forEach(control => {
      control.markAsTouched();
    });

    if (this.form.valid === false) {
      this.formValidation(card, timeBar);
      return;
    }

    let result = await this.firebaseService.sendPasswordResetToEmail(this.form.value.email);

    this.messages = [];
    this.messageIndex = 0;

    if (result.error !== undefined) {
      this.messages.push(result.error);
      this.showMessage(card, timeBar);
      return;
    }

    this.messages.push(result.message);
    this.messageType = 'success';
    this.showMessage(card, timeBar);
    this.isMailSent = true;
  }

  onInput(): void {
    this.form.value.email !== '' && this.form.value.email !== null ? this.isMailwritten = true : this.isMailwritten = false;
  }

  // Form validations

  noSpaceAllowed(control: AbstractControl) {
    let parentControl: any = control.parent;
    let controlName;

    if (parentControl) {
      controlName = Object.keys(parentControl.controls).find(key => parentControl.controls[key] === control);
    }

    if (control.value !== null && control.value.indexOf(' ') !== -1) {
      return { error: `Your ${controlName} can't contain spaces.` };
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

    return null;
  }
}
