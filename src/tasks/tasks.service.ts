import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskStatus } from './task-status.enum';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { Repository } from 'typeorm';
@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getTasks(filterDto: GetTasksFilterDto): Promise<Task[]> {
    // return this.tasksRepository.getTasks(filterDto);
    const query = this.taskRepository.createQueryBuilder('task');
    const tasks = await query.getMany();
    return tasks;
  }

  async getTaskById(id: string): Promise<Task> {
    console.log('id: ', id);
    const found = await this.taskRepository.findOne({ where: { id } });
    console.log('is found: ', found);
    if (!found) {
      throw new NotFoundException(`Task with ID '${id}' not found.`);
    }
    return found;
  }

  async createTask(createTaskDTO: CreateTaskDto): Promise<Task> {
    const { title, description } = createTaskDTO;
    const task = this.taskRepository.create({
      title,
      description,
      status: TaskStatus.OPEN,
    });
    await this.taskRepository.save(task);
    return task;
    // return this.tasksRepository.createTask(createTaskDto)
  }

  async deleteTask(id: string): Promise<void> {
    const result = await this.taskRepository.delete(id);
    console.log(result);
    if (result.affected === 0) {
      throw new NotFoundException(`Task with ID '${id}' not found.`);
    }
  }

  async updateTaskStatus(id: string, status: TaskStatus): Promise<Task> {
    const task = await this.getTaskById(id);
    task.status = status;
    await this.taskRepository.save(task);
    return task;
  }
}
