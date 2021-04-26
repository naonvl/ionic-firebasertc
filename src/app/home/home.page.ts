import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { AngularFireDatabase, AngularFireList, AngularFireObject } from '@angular/fire/database';
import { Router } from '@angular/router';
import * as firebase from "firebase/app";
import 'firebase/firestore';
import { Observable } from 'rxjs';

declare let RTCPeerConnection: any;
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  callInput: string;
  remoteStream: any;
  servers = {
    iceServers: [
      {
        urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
      },
    ],
    iceCandidatePoolSize: 10,
  };
  pc = new RTCPeerConnection(this.servers);
  constructor(
    private router: Router
  ) {
  }
  async CreateRoom() {
    console.log('room created');
    const callDoc = firebase.firestore().collection('calls').doc();
    const offerCandidates = callDoc.collection('offerCandidates');
    const answerCandidates = callDoc.collection('answerCandidates');
    this.callInput = callDoc.id;
    console.log(callDoc.id);
    this.pc.onicecandidate = (event) => {
      event.candidate && offerCandidates.add(event.candidate.toJSON());
      console.log(event);

    };
    const offerDescription = await this.pc.createOffer();
    await this.pc.setLocalDescription(offerDescription);
    const offer = {
      sdp: this.pc.localDescription.sdp,
      type: this.pc.localDescription.type,
    }
    callDoc.set({ offer });
    callDoc.onSnapshot((snapshot) => {
      const data = snapshot.data();
      if (!this.pc.currentRemoteDescription && data?.answer) {
        const answerDescription = new RTCSessionDescription(data.answer);
        this.pc.setRemoteDescription(answerDescription);
      }
    });
    // When answered, add candidate to peer connection
    answerCandidates.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const candidate = new RTCIceCandidate(change.doc.data());
          this.pc.addIceCandidate(candidate);
        }
      });
    });
    
    this.router.navigateByUrl('vcall?method=call' + '&id=' + callDoc.id);
  }
  JoinRoom(id) {
    this.router.navigateByUrl('vcall?method=join' + '&id=' + id);
    // console.log(id);
    
  }
}

