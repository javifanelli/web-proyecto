import { Component, OnInit } from '@angular/core';
import { LoginService } from '../services/login.service';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { DispositivoService } from '../services/dispositivo.service';
import { Usuario } from '../interfaces/usuario';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  userData!: Usuario;
  userId!: number;

  constructor(
    private loginService: LoginService,
    private router: Router,
    private alertController: AlertController,
    private usuarioService: DispositivoService
  ) {}

  ngOnInit() {
    const userId = this.loginService.getCurrentUser();
    if (userId !== null) {
      this.userId = userId;
      console.log("Usuario al inicio:", this.userId);
    } else {
      console.error("El usuario actual es nulo");
    }
  }

  async logout() {
    const alert = await this.alertController.create({
      header: 'Cerrar sesión',
      message: '¿Estás seguro de que quieres cerrar sesión?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'logout-alert-button.cancel',
        },
        {
          text: 'Cerrar sesión',
          handler: () => {
            this.loginService.logout();
            this.router.navigate(['/login']);
          },
          cssClass: 'logout-alert-button.confirm',
        },
      ],
    });
    await alert.present();
    this.loadUserData();
  }  

  loadUserData() {
    const userId = this.loginService.getCurrentUser();
    if (userId) {
      this.usuarioService.getUser(userId).subscribe({
      next: (data: Usuario) => {
        this.userData = data;
      },
      error: (error) => {
        console.error('Error al cargar los datos del usuario en home:', error);
      }
    });
    } else {
      console.error('No se proporcionó un userId en home.');
    }
  }  

}
