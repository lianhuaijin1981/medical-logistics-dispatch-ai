import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

export interface JwtPayload {
  sub: string;
  username: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly config: ConfigService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    // DEV MODE: short-circuit auth when NODE_ENV=development
    // Set in main.dev.ts before NestFactory.create()
    const isDev = (process.env.NODE_ENV || '').toLowerCase() === 'development';
    if (isDev) {
      return {
        _id: '507f1f77bcf86cd799439011',
        id: '507f1f77bcf86cd799439011',
        username,
        realName: username === 'admin' ? '管理员' : username,
        role: username === 'admin' ? 'admin' : 'operator',
        phone: '13800138000',
        email: `${username}@med-logistics.com`,
        isActive: true,
    };
    }
    const user = await this.usersService.findByUsername(username);
    if (!user) return null;
    const isValid = await this.usersService.validatePassword(user, password);
    if (!isValid) return null;
    // Return plain object without password
    const { password: _, ...result } = user.toObject();
    return result;
  }

  async login(user: any) {
    const payload: JwtPayload = {
      sub: user._id?.toString() || user.id,
      username: user.username,
      role: user.role,
    };
    const accessToken = this.jwtService.sign(payload);
    return {
      accessToken,
      user: {
        id: user._id?.toString() || user.id,
        username: user.username,
        realName: user.realName,
        role: user.role,
        phone: user.phone,
      },
    };
  }

  async getProfile(userId: string) {
    if (!userId) return null;
    return this.usersService.findOne(userId);
  }
}
