import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { VcallPageRoutingModule } from './vcall-routing.module';
import { VcallPage } from './vcall.page';
import { AngularFireDatabaseModule } from '@angular/fire/database';

import { Clipboard } from '@ionic-native/clipboard/ngx';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VcallPageRoutingModule,
    AngularFireDatabaseModule,
  ],
  declarations: [VcallPage],
  providers: [Clipboard],
})
export class VcallPageModule { }
