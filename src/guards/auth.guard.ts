import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { JwtPayload, verify } from 'jsonwebtoken';
import { PrismaService } from 'src/db/prisma/prisma.service';
import { AccountType } from 'src/domains/accounts/accounts.type';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const accountTypeInDecorator =
      this.reflector.getAllAndOverride<AccountType>('accountType', [
        context.getHandler(),
        context.getClass(),
      ]);
    if (!accountTypeInDecorator) {
      return true; //통과
    }

    const request = context.switchToHttp().getRequest<Request>();
    const accessToken = this.extractTokenFromHeader(request);
    if (!accessToken) {
      throw new UnauthorizedException();
    }
    try {
      const secret = this.configService.getOrThrow<string>('JWT_SECRET_KEY');
      const { sub: id, accountType: accountTypeInToken } = verify(
        accessToken,
        secret,
      ) as JwtPayload & { accountType: AccountType };

      //accessToken 유효 확인되었음

      //유저 찾기
      //유저타입에 따라 분기처리해야함!
      if (accountTypeInToken !== accountTypeInDecorator) throw new Error();

      if (accountTypeInDecorator === 'user') {
        const user = await this.prismaService.user.findUniqueOrThrow({
          where: { id },
        });
        request.user = user;
      } else {
        const partner = await this.prismaService.partner.findUniqueOrThrow({
          where: { id },
        });
        request.partner = partner;
      }
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
