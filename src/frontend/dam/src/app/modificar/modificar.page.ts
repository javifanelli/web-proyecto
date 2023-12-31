import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DispositivoService } from '../services/dispositivo.service';
import { Dispositivo } from '../interfaces/dispositivo';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-modificar',
  templateUrl: './modificar.page.html',
  styleUrls: ['./modificar.page.scss'],
})
export class ModificarPage implements OnInit {
  dispositivoId!: string;
  ubicacionold!: string;
  dispositivo: Dispositivo = {
    dispositivoId: '',
    nombre: '',
    ubicacion: '',
    mac: '',
    tipo: '',
    alarma: 0,
    act_al: 0,
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dispositivoService: DispositivoService,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.dispositivoId = this.route.snapshot.paramMap.get('id') || '0';
    this.cargarDispositivo();
  }

  async cargarDispositivo() {
    try {this.dispositivoService.getDeviceById(this.dispositivoId).subscribe({
        next: (dispositivos) => {
          if (dispositivos && dispositivos.length > 0) {
            this.dispositivo = dispositivos[0];
            this.ubicacionold = dispositivos[0].ubicacion;
            this.dispositivo.act_al = dispositivos[0].act_al;
          }
        },
        error: (error) => {
          console.error('Error al cargar el dispositivo:', error);
        }
    });
    } catch (error) {
      console.error('Error al cargar el dispositivo:', error);
    }
  }
  
  async guardarCambios() {
    try {
      if (this.dispositivo) {
        this.dispositivoService.actualizarDispositivo(this.dispositivo as Dispositivo).subscribe({
          next: (response) => {
            this.mostrarMensajeExitoso();
          },
          error: (error) => {
            this.mostrarError(error);
            console.error('Error al actualizar:', error);
          }
      });
      }
    } catch (error) {
      console.error('Error al guardar los cambios:', error);
    }
  }
  
  async mostrarMensajeExitoso() {
    const alert = await this.alertController.create({
      header: 'Éxito',
      message: 'Datos del dispositivo actualizados exitosamente.',
      buttons: ['Aceptar']
    });
    await alert.present();
  }

  async mostrarError(error: any) {
    const alert = await this.alertController.create({
      header: 'Error',
      message: 'Ha ocurrido un error al actualizar los datos del dispositivo.',
      buttons: ['Aceptar']
    });
    await alert.present();
  }

}
