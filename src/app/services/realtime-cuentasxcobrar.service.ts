import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import PocketBase from 'pocketbase';

@Injectable({
  providedIn: 'root'
})
export class RealtimeCuentasxcobrarService {
  private pb: PocketBase;
  private cuentasxcobrarSubject = new BehaviorSubject<any[]>([]);
  public cuentasxcobrar$ = this.cuentasxcobrarSubject.asObservable();

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
    this.pb.collection('cuentasxcobrar').getList(1, 50).then(records => {
      this.cuentasxcobrarSubject.next(records.items);
      
      // Suscribirse a los cambios en tiempo real
      this.pb.collection('cuentasxcobrar').subscribe('*', (e) => {
        console.log(e.action, e.record);
        
        const currentCuentasxcobrar = this.cuentasxcobrarSubject.value;
        let updatedCuentasxcobrar; 

        switch (e.action) {
          case 'create':
            updatedCuentasxcobrar = [...currentCuentasxcobrar, e.record];
            break;
          case 'update':
            updatedCuentasxcobrar = currentCuentasxcobrar.map(req => 
              req.id === e.record.id ? e.record : req
            );
            break;
          case 'delete':
            updatedCuentasxcobrar = currentCuentasxcobrar.filter(req => req.id !== e.record.id);
            break;
          default:
            updatedCuentasxcobrar = currentCuentasxcobrar;
        }

        this.cuentasxcobrarSubject.next(updatedCuentasxcobrar);
      });
    });
  }

  public unsubscribeFromRealtimeChanges(): void {
    this.pb.collection('cuentasxcobrar').unsubscribe('*');
  }
}