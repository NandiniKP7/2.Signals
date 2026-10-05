import { Component, effect, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductData } from '../product-data';
import { Product } from '../product';

@Component({
  selector: 'app-product-selection',
  imports: [FormsModule],
  templateUrl: './product-selection.html',
  styleUrl: './product-selection.css'
})
export class ProductSelection {
  pageTitle = 'Product Selection';
 selectedProduct=signal<Product |undefined>(undefined)
  quantity =signal(1)
 products =signal(ProductData.products)
 onIncrease(){
  this.quantity.update(q => q+1)
 }
 onDecrease(){
  this.quantity.update(q =>q<=0? 0:q-1)
 }
 qtyEffect=effect(()=>console.log('quantity:', this.quantity()))
}
