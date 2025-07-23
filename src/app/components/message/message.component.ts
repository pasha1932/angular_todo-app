import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil, finalize } from 'rxjs';
import { MessageService } from 'src/app/services/message.service';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})
export class MessageComponent implements OnInit, OnDestroy {
  @Input() title = 'Error'
  message = '';
  hidden = true;
  
  destroy$$ = new Subject();

  constructor(
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    console.log('1) ngOnInit спрацював');
    this.messageService.message$.pipe(
      takeUntil(this.destroy$$),
      finalize(() => {
        console.log('[message$] finalize → Потік завершено');
      })
    )
      .subscribe(text => {
        console.log(' 2) Отримали повідомлення:');
        this.hidden = false;
        this.message = text;
      })
  }

  ngOnDestroy(): void {
    console.log(' 3) MessageComponent destroyed');
    this.destroy$$.next(null);
    this.destroy$$.complete();
  }
}
