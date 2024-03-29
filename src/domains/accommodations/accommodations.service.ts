import { ForbiddenException, Injectable } from '@nestjs/common';
import {
  Accommodation,
  AccommodationType,
  Partner,
  Prisma,
  Room,
} from '@prisma/client';
import * as fs from 'fs/promises';
import { PrismaService } from 'src/db/prisma/prisma.service';
import { RoomsService } from './rooms/rooms.service';

@Injectable()
export class AccommodationsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly roomsService: RoomsService,
  ) {}

  async createAccommodation(data: Prisma.AccommodationUncheckedCreateInput) {
    const accommodation = await this.prismaService.accommodation.create({
      data,
    });

    return accommodation;
  }

  async getAccommodations(type?: AccommodationType) {
    const accommodations = await this.prismaService.accommodation.findMany({
      where: { type },
    });

    return accommodations;
  }

  async getAccommodation(accommodationId: number) {
    const accommodation = await this.prismaService.accommodation.findUnique({
      where: { id: accommodationId },
      include: { rooms: true },
    });

    return accommodation;
  }

  async addRoomToAccommodation(
    partner: Pick<Partner, 'id'>,
    accommodationId: Accommodation['id'],
    data: Parameters<typeof this.roomsService.createRoom>[1],
  ) {
    const accommodation = await this.prismaService.accommodation.findUnique({
      where: { id: accommodationId, partnerId: partner.id },
    });
    if (!accommodation) throw new ForbiddenException();

    const room = await this.roomsService.createRoom(accommodationId, data);

    return room;
  }

  async deleteRoomFromAccommodation(
    partner: Pick<Partner, 'id'>,
    accommodationId: Accommodation['id'],
    roomId: Room['id'],
  ) {
    const accommodation = await this.prismaService.accommodation.findUnique({
      where: { id: accommodationId, partnerId: partner.id },
    });
    if (!accommodation) throw new ForbiddenException('');

    const room = await this.roomsService.deleteRoom(roomId);

    return room;
  }

  async addImageToAccommodation(file: Express.Multer.File) {
    await fs.writeFile(`./public/${file.originalname}`, file.buffer);
    console.log(file);
  }
}
