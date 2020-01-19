import { Default, Format, Required, Schema } from "@tsed/common";
import { Indexed, Model, ObjectID } from "@tsed/mongoose";

@Schema({})
export class LocationSchema {
  @Required()
  latitude: number;
  longitude: number;
}
