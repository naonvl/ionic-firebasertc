import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VcallPage } from './vcall.page';

const routes: Routes = [
  {
    path: '',
    component: VcallPage,
    children : [{
      path: ':method/:id',
      component: VcallPage,
    }]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VcallPageRoutingModule {}
