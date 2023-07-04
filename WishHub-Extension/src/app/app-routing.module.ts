import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: '/my-component1', pathMatch: 'full' },
  // { path: 'my-component1', component: 'my-component1' },
  // { path: 'my-component2', component: 'my-component2' },
  // { path: 'my-component3', component: 'my-component3' },
  // { path: '**', component: my-component1 },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
