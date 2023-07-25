import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import { FirebaseService } from 'src/app/services/firebase.service';

@Component({
  selector: 'app-hub',
  templateUrl: './hub.component.html',
  styleUrls: ['./hub.component.scss']
})
export class HubComponent implements OnInit {
  form!: FormGroup;
  isGrid: boolean = false;
  isCreating: boolean = true;
  isMailFocused: boolean = false;
  isMailwritten: boolean = false;
  canBeAdded: boolean = true;
  contributors: Array<string> = [];
  notificationMessage: string = '';
  lists: Array<any> = [
    { photo: '../../../assets/Placeholder.png', group: false, name: 'birthday', items: 3, views: 0 },
    { photo: '../../../assets/Placeholder.png', group: false, name: 'christmas wishlist', items: 10, views: 3 },
    { photo: '../../../assets/Placeholder.png', group: true, name: 'random things', items: 35, views: 457 },
    { photo: '../../../assets/Placeholder.png', group: false, name: 'i just want this', items: 125, views: 72 }
  ];

  constructor(private firebaseService: FirebaseService) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      'name': new FormControl('', [this.lengthRangeAllowed, this.noEmptyAllowed, this.noSpaceOnlyAllowed, this.noConsecutiveSpacesAllowed, this.noStartNorEndSpacesAllowed]),
      'url': new FormControl(''),
      'image': new FormControl(''),
      'email': new FormControl(''),
    });
  }

  openModal() {
    this.isCreating = true;

    // this.firebaseService.AddWishListToDatabase('GHaFtnRL3NiUNVB2', 'birthday', '../../../assets/Placeholder.png', [1, 2, 3], null, null);
    // this.firebaseService.AddWishListToDatabase('asdasdasv314134v', 'christmas wishlist', '../../../assets/Placeholder.png', [1, 3], null, null);
    // this.firebaseService.AddWishListToDatabase('GHduwhdqhguadas2', 'random things', '../../../assets/Placeholder.png', [1], [3, 5, 6], ['GHaFtnRL3NiUNVB2', 'asdasdasv314134v']);
    // this.firebaseService.AddWishListToDatabase('123B2sadaswedasd', 'i just want this', '../../../assets/Placeholder.png', null, [1, 2], ['null', 'null2']);
  }

  createList() {
    Object.values(this.form.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  addPhoto() {
    this.form.patchValue({ 'url': this.form.value.image });
  }

  async addFriendToList(notification: HTMLElement) {
    this.canBeAdded = true;
    notification.classList.remove('success');
    notification.classList.remove('alert');
    notification.classList.remove('error');

    if (this.form.value.email === '') return;

    this.contributors.forEach(contributor => {
      if (contributor === this.form.value.email) {
        this.notificationMessage = `${contributor} is already a member!`;
        notification.classList.add('alert');
        notification.classList.remove('noOpacity');

        console.log(this.contributors);
        this.canBeAdded = false;
        return;
      }
    });

    if (!this.canBeAdded) return;

    switch (await this.firebaseService.userExists(this.form.value.email)) {
      case true:
        this.contributors.push(this.form.value.email);
        this.notificationMessage = `${this.form.value.email} was added!`;
        notification.classList.add('success');
        notification.classList.remove('noOpacity');
        break;

      case false:
        this.notificationMessage = `${this.form.value.email} was not found!`;
        notification.classList.add('error');
        notification.classList.remove('noOpacity');
        break;

      default:
        this.notificationMessage = `This email is invalid!`;
        notification.classList.add('error');
        notification.classList.remove('noOpacity');
        break;
    }

    console.log(this.contributors);
  }

  cancelListCreation(notification: HTMLElement) {
    this.form.reset({ name: '', url: '', image: '', email: '', });
    notification.classList.add('noOpacity');
    notification.classList.remove('success');
    notification.classList.remove('alert');
    notification.classList.remove('error');
    this.contributors = [];
    this.isCreating = false;
    this.isMailFocused = false;
    this.isMailwritten = false;
  }

  onFocus(notification: HTMLElement) {
    this.isMailFocused = !this.isMailFocused;
    notification.classList.add('noOpacity');
    notification.classList.remove('success');
    notification.classList.remove('alert');
    notification.classList.remove('error');
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

    if (controlName === 'name' && control.value !== null && control.value.length > 30) {
      return { error: `Your ${controlName} must have less then 30 characters.` };
    }

    if (controlName === 'name' && control.value !== null && control.value.length < 6) {
      return { error: `Your ${controlName} must have at least 6 characters.` };
    }

    return null;
  }

  noSpaceOnlyAllowed(control: AbstractControl) {
    let parentControl: any = control.parent;
    let controlName;

    if (parentControl) {
      controlName = Object.keys(parentControl.controls).find(key => parentControl.controls[key] === control);
    }

    if (control.value !== null && control.value !== '' && /^\s*$/.test(control.value)) {
      return { error: `Your ${controlName} can't contain just spaces.` };
    }

    return null;
  }

  noConsecutiveSpacesAllowed(control: AbstractControl) {
    let parentControl: any = control.parent;
    let controlName;

    if (parentControl) {
      controlName = Object.keys(parentControl.controls).find(key => parentControl.controls[key] === control);
    }

    if (control.value !== null && control.value !== '' && /\s{2,}/.test(control.value)) {
      return { error: `Your ${controlName} can't contain consecutive spaces.` };
    }

    return null;
  }

  noStartNorEndSpacesAllowed(control: AbstractControl) {
    let parentControl: any = control.parent;
    let controlName;

    if (parentControl) {
      controlName = Object.keys(parentControl.controls).find(key => parentControl.controls[key] === control);
    }

    if (control.value !== null && control.value !== '' && control.value.startsWith(" ")) {
      return { error: `Your ${controlName} can't start with a space.` };
    }

    if (control.value !== null && control.value !== '' && control.value.endsWith(" ")) {
      return { error: `Your ${controlName} can't end with a space.` };
    }

    return null;
  }
}
