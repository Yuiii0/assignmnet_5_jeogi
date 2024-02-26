import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Partner, Prisma } from '@prisma/client';
import { compare, hash } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { PrismaService } from 'src/db/prisma/prisma.service';
import generateRandomId from 'src/utils/generateRandomId';
import { PartnersLogInDto, PartnersSignUpDto } from './partners.dto';

@Injectable()
export class PartnersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}
  async signUp(dto: PartnersSignUpDto) {
    const { email, password, businessName, staffName, phoneNumber } = dto;
    const data: Prisma.PartnerCreateInput = {
      id: generateRandomId(),
      email,
      encryptedPassword: await hash(password, 12),
      businessName,
      staffName,
      phoneNumber,
    };
    //accessToken 돌려주기
    const partner = await this.prismaService.partner.create({
      data,
      select: { id: true, email: true }, //id,email만 포함
    });
    const accessToken = this.generateAccessToken(partner);
    return accessToken;
  }
  async logIn(dto: PartnersLogInDto) {
    const { email, password } = dto;

    //이메일로 유저찾기
    const partner = await this.prismaService.partner.findUnique({
      where: { email },
      select: { id: true, email: true, encryptedPassword: true }, //필요한것만
    });
    if (!partner) throw new NotFoundException('No partner');

    const isCorrectPassword = compare(password, partner.encryptedPassword);
    if (!isCorrectPassword) throw new BadRequestException('Incorrect Password');

    const accessToken = this.generateAccessToken(partner);

    return { accessToken };
    //ㄴ 없으면 에러
    //패스워드 검증
    //ㄴ패스워드 맞지 않으면 에러
    //액세스 토큰 만들어서 돌려주기
  }

  generateAccessToken(partner: Pick<Partner, 'id' | 'email'>) {
    const { id: subject, email } = partner;
    const secretKey = this.configService.getOrThrow<string>('JWT_SECRET_KEY');
    const accessToken = sign({ email, accountType: 'partner' }, secretKey, {
      subject,
      expiresIn: '5d',
    });

    return accessToken;
  }
}
