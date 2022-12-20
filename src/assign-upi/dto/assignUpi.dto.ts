import { IsArray, IsNotEmpty } from "class-validator";

export class AssignUpiDto {
  @IsArray()
  @IsNotEmpty()
  upis: number[];
}
