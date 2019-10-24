import { Service, Inject } from "@tsed/common";
import { MongooseModel } from "@tsed/mongoose";

type Selector<T> = Partial<keyof T>[];

@Service()
export abstract class CRUDService<Model, Type> {
  public abstract model: MongooseModel<Model>;

  private formatSelector = (querySelector: Selector<Type> = []) => {
    return querySelector.reduce((prev, curr, i) => {
      return (prev += `${curr} `);
    }, "");
  };

  /* get */
  getId = (id: string, querySelector: Selector<Type> = []) => {
    const selectOn = this.formatSelector(querySelector);

    return this.model
      .findById(id)
      .select(selectOn)
      .exec();
  };

  getAll = (querySelector: Selector<Type> = []) => {
    const selectOn = this.formatSelector(querySelector);

    return this.model
      .find()
      .select(selectOn)
      .exec();
  };

  find = (params: Partial<Type>, querySelector: Selector<Type> = []) => {
    const selectOn = this.formatSelector(querySelector);

    return this.model
      .find(params)
      .select(selectOn)
      .exec();
  };

  updateOne = (params: Partial<Type>, newData: Partial<Type>) => {
    return this.model.updateOne(params, newData).exec();
  };

  create = (data: Type) => {
    return this.model.create(data);
  };
}
