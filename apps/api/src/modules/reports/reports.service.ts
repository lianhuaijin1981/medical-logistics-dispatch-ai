import { Injectable } from '@nestjs/common';

@Injectable()
export class ReportsService {
  async findAll(query: any) {
    return { data: [], total: 0, page: 1, pageSize: 20 };
  }

  async findOne(id: string) {
    return { id, message: 'Reports stub' };
  }

  async create(dto: any) {
    return { id: 'new-id', ...dto };
  }

  async update(id: string, dto: any) {
    return { id, ...dto };
  }

  async remove(id: string) {
    return { id, deleted: true };
  }
}
