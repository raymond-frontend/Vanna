import { Observable, Subscription, Subject } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import * as fromRoot from '../../root-store/state';
import * as VIDEO from '../videos/state/video.actions';
import { Store, select, ActionsSubject, Action } from '@ngrx/store';
import { trigger, keyframes, animate, transition } from '@angular/animations';
import * as kf from '../../keyframes';
import { filter, takeUntil } from 'rxjs/operators';
import * as SWIPE from '../../root-store/actions/swipe.actions';

@Component({
  selector: 'app-videos',
  templateUrl: './videos.component.html',
  styleUrls: ['./videos.component.scss'],
  animations: [
    trigger('cardAnimator', [
      transition(
        '* =>slideOutRight',
        animate(1000, keyframes(kf.slideOutRight))
      ),
      transition('*=>slideOutLeft', animate(1000, keyframes(kf.slideOutLeft))),
      transition('*=>slideOutUp', animate(300, keyframes(kf.slideOutUp))),
      transition('*=>slideOutDown', animate(300, keyframes(kf.slideOutDown))),
    ]),
  ],
})
export class VideosComponent implements OnInit {
  videos$: Observable<any>;
  videosLength: number;
  VideoSub: Subscription;
  animationState: string;
  currentVideo;
  destroy$: Subject<boolean> = new Subject<boolean>();
  currentIndex$: Observable<number>;
  currentIndex: number;
  IndexSubscription: Subscription;

  constructor(
    private store: Store<fromRoot.State>,
    private actionsSubject: ActionsSubject
  ) {}

  ngOnInit(): void {
    this.store.dispatch(new VIDEO.LoadVideos());
    this.videos$ = this.store.pipe(select(fromRoot.getVideos));
    this.VideoSub = this.videos$
      .pipe()
      .subscribe((res) => (this.videosLength = res.length));

    this.currentIndex$ = this.store.pipe(select(fromRoot.getCurrentIndex));
    this.IndexSubscription = this.currentIndex$.subscribe(
      (res) => (this.currentIndex = res)
    );

    this.actionsSubject
      .pipe(
        filter((action: Action) => {
          return (
            action.type === SWIPE.SwipeActionTypes.swipeUp ||
            action.type === SWIPE.SwipeActionTypes.swipeDown
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((action) => {
        if (action.type === SWIPE.SwipeActionTypes.swipeUp) {
        }
      });
  }

  nextVideo() {
    if (this.currentIndex < this.videosLength - 1) {
      this.currentIndex++;
    } else {
      this.currentIndex = 0;
    }
  }

  previousVideo() {
    if (this.currentIndex > 0) {
      this.currentIndex++;
    } else {
      this.currentIndex = this.videosLength - 1;
    }
  }

  ngOnDestroy(): void {
    this.VideoSub.unsubscribe();
    this.IndexSubscription.unsubscribe();
    this.destroy$.unsubscribe();
  }
}
