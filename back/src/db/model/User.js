import bcrypt from "bcrypt";
import { db } from "../db";

class User {
  static async createUserByEmailAndPassword(data) {
    data.password = bcrypt.hashSync(data.password, 12);

    data.wallet = {};
    data.wallet.create = { krwAmount: 0, statement: "회원가입" };
    const newUser = db.user.create({
      data,
    });
    return newUser;
  }

  static async findUserByEmail(email) {
    const user = db.user.findUnique({
      where: {
        email,
      },
    });
    return user;
  }

  static async findUserById(id) {
    const user = db.user.findUnique({
      where: {
        id,
      },
    });
    return user;
  }

  static async updateUser({ id, userName, phoneNumber }) {
    const user = db.user.update({
      where: {
        id,
      },
      data: {
        userName,
        phoneNumber,
      },
    });
    return user;
  }

  static async updatePassword({ id, password }) {
    password = bcrypt.hashSync(password, 12);
    const user = db.user.update({
      where: {
        id,
      },
      data: {
        password,
      },
    });

    return user;
  }

  static async withdrawalUser({ id, role }) {
    const user = db.user.update({
      where: {
        id,
      },
      data: {
        role,
      },
    });
    return user;
  }

  static async authMailUpdate(id) {
    const user = db.user.update({
      where: {
        id,
      },
      data: {
        isEmailAuthorized: true,
      },
    });
    return user;
  }
}
export { User };
