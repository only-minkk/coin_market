import { Router } from "express";
import { userService } from "../services/userService";
import { loginRequired } from "../middlewares/loginRequired";
import { mailAuthService } from "../services/mailAuthService";
import passport from "passport";

const userAuthRouter = Router();

//회원가입
userAuthRouter.post("/users/register", async (req, res, next) => {
  try {
    const userData = req.body;

    //Todo validation

    // 회원가입
    const createdUser = await userService.registerUser(userData);
    res.status(201).json(createdUser);
  } catch (err) {
    next(err);
  }
});

//로그인
userAuthRouter.post("/users/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const loginUser = await userService.login({ email, password });

    res.status(201).json(loginUser);
  } catch (err) {
    next(err);
  }
});

//회원정보조회
userAuthRouter.get("/users", loginRequired, async (req, res, next) => {
  try {
    const user = await userService.userInfo(req.userId);

    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
});

//회원정보수정
userAuthRouter.put("/users", loginRequired, async (req, res, next) => {
  try {
    const id = req.userId;
    const toUpdateData = req.body;
    const user = await userService.userUpdate({ id, toUpdateData });

    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
});

//비밀번호검증
userAuthRouter.post(
  "/users/pass/vrfct",
  loginRequired,
  async (req, res, next) => {
    try {
      //Todo 비밀번호검증필요 공백넘어옴
      const user = await userService.verificationPassword(
        req.userId,
        req.body.password
      );

      res.status(200).send("success");
    } catch (err) {
      next(err);
    }
  }
);

//비밀번호변경
userAuthRouter.put(
  "/users/pass/update",
  loginRequired,
  async (req, res, next) => {
    try {
      //Todo 비밀번호검증필요 공백넘어옴
      const user = await userService.updatePassword(
        req.userId,
        req.body.password
      );

      res.status(201).json(user);
    } catch (err) {
      next(err);
    }
  }
);

//회원탈퇴
userAuthRouter.put(
  "/users/withdrawal",
  loginRequired,
  async (req, res, next) => {
    try {
      const withdrawal = { role: "withdrawal" };
      const id = req.userId;
      const user = await userService.userUpdate({ id, withdrawal });

      res.status(204).send("회원탈퇴 신청이 완료되었습니다.");
    } catch (err) {
      next(err);
    }
  }
);

//메일인증
userAuthRouter.post(
  "/users/authMail",
  loginRequired,
  async (req, res, next) => {
    const user = await userService.userInfo(req.userId);
    const email = user.email;

    const generateRandom = (min, max) => {
      const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
      return randomNumber;
    };

    const randomNumber = generateRandom(111111, 999999);

    try {
      const sendMail = await mailAuthService.sendMail({ email, randomNumber });

      res.status(200).json(randomNumber);
    } catch (err) {
      next(err);
    }
  }
);

//메일인증 완료
userAuthRouter.put(
  "/users/authMail/success",
  loginRequired,
  async (req, res, next) => {
    try {
      const authMail = await userService.authMailUpdate(req.userId);
      res.status(201).send("메일인증이 완료되었습니다.");
    } catch (err) {
      next(err);
    }
  }
);

//구글 로그인
userAuthRouter.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

userAuthRouter.get(
  "/oauth2/redirect/google",
  passport.authenticate("google", { session: false }),
  (req, res, next) => {
    try {
      res.status(201).json(req.user);
      res.redirect("/");
    } catch (err) {
      next(err);
    }
  }
);

//네이버 로그인
userAuthRouter.get(
  "/naver",
  passport.authenticate("naver", { authType: "reprompt" })
);

userAuthRouter.get(
  "/auth/naver/callback",
  passport.authenticate("naver", { session: false }),
  (req, res, next) => {
    try {
      res.status(201).json(req.user);
      res.redirect("/");
    } catch (err) {
      next(err);
    }
  }
);

export { userAuthRouter };
