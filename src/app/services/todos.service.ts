import { BehaviorSubject, tap, withLatestFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Todo } from '../types/todo';

const USER_ID = 1988;
const API_URL = 'https://mate.academy/students-api';

@Injectable({
  providedIn: 'root'
})
  
export class TodosService {
  private todos$$ = new BehaviorSubject<Todo[]>([]);

  todos$ = this.todos$$.asObservable();

  constructor(
    private http: HttpClient,
  ) { }

  loadTodos() {
    return this.http.get<Todo[]>(`${API_URL}/todos?userId=${USER_ID}`)
      .pipe(
        tap(todos => {
          this.todos$$.next(todos)
        }),
      );
  }

  createTodo(title: string) {
    return this.http.post<Todo>(`${API_URL}/todos`, {
      title,
      userId: USER_ID,
      completed: false,
    })
      .pipe(
        withLatestFrom(this.todos$$),
        tap(([createdTodo, todos]) => {
          this.todos$$.next(
            [...todos, createdTodo]
          );
        }),
      )
  }

  updateTodo({ id, ...data }: Todo) {
    return this.http.patch<Todo>(`${API_URL}/todos/${id}`, data)
      .pipe(
        withLatestFrom(this.todos$$),
        tap(([updatedTodo, todos]) => {
          this.todos$$.next(
            todos.map(todo => todo.id === id ? updatedTodo : todo)
          );
        }),
      )
  }

  deleteTodo({ id }: Todo) {
    return this.http.delete<Todo>(`${API_URL}/todos/${id}`)
      .pipe(
        withLatestFrom(this.todos$$),
        tap(([_, todos]) => {
          this.todos$$.next(
            todos.filter(todo => todo.id !== id),
          );
        }),
      )
  }
}
