import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  async login(dto: { username: string; password: string }) {
    // Sprint 0: stub
    return {
      accessToken: 'stub-jwt-token',
      user: { id: '1', username: dto.username, role: 'admin' },
    };
  }

  async getProfile(userId?: string) {
    return { id: userId || '1', username: 'admin', role: 'admin', realName: '管理员' };
  }
}
