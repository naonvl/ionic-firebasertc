import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { AngularFireDatabase, AngularFireList, AngularFireObject } from '@angular/fire/database';
import { ActivatedRoute, Router } from '@angular/router';
import * as firebase from "firebase/app";
import 'firebase/firestore';
import { Observable } from 'rxjs';
declare let RTCPeerConnection: any;
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { ToastController } from '@ionic/angular';
@Component({
  selector: 'app-vcall',
  templateUrl: './vcall.page.html',
  styleUrls: ['./vcall.page.scss'],
})
export class VcallPage implements OnInit {
  callActive: boolean = false;
  servers = {
    iceServers: [
      {
        urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
      },
    ],
    iceCandidatePoolSize: 10,
  };
  pc = new RTCPeerConnection(this.servers);
  callInput: string;
  firestore: any;
  localStream = null;
  remoteStream = null;
  channel: AngularFireList<{}>;
  database: firebase.database.Reference;
  senderId: string;
  callDoc: any;
  @ViewChild("myVideo") myVideo: any;
  @ViewChild("remoteVideo") remoteVideo: any;
  offerCandidates: any;
  answerCandidates: any;

  constructor(
    private afDb: AngularFireDatabase,
    private router: Router,
    private route: ActivatedRoute,
    public toastController: ToastController,
    private clipboard: Clipboard
  ) {
  }
  async presentToast() {
    const toast = await this.toastController.create({
      message: 'Room ID Has Copied To Clipboard',
      duration: 2000
    });
    toast.present();
  }
  ngOnInit() {

    this.webcamButton();
    // this.route.queryParams.subscribe(params => {
    //   console.log(params.method);
    //   if (params.method == undefined) {
    //     this.router.navigateByUrl('/home');
    //   } else {
    //     if (params.method == 'join') {
    //       console.log('join');
    //       this.webcamButton();
    //       this.JoinRoom(params.id);
    //     } else {
    //       console.log('call');
    //       this.CreateRoom();
    //       this.webcamButton();
    //     }
    //   }
    // })
  }

  topVideoFrame = 'remoteVideo';
  swapVideo(topVideo: string) {
    this.topVideoFrame = topVideo;
  }
  async CreateRoom() {
    console.log('room created');
    const callDoc = firebase.firestore().collection('calls').doc();
    const offerCandidates = callDoc.collection('offerCandidates');
    const answerCandidates = callDoc.collection('answerCandidates');
    this.callInput = callDoc.id;
    this.clipboard.copy(callDoc.id);
    
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
    this.presentToast();
    this.pc.addEventListener('track', async (event) => {
      this.swapVideo('myVideo');
    });
  }
  async webcamButton() {
    this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    this.remoteStream = new MediaStream();
    this.pc.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        this.remoteStream.addTrack(track);
      });
    };
    this.localStream.getTracks().forEach((track) => {
      this.pc.addTrack(track, this.localStream);
    });

    this.myVideo.nativeElement.srcObject = this.localStream;
    this.remoteVideo.nativeElement.srcObject = this.remoteStream;
  }
  async JoinRoom(id) {
    console.log(id);

    this.swapVideo('myVideo');
    const callDoc = firebase.firestore().collection('calls').doc(id);

    const offerCandidates = callDoc.collection('offerCandidates');
    const answerCandidates = callDoc.collection('answerCandidates');

    this.pc.onicecandidate = (event) => {
      event.candidate && answerCandidates.add(event.candidate.toJSON());
    };

    const callData = (await callDoc.get()).data();

    const offerDescription = callData.offer;
    await this.pc.setRemoteDescription(new RTCSessionDescription(offerDescription));

    const answerDescription = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answerDescription);


    const answer = {
      type: answerDescription.type,
      sdp: answerDescription.sdp,
    }

    await callDoc.update({ answer });

    offerCandidates.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        console.log(change);
        if (change.type === 'added') {
          let data = change.doc.data();
          this.pc.addIceCandidate(new RTCIceCandidate(data));
        }
      });
    });
  }
  hangup() {
    this.pc.close();
    let tracks = this.localStream.getTracks();
    for (let i = 0; i < tracks.length; i++) {
      tracks[i].stop();
    }
    this.callActive = false;
  }


}

