import Resource from "./resource.js";

export default Resource.User = class User extends Resource {
  static get primaryKey() { return "id"; }
}
