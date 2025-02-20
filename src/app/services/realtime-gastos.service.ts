import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import PocketBase from 'pocketbase';

@Injectable({
  providedIn: 'root'
})
export class RealtimeGastosService {
  private pb: PocketBase;
  private gastosSubject = new BehaviorSubject<any[]>([]);
  public gastos$ = this.gastosSubject.asObservable();

  constructor() {
    this.pb = new PocketBase('https://db.buckapi.lat:8095');
    
    // Autenticación
    this.pb.collection('users')
      .authWithPassword('admin@email.com', 'admin1234')
      .then(() => {
        console.log('Autenticado');
        this.subscribeToRealtimeChanges();
      })
      .catch(err => {
        console.error('Error al autenticar:', err);
      });
  }

  private subscribeToRealtimeChanges(): void {
    // Obtener todos los registros existentes
    this.pb.collection('gastos').getList(1, 50).then(records => {
          this.gastosSubject.next(records.items);
      
      // Suscribirse a los cambios en tiempo real
      this.pb.collection('gastos').subscribe('*', (e) => {
        console.log(e.action, e.record);
        
        const currentGastos = this.gastosSubject.value;
        let updatedGastos;

        switch (e.action) {
          case 'create':
            updatedGastos = [...currentGastos, e.record];
            break;
          case 'update':
            updatedGastos = currentGastos.map(req => 
              req.id === e.record.id ? e.record : req
            );
            break;
          case 'delete':
            updatedGastos = currentGastos.filter(req => req.id !== e.record.id);
            break;
          default:
            updatedGastos = currentGastos;
        }

        this.gastosSubject.next(updatedGastos);
      });
    });
  }

  public unsubscribeFromRealtimeChanges(): void {
    this.pb.collection('gastos').unsubscribe('*');
  }
}