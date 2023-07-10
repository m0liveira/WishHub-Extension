import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  userInfo: any = {
    token: '',
    id: '',
    displayName: '',
    email: '',
    avatar: '',
    verified: false
  };

  constructor() { }
}
