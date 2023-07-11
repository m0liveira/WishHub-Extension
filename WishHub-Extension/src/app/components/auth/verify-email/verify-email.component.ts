import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { FirebaseService } from 'src/app/services/firebase.service';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.scss']
})
export class VerifyEmailComponent implements OnInit {
  messageType: string = 'error';
  messages: Array<string> = [];
  messageIndex: number = 0;
  startAnimationTimeout: NodeJS.Timeout | undefined;
  endAnimationTimeout: NodeJS.Timeout | undefined;
  isMailSent: boolean = false;

  constructor(public userService: UserService, private firebaseService: FirebaseService) { }

  ngOnInit(): void {
    let card = document.getElementById('message-card') as HTMLDivElement;
    let timeBar = document.getElementById('time-bar') as HTMLDivElement;

    this.messages.push(`⚠️ Verify your email to activate your account.`);
    this.messageType = 'warning';
    this.showMessage(card, timeBar);
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

  sendEmailVerification(card: HTMLDivElement, timeBar: HTMLDivElement) {
    this.messageType = 'error';

    // send request

    this.messages = [];
    this.messageIndex = 0;

    // if ('error' in result) {
    //   this.messages.push(result.error);
    //   this.showMessage(card, timeBar);
    //   return;
    // }

    this.messages.push('✔️ Account successfully created.');
    this.messageType = 'success';
    this.showMessage(card, timeBar);

    this.isMailSent = true;
  }
}
