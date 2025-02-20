import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../services/global.service';
import { AuthPocketbaseService } from '../../services/auth-pocketbase.service';
import { Router } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';
import { RealtimeProductsService } from '../../services/realtime-products.service';
import { RealtimeEmployeesService } from '../../services/realtime-employees.service';
import { RealtimeSalesService } from '../../services/realtime-sales.service';
import { Modal } from 'bootstrap';
import { Observable } from 'rxjs';

interface WorkInstruction {
    id: string | number; 
    companyName: string;
    contactName: string;
    mobile: string;
    progress: number;
    status: string; 
    created: string;
    updated: string;
    collectionId: string;
    expand: any;
}

interface User {
    name: string;
    role: string;
    lastLogin: string;
}

declare var bootstrap: any;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule    
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent   {
  workInstructions: WorkInstruction[] = [];
  products: any[] = [];
  employees: any[] = [];
  form = new FormGroup({
    code: new FormControl('')
    });
ventas: any[] = [];
  selectedSale: any = null;
  private modal: any;
  loading: boolean = true;
  totalIngresos: number = 0;
  totalStock: number = 0;

  constructor(
    public global: GlobalService,
    public auth: AuthPocketbaseService,
    public realtimeProducts: RealtimeProductsService,
    public realtimeEmployees: RealtimeEmployeesService,
    public realtimeSales: RealtimeSalesService
  ){    
        
  }

  
  ngOnInit() {
    // Suscribirse a los cambios en tiempo real de los productos
    this.realtimeProducts.products$.subscribe(products => {
      this.products = products;
    });

    this.realtimeEmployees.employees$.subscribe(employees => {
      this.employees = employees;
    });

    this.realtimeSales.sales$.subscribe(ventas => {
      this.ventas = ventas;
      if (ventas) {
        this.totalIngresos = ventas.reduce((total, venta) => total + (venta.total || 0), 0);
      }
    });
  
  }

  openSaleDetailsModal(venta: any) {
    this.selectedSale = venta;
    const modalElement = document.getElementById('saleDetailsModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }
  calculateTotalStock(): number {
    return this.products.reduce((total, product) => total + (product.quantity || 0), 0);
}
}
