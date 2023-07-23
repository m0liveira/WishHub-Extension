import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-hub',
  templateUrl: './hub.component.html',
  styleUrls: ['./hub.component.scss']
})
export class HubComponent implements OnInit {
  lists: Array<any> = [
    { photo: '../../../assets/Placeholder.png', group: false, name: 'birthday', items: 3, views: 0 },
    { photo: '../../../assets/Placeholder.png', group: false, name: 'christmas wishlist', items: 10, views: 3 },
    { photo: '../../../assets/Placeholder.png', group: true, name: 'random things', items: 35, views: 457 },
    { photo: '../../../assets/Placeholder.png', group: false, name: 'i just want this', items: 125, views: 72 }
  ]

  constructor() { }

  ngOnInit(): void {
  }

}
