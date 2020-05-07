import { Inject, Service } from "@tsed/common";
import { MongooseModel } from "@tsed/mongoose";

// type Test = Pick<UserModel, ['firstName', 'deviceToken']>

type Selector<T> = Partial<keyof T>[];

// type MakePick<Type, Keys extends (keyof Type)[]> = { [Key in Keys]: Type[Key] };

// type Test<T, K> = {
//   [Key in keyof T]:

// }

// type Partial<T> = {
//   [P in keyof T]?: T[P];
// };

// type Opt<T> = Partial<keyof T>;
// type Ret<T> = Pick<T, Selector<T>>;

// @Service()
export abstract class CRUDService<Model, Type> {
  public abstract model: MongooseModel<Model>;

  /* get */
  getId = (id: string, querySelector: Selector<Model> = []) => {
    const selectOn = this.formatSelector(querySelector);

    return this.model.findById(id).select(selectOn).exec();
  };

  getAll = (querySelector: Selector<Model> = []) => {
    const selectOn = this.formatSelector(querySelector);

    return this.model.find().select(selectOn).exec();
  };

  find = (conditions: any, querySelector: Selector<Model> = []) => {
    const selectOn = this.formatSelector(querySelector);

    // const data = ['text 1', 'text 2'] as const;
    // type Data = typeof data[number];

    // type Test = typeof (['hello'] as const);

    return this.model.find(conditions).select(selectOn).exec();
  };

  findOne = (params: Partial<Type>, querySelector: Selector<Model> = []) => {
    const selectOn = this.formatSelector(querySelector);

    return this.model.findOne(params).select(selectOn).exec();
  };

  updateOne = (params: Partial<Type>, newData: Partial<Model>) => {
    return this.model.updateOne(params, newData).exec();
  };

  create = (data: Type) => {
    return this.model.create(data);
  };

  delete = (_id: string) => {
    return this.model.deleteOne({ _id }).exec();
  };

  private formatSelector = (querySelector: Selector<Model> = []): string => {
    return querySelector.reduce((prev, curr, i) => {
      return (prev += `${curr} `);
    }, "");
  };
}
