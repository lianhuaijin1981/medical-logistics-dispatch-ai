import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: '用户登录' })
  async login(@Body() dto: { username: string; password: string }) {
    return this.authService.login(dto);
  }

  @Get('profile')
  @ApiOperation({ summary: '获取当前用户信息' })
  async getProfile(@Request() req: any) {
    return this.authService.getProfile(req.user?.id);
  }
}
