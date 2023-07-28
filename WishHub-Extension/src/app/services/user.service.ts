import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  userInfo: any = {
    token: '',
    id: '',
    displayName: '',
    email: 'mateusamaraloliveira160302@gmail.com',
    avatar: '',
    verified: false
  };

  constructor() { }
}
