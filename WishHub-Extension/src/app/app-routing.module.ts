import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './components/auth/register/register.component';
import { LoginComponent } from './components/auth/login/login.component';
import { VerifyEmailComponent } from './components/auth/verify-email/verify-email.component';
import { ResetPasswordComponent } from './components/auth/reset-password/reset-password.component';
import { HubComponent } from './components/hub/hub.component';
import { WishComponent } from './components/wish/wish.component';

const routes: Routes = [
  { path: '', redirectTo: '/Login', pathMatch: 'full' },
  { path: 'Register', component: RegisterComponent },
  { path: 'Login', component: LoginComponent },
  { path: 'Verification', component: VerifyEmailComponent },
  { path: 'Recover', component: ResetPasswordComponent },
  { path: 'Hub', component: HubComponent },
  { path: 'Wish/:code', component: WishComponent },
  { path: '**', component: LoginComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
