import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Todo } from './types/todo';
import { TodosService } from './services/todos.service';
import { MessageService } from './services/message.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
  
export class AppComponent implements OnInit {
  private _todos: Todo[] = [];
  activeTodos: Todo[] = [];
  errorMessage = '';
  hidden = true;
  
  get todos() {
     // get — це геттер, тобто властивість,
     // яку ми читаємо як змінну, а не викликаємо як функцію
    return this._todos;
  }

  set todos(todos: Todo[]) {
    if (todos === this._todos) {
      return;
    }
    this._todos = todos;
  
    this.activeTodos = this._todos.filter((todo) => !todo.completed);
    // отримаємо масив незавершених задач — фільтрує всі елементи
    // масиву todos, залишаючи лише ті,
    // в яких todo.completed === false
  }

  constructor(
    private todosService: TodosService,
    private messageService: MessageService,
  ) {}
  
  ngOnInit(): void {
    this.todosService.todos$
      .subscribe((todos) => {
        this.todos = todos;
      });
    
    this.todosService.loadTodos()
      .subscribe({
        error: () => this.messageService.showMessage('Unable to load todos'),
      });
  }
  
  // tickedById(i: number, todo: Todo) {
  // }

  todoForm = new FormGroup({
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)],
    }),
  });

  get title() {
    return this.todoForm.get('title') as FormControl;
  }

  handleFormSubmit() {
    if (this.todoForm.invalid) {
      return;
    }

    this.addTodo(this.title.value);
    this.todoForm.reset();
  }

  addTodo(newTitle: string) {
    this.todosService.createTodo(newTitle)
      .subscribe({
        next: () => {
          this.errorMessage = '';
        },
        error: () => {
          this.messageService.showMessage('Unable to add a Todo');
          this.hidden = false;
        },
      });
  }

  renameTodo(todo: Todo, title: string) {
    this.todosService.updateTodo({...todo, title})
      .subscribe();
    
  }

  toggleTodo(todo: Todo) {
    this.todosService.updateTodo({...todo, completed: !todo.completed})
      .subscribe();
  }

  deleteTodo(todo: Todo) {
    this.todosService.deleteTodo(todo)
      .subscribe({
        next: () => {
          this.errorMessage = '';
        },
        error: () => {
          this.messageService.showMessage('Unable to delite a Todo');
          this.hidden = false;
        }
      });
  }
}
