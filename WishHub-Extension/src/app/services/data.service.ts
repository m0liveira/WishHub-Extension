import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  wishList =  { code: null };

  constructor() { }
}
