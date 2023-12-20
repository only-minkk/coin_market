import { User } from "../db/model/User";
import bcrypt from "bcrypt";
import { tokenService } from "./tokenService";

class userService {
  //회원가입
  static async registerUser(userData) {
    // 유저 존재 여부 확인
    const duplicateUser = await User.checkUserExistsByEmail(userData.email);
    if (duplicateUser) {
      throw new Error("이미 존재하는 이메일입니다.");
    }

    // 유저 비밀번호 해싱
    userData.password = bcrypt.hashSync(userData.password, 12);

    // 유저 생성
    const createdUser = await User.createUser(userData);
    return createdUser;
  }

  //로그인
  static async login({ email, password }) {
    const user = await User.findUserByEmail(email);
    if (!user) {
      throw new Error("가입되어있지 않은 이메일입니다.");
    }

    if (user.role == "withdrawal") {
      throw new Error("탈퇴한 유저입니다.");
    }

    const correctPassword = user.password;
    const isPasswordRight = await bcrypt.compare(password, correctPassword);
    if (!isPasswordRight) {
      throw new Error("비밀번호가 틀렸습니다.");
    }

    // 로그인시 새로운 토큰 생성(access, refresh)
    const newToken = tokenService.createToken(user.id);

    // 새로 생성한 리프레쉬 토큰 암호화
    const hashRefreshToken = bcrypt.hashSync(
      (await newToken).refresh_token,
      12
    );

    //userId와 암호화한 리프레쉬 토큰을 묶어줌
    const data = {
      userId: user.id,
      refreshToken: hashRefreshToken,
    };

    //만약 기존 db에 저장되어있는 토큰이 있다면 새로 생성한 암호화한 리프레쉬토큰으로 수정
    const findToken = await tokenService.findToken(user.id);
    if (findToken) {
      const updateToken = await tokenService.updateToken(
        user.id,
        data.refreshToken
      );

      //암호화하지 않은 access, refresh 토큰 전달
      return newToken;
    } else {
      //기존 db에 저장되어있지 않다면 새로 생성한 암호화한 토큰을 db에 저장
      const createDb = await tokenService.createdTokenDb(data);

      //암호화하지 않은 access, refresh 토큰 전달
      return newToken;
    }
  }

  //회원정보조회
  static async userInfo(id) {
    const user = await User.findUserById(id);
    if (!user) {
      throw new Error("해당 유저가 존재하지 않습니다.");
    }

    delete user.password;

    return user;
  }

  //회원정보수정 , 회원탈퇴
  static async userUpdate(id, body) {
    const user = await User.findUserById(id);
    if (!user) {
      throw new Error("해당 유저가 존재하지 않습니다.");
    }

    if (!body.role) {
      const userName = body.userName;
      const phoneNumber = body.phoneNumber;
      const updatedUser = await User.updateUser({
        id,
        userName,
        phoneNumber,
      });
      delete updatedUser.password;

      return updatedUser;
    } else {
      const role = body.role;
      const withdrawalUser = await User.withdrawalUser({
        id,
        role,
      });

      return withdrawalUser;
    }
  }

  //비밀번호 검증
  static async verificationPassword(email, password) {
    const user = await User.checkUserPwByEmail(email);

    const correctPassword = user.password;
    const isPasswordRight = await bcrypt.compare(password, correctPassword);
    if (!isPasswordRight) {
      throw new Error("비밀번호가 틀렸습니다.");
    }
    return console.log("ok");
  }

  //비밀번호 변경
  static async updatePassword(id, password) {
    const user = await User.updatePassword({ id, password });

    delete user.password;

    return user;
  }

  //메일 인증 처리
  static async authMailUpdate(userId) {
    const user = await User.authMailUpdate(userId);

    return user;
  }
}
export { userService };
