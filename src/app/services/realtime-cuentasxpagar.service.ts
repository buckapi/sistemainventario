import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import PocketBase from 'pocketbase';

@Injectable({
  providedIn: 'root'
})
export class RealtimeCuentasxpagarService {
  private pb: PocketBase;
  private cuentasxpagarSubject = new BehaviorSubject<any[]>([]);
  public cuentasxpagar$ = this.cuentasxpagarSubject.asObservable();

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
    this.pb.collection('cuentasxpagar').getList(1, 50).then(records => {
      this.cuentasxpagarSubject.next(records.items);
      
      // Suscribirse a los cambios en tiempo real
      this.pb.collection('cuentasxpagar').subscribe('*', (e) => {
        console.log(e.action, e.record);
        
        const currentCuentasxpagar = this.cuentasxpagarSubject.value;
        let updatedCuentasxpagar;

        switch (e.action) {
          case 'create':
            updatedCuentasxpagar = [...currentCuentasxpagar, e.record];
            break;
          case 'update':
            updatedCuentasxpagar = currentCuentasxpagar.map(req => 
              req.id === e.record.id ? e.record : req
            );
            break;
          case 'delete':
            updatedCuentasxpagar = currentCuentasxpagar.filter(req => req.id !== e.record.id);
            break;
          default:
            updatedCuentasxpagar = currentCuentasxpagar;
        }

        this.cuentasxpagarSubject.next(updatedCuentasxpagar);
      });
    });
  }

  public unsubscribeFromRealtimeChanges(): void {
    this.pb.collection('cuentasxpagar').unsubscribe('*');
  }
}