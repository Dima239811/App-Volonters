import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/pages/home/home.component';
import { LoginComponent } from './components/pages/login/login.component';
import { RegistrationComponent } from './components/pages/registration/registration.component';
import { ErrorComponent } from './components/pages/error/error.component';
import { ProfileComponent } from './components/pages/profile/profile.component';
import { AdminEventsComponent } from './components/pages/admin-events/admin-events.component';
import { OrganizerGuard } from './organizer.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegistrationComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'error', component: ErrorComponent },
  { path: 'admin', component: AdminEventsComponent, canActivate: [OrganizerGuard]},
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
