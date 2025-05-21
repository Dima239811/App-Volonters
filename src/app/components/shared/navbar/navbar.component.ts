import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgIf]
})
export class NavbarComponent {
  constructor( private authService: AuthService) { }
  @Input() isLoggedIn: boolean = false;


  
  auth() {
    return this.authService.isLoggedIn()
  }
  out(){
    this.authService.logout(); 
  }

   hasOrganizationRole(): boolean {
    return this.authService.hasRole('organization');
  }

}