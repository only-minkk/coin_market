import bcrypt from "bcrypt";
import { db } from "../db";

class User {
  static async createUser(userData) {
    // 유저의 지갑 데이터 생성
    userData.wallet = { create: { krwAmount: 0, statement: "회원가입" } };

    // 유저 생성
    const createdUser = db.user.create({
      data: userData,
      select: {
        email: true,
        userName: true,
      },
    });

    return createdUser;
  }

  static async checkUserExistsByEmail(email) {
    const userExists = db.user.findUnique({
      where: {
        email,
      },
      select: {
        email: true,
      },
    });
    return userExists;
  }

  static async findUserByEmail(email) {
    const user = db.user.findUnique({
      where: {
        email,
      },
      select: {
        email: true,
        id: true,
        password: true,
        role: true,
      },
    });
    return user;
  }

  static async checkUserPwByEmail(email) {
    const userPw = db.user.findUnique({
      where: {
        email,
      },
      select: {
        password: true,
      },
    });
    return userPw;
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
