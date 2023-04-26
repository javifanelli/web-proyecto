import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as Highcharts from 'highcharts';
declare var require: any;
require('highcharts/highcharts-more')(Highcharts);
require('highcharts/modules/solid-gauge')(Highcharts);
import { Dispositivo } from '../interfaces/dispositivo';
import { DispositivoService } from '../services/dispositivo.service';

@Component({
  selector: 'app-dispositivo',
  templateUrl: './dispositivo.page.html',
  styleUrls: ['./dispositivo.page.scss'],
})

export class DispositivoPage implements OnInit  {
  public device!: Dispositivo;
  public dispositivoId!: number;
  private valorObtenido!: number;
  public myChart:any;
  private chartOptions:any;
  private activatedRoute = inject(ActivatedRoute);

  constructor(
    private deviceService: DispositivoService) {
      setInterval(()=>{
        console.log("Mediciones nuevas");
        const id = this.activatedRoute.snapshot.paramMap.get('id') as string;
        this.deviceService.postMedicion(parseInt(id, 10), (this.valorObtenido + 5).toString()); //simulo que se va secando
        console.log("Cambio el valor del sensor");
        this.refreshChart();
      },12000);
    }

  ngOnInit() {
    const deviceId = this.activatedRoute.snapshot.paramMap.get('id') as string;
    this.dispositivoId = parseInt(deviceId, 10);
    this.deviceService.getDeviceById(this.dispositivoId).subscribe(data => {
      this.device = data[0];
    });
    this.refrescamedicion();
  }

  ionViewDidEnter() {
    this.generarChart();
  }

  abrirElectrovalvula() {
    this.deviceService.abrirElectrovalvula(this.device.electrovalvulaId);
    this.refreshChart();
  }

  refrescamedicion() {
    const id = this.activatedRoute.snapshot.paramMap.get('id') as string;
    this.deviceService.getUltMedicion(parseInt(id, 10)).subscribe(data => {
      this.valorObtenido = parseInt(data[0].valor, 10);
    });
  }

  refreshChart() {
    
    this.refrescamedicion();
    
    this.updateChart();
  }

  updateChart() {
    this.myChart.update({series: [{
      name: 'kPA',
      data: [this.valorObtenido],
      tooltip: {
          valueSuffix: ' kPA'
      }
    }]});
  }

  generarChart() {
    this.chartOptions={
      chart: {
          type: 'gauge',
          plotBackgroundColor: null,
          plotBackgroundImage: null,
          plotBorderWidth: 0,
          plotShadow: false
        }
        ,title: {
          text: 'Sensor N° ' + this.device.dispositivoId
        }

        ,credits:{enabled:false}
        
           
        ,pane: {
            startAngle: -150,
            endAngle: 150
        } 
        // the value axis
      ,yAxis: {
        min: 0,
        max: 100,
  
        minorTickInterval: 'auto',
        minorTickWidth: 1,
        minorTickLength: 10,
        minorTickPosition: 'inside',
        minorTickColor: '#666',
  
        tickPixelInterval: 30,
        tickWidth: 2,
        tickPosition: 'inside',
        tickLength: 10,
        tickColor: '#666',
        labels: {
            step: 2,
            rotation: 'auto'
        },
        title: {
            text: 'kPA'
        },
        plotBands: [{
            from: 0,
            to: 10,
            color: '#55BF3B' // green
        }, {
            from: 10,
            to: 30,
            color: '#DDDF0D' // yellow
        }, {
            from: 30,
            to: 100,
            color: '#DF5353' // red
        }]
    }
    ,
  
    series: [{
        name: 'kPA',
        data: [this.valorObtenido],
        tooltip: {
            valueSuffix: ' kPA'
        }
    }]

    };
    this.myChart = Highcharts.chart('highcharts', this.chartOptions );
  }

}
