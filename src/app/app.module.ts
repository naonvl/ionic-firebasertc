import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AngularFireModule } from '@angular/fire';
import { AngularFireDatabaseModule } from '@angular/fire/database';
const config = {
  apiKey: "AIzaSyBNpa0jZPKS6EMvjQGT0edYIgjrvSTjYW4",
  authDomain: "bory-webrtc.firebaseapp.com",
  databaseURL: "https://bory-webrtc-default-rtdb.firebaseio.com",
  projectId: "bory-webrtc",
  storageBucket: "bory-webrtc.appspot.com",
  messagingSenderId: "1092092647891",
  appId: "1:1092092647891:web:d67ae0dd06f8905a027726",
  measurementId: "G-LXLBM33XR3"
};
@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    AngularFireModule.initializeApp(config),
    AngularFireDatabaseModule
  ],
  providers: [Clipboard, { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule { }
