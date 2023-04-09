import db from "../config/Database.js";
import "./CommentModel.js";
import "./FollowModel.js";
import "./UserModel.js";
import "./LikeModel.js";
import "./PostModel.js";
import "./SaveModel.js";

(async () => {
    await db.sync({ alter: true });
})();

