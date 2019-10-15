import { model, Schema } from "mongoose";
import bcrypt from "bcrypt";

const saltRounds = 10;

export interface UserType {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

const UserSchema = new Schema({
  firstName: {
    type: String,
    trim: true,
    required: true
  },
  lastName: {
    type: String,
    trim: true,
    required: true
  },
  email: {
    type: String,
    trim: true,
    required: true
  },
  password: {
    type: String,
    trim: true,
    required: true
  }
});

// UserSchema.pre("save", function(next) {
//   this.password = bcrypt.hashSync(this.password, saltRounds);
//   next();
// });

export default model("User", UserSchema);
