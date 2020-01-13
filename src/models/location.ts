import { Default, Format, Required, Schema } from "@tsed/common";
import { Model, ObjectID, Indexed } from "@tsed/mongoose";

@Schema({})
export class LocationSchema {
  @Required()
  latitude: number;
  longitude: number;
}
