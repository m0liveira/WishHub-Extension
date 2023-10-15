import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { v4 as uuidv4 } from 'uuid';
import { SHA256 } from 'crypto-js';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UserService } from 'src/app/services/user.service';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-hub',
  templateUrl: './hub.component.html',
  styleUrls: ['./hub.component.scss']
})
export class HubComponent implements OnInit {
  form!: FormGroup;
  isGrid: boolean = false;
  isCreating: boolean = false;
  isNameFocused: boolean = false;
  isMailFocused: boolean = false;
  isMailwritten: boolean = false;
  canBeAdded: boolean = true;
  notificationMessage: string = '';
  contributors: Array<string> = [];
  lists: Array<any> = [];
  imgPreview: string | undefined = undefined;
  file: File | undefined = undefined;

  constructor(private firebaseService: FirebaseService, public userService: UserService, public dataService: DataService, public router: Router) { }

  async ngOnInit(): Promise<void> {
    this.form = new FormGroup({
      'name': new FormControl('', [this.lengthRangeAllowed, this.noEmptyAllowed, this.noSpaceOnlyAllowed, this.noConsecutiveSpacesAllowed, this.noStartNorEndSpacesAllowed]),
      'email': new FormControl(''),
    });

    this.lists = await this.firebaseService.getUserWishLists(this.userService.userInfo.email);
  }

  generateUniqueID(name: string, photoURL: string, email: string, contributors: Array<string>): string {
    let date = new Date().toLocaleString("pt-PT");
    let base36Date = Date.parse(date.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$2/$1/$3')).toString(36);
    let key = Date.now().toString(36) + base36Date;

    let concatenatedString = `${key}${name}${photoURL}${email}${contributors.join('')}`;
    let hashedString = SHA256(concatenatedString).toString();

    let id = uuidv4({ random: [...hashedString].map(c => c.charCodeAt(0)) });

    return id;
  }

  async createList(notification: HTMLElement): Promise<void> {
    Object.values(this.form.controls).forEach(control => {
      control.markAsTouched();
    });

    if (!this.form.valid) return;

    let uniqueID;
    let url;

    do {
      uniqueID = this.generateUniqueID(this.form.value.name, this.form.value.image, this.userService.userInfo.email, this.contributors);
    } while (await this.firebaseService.isWishListsIdUnique(`wish_${uniqueID}`));

    this.file ? url = await this.firebaseService.uploadFileToStorage(this.file, this.userService.userInfo.id) : url = await this.firebaseService.getImageURL('Default/wishHub.png');

    await this.firebaseService.AddWishListToDatabase(`wish_${uniqueID}`, this.userService.userInfo.email, url, this.form.value.name, [], [], this.contributors, uniqueID);

    this.lists = await this.firebaseService.getUserWishLists(this.userService.userInfo.email);

    this.clearListCreation(notification);
  }

  readImgFile(file: File): any {
    let reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = (event: any) => {
      this.imgPreview = event.target.result;
    };
  }

  addPhoto(input: HTMLInputElement) {
    if (input.files && input.files.length > 0) {
      this.file = input.files[0];

      this.readImgFile(this.file);
    }
  }

  removePhoto() {
    if (this.file === undefined) return;

    this.imgPreview = undefined
    this.file = undefined;
  }

  async addFriendToList(notification: HTMLElement) {
    this.canBeAdded = true;
    notification.classList.remove('success');
    notification.classList.remove('alert');
    notification.classList.remove('error');

    if (this.form.value.email === '') {
      this.notificationMessage = "Please enter friends' emails to collaborate.";
      notification.classList.add('error');
      notification.classList.remove('noOpacity');
      return;
    }

    if (this.form.value.email === this.userService.userInfo.email) {
      this.notificationMessage = "Please enter friends' emails to collaborate, not your own.";
      notification.classList.add('error');
      notification.classList.remove('noOpacity');
      return;
    }

    this.contributors.forEach(contributor => {
      if (contributor === this.form.value.email) {
        this.notificationMessage = `${contributor} is already a member!`;
        notification.classList.add('alert');
        notification.classList.remove('noOpacity');

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
  }

  clearListCreation(notification: HTMLElement) {
    this.form.reset({ name: '', email: '', });
    this.imgPreview = undefined;
    this.file = undefined;
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

  GoToList(list: any) {
    this.dataService.wishList = list;

    this.router.navigate(['Wish', this.dataService.wishList.code]);
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
