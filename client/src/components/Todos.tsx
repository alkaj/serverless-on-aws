import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { createTodo, deleteTodo, getTodos, patchTodo } from '../api/todos-api'
import Auth from '../auth/Auth'
import { Todo } from '../types/Todo'

interface TodosProps {
  auth: Auth
  history: History
}

interface TodosState {
  todos: Todo[]
  filter: string,
  newTodoName: string
  newTodoDueDate: string
  loadingTodos: boolean
}

export class Todos extends React.PureComponent<TodosProps, TodosState> {
  state: TodosState = {
    todos: [],
    newTodoName: '',
    newTodoDueDate: '',
    filter: '',
    loadingTodos: true
  }

  handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ filter: event.target.value })
  }
  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newTodoName: event.target.value })
  }
  handleDueDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (this.timeTravel(event.target.value)) {
      alert("We are not able to provide time travel features yet, please enter a date in the near future")
      this.setState({ newTodoDueDate: '' })
      event.target.value = ''
    }
    else this.setState({ newTodoDueDate: new Date(new Date(event.target.value).setHours(23, 59, 59)).toString() })
  }

  onEditButtonClick = (todoId: string) => {
    this.props.history.push(`/todos/${todoId}/edit`)
  }

  onTodoCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const newTodo = await createTodo(this.props.auth.getIdToken(), {
        name: this.state.newTodoName,
        dueDate: this.state.newTodoDueDate
      })
      this.setState({
        todos: [...this.state.todos, newTodo],
        newTodoName: '',
        newTodoDueDate: ''
      })
    } catch {
      alert('Todo creation failed')
    }
  }

  onTodoDelete = async (todoId: string) => {
    try {
      await deleteTodo(this.props.auth.getIdToken(), todoId)
      this.setState({
        todos: this.state.todos.filter(todo => todo.todoId !== todoId)
      })
    } catch {
      alert('Todo deletion failed')
    }
  }

  onTodoCheck = async (pos: number) => {
    try {
      const todo = this.state.todos[pos]
      await patchTodo(this.props.auth.getIdToken(), todo.todoId, {
        name: todo.name,
        dueDate: todo.dueDate,
        expired: todo.expired,
        expiring: todo.expiring,
        done: todo.done ? 0 : 1
      })
      this.setState({
        todos: update(this.state.todos, {
          [pos]: { done: { $set: todo.done ? 0 : 1 } }
        })
      })
    } catch {
      alert('Todo deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const todos = await getTodos(this.props.auth.getIdToken())
      this.setState({
        todos,
        loadingTodos: false
      })
    } catch (e: any) {
      alert(`Failed to fetch todos: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">KAJ ToDo-s</Header>

        {this.renderCreateTodoInput()}

        {this.renderTodos()}
      </div>
    )
  }

  renderCreateTodoInput() {
    return (
      <Grid.Row>
        <Grid.Column width={1} floated="left">
          <Input
          placeholder="Find a Todo..."
          onChange={this.handleFilterChange}
            />
        </Grid.Column>
        <Grid.Column>
          <Divider />
        </Grid.Column>
        <Grid.Column width={1} floated="right">
          <Input
            placeholder="To change the world..."
            onChange={this.handleNameChange}
          />
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'New task',
              onClick: this.onTodoCreate
            }}
          placeholder="Due date"
          type="date"
          format="yyyy-mm-dd"
          onChange={this.handleDueDateChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderTodos() {
    if (this.state.loadingTodos) {
      return this.renderLoading()
    }

    return this.renderTodosList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading TODOs
        </Loader>
      </Grid.Row>
    )
  }

  renderTodosList() {
    return (
      <Grid padded>
        {this.state.todos.filter(todo => todo.done != 1 && todo.name.toLowerCase().indexOf(this.state.filter.toLowerCase()) >= 0).map((todo, pos) => {
          return (
            <Grid.Row key={todo.todoId}>
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onTodoCheck(pos)}
                  checked={todo.done == 1}
                />
              </Grid.Column>
              <Grid.Column width={10} verticalAlign="middle">
                {todo.name}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                <span style={{display: !todo.done && (todo.expiring || todo.expired) ? 'inline-block' : 'none', border: '1px solid', marginRight: '16px', whiteSpace: 'nowrap', padding: '3px', borderRadius: '8px', color: todo.expired ? 'red' : (todo.expiring ? 'orange': 'white'), borderColor: todo.expired ? 'red' : (todo.expiring ? 'orange': 'white')}}>{todo.expired ? 'Over Due !' : (todo.expiring ? 'Due Today!' : '')}</span>
                {new Date(todo.dueDate).toLocaleDateString()}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(todo.todoId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onTodoDelete(todo.todoId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {todo.attachmentUrl && (
                <Image src={todo.attachmentUrl} size="small" alt="." style={{color: 'white'}} wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
        {this.state.todos.filter(todo => todo.done == 1 && todo.name.toLowerCase().indexOf(this.state.filter.toLowerCase()) >= 0).map((todo, pos) => {
          return (
            <Grid.Row key={todo.todoId}>
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onTodoCheck(pos)}
                  checked={todo.done == 1}
                />
              </Grid.Column>
              <Grid.Column width={10} verticalAlign="middle">
                {todo.name}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                <span style={{display: !todo.done && (todo.expiring || todo.expired) ? 'inline-block' : 'none', border: '1px solid', marginRight: '16px', whiteSpace: 'nowrap', padding: '3px', borderRadius: '8px', color: todo.expired ? 'red' : (todo.expiring ? 'orange': 'white'), borderColor: todo.expired ? 'red' : (todo.expiring ? 'orange': 'white')}}>{todo.expired ? 'Over Due !' : (todo.expiring ? 'Due Today!' : '')}</span>
                {new Date(todo.dueDate).toLocaleDateString()}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(todo.todoId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onTodoDelete(todo.todoId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {todo.attachmentUrl && (
                <Image src={todo.attachmentUrl} size="small" alt="." style={{color: 'white'}} wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }

  timeTravel(date: string): boolean {
    const today = new Date()
    today.setDate(today.getDate() - 1)
    const selectedDate = new Date(date)
    // make sure selected date is not in the past
    if (selectedDate < today) {
      return true
    } else {
      return false
    }
  }
}
