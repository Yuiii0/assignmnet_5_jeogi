import { Module } from '@nestjs/common';

import { AccommodationsModule } from './accommodations/accommodations.module';
import { RoomsModule } from './accommodations/rooms/rooms.module';
import { AccountsModule } from './accounts/accounts.module';

@Module({
  imports: [AccountsModule, AccommodationsModule, RoomsModule],
})
export class DomainsModule {}
