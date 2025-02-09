import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ListsModule } from './lists/lists.module';
import { UserModule } from "./user/user.module";
import { UserController } from "./user/user.controller";
import { UserService } from "./user/user.service";

@Module({
  imports: [ListsModule, UserModule],
  controllers: [AppController, UserController],
  providers: [AppService, UserService],
})
export class AppModule {}
