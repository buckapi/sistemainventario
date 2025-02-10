import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import PocketBase from 'pocketbase';

@Injectable({
  providedIn: 'root'
})
export class RealtimeEmployeesService {
  private pb: PocketBase;
  private employeesSubject = new BehaviorSubject<any[]>([]);
  public employees$ = this.employeesSubject.asObservable();

  constructor() {
    this.pb = new PocketBase('https://db.buckapi.com:8095');
    
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
    this.pb.collection('employees').getList(1, 50).then(records => {
      this.employeesSubject.next(records.items);
      
      // Suscribirse a los cambios en tiempo real
      this.pb.collection('employees').subscribe('*', (e) => {
        console.log(e.action, e.record);
        
        const currentEmployees = this.employeesSubject.value;
        let updatedEmployees;

        switch (e.action) {
          case 'create':
            updatedEmployees = [...currentEmployees, e.record];
            break;
          case 'update':
            updatedEmployees = currentEmployees.map(req => 
              req.id === e.record.id ? e.record : req
            );
            break;
          case 'delete':
            updatedEmployees = currentEmployees.filter(req => req.id !== e.record.id);
            break;
          default:
            updatedEmployees = currentEmployees;
        }

        this.employeesSubject.next(updatedEmployees);
      });
    });
  }

  public unsubscribeFromRealtimeChanges(): void {
    this.pb.collection('employees').unsubscribe('*');
  }
}