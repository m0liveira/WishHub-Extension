import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  userInfo: any = {
    token: '',
    id: 'j5aRS5r9z0UsJTOWbU571iTJpuH2',
    displayName: '',
    email: 'mateusamaraloliveira160302@gmail.com',
    avatar: '',
    verified: false
  };

  constructor() { }
}
